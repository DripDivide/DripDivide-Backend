import type { GroupDAL } from '../dal/group.dal';
import { NotFoundError, NotImplementedError } from '../utils/errors';

export class GroupService {
  constructor(private groupDAL: GroupDAL) {}

  async createGroup(name: string, creatorId: string) {
    return this.groupDAL.create(name, creatorId);
  }

  async getUserGroups(userId: string) {
    return this.groupDAL.findByUser(userId);
  }

  async getGroup(id: string) {
    const group = await this.groupDAL.findById(id);
    if (!group) throw new NotFoundError('Group');
    return group;
  }

  async inviteMember(): Promise<never> {
    throw new NotImplementedError('Group invitations');
  }
}
