//this import must be called before the first import of tsyring
import 'reflect-metadata';
import { Probe } from '@map-colonies/mc-probe';
import config from 'config';
import { container } from 'tsyringe';
import { getApp } from './src/app';
import { Services } from './src/common/constants';

const DEFAULT_PORT = 8080;

async function main(): Promise<void> {
  const port = config.get<number | undefined>('server.port') ?? DEFAULT_PORT;
  const app = await getApp();
  const probe = container.resolve(Probe);
  await probe.start(app, port);
  probe.readyFlag = true;
}

void main();
