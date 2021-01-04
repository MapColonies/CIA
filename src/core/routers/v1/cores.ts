import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { CoresController } from '../../controllers/cores';

const coresRoutesFactory: FactoryFunction<Router> = (dependencyContainer): Router => {
  const coresRouter = Router();
  const controller = dependencyContainer.resolve(CoresController);

  coresRouter.route('/cores').get(controller.getCores).post(controller.createCore);
  coresRouter.route('/cores/:coreId').get(controller.getCoreByID);

  return coresRouter;
};

export { coresRoutesFactory };
