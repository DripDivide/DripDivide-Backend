import type { SettlementDAL } from '../dal/settlement.dal';
import { NotFoundError, NotImplementedError } from '../utils/errors';
import type { StellarService } from './stellar.service';

export class SettlementService {
  constructor(
    private settlementDAL: SettlementDAL,
    private stellarService: StellarService,
  ) {}

  async createSettlement(): Promise<never> {
    throw new NotImplementedError('Settlement creation from debt records');
  }

  async getSettlement(id: string) {
    const settlement = await this.settlementDAL.findById(id);
    if (!settlement) throw new NotFoundError('Settlement');
    return {
      ...settlement,
      explorerUrl: this.stellarService.getExplorerUrl(settlement.transactionHash),
    };
  }

  async getUserSettlements(userId: string) {
    const settlements = await this.settlementDAL.findByUser(userId);
    return settlements.map((settlement) => ({
      ...settlement,
      explorerUrl: this.stellarService.getExplorerUrl(settlement.transactionHash),
    }));
  }
}
