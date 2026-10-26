import { api } from '../lib/api';
import type { TransactionFormValues } from '../schemas/transaction-schema';

export type Transaction = {
  id: string;
  description: string;
  amountCents: number;
  date: string;
  type: string;
  account: { id: string; name: string };
  category: { id: string; name: string; type: 'INCOME' | 'EXPENSE' } | null;
};
export type TransactionList = { items: Transaction[]; total: number };

/** Sends a transaction form to the financial API converting reais to integer cents. */
export async function createTransaction(transaction: TransactionFormValues): Promise<void> {
  const { amount, isFixed, fixedDuration, ...payload } = transaction;
  await api('/transactions', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      amountCents: Math.round(amount * 100),
      recurringMonths: isFixed ? fixedDuration : 1
    })
  });
}
export const getTransactions = (month: string) =>
  api<TransactionList>(`/transactions?month=${month}`);
export const deleteTransaction = (id: string) =>
  api<void>(`/transactions/${id}`, { method: 'DELETE' });
