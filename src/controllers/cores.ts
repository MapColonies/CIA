import { NextFunction, Request, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { v4 } from 'is-uuid';
import { injectable } from 'tsyringe';
import { CoreManager } from '../CoreManager';
import { Core as CoreModel } from '../models/core';

@injectable()
export class CoresController {
  public constructor(private readonly coreManager: CoreManager) {}

  public async getCores(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const cores = await this.coreManager.findCores();
      res.status(HttpStatus.OK).json(cores);
    } catch (error) {
      next(error);
    }
  }

  public async createCore(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const coreModel = req.body as CoreModel;

      if (!coreModel.description)
        return res.status(HttpStatus.BAD_REQUEST).end();

      const savedCore = await this.coreManager.allocateIDs({
        coreSize: (coreModel.coreSize = 'small'),
        description: coreModel.description,
      } as CoreModel);

      const host = req.headers?.host ?? req.hostname;
      const locationHeader = `${req.protocol}://${host}${req.baseUrl}/cores/${savedCore.coreID}`;
      res
        .status(HttpStatus.CREATED)
        .header('Location', locationHeader)
        .json(savedCore);
    } catch (error) {
      next(error);
    }
  }

  public async getCoreByID(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!v4(req.params.coreId))
        return res.status(HttpStatus.BAD_REQUEST).end();

      const core = await this.coreManager.findCoreById(req.params.coreId);

      if (core) res.status(HttpStatus.OK).json(core);
      else res.status(HttpStatus.NOT_FOUND).end();
    } catch (error) {
      next(error);
    }
  }
}
