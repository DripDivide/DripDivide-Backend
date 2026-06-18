import type { NextFunction, Request, Response } from 'express';
import type { ExpenseService } from '../services/expense.service';

export class ExpenseController {
  constructor(private expenseService: ExpenseService) {}

  async createExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { groupId, amount, description, splitConfiguration } = req.body;
      const expense = await this.expenseService.createExpense(
        groupId,
        req.user!.userId,
        amount,
        description,
        splitConfiguration,
      );
      res.status(201).json({ success: true, data: expense });
    } catch (error) {
      next(error);
    }
  }

  async getExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const expense = await this.expenseService.getExpense(req.params.id);
      res.json({ success: true, data: expense });
    } catch (error) {
      next(error);
    }
  }

  async getGroupExpenses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const expenses = await this.expenseService.getGroupExpenses(req.params.groupId);
      res.json({ success: true, data: expenses });
    } catch (error) {
      next(error);
    }
  }

  async searchExpenses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const expenses = await this.expenseService.searchExpenses(
        String(req.query.q ?? ''),
        req.query.groupId ? String(req.query.groupId) : undefined,
      );
      res.json({ success: true, data: expenses });
    } catch (error) {
      next(error);
    }
  }
}
