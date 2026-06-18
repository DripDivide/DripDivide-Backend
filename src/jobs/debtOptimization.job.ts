import type { DebtService } from '../services/debt.service';

export async function optimizeGroupDebtJob(debtService: DebtService, groupId: string): Promise<void> {
  await debtService.recalculateDebts(groupId);
}
