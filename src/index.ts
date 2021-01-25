//this import must be called before the first import of tsyring
import 'reflect-metadata';
import { Probe } from '@map-colonies/mc-probe';
import config from 'config';
import { container } from 'tsyringe';
import { getApp } from './app';
import { DEFAULT_SERVER_PORT } from './common/constants';

async function main(): Promise<void> {
  const port = config.get<string | undefined>('server.port');
  const app = await getApp();
  const probe = container.resolve(Probe);
  await probe.start(app, port !== undefined ? Number(port) : DEFAULT_SERVER_PORT);
  probe.readyFlag = true;
}

void main();