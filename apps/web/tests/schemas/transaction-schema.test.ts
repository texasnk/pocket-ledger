import { describe, expect, it } from 'vitest';
import { transactionFormSchema } from '../../src/schemas/transaction-schema';

describe('transaction form schema', () => {
  it('accepts a fixed expense with a defined duration', () => {
    const transaction = transactionFormSchema.parse({
      description: 'Internet',
      amount: 120,
      date: '2026-10-01',
      type: 'EXPENSE',
      accountId: 'account-1',
      categoryId: 'category-1',
      installments: 1,
      isFixed: true,
      fixedDuration: 12
    });

    expect(transaction.fixedDuration).toBe(12);
    expect(transaction.isFixed).toBe(true);
  });
});
