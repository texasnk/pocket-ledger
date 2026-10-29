export type AccountRequest = {
  name: string;
  initialBalanceCents: number;
};

export type CategoryRequest = {
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color: string;
};

export type TransactionRequest = {
  description: string;
  amountCents: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  accountId: string;
  categoryId: string;
};

export const testMonth = '2026-10';

export const accountFixture: AccountRequest = {
  name: 'Test checking account',
  initialBalanceCents: 5_000
};

export const incomeCategoryFixture: CategoryRequest = {
  name: 'Test salary',
  type: 'INCOME',
  color: '#16a34a'
};

export const expenseCategoryFixture: CategoryRequest = {
  name: 'Test groceries',
  type: 'EXPENSE',
  color: '#dc2626'
};

export function transactionFixture(
  accountId: string,
  categoryId: string,
  overrides: Partial<TransactionRequest> = {}
): TransactionRequest {
  return {
    description: 'Test grocery purchase',
    amountCents: 3_000,
    date: '2026-10-15',
    type: 'EXPENSE',
    accountId,
    categoryId,
    ...overrides
  };
}
