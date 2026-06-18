import type { NextFunction, Request, Response } from 'express';
import type { AuthService } from '../services/auth.service';

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.authService.register(req.body.email, req.body.password);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.authService.login(req.body.email, req.body.password);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization!;
    const token = authHeader.slice('Bearer '.length);
    res.json({ success: true, data: { token: this.authService.refresh(token) } });
  }

  async logout(_req: Request, res: Response): Promise<void> {
    res.status(204).send();
  }
}
