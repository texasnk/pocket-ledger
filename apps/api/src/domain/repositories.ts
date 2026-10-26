import type { CategoryType, TransactionType } from './financial.js';

export interface AccountRecord {
  id: string;
  name: string;
  initialBalanceCents: number;
}
export interface CategoryRecord {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
}
export interface TransactionRecord {
  id: string;
  description: string;
  amountCents: number;
  date: Date;
  type: TransactionType;
  accountId: string;
  categoryId: string | null;
  transferFromAccountId: string | null;
  transferToAccountId: string | null;
  installmentGroupId: string | null;
  installmentNumber: number | null;
  installmentTotal: number | null;
  recurrenceGroupId: string | null;
  account?: AccountRecord;
  category?: CategoryRecord | null;
}
export interface TransactionFilters {
  month?: string;
  categoryId?: string;
  type?: TransactionType;
  from?: string;
  to?: string;
  page: number;
  pageSize: number;
  order: 'asc' | 'desc';
}
export interface TransactionRepository {
  create(input: Omit<TransactionRecord, 'id'>): Promise<TransactionRecord>;
  findById(id: string): Promise<TransactionRecord | null>;
  update(
    id: string,
    input: Partial<
      Pick<TransactionRecord, 'description' | 'amountCents' | 'date' | 'accountId' | 'categoryId'>
    >
  ): Promise<TransactionRecord>;
  delete(id: string): Promise<void>;
  list(filters: TransactionFilters): Promise<{ items: TransactionRecord[]; total: number }>;
  runAtomically<T>(operation: () => Promise<T>): Promise<T>;
}
