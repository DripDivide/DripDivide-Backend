import { BaseDAL } from './base.dal';
import type { Group } from '../models/group.model';

interface GroupRow {
  id: string;
  name: string;
  creator_id: string;
  created_at: Date;
  updated_at: Date;
  members?: string[] | null;
}

function mapGroup(row: GroupRow): Group {
  return {
    id: row.id,
    name: row.name,
    creatorId: row.creator_id,
    members: row.members ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class GroupDAL extends BaseDAL {
  async create(name: string, creatorId: string): Promise<Group> {
    const row = await this.transaction(async (client) => {
      const group = await client.query<GroupRow>(
        `INSERT INTO groups (name, creator_id)
         VALUES ($1, $2)
         RETURNING *`,
        [name, creatorId],
      );
      await client.query(
        `INSERT INTO group_members (group_id, user_id, role)
         VALUES ($1, $2, 'owner')`,
        [group.rows[0].id, creatorId],
      );
      return group.rows[0];
    });

    return { ...mapGroup(row), members: [creatorId] };
  }

  async findByUser(userId: string): Promise<Group[]> {
    const rows = await this.query<GroupRow>(
      `SELECT g.*, array_agg(gm_all.user_id) AS members
       FROM groups g
       JOIN group_members gm ON gm.group_id = g.id
       JOIN group_members gm_all ON gm_all.group_id = g.id
       WHERE gm.user_id = $1
       GROUP BY g.id
       ORDER BY g.created_at DESC`,
      [userId],
    );
    return rows.map(mapGroup);
  }

  async findById(id: string): Promise<Group | null> {
    const row = await this.queryOne<GroupRow>(
      `SELECT g.*, array_agg(gm.user_id) AS members
       FROM groups g
       LEFT JOIN group_members gm ON gm.group_id = g.id
       WHERE g.id = $1
       GROUP BY g.id`,
      [id],
    );
    return row ? mapGroup(row) : null;
  }
}
