import { get } from 'config';
import { config as initDotEnv } from 'dotenv';
import { Request, RequestHandler, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { delay, inject, injectable } from 'tsyringe';
import { load } from 'yamljs';
import { MCLogger } from '@map-colonies/mc-logger';

interface SwaggerServer  { 
  [key: string]: unknown,
  url: string;
}

@injectable()
export class SwaggerController {
  public uiMiddleware: RequestHandler[];
  public serveUi: RequestHandler;

  private readonly swaggerDoc: swaggerUi.JsonObject;

  private readonly swaggerConfig: {
    jsonPath: string;
    uiPath: string;
  };

  public constructor(
    @inject(delay(() => MCLogger)) private readonly logger: MCLogger
  ) {
    this.swaggerConfig = get('swagger');
    // load swagger object from file
    this.swaggerDoc = load('./docs/openapi3-cia.yaml') as swaggerUi.JsonObject;
    this.setSwaggerHost();
    this.serveUi = swaggerUi.setup(this.swaggerDoc);
    this.uiMiddleware = swaggerUi.serve;
  }

  public serveJson(req: Request, res: Response): void {
    res.json(this.swaggerDoc);
  }

  private setSwaggerHost(): void {
    // TODO: what is the purpose of this function?
    initDotEnv();
    const host: string = process.env.HOST ?? 'http://localhost';
    const port: string = process.env.SERVER_PORT ?? '80';
    const servers = (this.swaggerDoc.servers) as SwaggerServer[];
    servers[0].url = `${host}:${port}`;
  }
}
