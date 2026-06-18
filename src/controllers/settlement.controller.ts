import type { NextFunction, Request, Response } from 'express';
import type { SettlementService } from '../services/settlement.service';

export class SettlementController {
  constructor(private settlementService: SettlementService) {}

  async createSettlement(_req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      await this.settlementService.createSettlement();
    } catch (error) {
      next(error);
    }
  }

  async getSettlement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settlement = await this.settlementService.getSettlement(req.params.id);
      res.json({ success: true, data: settlement });
    } catch (error) {
      next(error);
    }
  }

  async getSettlements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settlements = await this.settlementService.getUserSettlements(req.user!.userId);
      res.json({ success: true, data: settlements });
    } catch (error) {
      next(error);
    }
  }
}
