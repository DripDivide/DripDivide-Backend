import { pool } from '../src/config/database';
import { logger } from '../src/utils/logger';

async function seed(): Promise<void> {
  logger.info('Seed script scaffolded. Add development fixture data here as flows mature.');
}

seed()
  .then(async () => {
    await pool.end();
  })
  .catch(async (error) => {
    logger.error('Seed failed', { error });
    await pool.end();
    process.exit(1);
  });
