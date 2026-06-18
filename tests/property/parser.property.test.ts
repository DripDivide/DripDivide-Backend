import * as fc from 'fast-check';
import { ParserService } from '../../src/services/parser.service';

describe('ParserService properties', () => {
  const service = new ParserService();

  it('keeps normalized money at two decimal precision', () => {
    fc.assert(
      fc.property(fc.double({ min: 0.01, max: 10000, noNaN: true }), (amount) => {
        const expense = service.parseExpense({
          groupId: '00000000-0000-0000-0000-000000000001',
          payerId: '00000000-0000-0000-0000-000000000002',
          amount,
          description: 'Property expense',
          splitConfig: {
            type: 'exact',
            splits: [{ userId: '00000000-0000-0000-0000-000000000002', amount }],
          },
        });

        expect(expense.amount).toBe(Number(expense.amount.toFixed(2)));
      }),
    );
  });
});
