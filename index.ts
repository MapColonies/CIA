//this import must be called before the first import of tsyring
import 'reflect-metadata';
import { Probe } from '@map-colonies/mc-probe';
import config from 'config';
import { container } from 'tsyringe';
import { getApp } from './src/app';
import { DEFAULT_SERVER_PORT } from './src/common/constants';

async function main(): Promise<void> {
  const port = config.get<number | undefined>('server.port') ?? DEFAULT_SERVER_PORT;
  const app = await getApp();
  const probe = container.resolve(Probe);
  await probe.start(app, port);
  probe.readyFlag = true;
}

void main();
