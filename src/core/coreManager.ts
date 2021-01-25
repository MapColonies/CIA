import { ILogger } from 'src/common/interfaces';
import { inject, injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import { Services } from '../common/constants';
import { rangeFormatter } from '../utils/postgresRanges';
import { COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE, CORE_ID_COLUMNS, DEFAULT_IDS } from './constants';
import { IDsRangesSizes, IResponseCore } from './interfaces';
import { Core as CoreModel } from './models/core';
import { CoreNotFoundError } from './models/errors';
import { ResponseCore } from './models/responseCore';
import { CalculatedCore, CoreCurrentAllocatedIDsRange, CurrentAllocatedID, InputCore } from './types';

@injectable()
export class CoreManager {
  private static internalCurrentAllocatedIDs: CurrentAllocatedID = { ...DEFAULT_IDS };

  public constructor(
    @inject('CoreRepository') private readonly repository: Repository<CoreModel>,
    @inject('CORE_IDS_RANGES_SIZES') private readonly idsRangesSizes: IDsRangesSizes,
    @inject(Services.LOGGER) private readonly logger: ILogger,
    @inject('InitialAllocationIDs') private readonly initialAllocationIDs: CurrentAllocatedID
  ) {
    CoreManager.internalCurrentAllocatedIDs = { ...initialAllocationIDs };
  }

  public get currentAllocatedIDs(): CurrentAllocatedID {
    return CoreManager.internalCurrentAllocatedIDs;
  }

  public async allocateIDs(requestedCore: InputCore): Promise<IResponseCore> {
    const calculatedCore = this.allocateAllIDsRange(requestedCore);
    const createdCore = this.repository.create(calculatedCore);
    const savedCore = await this.repository.save(createdCore);
    const responseCore = new ResponseCore(savedCore);
    this.logger.log('debug', `allocated a new core ${responseCore.coreID}`);
    return responseCore;
  }

  public async findCores(): Promise<IResponseCore[]> {
    const cores = await this.repository.find();

    const responseCores = cores.map((core) => new ResponseCore(core));
    return responseCores;
  }

  public async findCoreById(coreId: string): Promise<IResponseCore> {
    const core = await this.repository.findOne({ coreID: coreId });

    if (!core) {
      throw new CoreNotFoundError(`coreID - ${coreId} was not found`);
    }

    const responseCore = new ResponseCore(core);
    return responseCore;
  }

  private allocateIDsRange(lastID: number, allocationSize: number): string {
    return rangeFormatter(lastID + 1, lastID + allocationSize); // Format range to Postgresql range format
  }

  private allocateAllIDsRange(core: InputCore): CalculatedCore {
    const allocatedIDsRanges: CoreCurrentAllocatedIDsRange = {
      allocatedNodeIDsRange: '',
      allocatedWayIDsRange: '',
      allocatedRelationIDsRange: '',
      allocatedChangesetIDsRange: '',
    };

    for (const coreModelColumn of CORE_ID_COLUMNS) {
      // Create an object with allocated IDs ranges for all ID columns
      const idStateType = COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE[coreModelColumn];
      allocatedIDsRanges[coreModelColumn] = this.allocateIDsRange(this.currentAllocatedIDs[idStateType], this.idsRangesSizes[core.coreSize]);

      // Update current ID state of CoreManager
      this.currentAllocatedIDs[idStateType] += this.idsRangesSizes[core.coreSize];
    }

    return { ...core, ...allocatedIDsRanges };
  }
}
