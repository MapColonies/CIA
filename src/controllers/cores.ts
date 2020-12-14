import { NextFunction, Request, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { v4 } from 'is-uuid';
import { defaults, omit, pick } from 'lodash';
import { injectable } from 'tsyringe';
import { createConnection, getRepository } from 'typeorm';
import { CurrentAllocatedID, IDsRangesSizes, ResponseCore } from '../common/interfaces';
import { CoreSize } from '../common/types/core';
import { Core as CoreModel } from '../models/core';
import { StringValueObject } from '../utils/indexable_types';
import { getIntRangeBound, rangeFormatter, rangeToObj } from '../utils/postgres_ranges';

const COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE: StringValueObject = {
  allocatedNodeIDsRange: 'node',
  allocatedWayIDsRange: 'way',
  allocatedRelationIDsRange: 'relation',
  allocatedChangesetIDsRange: 'changeset',
};

// Extract env vars starting with 'IDS_RANGES_SIZES_' and fallback to hardcoded values
const IDS_RANGES_SIZES: IDsRangesSizes = defaults(
  {
    small: process.env.IDS_RANGES_SIZES_SMALL,
    medium: process.env.IDS_RANGES_SIZES_MEDIUM,
    large: process.env.IDS_RANGES_SIZES_LARGE,
  },
  {
    small: 10000,
    medium: 1000000,
    large: 100000000,
  }
);

@injectable()
export class CoresController {
  private static currentAllocatedIDs: CurrentAllocatedID = {
    node: 0,
    way: 0,
    relation: 0,
    changeset: 0,
  };

  public constructor() {
    void this.initialize();
  }

  public async getCores(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const cores = await getRepository(CoreModel).find();
      res.status(HttpStatus.OK).json(cores.map(core => this.modifyCoreRangesToCoreEnds(core)));
    } catch (error) {
      next(error);
    }
  }

  public async createCore(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const requestedCore = defaults(
        pick(req.body, ['coreSize', 'description']) as CoreModel,
        { coreSize: 'small' }
      ); // Extract only properties that are valid request payload

      // FIXME: Should coreSize be set to default if not passed in payload?
      if (!requestedCore.description)
        return res.status(HttpStatus.BAD_REQUEST).end();

      const calculatedCore = this.allocateAllIDsRange(
        requestedCore,
        requestedCore.coreSize
      );
      const createdCore = getRepository(CoreModel).create(calculatedCore);
      const savedCore = await getRepository(CoreModel).save(createdCore);

      const host = req.headers?.host ?? req.hostname;
      const locationHeader = `${req.protocol}://${host}${req.baseUrl}/cores/${savedCore.coreID}`;
      res
        .status(HttpStatus.CREATED)
        .header('Location', locationHeader)
        .json(savedCore);
    } catch (error) {
      next(error);
    }
  }

  public async getCoreByID(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!v4(req.params.coreId))
        return res.status(HttpStatus.BAD_REQUEST).end();
      const core = await getRepository(CoreModel).findOne({
        coreID: req.params.coreId,
      });
      if (core) {
        res.status(HttpStatus.OK).json(this.modifyCoreRangesToCoreEnds(core));
      }
      else res.status(HttpStatus.NOT_FOUND).end();
    } catch (error) {
      next(error);
    }
  }

  private async initialize(): Promise<void> {
    await createConnection(); // Connection configurations load from ormconfig.env

    // Return to last allocated IDs state by querying the database if possible
    const lastAllocation = await getRepository(CoreModel).findOne({
      order: { id: 'DESC' },
    });
    if (!lastAllocation) return;

    const allocatedIDsRange = pick(
      lastAllocation,
      Object.keys(COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE)
    );
    Object.entries(allocatedIDsRange).forEach(
      ([coreModelColumn, lastIDAllocationRange]) => {
        // Extract upper bound of IDs allocation range and subtract one, because the range's upper bound is not inclusive
        const upperBound = getIntRangeBound(lastIDAllocationRange as string, 'upper');

        // Update the state of allocated IDs
        CoresController.currentAllocatedIDs[
          COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE[coreModelColumn]
        ] = upperBound;
      }
    );
  }

  private modifyCoreRangesToCoreEnds(core: CoreModel): ResponseCore {
    const partialResponseCore = omit(core, [
      'allocatedNodeIDsRange',
      'allocatedWayIDsRange',
      'allocatedRelationIDsRange',
      'allocatedChangesetIDsRange',
    ]) as ResponseCore;
    const responseCore = defaults(
      partialResponseCore,
      rangeToObj(
        'allocatedNodeIdStart',
        'allocatedNodeIdEnd',
        core.allocatedNodeIDsRange
      ),
      rangeToObj(
        'allocatedWayIdStart',
        'allocatedWayIdEnd',
        core.allocatedWayIDsRange
      ),
      rangeToObj(
        'allocatedRelationIdStart',
        'allocatedRelationIdEnd',
        core.allocatedRelationIDsRange
      ),
      rangeToObj(
        'allocatedChangesetIdStart',
        'allocatedChangesetIdEnd',
        core.allocatedChangesetIDsRange
      )
    );
    return responseCore;
  }

  private allocateIDsRange(lastID: number, coreSize: CoreSize): string {
    return rangeFormatter(lastID + 1, lastID + IDS_RANGES_SIZES[coreSize]); // Format range to Postgresql range format
  }

  private allocateAllIDsRange(core: CoreModel, coreSize: CoreSize): CoreModel {
    const allocatedIDsRanges: StringValueObject = {};
    Object.entries(COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE).forEach(
      ([coreModelColumn, idStateType]) => {
        allocatedIDsRanges[coreModelColumn] = this.allocateIDsRange(
          CoresController.currentAllocatedIDs[idStateType],
          coreSize
        );
        CoresController.currentAllocatedIDs[idStateType] +=
          IDS_RANGES_SIZES[coreSize]; // Update current ID state
      }
    );

    return defaults(core, allocatedIDsRanges);
  }
}
