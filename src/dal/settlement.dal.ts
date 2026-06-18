import { BaseDAL } from './base.dal';
import type { Settlement, SettlementStatus } from '../models/settlement.model';

interface SettlementRow {
  id: string;
  debt_id: string;
  payer_id: string;
  payee_id: string;
  amount: string;
  transaction_hash: string;
  status: SettlementStatus;
  created_at: Date;
  confirmed_at?: Date | null;
}

function mapSettlement(row: SettlementRow): Settlement {
  return {
    id: row.id,
    debtId: row.debt_id,
    payerId: row.payer_id,
    payeeId: row.payee_id,
    amount: Number(row.amount),
    transactionHash: row.transaction_hash,
    status: row.status,
    createdAt: row.created_at,
    confirmedAt: row.confirmed_at ?? undefined,
  };
}

export class SettlementDAL extends BaseDAL {
  async create(input: Omit<Settlement, 'id' | 'createdAt'>): Promise<Settlement> {
    const row = await this.queryOne<SettlementRow>(
      `INSERT INTO settlements (debt_id, payer_id, payee_id, amount, transaction_hash, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [input.debtId, input.payerId, input.payeeId, input.amount, input.transactionHash, input.status],
    );
    return mapSettlement(row!);
  }

  async findById(id: string): Promise<Settlement | null> {
    const row = await this.queryOne<SettlementRow>('SELECT * FROM settlements WHERE id = $1', [id]);
    return row ? mapSettlement(row) : null;
  }

  async findByUser(userId: string): Promise<Settlement[]> {
    const rows = await this.query<SettlementRow>(
      `SELECT * FROM settlements
       WHERE payer_id = $1 OR payee_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );
    return rows.map(mapSettlement);
  }

  async updateStatus(id: string, status: SettlementStatus): Promise<void> {
    await this.query(
      `UPDATE settlements
       SET status = $2,
           confirmed_at = CASE WHEN $2 = 'confirmed' THEN CURRENT_TIMESTAMP ELSE confirmed_at END
       WHERE id = $1`,
      [id, status],
    );
  }
}
