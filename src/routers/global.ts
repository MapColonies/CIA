import { Router } from 'express';
// import { swaggerRouter } from './swagger';
import { coresRouter } from './v1/cores';

const globalRouter = Router();
// globalRouter.use(swaggerRouter);
globalRouter.use('/api/v1', coresRouter);

export { globalRouter };
