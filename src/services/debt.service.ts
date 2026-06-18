import type { DebtDAL } from '../dal/debt.dal';
import type { ExpenseDAL } from '../dal/expense.dal';
import type { Debt } from '../models/debt.model';
import type { Expense } from '../models/expense.model';
import { roundMoney } from '../utils/helpers';

export class DebtService {
  constructor(
    private debtDAL: DebtDAL,
    private expenseDAL: ExpenseDAL,
  ) {}

  async recalculateDebts(groupId: string): Promise<void> {
    const expenses = await this.expenseDAL.findByGroup(groupId);
    const balances = this.calculateBalances(expenses);
    const debts = this.optimizeDebts(balances).map((debt) => ({ ...debt, groupId }));
    await this.debtDAL.replaceGroupDebts(groupId, debts);
  }

  async getGroupDebts(groupId: string): Promise<Debt[]> {
    return this.debtDAL.findByGroup(groupId);
  }

  async getUserBalance(userId: string, groupId: string): Promise<number> {
    const debts = await this.debtDAL.findByUserAndGroup(userId, groupId);
    return roundMoney(
      debts.reduce((balance, debt) => {
        if (debt.creditorId === userId) return balance + debt.amount;
        if (debt.debtorId === userId) return balance - debt.amount;
        return balance;
      }, 0),
    );
  }

  calculateBalances(expenses: Expense[]): Map<string, number> {
    const balances = new Map<string, number>();

    for (const expense of expenses) {
      balances.set(expense.payerId, roundMoney((balances.get(expense.payerId) ?? 0) + expense.amount));

      for (const split of expense.splitConfig.splits) {
        const amount = split.amount ?? 0;
        balances.set(split.userId, roundMoney((balances.get(split.userId) ?? 0) - amount));
      }
    }

    return balances;
  }

  optimizeDebts(balances: Map<string, number>): Debt[] {
    const creditors: Array<{ userId: string; amount: number }> = [];
    const debtors: Array<{ userId: string; amount: number }> = [];

    for (const [userId, balance] of balances.entries()) {
      const amount = roundMoney(balance);
      if (amount > 0) creditors.push({ userId, amount });
      if (amount < 0) debtors.push({ userId, amount: Math.abs(amount) });
    }

    const debts: Debt[] = [];
    let creditorIndex = 0;
    let debtorIndex = 0;

    while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
      const creditor = creditors[creditorIndex];
      const debtor = debtors[debtorIndex];
      const amount = roundMoney(Math.min(creditor.amount, debtor.amount));

      if (amount > 0) {
        debts.push({
          debtorId: debtor.userId,
          creditorId: creditor.userId,
          amount,
          settled: false,
        });
      }

      creditor.amount = roundMoney(creditor.amount - amount);
      debtor.amount = roundMoney(debtor.amount - amount);

      if (creditor.amount <= 0) creditorIndex += 1;
      if (debtor.amount <= 0) debtorIndex += 1;
    }

    return debts;
  }
}
