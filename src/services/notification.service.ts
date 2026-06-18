import { logger } from '../utils/logger';

export class NotificationService {
  async sendSettlementConfirmed(payerId: string, payeeId: string, amount: number): Promise<void> {
    logger.info('Settlement notification scaffolded', { payerId, payeeId, amount });
  }
}
