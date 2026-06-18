import type { ExpenseDAL } from '../dal/expense.dal';
import type { SplitConfiguration } from '../models/expense.model';
import { NotFoundError, ValidationError } from '../utils/errors';
import { roundMoney } from '../utils/helpers';
import type { DebtService } from './debt.service';
import type { ParserService } from './parser.service';

export class ExpenseService {
  constructor(
    private expenseDAL: ExpenseDAL,
    private debtService: DebtService,
    private parserService: ParserService,
  ) {}

  async createExpense(
    groupId: string,
    payerId: string,
    amount: number,
    description: string,
    splitConfig: SplitConfiguration,
  ): Promise<unknown> {
    this.validateSplitConfiguration(splitConfig, amount);

    const parsedExpense = this.parserService.parseExpense({
      groupId,
      payerId,
      amount,
      description,
      splitConfig,
    });

    const expense = await this.expenseDAL.create(parsedExpense);
    await this.debtService.recalculateDebts(groupId);
    return this.parserService.serializeExpense(expense);
  }

  async getExpense(id: string): Promise<unknown> {
    const expense = await this.expenseDAL.findById(id);
    if (!expense) throw new NotFoundError('Expense');
    return this.parserService.serializeExpense(expense);
  }

  async getGroupExpenses(groupId: string): Promise<unknown[]> {
    const expenses = await this.expenseDAL.findByGroup(groupId);
    return expenses.map((expense) => this.parserService.serializeExpense(expense));
  }

  async searchExpenses(query: string, groupId?: string): Promise<unknown[]> {
    const expenses = await this.expenseDAL.search(query, groupId);
    return expenses.map((expense) => this.parserService.serializeExpense(expense));
  }

  validateSplitConfiguration(config: SplitConfiguration, totalAmount: number): void {
    if (config.splits.length === 0) throw new ValidationError('At least one split is required');

    switch (config.type) {
      case 'equal':
        return;
      case 'exact': {
        const sum = roundMoney(config.splits.reduce((acc, split) => acc + (split.amount ?? 0), 0));
        if (Math.abs(sum - totalAmount) > 0.01) {
          throw new ValidationError('Split amounts must equal total expense amount');
        }
        return;
      }
      case 'percentage': {
        const totalPercent = roundMoney(
          config.splits.reduce((acc, split) => acc + (split.percentage ?? 0), 0),
        );
        if (Math.abs(totalPercent - 100) > 0.01) {
          throw new ValidationError('Split percentages must equal 100%');
        }
        return;
      }
      default:
        throw new ValidationError('Unsupported split type');
    }
  }
}
