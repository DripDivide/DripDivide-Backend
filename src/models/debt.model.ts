export interface Debt {
  id?: string;
  groupId?: string;
  debtorId: string;
  creditorId: string;
  amount: number;
  settled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DebtRow {
  id: string;
  group_id: string;
  debtor_id: string;
  creditor_id: string;
  amount: string;
  settled: boolean;
  created_at: Date;
  updated_at: Date;
}
