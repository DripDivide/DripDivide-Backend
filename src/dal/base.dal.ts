import type { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { ConflictError, DatabaseError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

export abstract class BaseDAL {
  constructor(protected pool: Pool) {}

  protected async query<T extends QueryResultRow>(text: string, params?: unknown[]): Promise<T[]> {
    const startedAt = Date.now();
    try {
      const result: QueryResult<T> = await this.pool.query(text, params);
      logger.debug('Executed query', {
        durationMs: Date.now() - startedAt,
        rows: result.rowCount,
      });
      return result.rows;
    } catch (error: any) {
      logger.error('Database query failed', {
        error: error.message,
        code: error.code,
      });

      if (error.code === '23505') throw new ConflictError('Resource already exists');
      if (error.code === '23503') throw new ValidationError('Referenced resource does not exist');
      if (error.code === '23502') throw new ValidationError('Required field is missing');
      throw new DatabaseError();
    }
  }

  protected async queryOne<T extends QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<T | null> {
    const rows = await this.query<T>(text, params);
    return rows[0] ?? null;
  }

  protected async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
