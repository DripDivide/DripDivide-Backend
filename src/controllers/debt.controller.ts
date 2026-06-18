import type { NextFunction, Request, Response } from 'express';
import type { DebtService } from '../services/debt.service';

export class DebtController {
  constructor(private debtService: DebtService) {}

  async getGroupDebts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const debts = await this.debtService.getGroupDebts(req.params.groupId);
      res.json({ success: true, data: { debts } });
    } catch (error) {
      next(error);
    }
  }

  async getMyBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const balance = await this.debtService.getUserBalance(req.user!.userId, req.params.groupId);
      res.json({ success: true, data: { userId: req.user!.userId, groupId: req.params.groupId, balance } });
    } catch (error) {
      next(error);
    }
  }
}
