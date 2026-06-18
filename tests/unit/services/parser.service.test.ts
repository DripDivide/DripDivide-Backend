import { ParserService } from '../../../src/services/parser.service';

describe('ParserService', () => {
  const service = new ParserService();

  it('normalizes equal split cents without losing the total', () => {
    const expense = service.parseExpense({
      groupId: '00000000-0000-0000-0000-000000000001',
      payerId: '00000000-0000-0000-0000-000000000002',
      amount: 120.5,
      description: '  Dinner  ',
      splitConfig: {
        type: 'equal',
        splits: [
          { userId: '00000000-0000-0000-0000-000000000002' },
          { userId: '00000000-0000-0000-0000-000000000003' },
          { userId: '00000000-0000-0000-0000-000000000004' },
        ],
      },
    });

    expect(expense.description).toBe('Dinner');
    expect(expense.splitConfig.splits.map((split) => split.amount)).toEqual([40.17, 40.17, 40.16]);
  });

  it('serializes money values as fixed two-decimal strings', () => {
    const expense = service.parseExpense({
      groupId: '00000000-0000-0000-0000-000000000001',
      payerId: '00000000-0000-0000-0000-000000000002',
      amount: 10,
      description: 'Coffee',
      splitConfig: {
        type: 'exact',
        splits: [{ userId: '00000000-0000-0000-0000-000000000002', amount: 10 }],
      },
    });

    expect(service.serializeExpense(expense)).toMatchObject({
      amount: '10.00',
      splitConfiguration: {
        splits: [{ amount: '10.00' }],
      },
    });
  });
});
