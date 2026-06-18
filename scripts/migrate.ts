import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { pool } from '../src/config/database';
import { logger } from '../src/utils/logger';

async function runMigrations(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const migrationsDir = join(__dirname, '../src/db/migrations');
  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const { rows } = await pool.query<{ name: string }>('SELECT name FROM migrations');
  const executed = new Set(rows.map((row) => row.name));

  for (const file of files) {
    if (executed.has(file)) continue;

    logger.info('Running migration', { file });
    const sql = readFileSync(join(migrationsDir, file), 'utf8');

    await pool.query('BEGIN');
    try {
      await pool.query(sql);
      await pool.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
      await pool.query('COMMIT');
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }
}

runMigrations()
  .then(async () => {
    logger.info('All migrations completed successfully');
    await pool.end();
  })
  .catch(async (error) => {
    logger.error('Migration failed', { error });
    await pool.end();
    process.exit(1);
  });
