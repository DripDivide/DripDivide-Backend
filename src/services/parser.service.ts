import { randomUUID } from 'crypto';
import type { Expense, ExpenseInput, SplitConfiguration } from '../models/expense.model';
import { roundMoney, toMoneyString } from '../utils/helpers';

export class ParserService {
  parseExpense(input: ExpenseInput): Expense {
    return {
      id: randomUUID(),
      groupId: input.groupId,
      payerId: input.payerId,
      amount: roundMoney(input.amount),
      description: input.description.trim(),
      splitConfig: this.parseSplitConfiguration(input.splitConfig, input.amount),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  serializeExpense(expense: Expense) {
    return {
      id: expense.id,
      groupId: expense.groupId,
      payerId: expense.payerId,
      amount: toMoneyString(expense.amount),
      description: expense.description,
      splitConfiguration: {
        type: expense.splitConfig.type,
        splits: expense.splitConfig.splits.map((split) => ({
          userId: split.userId,
          amount: split.amount === undefined ? undefined : toMoneyString(split.amount),
          percentage: split.percentage,
        })),
      },
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    };
  }

  private parseSplitConfiguration(config: SplitConfiguration, totalAmount: number): SplitConfiguration {
    if (config.type !== 'equal') {
      return {
        type: config.type,
        splits: config.splits.map((split) => ({
          userId: split.userId,
          amount: split.amount === undefined ? undefined : roundMoney(split.amount),
          percentage: split.percentage,
        })),
      };
    }

    const baseAmount = Math.floor((totalAmount / config.splits.length) * 100) / 100;
    let remainderCents = Math.round(totalAmount * 100) - Math.round(baseAmount * 100) * config.splits.length;

    return {
      type: 'equal',
      splits: config.splits.map((split) => {
        const extraCent = remainderCents > 0 ? 0.01 : 0;
        remainderCents -= extraCent > 0 ? 1 : 0;
        return {
          userId: split.userId,
          amount: roundMoney(baseAmount + extraCent),
        };
      }),
    };
  }
}
