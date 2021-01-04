import {Application} from 'express';
import {container} from 'tsyringe';
import {registerExternalValues} from './containerConfig';
import {ServerBuilder} from './serverBuilder';

async function getApp(): Promise<Application> {
  await registerExternalValues();
  const app = container.resolve(ServerBuilder).build();
  return app;
}
export {getApp};
