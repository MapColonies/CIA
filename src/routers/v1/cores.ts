import { Router } from 'express';
import { validate } from 'openapi-validator-middleware';
import { FactoryFunction } from 'tsyringe';
import { CoresController } from '../../controllers/cores';

const coresRoutesFactory: FactoryFunction<Router> = (
  dependencyContainer
): Router => {
  const coresRouter = Router();
  const controller = dependencyContainer.resolve(CoresController);

  coresRouter
    .route('/cores')
    .get(validate, controller.getCores.bind(controller))
    .post(validate, controller.createCore.bind(controller));

  coresRouter
    .route('/cores/:coreId')
    .get(validate, controller.getCoreByID.bind(controller));

  return coresRouter;
};

export { coresRoutesFactory };
