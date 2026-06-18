import { BaseDAL } from './base.dal';
import type { Expense, ExpenseRow } from '../models/expense.model';

function numeric(value: number | string | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  return Number(value);
}

function mapExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    groupId: row.group_id,
    payerId: row.payer_id,
    amount: Number(row.amount),
    description: row.description,
    splitConfig: {
      type: row.split_type,
      splits:
        row.splits
          ?.filter((split) => split.userId)
          .map((split) => ({
            userId: split.userId,
            amount: numeric(split.amount),
            percentage: numeric(split.percentage),
          })) ?? [],
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    modifiedBy: row.modified_by ?? undefined,
  };
}

export class ExpenseDAL extends BaseDAL {
  async create(expense: Expense): Promise<Expense> {
    return this.transaction(async (client) => {
      const result = await client.query<ExpenseRow>(
        `INSERT INTO expenses (id, group_id, payer_id, amount, description, split_type)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          expense.id,
          expense.groupId,
          expense.payerId,
          expense.amount,
          expense.description,
          expense.splitConfig.type,
        ],
      );

      for (const split of expense.splitConfig.splits) {
        await client.query(
          `INSERT INTO expense_splits (expense_id, user_id, amount, percentage)
           VALUES ($1, $2, $3, $4)`,
          [expense.id, split.userId, split.amount ?? null, split.percentage ?? null],
        );
      }

      return {
        ...expense,
        id: result.rows[0].id,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at,
      };
    });
  }

  async findById(id: string): Promise<Expense | null> {
    const row = await this.queryOne<ExpenseRow>(
      `SELECT e.*,
              COALESCE(json_agg(json_build_object(
                'userId', es.user_id,
                'amount', es.amount,
                'percentage', es.percentage
              )) FILTER (WHERE es.id IS NOT NULL), '[]') AS splits
       FROM expenses e
       LEFT JOIN expense_splits es ON e.id = es.expense_id
       WHERE e.id = $1
       GROUP BY e.id`,
      [id],
    );
    return row ? mapExpense(row) : null;
  }

  async findByGroup(groupId: string): Promise<Expense[]> {
    const rows = await this.query<ExpenseRow>(
      `SELECT e.*,
              COALESCE(json_agg(json_build_object(
                'userId', es.user_id,
                'amount', es.amount,
                'percentage', es.percentage
              )) FILTER (WHERE es.id IS NOT NULL), '[]') AS splits
       FROM expenses e
       LEFT JOIN expense_splits es ON e.id = es.expense_id
       WHERE e.group_id = $1
       GROUP BY e.id
       ORDER BY e.created_at DESC`,
      [groupId],
    );
    return rows.map(mapExpense);
  }

  async search(query: string, groupId?: string): Promise<Expense[]> {
    const rows = await this.query<ExpenseRow>(
      `SELECT e.*,
              COALESCE(json_agg(json_build_object(
                'userId', es.user_id,
                'amount', es.amount,
                'percentage', es.percentage
              )) FILTER (WHERE es.id IS NOT NULL), '[]') AS splits
       FROM expenses e
       LEFT JOIN expense_splits es ON e.id = es.expense_id
       WHERE ($1::text IS NULL OR e.group_id = $1::uuid)
         AND ($2::text = '' OR e.description ILIKE '%' || $2 || '%')
       GROUP BY e.id
       ORDER BY e.created_at DESC`,
      [groupId ?? null, query],
    );
    return rows.map(mapExpense);
  }
}
