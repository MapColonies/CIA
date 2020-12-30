import { omit, pick } from 'lodash';
import { inject, injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import {
  COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE,
  IDS_RANGES_SIZES,
} from '../common/constants';
import { CurrentAllocatedID, ResponseCore } from '../core/interfaces';
import { Core as CoreModel } from '../core/models/core';
import {
  getIntRangeBound,
  rangeFormatter,
  rangeToObj,
} from '../../src/utils/postgres_ranges';

@injectable()
export class CoreManager {
  private static currentAllocatedIDs: CurrentAllocatedID = {
    node: 0,
    way: 0,
    relation: 0,
    changeset: 0,
  };

  // TODO: pass logger to constructor
  public constructor(
    @inject('CoreRepository') private readonly repository: Repository<CoreModel>
  ) {
    void this.initialize();
  }

  public static generateResponseCore(core: CoreModel): ResponseCore {
    const partialResponseCore = omit(core, [
      'allocatedNodeIDsRange',
      'allocatedWayIDsRange',
      'allocatedRelationIDsRange',
      'allocatedChangesetIDsRange',
    ]) as ResponseCore;

    // create a respone core witch transforms IDs allocation ranges to core ends
    const responseCore = {
      ...partialResponseCore,
      ...rangeToObj(
        'allocatedNodeIdStart',
        'allocatedNodeIdEnd',
        core.allocatedNodeIDsRange
      ),
      ...rangeToObj(
        'allocatedWayIdStart',
        'allocatedWayIdEnd',
        core.allocatedWayIDsRange
      ),
      ...rangeToObj(
        'allocatedRelationIdStart',
        'allocatedRelationIdEnd',
        core.allocatedRelationIDsRange
      ),
      ...rangeToObj(
        'allocatedChangesetIdStart',
        'allocatedChangesetIdEnd',
        core.allocatedChangesetIDsRange
      ),
    };
    return responseCore;
  }

  public async allocateIDs(requestedCore: CoreModel): Promise<CoreModel> {
    const calculatedCore = this.allocateAllIDsRange(requestedCore);
    const createdCore = this.repository.create(calculatedCore);
    const savedCore = await this.repository.save(createdCore);
    return savedCore;
  }

  public async findCores(): Promise<ResponseCore[]> {
    let cores;
    try {
      cores = await this.repository.find();
    } catch (e) {
      console.error(e);
    }
    return cores
      ? cores.map((core) => CoreManager.generateResponseCore(core))
      : [];
  }

  public async findCoreById(coreId: string): Promise<ResponseCore | undefined> {
    let core;
    try {
      core = await this.repository.findOne(coreId);
    } catch (e) {
      console.error(e);
    }
    return core ? CoreManager.generateResponseCore(core) : undefined;
  }

  private async initialize(): Promise<void> {
    // Return to last allocated IDs state by querying the database if possible
    let lastAllocation;
    try {
      lastAllocation = await this.repository.findOne({
        order: { id: 'DESC' },
      });
    } catch (e) {
      console.error(e);
    }

    if (!lastAllocation) return;
    const allocatedIDsRange = pick(
      lastAllocation,
      Object.keys(COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE)
    );
    Object.entries(allocatedIDsRange).forEach(
      ([coreModelColumn, lastIDAllocationRange]) => {
        // Extract upper bound of IDs allocation range and subtract one, because the range's upper bound is not inclusive
        const upperBound = getIntRangeBound(
          lastIDAllocationRange as string,
          'upper'
        );
        // Update the state of allocated IDs
        CoreManager.currentAllocatedIDs[
          COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE[coreModelColumn]
        ] = upperBound;
      }
    );
  }

  private allocateIDsRange(lastID: number, allocationSize: number): string {
    return rangeFormatter(lastID + 1, lastID + allocationSize); // Format range to Postgresql range format
  }

  private allocateAllIDsRange(core: CoreModel): Partial<CoreModel> {
    const columnToTypeMapping = Object.entries(
      COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE
    );

    // Create an object with allocated IDs ranges for all ID columns
    const allocatedIDsRanges = columnToTypeMapping.reduce(
      (o, [coreModelColumn, idStateType]) => ({
        ...o,
        [coreModelColumn]: this.allocateIDsRange(
          CoreManager.currentAllocatedIDs[idStateType],
          IDS_RANGES_SIZES[core.coreSize]
        ),
      }),
      {}
    );

    // Update current ID state of CoreManager
    const idStateTypes = Object.values(CoreManager.currentAllocatedIDs);
    idStateTypes.forEach((idStateType) => {
      CoreManager.currentAllocatedIDs[idStateType] +=
        IDS_RANGES_SIZES[core.coreSize];
    });

    return { ...core, ...allocatedIDsRanges };
  }
}
