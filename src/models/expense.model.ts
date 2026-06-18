export type SplitType = 'equal' | 'exact' | 'percentage';

export interface Split {
  userId: string;
  amount?: number;
  percentage?: number;
}

export interface SplitConfiguration {
  type: SplitType;
  splits: Split[];
}

export interface Expense {
  id: string;
  groupId: string;
  payerId: string;
  amount: number;
  description: string;
  splitConfig: SplitConfiguration;
  createdAt: Date;
  updatedAt: Date;
  modifiedBy?: string;
}

export interface ExpenseInput {
  groupId: string;
  payerId: string;
  amount: number;
  description: string;
  splitConfig: SplitConfiguration;
}

export interface ExpenseRow {
  id: string;
  group_id: string;
  payer_id: string;
  amount: string;
  description: string;
  split_type: SplitType;
  created_at: Date;
  updated_at: Date;
  modified_by?: string | null;
  splits?: Array<{
    userId: string;
    amount?: string | number | null;
    percentage?: string | number | null;
  }>;
}
