import { Router } from 'express';
import { DebtController } from '../controllers/debt.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { userSchemas } from '../validators/user.validator';
import { expenseSchemas } from '../validators/expense.validator';

export function createDebtRoutes(controller: DebtController): Router {
  const router = Router();

  router.use(authenticate);
  router.get('/groups/:groupId/debts', validate(expenseSchemas.getByGroup), controller.getGroupDebts.bind(controller));
  router.get('/users/me/balance/:groupId', validate(userSchemas.balance), controller.getMyBalance.bind(controller));

  return router;
}
