import { Router } from 'express';
// import { swaggerRouter } from './swagger';
import { container } from 'tsyringe';
import { coresRoutesFactory } from './v1/cores';

const globalRoutesFactory = (): Router => {
    const globalRouter = Router();
    // globalRouter.use(swaggerRouter);
    globalRouter.use('/api/v1', coresRoutesFactory(container));
    return globalRouter;
}
export { globalRoutesFactory };
