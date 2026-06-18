import type { Request, Response } from 'express';

export class UserController {
  async me(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      data: {
        userId: req.user!.userId,
        email: req.user!.email,
      },
    });
  }
}
