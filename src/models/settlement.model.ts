export type SettlementStatus = 'pending' | 'confirmed' | 'failed';

export interface Settlement {
  id: string;
  debtId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  transactionHash: string;
  status: SettlementStatus;
  createdAt: Date;
  confirmedAt?: Date;
}
