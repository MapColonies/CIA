import { Router } from 'express';
import { container } from 'tsyringe';
import { coresRoutesFactory } from '../../core/routers/v1/cores';
import { swaggerRouterFactory } from './swagger';

const globalRoutesFactory = (): Router => {
    const globalRouter = Router();
    // TODO: change swagger to openapi
    globalRouter.use(swaggerRouterFactory(container));
    globalRouter.use('/api/v1', coresRoutesFactory(container));
    return globalRouter;
}
export { globalRoutesFactory };
