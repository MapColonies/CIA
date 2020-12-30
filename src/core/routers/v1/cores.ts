import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { CoresController } from '../../controllers/cores';

const coresRoutesFactory: FactoryFunction<Router> = (
  dependencyContainer
): Router => {
  const coresRouter = Router();
  const controller = dependencyContainer.resolve(CoresController);

  coresRouter
    .route('/cores')
    .get(controller.getCores.bind(controller))
    .post(controller.createCore.bind(controller));

  coresRouter
    .route('/cores/:coreId')
    .get(controller.getCoreByID.bind(controller));

  return coresRouter;
};

export { coresRoutesFactory };
