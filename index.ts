//this import must be called before the first import of tsyring
import 'reflect-metadata';
import { config as initDotEnv } from 'dotenv';
import { Probe } from '@map-colonies/mc-probe';
import { container } from 'tsyringe';
import { getApp } from './src/app';

const DEFAULT_PORT = 80;

async function main(): Promise<void> {
  initDotEnv();
  const port =
    process.env.SERVER_PORT != undefined ? parseInt(process.env.SERVER_PORT) : DEFAULT_PORT;
  const app = await getApp();
  const probe = container.resolve(Probe);
  await probe.start(app, port);
  probe.readyFlag = true;
}

void main();
