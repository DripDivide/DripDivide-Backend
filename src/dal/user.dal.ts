import { BaseDAL } from './base.dal';
import type { User, UserRow } from '../models/user.model';

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    password: row.password_hash,
    stellarPublicKey: row.stellar_public_key ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class UserDAL extends BaseDAL {
  async create(input: { email: string; password: string }): Promise<User> {
    const row = await this.queryOne<UserRow>(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING *`,
      [input.email.toLowerCase(), input.password],
    );
    return mapUser(row!);
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.queryOne<UserRow>('SELECT * FROM users WHERE email = $1', [
      email.toLowerCase(),
    ]);
    return row ? mapUser(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.queryOne<UserRow>('SELECT * FROM users WHERE id = $1', [id]);
    return row ? mapUser(row) : null;
  }

  async updateStellarKey(userId: string, publicKey: string): Promise<User | null> {
    const row = await this.queryOne<UserRow>(
      `UPDATE users
       SET stellar_public_key = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [userId, publicKey],
    );
    return row ? mapUser(row) : null;
  }
}
