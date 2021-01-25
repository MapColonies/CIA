import { getErrorHandlerMiddleware } from '@map-colonies/error-express-handler';
import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Router } from 'express';
import { middleware as OpenApiMiddleware } from 'express-openapi-validator';
import { container, inject, injectable } from 'tsyringe';
import { Services } from './common/constants';
import { IConfig, ILogger } from './common/interfaces';
import { RequestLogger } from './common/middlewares/RequestLogger';
import { openapiRouterFactory } from './common/routes/openapi';
import { coresRoutesFactory } from './core/routers/v1/cores';

@injectable()
export class ServerBuilder {
  private readonly serverInstance = express();

  public constructor(
    @inject(Services.LOGGER) private readonly logger: ILogger,
    @inject(Services.CONFIG) private readonly config: IConfig,
    private readonly requestLogger: RequestLogger
  ) {
    this.serverInstance = express();
  }

  public build(): express.Application {
    this.registerPreRoutesMiddleware();
    this.buildRoutes();
    this.registerPostRoutesMiddleware();

    return this.serverInstance;
  }

  private readonly globalRoutesFactory = (): Router => {
    const globalRouter = Router();
    globalRouter.use(openapiRouterFactory(container));
    globalRouter.use('/api/v1/cores', coresRoutesFactory(container));
    return globalRouter;
  };

  private buildRoutes(): void {
    this.serverInstance.use(this.globalRoutesFactory());
  }

  private registerPreRoutesMiddleware(): void {
    this.serverInstance.use(cors());
    this.serverInstance.use(bodyParser.json());

    const ignorePathRegex = new RegExp(`^${this.config.get<string>('openapiConfig.basePath')}/.*`, 'i');
    const apiSpecPath = this.config.get<string>('openapiConfig.filePath');
    this.serverInstance.use(
      OpenApiMiddleware({
        apiSpec: apiSpecPath,
        validateRequests: true,
        ignorePaths: ignorePathRegex,
      })
    );

    this.serverInstance.use(this.requestLogger.getLoggerMiddleware());
  }

  private registerPostRoutesMiddleware(): void {
    this.serverInstance.use(getErrorHandlerMiddleware((message) => this.logger.log('error', message)));
  }
}
