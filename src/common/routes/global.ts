import { Router } from 'express';
import { container } from 'tsyringe';
import { coresRoutesFactory } from '../../core/routers/v1/cores';
import { openapiRouterFactory } from './openapi';

const globalRoutesFactory = (): Router => {
  const globalRouter = Router();
  globalRouter.use(openapiRouterFactory(container));
  globalRouter.use('/api/v1', coresRoutesFactory(container));
  return globalRouter;
};
export { globalRoutesFactory };
