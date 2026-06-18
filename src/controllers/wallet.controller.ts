import type { NextFunction, Request, Response } from 'express';
import type { WalletService } from '../services/wallet.service';

export class WalletController {
  constructor(private walletService: WalletService) {}

  async connect(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const wallet = await this.walletService.connectWallet(req.user!.userId, req.body.publicKey);
      res.json({ success: true, data: wallet });
    } catch (error) {
      next(error);
    }
  }

  async getWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const wallet = await this.walletService.getWallet(req.user!.userId);
      res.json({ success: true, data: wallet });
    } catch (error) {
      next(error);
    }
  }

  async verify(_req: Request, res: Response): Promise<void> {
    res.status(202).json({
      success: true,
      data: {
        status: 'pending',
        message: 'Wallet challenge verification endpoint scaffolded',
      },
    });
  }
}
