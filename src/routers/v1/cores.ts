import { Router } from 'express';
import { container } from 'tsyringe';
import { validate } from 'openapi-validator-middleware';
import { CoresController } from '../../controllers/cores';

const coresRouter = Router();
const controller = container.resolve(CoresController);

coresRouter.route('/cores')
    .get(validate, controller.getCores.bind(controller))
    .post(validate, controller.createCore.bind(controller));

coresRouter.route('/cores/:coreId')
    .get(validate, controller.getCoreByID.bind(controller));

export { coresRouter };
