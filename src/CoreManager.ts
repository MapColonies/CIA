import { defaults, omit, pick } from 'lodash';
import { inject, injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import {
  COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE,
  IDS_RANGES_SIZES
} from './common/constants/constants';
import { CurrentAllocatedID, ResponseCore } from './common/interfaces';
import { CoreSize } from './common/types/core';
import { StringValueObject } from './common/types/indexable_types';
import { Core as CoreModel } from './models/core';
import {
  getIntRangeBound,
  rangeFormatter,
  rangeToObj
} from './utils/postgres_ranges';

@injectable()
export class CoreManager {
  private static currentAllocatedIDs: CurrentAllocatedID = {
    node: 0,
    way: 0,
    relation: 0,
    changeset: 0,
  };

  public constructor(
    @inject('CoreRepository') private readonly repository: Repository<CoreModel>
  ) {
    void this.initialize();
  }

  public async allocateIDs(requestedCore: CoreModel): Promise<CoreModel> {
    const calculatedCore = this.allocateAllIDsRange(requestedCore);
    const createdCore = this.repository.create(calculatedCore);
    const savedCore = await this.repository.save(createdCore);
    return savedCore;
  }

  public async findCores(): Promise<ResponseCore[]> {
    const cores = await this.repository.find();
    return cores.map((core) => this.generateResponseCore(core));
  }

  public async findCoreById(coreId: string): Promise<ResponseCore | undefined> {
    const core = await this.repository.findOne(coreId);
    return core ? this.generateResponseCore(core) : undefined;
  }

  private async initialize(): Promise<void> {
    // Return to last allocated IDs state by querying the database if possible
    const lastAllocation = await this.repository.findOne({
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

  private generateResponseCore(core: CoreModel): ResponseCore {
    const partialResponseCore = omit(core, [
      'allocatedNodeIDsRange',
      'allocatedWayIDsRange',
      'allocatedRelationIDsRange',
      'allocatedChangesetIDsRange',
    ]) as ResponseCore;

    // create a respone core witch transforms IDs allocation ranges to core ends
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

  private allocateAllIDsRange(core: CoreModel): CoreModel {
    const allocatedIDsRanges: StringValueObject = {};
    Object.entries(COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE).forEach(
      ([coreModelColumn, idStateType]) => {
        allocatedIDsRanges[coreModelColumn] = this.allocateIDsRange(
          CoreManager.currentAllocatedIDs[idStateType],
          core.coreSize
        );
        CoreManager.currentAllocatedIDs[idStateType] +=
          IDS_RANGES_SIZES[core.coreSize]; // Update current ID state
      }
    );

    return defaults(core, allocatedIDsRanges);
  }
}
