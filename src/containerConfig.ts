import { readFileSync } from 'fs';
import { ILoggerConfig, IServiceConfig, MCLogger } from '@map-colonies/mc-logger';
import { Probe } from '@map-colonies/mc-probe';
import config from 'config';
import { container } from 'tsyringe';
import { createConnection, getRepository, Repository } from 'typeorm';
import { Services } from './common/constants';
import { IDsRangesSizes } from './core/interfaces';
import { Core as CoreModel } from './core/models/core';
import { getIntRangeBound } from './utils/postgresRanges';
import { CurrentAllocatedID, CoreIDColumn } from './core/types';
import { COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE, DEFAULT_IDS } from './core/constants';

async function initializeIDs(repository: Repository<CoreModel>): Promise<CurrentAllocatedID> {
  const initializedIDs = { ...DEFAULT_IDS } as CurrentAllocatedID;

  const columnNames = Object.keys(COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE) as CoreIDColumn[];

  const lastAllocation = await repository.findOne({
    order: { id: 'DESC' },
    select: columnNames,
  });

  if (!lastAllocation) return initializedIDs; // The database is empty, no need to initialize properties

  for (const coreModelColumn of columnNames) {
    // Extract the upper bound of IDs allocation range
    const upperBound = getIntRangeBound(lastAllocation[coreModelColumn], 'upper');
    // Update the state of allocated IDs
    const idStateType = COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE[coreModelColumn];
    initializedIDs[idStateType] = upperBound;
  }

  return initializedIDs;
}

async function registerExternalValues(): Promise<void> {
  const loggerConfig = config.get<ILoggerConfig>('logger');
  const packageContent = readFileSync('./package.json', 'utf8');
  const service = JSON.parse(packageContent) as IServiceConfig;
  const logger = new MCLogger(loggerConfig, service);

  const CORE_IDS_RANGES_SIZES: IDsRangesSizes = {
    small: config.get<number>('core.sizes.small'),
    medium: config.get<number>('core.sizes.medium'),
    large: config.get<number>('core.sizes.large'),
  };

  container.register(Services.CONFIG, { useValue: config });
  container.register(Services.LOGGER, { useValue: logger });

  await createConnection();
  const coreRepository = getRepository(CoreModel);

  const initialAllocationIDs = await initializeIDs(coreRepository);

  container.register<Probe>(Probe, { useValue: new Probe(logger, {}) });
  container.register('CoreRepository', { useValue: coreRepository });
  container.register('CORE_IDS_RANGES_SIZES', { useValue: CORE_IDS_RANGES_SIZES });
  container.register('InitialAllocationIDs', { useValue: initialAllocationIDs });
}

export { registerExternalValues };
