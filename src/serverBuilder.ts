import { MCLogger } from '@map-colonies/mc-logger';
import * as bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { initAsync as validatorInit } from 'openapi-validator-middleware';
import { container, injectable } from 'tsyringe';
import { ErrorHandler } from './middleware/ErrorHandler';
import { RequestLogger } from './middleware/RequestLogger';
import { coresRoutesFactory } from './routers/v1/cores';

import { globalRoutesFactory } from './routers/global';

@injectable()
export class ServerBuilder {
  private readonly serverInstance = express();

  public constructor(
    private readonly logger: MCLogger,
    private readonly requestLogger: RequestLogger,
    private readonly errorHandler: ErrorHandler
  ) {
    this.serverInstance = express();
  }

  public async build(): Promise<express.Application> {
    // Initiate swagger validator
    await validatorInit('./docs/openapi3-cia.yaml');

    this.registerMiddlewares();
    // this.serverInstance.use('/api/v1', coresRoutesFactory(container));
    this.serverInstance.use(globalRoutesFactory());
    this.serverInstance.use(this.errorHandler.getErrorHandlerMiddleware());

    return this.serverInstance;
  }

  private registerMiddlewares(): void {
    this.serverInstance.use(cors());
    this.serverInstance.use(bodyParser.json());
    this.serverInstance.use(this.requestLogger.getLoggerMiddleware());
  }
}
