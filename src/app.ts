import {Application} from 'express';
import {container} from 'tsyringe';
import {ServerBuilder} from './serverBuilder';
import {registerExternalValues} from './containerConfig';

async function getApp(): Promise<Application> {
  registerExternalValues();
  const app = await container.resolve(ServerBuilder).build();
  return app;
}
export {getApp};
