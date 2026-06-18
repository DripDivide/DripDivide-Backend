import { Router } from 'express';
import { ExpenseController } from '../controllers/expense.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { expenseSchemas } from '../validators/expense.validator';

export function createExpenseRoutes(controller: ExpenseController): Router {
  const router = Router();

  router.use(authenticate);
  router.get('/search', validate(expenseSchemas.search), controller.searchExpenses.bind(controller));
  router.post('/', validate(expenseSchemas.create), controller.createExpense.bind(controller));
  router.get('/:id', validate(expenseSchemas.getById), controller.getExpense.bind(controller));

  return router;
}
