import { readFileSync } from 'fs';
import { ILoggerConfig, IServiceConfig, MCLogger } from '@map-colonies/mc-logger';
import { Probe } from '@map-colonies/mc-probe';
import config from 'config';
import { container } from 'tsyringe';
import { createConnection, getRepository } from 'typeorm';
import { Core as CoreModel } from './core/models/core';
import { Services } from './common/constants';
import { IDsRangesSizes } from './core/interfaces';

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

  container.register<Probe>(Probe, { useValue: new Probe(logger, {}) });
  container.register('CoreRepository', { useValue: coreRepository });
  container.register('CORE_IDS_RANGES_SIZES', { useValue: CORE_IDS_RANGES_SIZES });
}

export { registerExternalValues };
