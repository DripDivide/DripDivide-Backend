import { ExpenseService } from '../../../src/services/expense.service';

describe('ExpenseService', () => {
  const service = new ExpenseService({} as any, {} as any, {} as any);

  it('accepts exact splits that equal the total', () => {
    expect(() =>
      service.validateSplitConfiguration(
        {
          type: 'exact',
          splits: [
            { userId: '00000000-0000-0000-0000-000000000001', amount: 40 },
            { userId: '00000000-0000-0000-0000-000000000002', amount: 60 },
          ],
        },
        100,
      ),
    ).not.toThrow();
  });

  it('rejects percentage splits that do not equal 100', () => {
    expect(() =>
      service.validateSplitConfiguration(
        {
          type: 'percentage',
          splits: [{ userId: '00000000-0000-0000-0000-000000000001', percentage: 60 }],
        },
        100,
      ),
    ).toThrow('Split percentages must equal 100%');
  });
});
