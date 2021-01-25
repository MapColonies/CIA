import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { CoresController } from '../../controllers/cores';

const coresRoutesFactory: FactoryFunction<Router> = (dependencyContainer): Router => {
  const coresRouter = Router();
  const controller = dependencyContainer.resolve(CoresController);

  coresRouter.get('/', controller.getCores);
  coresRouter.post('/', controller.createCore);
  coresRouter.get('/:coreId', controller.getCoreByID);

  return coresRouter;
};

export { coresRoutesFactory };
