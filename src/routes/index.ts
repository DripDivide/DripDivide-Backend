import { Router } from 'express';
import { pool } from '../config/database';
import { AuthController } from '../controllers/auth.controller';
import { DebtController } from '../controllers/debt.controller';
import { ExpenseController } from '../controllers/expense.controller';
import { GroupController } from '../controllers/group.controller';
import { SettlementController } from '../controllers/settlement.controller';
import { UserController } from '../controllers/user.controller';
import { WalletController } from '../controllers/wallet.controller';
import { DebtDAL } from '../dal/debt.dal';
import { ExpenseDAL } from '../dal/expense.dal';
import { GroupDAL } from '../dal/group.dal';
import { SettlementDAL } from '../dal/settlement.dal';
import { UserDAL } from '../dal/user.dal';
import { AuthService } from '../services/auth.service';
import { DebtService } from '../services/debt.service';
import { ExpenseService } from '../services/expense.service';
import { GroupService } from '../services/group.service';
import { ParserService } from '../services/parser.service';
import { SettlementService } from '../services/settlement.service';
import { StellarService } from '../services/stellar.service';
import { WalletService } from '../services/wallet.service';
import { createAuthRoutes } from './auth.routes';
import { createDebtRoutes } from './debt.routes';
import { createExpenseRoutes } from './expense.routes';
import { createGroupRoutes } from './group.routes';
import { createSettlementRoutes } from './settlement.routes';
import { createUserRoutes } from './user.routes';
import { createWalletRoutes } from './wallet.routes';

export function createRoutes(): Router {
  const router = Router();

  const userDAL = new UserDAL(pool);
  const groupDAL = new GroupDAL(pool);
  const expenseDAL = new ExpenseDAL(pool);
  const debtDAL = new DebtDAL(pool);
  const settlementDAL = new SettlementDAL(pool);

  const parserService = new ParserService();
  const debtService = new DebtService(debtDAL, expenseDAL);
  const stellarService = new StellarService();

  router.use('/auth', createAuthRoutes(new AuthController(new AuthService(userDAL))));
  router.use('/groups', createGroupRoutes(new GroupController(new GroupService(groupDAL))));
  router.use(
    '/expenses',
    createExpenseRoutes(new ExpenseController(new ExpenseService(expenseDAL, debtService, parserService))),
  );
  router.use('/', createDebtRoutes(new DebtController(debtService)));
  router.use('/wallet', createWalletRoutes(new WalletController(new WalletService(stellarService, userDAL))));
  router.use(
    '/settlements',
    createSettlementRoutes(new SettlementController(new SettlementService(settlementDAL, stellarService))),
  );
  router.use('/users', createUserRoutes(new UserController()));

  return router;
}
