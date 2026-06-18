import { app } from './app';
import { config } from './config';
import { pool } from './config/database';
import { logger } from './utils/logger';

async function startServer(): Promise<void> {
  try {
    await pool.query('SELECT NOW()');
    logger.info('Database connection established');

    const server = app.listen(config.port, () => {
      logger.info('Server started', {
        port: config.port,
        env: config.env,
        apiVersion: config.apiVersion,
      });
    });

    const shutdown = async () => {
      logger.info('Received shutdown signal');
      server.close(async () => {
        await pool.end();
        logger.info('Shutdown complete');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000).unref();
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

void startServer();
