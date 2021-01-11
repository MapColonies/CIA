import { ILogger } from 'src/common/interfaces';
import { inject, injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import { Services } from '../common/constants';
import { rangeFormatter } from '../utils/postgresRanges';
import { COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE, DEFAULT_IDS } from './constants';
import { IDsRangesSizes, IResponseCore } from './interfaces';
import { Core as CoreModel } from './models/core';
import { CoreNotFoundError } from './models/errors';
import { ResponseCore } from './models/responseCore';
import { CoreCurrentAllocatedIDsRange, CoreIDColumn, CurrentAllocatedID } from './types';

@injectable()
export class CoreManager {
  private static _currentAllocatedIDs: CurrentAllocatedID = { ...DEFAULT_IDS };

  public constructor(
    @inject('CoreRepository') private readonly repository: Repository<CoreModel>,
    @inject('CORE_IDS_RANGES_SIZES') private readonly idsRangesSizes: IDsRangesSizes,
    @inject(Services.LOGGER) private readonly logger: ILogger,
    @inject('InitialAllocationIDs') private readonly initialAllocationIDs: CurrentAllocatedID
  ) {
    CoreManager._currentAllocatedIDs = { ...initialAllocationIDs };
  }
  public get currentAllocatedIDs(): CurrentAllocatedID {
    return CoreManager._currentAllocatedIDs;
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

  private allocateIDsRange(lastID: number, allocationSize: number): string {
    return rangeFormatter(lastID + 1, lastID + allocationSize); // Format range to Postgresql range format
  }

  private allocateAllIDsRange(core: CoreModel): CoreModel {
    const columnToTypeMapping = Object.entries(COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE);
    const allocatedIDsRanges: CoreCurrentAllocatedIDsRange = {} as CoreCurrentAllocatedIDsRange;

    for (const [coreModelColumn, idStateType] of columnToTypeMapping) {
      // Create an object with allocated IDs ranges for all ID columns
      allocatedIDsRanges[coreModelColumn as CoreIDColumn] = this.allocateIDsRange(
        this.currentAllocatedIDs[idStateType],
        this.idsRangesSizes[core.coreSize]
      );

      // Update current ID state of CoreManager
      this.currentAllocatedIDs[idStateType] += this.idsRangesSizes[core.coreSize];
    }

    return { ...core, ...allocatedIDsRanges };
  }
}
