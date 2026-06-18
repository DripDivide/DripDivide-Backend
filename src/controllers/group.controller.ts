import type { NextFunction, Request, Response } from 'express';
import type { GroupService } from '../services/group.service';

export class GroupController {
  constructor(private groupService: GroupService) {}

  async createGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const group = await this.groupService.createGroup(req.body.name, req.user!.userId);
      res.status(201).json({ success: true, data: group });
    } catch (error) {
      next(error);
    }
  }

  async getGroups(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const groups = await this.groupService.getUserGroups(req.user!.userId);
      res.json({ success: true, data: groups });
    } catch (error) {
      next(error);
    }
  }

  async getGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const group = await this.groupService.getGroup(req.params.id);
      res.json({ success: true, data: group });
    } catch (error) {
      next(error);
    }
  }

  async inviteMember(_req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      await this.groupService.inviteMember();
    } catch (error) {
      next(error);
    }
  }
}
