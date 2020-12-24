import { readFileSync } from 'fs';
import {
  ILoggerConfig,
  IServiceConfig,
  MCLogger
} from '@map-colonies/mc-logger';
import { Probe } from '@map-colonies/mc-probe';
import { get } from 'config';
import { container } from 'tsyringe';
import { createConnection, getRepository } from 'typeorm';
import { Core as CoreModel } from './models/core';

async function registerExternalValues(): Promise<void> {
  const loggerConfig = get<ILoggerConfig>('logger');
  const packageContent = readFileSync('./package.json', 'utf8');
  const service = JSON.parse(packageContent) as IServiceConfig;
  const logger = new MCLogger(loggerConfig, service);

  await createConnection();
  const coreRepository = getRepository(CoreModel);

  container.register<MCLogger>(MCLogger, { useValue: logger });
  container.register<Probe>(Probe, { useValue: new Probe(logger, {}) });
  container.register('CoreRepository', { useValue: coreRepository });
}

export { registerExternalValues };
