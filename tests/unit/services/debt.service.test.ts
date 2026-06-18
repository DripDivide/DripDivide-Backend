import { DebtService } from '../../../src/services/debt.service';

describe('DebtService', () => {
  const debtDAL = {
    findByGroup: jest.fn(),
    findByUserAndGroup: jest.fn(),
    replaceGroupDebts: jest.fn(),
  };
  const expenseDAL = {
    findByGroup: jest.fn(),
  };

  let service: DebtService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DebtService(debtDAL as any, expenseDAL as any);
  });

  it('calculates balances from paid amounts and split shares', () => {
    const balances = service.calculateBalances([
      {
        id: 'expense-1',
        groupId: 'group-1',
        payerId: 'user-1',
        amount: 100,
        description: 'Dinner',
        splitConfig: {
          type: 'exact',
          splits: [
            { userId: 'user-1', amount: 50 },
            { userId: 'user-2', amount: 50 },
          ],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'expense-2',
        groupId: 'group-1',
        payerId: 'user-2',
        amount: 60,
        description: 'Taxi',
        splitConfig: {
          type: 'exact',
          splits: [
            { userId: 'user-1', amount: 30 },
            { userId: 'user-2', amount: 30 },
          ],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    expect(balances.get('user-1')).toBe(20);
    expect(balances.get('user-2')).toBe(-20);
  });

  it('optimizes balances into minimal debts', () => {
    const debts = service.optimizeDebts(
      new Map([
        ['user-1', 50],
        ['user-2', -30],
        ['user-3', -20],
      ]),
    );

    expect(debts).toEqual([
      { creditorId: 'user-1', debtorId: 'user-2', amount: 30, settled: false },
      { creditorId: 'user-1', debtorId: 'user-3', amount: 20, settled: false },
    ]);
  });

  it('returns signed user balance from active debts', async () => {
    debtDAL.findByUserAndGroup.mockResolvedValue([
      { creditorId: 'user-1', debtorId: 'user-2', amount: 12.5 },
      { creditorId: 'user-3', debtorId: 'user-1', amount: 7.25 },
    ]);

    await expect(service.getUserBalance('user-1', 'group-1')).resolves.toBe(5.25);
  });
});
