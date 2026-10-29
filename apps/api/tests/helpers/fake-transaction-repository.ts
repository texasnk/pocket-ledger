import type {
  TransactionFilters,
  TransactionRecord,
  TransactionRepository
} from '../../src/domain/repositories.js';

export type FakeTransactionRepositoryOptions = {
  atomicFailure?: Error;
  createFailure?: { callNumber: number; error: Error };
};

export class FakeTransactionRepository implements TransactionRepository {
  public records: TransactionRecord[] = [];
  public createCalls = 0;
  public atomicCalls = 0;
  private readonly options: FakeTransactionRepositoryOptions;

  public constructor(options: FakeTransactionRepositoryOptions = {}) {
    this.options = options;
  }

  public async create(transaction: Omit<TransactionRecord, 'id'>): Promise<TransactionRecord> {
    this.createCalls += 1;
    if (this.options.createFailure?.callNumber === this.createCalls) {
      throw this.options.createFailure.error;
    }
    const record = { ...transaction, id: `test-transaction-${this.createCalls}` };
    this.records.push(record);
    return record;
  }

  public async findById(id: string): Promise<TransactionRecord | null> {
    return this.records.find((record) => record.id === id) ?? null;
  }

  public async update(
    id: string,
    changes: Partial<
      Pick<TransactionRecord, 'description' | 'amountCents' | 'date' | 'accountId' | 'categoryId'>
    >
  ): Promise<TransactionRecord> {
    const record = await this.findById(id);
    if (!record) throw new Error('The requested fake transaction does not exist.');
    const updatedRecord = { ...record, ...changes };
    this.records = this.records.map((current) => (current.id === id ? updatedRecord : current));
    return updatedRecord;
  }

  public async delete(id: string): Promise<void> {
    this.records = this.records.filter((record) => record.id !== id);
  }

  public async list(
    _filters: TransactionFilters
  ): Promise<{ items: TransactionRecord[]; total: number }> {
    return { items: [...this.records], total: this.records.length };
  }

  public async runAtomically<T>(operation: () => Promise<T>): Promise<T> {
    this.atomicCalls += 1;
    if (this.options.atomicFailure) throw this.options.atomicFailure;
    const previousRecords = [...this.records];
    try {
      return await operation();
    } catch (error) {
      this.records = previousRecords;
      throw error;
    }
  }
}
