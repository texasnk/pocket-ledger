import type {
  CreateTransactionInput,
  TransferInput
} from '../../src/application/transaction-service.js';

export const createTransactionInputFixture = (
  overrides: Partial<CreateTransactionInput> = {}
): CreateTransactionInput => ({
  description: 'Unit test transaction',
  amountCents: 2_500,
  date: '2026-10-15',
  type: 'EXPENSE',
  accountId: 'test-account-1',
  categoryId: 'test-category-1',
  ...overrides
});

export const transferInputFixture = (overrides: Partial<TransferInput> = {}): TransferInput => ({
  description: 'Unit test transfer',
  amountCents: 4_200,
  date: '2026-10-15',
  fromAccountId: 'test-account-from',
  toAccountId: 'test-account-to',
  ...overrides
});

export const categoryRequestFixture = {
  name: 'Unit test category',
  type: 'EXPENSE' as const,
  color: '#2563eb'
};

export const transactionRequestFixture = {
  description: 'Unit test transaction',
  amountCents: 2_500,
  date: '2026-10-15',
  type: 'EXPENSE' as const,
  accountId: 'test-account-1',
  categoryId: 'test-category-1'
};
