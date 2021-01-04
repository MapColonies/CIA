import { pick } from 'lodash';
import { ILogger } from 'src/common/interfaces';
import { inject, injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import { COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE, Services } from '../common/constants';
import { getIntRangeBound, rangeFormatter } from '../utils/postgresRanges';
import { CurrentAllocatedID, IDsRangesSizes, IResponseCore } from './interfaces';
import { Core as CoreModel } from './models/core';
import { CoreNotFoundError } from './models/errors';
import { ResponseCore } from './models/responseCore';

@injectable()
export class CoreManager {
  private static currentAllocatedIDs: CurrentAllocatedID = {
    node: 0,
    way: 0,
    relation: 0,
    changeset: 0,
  };

  public constructor(
    @inject('CoreRepository') private readonly repository: Repository<CoreModel>,
    @inject('CORE_IDS_RANGES_SIZES') private readonly idsRangesSizes: IDsRangesSizes,
    @inject(Services.LOGGER) private readonly logger: ILogger
  ) {
    void this.initialize();
  }

  public async allocateIDs(requestedCore: CoreModel): Promise<IResponseCore> {
    const calculatedCore = this.allocateAllIDsRange(requestedCore);
    const createdCore = this.repository.create(calculatedCore);
    const savedCore = await this.repository.save(createdCore);
    const responseCore = new ResponseCore(savedCore);
    this.logger.log('info', `allocated a new core - ${JSON.stringify(responseCore)}`);
    return responseCore;
  }

  public async findCores(): Promise<IResponseCore[]> {
    const cores = await this.repository.find();

    const responseCores = cores.map((core) => new ResponseCore(core));
    return responseCores;
  }

  public async findCoreById(coreId: string): Promise<IResponseCore> {
    const core = await this.repository.findOne({ coreID: coreId });

    if (!core) throw new CoreNotFoundError(`coreID - ${coreId} was not found`);

    const responseCore = new ResponseCore(core);
    return responseCore;
  }

  private async initialize(): Promise<void> {
    // Return to last allocated IDs state by querying the database
    const lastAllocation = await this.repository.findOne({
      order: { id: 'DESC' },
    });

    if (!lastAllocation) return; // The database is empty, no need to initialize properties

    const allocatedIDsRange = pick(lastAllocation, Object.keys(COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE));
    Object.entries(allocatedIDsRange).forEach(([coreModelColumn, lastIDAllocationRange]) => {
      // Extract upper bound of IDs allocation range and subtract one, because the range's upper bound is not inclusive
      const upperBound = getIntRangeBound(lastIDAllocationRange as string, 'upper');
      // Update the state of allocated IDs
      CoreManager.currentAllocatedIDs[COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE[coreModelColumn]] = upperBound;
    });

    this.logger.log('info', `initialized coreManager with IDs initial state - ${JSON.stringify(CoreManager.currentAllocatedIDs)}`);
  }

  private allocateIDsRange(lastID: number, allocationSize: number): string {
    return rangeFormatter(lastID + 1, lastID + allocationSize); // Format range to Postgresql range format
  }

  private allocateAllIDsRange(core: CoreModel): Partial<CoreModel> {
    const columnToTypeMapping = Object.entries(COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE);

    // Create an object with allocated IDs ranges for all ID columns
    const allocatedIDsRanges = columnToTypeMapping.reduce(
      (o, [coreModelColumn, idStateType]) => ({
        ...o,
        [coreModelColumn]: this.allocateIDsRange(CoreManager.currentAllocatedIDs[idStateType], this.idsRangesSizes[core.coreSize]),
      }),
      {}
    );

    // Update current ID state of CoreManager
    for (const idStateType in CoreManager.currentAllocatedIDs) {
      CoreManager.currentAllocatedIDs[idStateType] += this.idsRangesSizes[core.coreSize];
    }

    return { ...core, ...allocatedIDsRanges };
  }
}
