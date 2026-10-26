import { and, asc, desc, eq, gte, lte, lt, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import type { Database } from '../db/client.js';
import { accounts, categories, transactions } from '../db/schema.js';
import { RecordNotFoundError, type CategoryType, type TransactionType } from '../domain/financial.js';
import type {
  AccountRecord,
  CategoryRecord,
  TransactionFilters,
  TransactionRecord,
  TransactionRepository
} from '../domain/repositories.js';
import { monthBounds } from '../shared/date.js';

type TransactionRow = typeof transactions.$inferSelect;

const toDate = (value: string) => new Date(value);
const mapAccount = (item: typeof accounts.$inferSelect): AccountRecord => item;
const mapCategory = (item: typeof categories.$inferSelect): CategoryRecord => ({
  ...item,
  type: item.type as CategoryType
});
const mapTransaction = (
  item: TransactionRow,
  account?: typeof accounts.$inferSelect,
  category?: typeof categories.$inferSelect | null
): TransactionRecord => ({
  ...item,
  date: toDate(item.date),
  type: item.type as TransactionType,
  account: account ? mapAccount(account) : undefined,
  category: category ? mapCategory(category) : null
});

export class DrizzleTransactionRepository implements TransactionRepository {
  public constructor(private readonly database: Database) {}

  public async create(input: Omit<TransactionRecord, 'id'>): Promise<TransactionRecord> {
    const id = randomUUID();
    this.database.db
      .insert(transactions)
      .values({
        ...input,
        id,
        date: input.date.toISOString(),
        updatedAt: new Date().toISOString()
      })
      .run();
    return (await this.findById(id))!;
  }

  public async findById(id: string): Promise<TransactionRecord | null> {
    const result = this.database.db
      .select({ transaction: transactions, account: accounts, category: categories })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.id, id))
      .get();
    return result ? mapTransaction(result.transaction, result.account, result.category) : null;
  }

  public async update(
    id: string,
    input: Partial<
      Pick<TransactionRecord, 'description' | 'amountCents' | 'date' | 'accountId' | 'categoryId'>
    >
  ): Promise<TransactionRecord> {
    const { date, ...changes } = input;
    this.database.db
      .update(transactions)
      .set({
        ...changes,
        ...(date ? { date: date.toISOString() } : {}),
        updatedAt: new Date().toISOString()
      })
      .where(eq(transactions.id, id))
      .run();
    const result = await this.findById(id);
    if (!result) throw new RecordNotFoundError();
    return result;
  }

  public async delete(id: string): Promise<void> {
    this.database.db.delete(transactions).where(eq(transactions.id, id)).run();
  }

  public async list(
    filters: TransactionFilters
  ): Promise<{ items: TransactionRecord[]; total: number }> {
    const conditions = [];
    if (filters.type) conditions.push(eq(transactions.type, filters.type));
    if (filters.categoryId) conditions.push(eq(transactions.categoryId, filters.categoryId));
    if (filters.month) {
      const { from, to } = monthBounds(filters.month);
      conditions.push(
        gte(transactions.date, from.toISOString()),
        lt(transactions.date, to.toISOString())
      );
    }
    if (filters.from) conditions.push(gte(transactions.date, `${filters.from}T00:00:00.000Z`));
    if (filters.to) conditions.push(lte(transactions.date, `${filters.to}T23:59:59.999Z`));
    const where = conditions.length ? and(...conditions) : undefined;
    const rows = this.database.db
      .select({ transaction: transactions, account: accounts, category: categories })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(where)
      .orderBy(filters.order === 'asc' ? asc(transactions.date) : desc(transactions.date))
      .limit(filters.pageSize)
      .offset((filters.page - 1) * filters.pageSize)
      .all();
    const total =
      this.database.db
        .select({ count: sql<number>`count(*)` })
        .from(transactions)
        .where(where)
        .get()?.count ?? 0;
    return {
      items: rows.map((row) => mapTransaction(row.transaction, row.account, row.category)),
      total
    };
  }

  public async runAtomically<T>(operation: () => Promise<T>): Promise<T> {
    this.database.client.exec('BEGIN');
    try {
      const result = await operation();
      this.database.client.exec('COMMIT');
      return result;
    } catch (error) {
      this.database.client.exec('ROLLBACK');
      throw error;
    }
  }
}
