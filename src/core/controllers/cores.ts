import { RequestHandler } from 'express';
import HttpStatus from 'http-status-codes';
import { HttpError } from 'src/common/errors';
import { ParamsDictionary } from 'express-serve-static-core';
import { injectable } from 'tsyringe';
import { Core as CoreModel, CoreSize } from '../../core/models/core';
import { CoreManager } from '../coreManager';
import { IResponseCore } from '../interfaces';
import { CoreNotFoundError } from '../models/errors';

type GetCoresHandler = RequestHandler<ParamsDictionary, IResponseCore[]>;
type CreateCoreHandler = RequestHandler<ParamsDictionary, IResponseCore, { coreSize: CoreSize; description: string }>;
type GetCoreByIdHandler = RequestHandler<ParamsDictionary, IResponseCore>;

@injectable()
export class CoresController {
  public constructor(private readonly coreManager: CoreManager) {}

  public getCores: GetCoresHandler = async (req, res, next) => {
    try {
      const cores = await this.coreManager.findCores();
      res.status(HttpStatus.OK).json(cores);
    } catch (error) {
      next(error);
    }
  };

  public getCoreByID: GetCoreByIdHandler = async (req, res, next) => {
    let core: IResponseCore;

    try {
      core = await this.coreManager.findCoreById(req.params.coreId);
    } catch (error) {
      if (error instanceof CoreNotFoundError) (error as HttpError).status = HttpStatus.NOT_FOUND;

      return next(error);
    }
    res.status(HttpStatus.OK).json(core);
  };
  
  public createCore: CreateCoreHandler = async (req, res, next) => {
    const coreModel = req.body;
    let core: IResponseCore;

    try {
      core = await this.coreManager.allocateIDs({
        coreSize: coreModel.coreSize,
        description: coreModel.description,
      } as CoreModel);
    } catch (error) {
      return next(error);
    }

    const host = req.headers?.host ?? req.hostname;
    const locationHeader = `${req.protocol}://${host}${req.baseUrl}/cores/${core.coreID}`;
    res.status(HttpStatus.CREATED).header('Location', locationHeader).json(core);
  };
}
