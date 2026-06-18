import { BaseDAL } from './base.dal';
import type { Debt, DebtRow } from '../models/debt.model';

function mapDebt(row: DebtRow): Debt {
  return {
    id: row.id,
    groupId: row.group_id,
    debtorId: row.debtor_id,
    creditorId: row.creditor_id,
    amount: Number(row.amount),
    settled: row.settled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class DebtDAL extends BaseDAL {
  async replaceGroupDebts(groupId: string, debts: Debt[]): Promise<void> {
    await this.transaction(async (client) => {
      await client.query('DELETE FROM debts WHERE group_id = $1 AND settled = false', [groupId]);
      for (const debt of debts) {
        await client.query(
          `INSERT INTO debts (group_id, debtor_id, creditor_id, amount, settled)
           VALUES ($1, $2, $3, $4, false)`,
          [groupId, debt.debtorId, debt.creditorId, debt.amount],
        );
      }
    });
  }

  async findByGroup(groupId: string): Promise<Debt[]> {
    const rows = await this.query<DebtRow>(
      'SELECT * FROM debts WHERE group_id = $1 ORDER BY created_at DESC',
      [groupId],
    );
    return rows.map(mapDebt);
  }

  async findByUserAndGroup(userId: string, groupId: string): Promise<Debt[]> {
    const rows = await this.query<DebtRow>(
      `SELECT * FROM debts
       WHERE group_id = $1 AND (debtor_id = $2 OR creditor_id = $2)`,
      [groupId, userId],
    );
    return rows.map(mapDebt);
  }

  async markAsSettled(debtId: string): Promise<void> {
    await this.query(
      `UPDATE debts
       SET settled = true, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [debtId],
    );
  }
}
