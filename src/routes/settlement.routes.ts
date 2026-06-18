import { Router } from 'express';
import { SettlementController } from '../controllers/settlement.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { settlementSchemas } from '../validators/settlement.validator';

export function createSettlementRoutes(controller: SettlementController): Router {
  const router = Router();

  router.use(authenticate);
  router.post('/', validate(settlementSchemas.create), controller.createSettlement.bind(controller));
  router.get('/', controller.getSettlements.bind(controller));
  router.get('/:id', validate(settlementSchemas.getById), controller.getSettlement.bind(controller));

  return router;
}
