import { logger } from '../utils/logger';

export async function processNotificationJob(payload: unknown): Promise<void> {
  logger.info('Notification job scaffolded', { payload });
}
