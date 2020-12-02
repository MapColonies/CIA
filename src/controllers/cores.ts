import { NextFunction, Request, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { injectable } from 'tsyringe';
import { createConnection, getRepository } from 'typeorm';
import { defaults, pick } from 'lodash';
import { v4 } from 'is-uuid';
import { Core as CoreModel, CoreSize } from '../models/core'

interface IDsRangeSizes {
  small: number;
  medium: number;
  large: number;
}

interface StringIndexType {
  [index: string]: string;
}

interface CurrentAllocatedID {
  [index: string]: number;
  node: number;
  way: number;
  relation: number;
  changeset: number;
}

const COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE: StringIndexType = {
  allocatedNodeIDsRange: 'node',
  allocatedWayIDsRange: 'way',
  allocatedRelationIDsRange: 'relation',
  allocatedChangesetIDsRange: 'changeset'
};

// TODO: Set fixed sizes and consider moving to env vars
const ID_RANGES_SIZES: IDsRangeSizes = {
  small: 10000,
  medium: 1000000,
  large: 100000000
};

@injectable()
export class CoresController {
  private static currentAllocatedIDs: CurrentAllocatedID = {
    node: 0,
    way: 0,
    relation: 0,
    changeset: 0
  };

  public constructor() {
    void this.initialize();
  }

  public async getCores(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cores = await getRepository(CoreModel).find();
      res.status(HttpStatus.OK).json(cores);
    } catch (error) {
      next(error);
    }
  }

  public async createCore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestedCore = defaults(pick(req.body, ['coreSize', 'description']) as CoreModel, { coreSize: 'small' }); // extract only properties that are valid request payload

      // FIXME: Should coreSize be set to default if not passed in payload?
      if (!requestedCore.description) return res.status(HttpStatus.BAD_REQUEST).end();

      const calculatedCore = this.allocateAllIDsRange(requestedCore, requestedCore.coreSize);
      const createdCore = getRepository(CoreModel).create(calculatedCore);
      const savedCore = await getRepository(CoreModel).save(createdCore);

      const host = req.headers?.host ?? req.hostname;
      const locationHeader = `${req.protocol}://${host}${req.baseUrl}/cores/${savedCore.coreID}`;
      res.status(HttpStatus.CREATED).header('Location', locationHeader).json(savedCore);
    } catch (error) {
      next(error);
    }
  }

  public async getCoreByID(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!v4(req.params.coreId)) return res.status(HttpStatus.BAD_REQUEST).end();
      const core = await getRepository(CoreModel).findOne({ coreID: req.params.coreId });
      if (core) res.status(HttpStatus.OK).json(core)
      else res.status(HttpStatus.NOT_FOUND).end()
    } catch (error) {
      next(error);
    }
  }

  private async initialize(): Promise<void> {
    await createConnection(); // connection configurations load from ormconfig.env

    // return to last allocated IDs state by querying the database if possible
    const lastAllocation = await getRepository(CoreModel).findOne({ order: { id: 'DESC' } });
    if (!lastAllocation) return;

    const allocatedIDsRange = pick(lastAllocation, Object.keys(COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE));
    Object.entries(allocatedIDsRange).forEach(([coreModelColumn, lastIDAllocationRange]) => {
      // extract upper bound of IDs allocation range and subtract one, because the range's upper bound is not inclusive
      const upperBound = parseInt((lastIDAllocationRange as string).split(',')[1]) - 1;

      // update the state of allocated IDs
      CoresController.currentAllocatedIDs[COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE[coreModelColumn]] = upperBound;
    });
  }

  /**
   * 
   * @param start 
   * @param end 
   */
  private rangeFormatter(start: number, end: number): string {
    return `[${start}, ${end}]`;
  }

  /**
   * 
   * @param lastID 
   * @param coreSize 
   */
  private allocateIDsRange(lastID: number, coreSize: CoreSize): string {
    return this.rangeFormatter(lastID + 1, lastID + ID_RANGES_SIZES[coreSize]);
  }

  private allocateAllIDsRange(core: CoreModel, coreSize: CoreSize): CoreModel {
    const allocatedIDsRanges: StringIndexType = {};
    Object
      .entries(COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE)
      .forEach(([coreModelColumn, idStateType]) => {
        allocatedIDsRanges[coreModelColumn] = this.allocateIDsRange(CoresController.currentAllocatedIDs[idStateType], coreSize);
        CoresController.currentAllocatedIDs[idStateType] += ID_RANGES_SIZES[coreSize]; // update current ID state
      });

    return defaults(core, allocatedIDsRanges);
  }
}
