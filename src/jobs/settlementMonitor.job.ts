import type { DebtDAL } from '../dal/debt.dal';
import type { SettlementDAL } from '../dal/settlement.dal';
import type { NotificationService } from '../services/notification.service';
import type { StellarService } from '../services/stellar.service';
import { logger } from '../utils/logger';

export class SettlementMonitorJob {
  constructor(
    private stellarService: StellarService,
    private settlementDAL: SettlementDAL,
    private debtDAL: DebtDAL,
    private notificationService: NotificationService,
  ) {}

  async process(settlementId: string, transactionHash: string): Promise<void> {
    const confirmed = await this.stellarService.verifyTransaction(transactionHash);
    if (!confirmed) throw new Error('Transaction not confirmed yet');

    await this.settlementDAL.updateStatus(settlementId, 'confirmed');
    const settlement = await this.settlementDAL.findById(settlementId);
    if (!settlement) throw new Error('Settlement not found');

    await this.debtDAL.markAsSettled(settlement.debtId);
    await this.notificationService.sendSettlementConfirmed(
      settlement.payerId,
      settlement.payeeId,
      settlement.amount,
    );

    logger.info('Settlement confirmed', { settlementId, transactionHash });
  }
}
