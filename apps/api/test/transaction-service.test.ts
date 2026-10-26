import { describe, expect, it } from 'vitest';
import { TransactionService } from '../src/application/transaction-service.js';
import { DomainError } from '../src/domain/financial.js';
import type { TransactionRecord, TransactionRepository } from '../src/domain/repositories.js';

class MemoryTransactions implements TransactionRepository {
  public records: TransactionRecord[] = [];
  public async create(input: Omit<TransactionRecord, 'id'>): Promise<TransactionRecord> {
    const record = { ...input, id: String(this.records.length + 1) };
    this.records.push(record);
    return record;
  }
  public async findById(id: string) {
    return this.records.find((item) => item.id === id) ?? null;
  }
  public async update(id: string, input: Partial<TransactionRecord>) {
    const record = await this.findById(id);
    if (!record) throw new Error('not found');
    Object.assign(record, input);
    return record;
  }
  public async delete(id: string) {
    this.records = this.records.filter((item) => item.id !== id);
  }
  public async list() {
    return { items: this.records, total: this.records.length };
  }
  public async runAtomically<T>(operation: () => Promise<T>) {
    return operation();
  }
}
describe('TransactionService', () => {
  it('splits installment cents without losing the total', async () => {
    const repository = new MemoryTransactions();
    const service = new TransactionService(repository);
    const records = await service.create({
      description: 'Notebook',
      amountCents: 100,
      date: '2026-01-10',
      type: 'EXPENSE',
      accountId: 'a',
      categoryId: 'c',
      installments: 3
    });
    expect(records.map((item) => item.amountCents)).toEqual([34, 33, 33]);
    expect(records.reduce((sum, item) => sum + item.amountCents, 0)).toBe(100);
  });
  it('rejects a transaction that is recurring and installment based', async () => {
    const service = new TransactionService(new MemoryTransactions());
    await expect(
      service.create({
        description: 'x',
        amountCents: 100,
        date: '2026-01-10',
        type: 'EXPENSE',
        accountId: 'a',
        categoryId: 'c',
        installments: 2,
        recurringMonths: 2
      })
    ).rejects.toBeInstanceOf(DomainError);
  });
  it('creates transfer counterpart records with equal amounts', async () => {
    const service = new TransactionService(new MemoryTransactions());
    const records = await service.transfer({
      description: 'Reserva',
      amountCents: 1300,
      date: '2026-01-10',
      fromAccountId: 'a',
      toAccountId: 'b'
    });
    expect(records).toHaveLength(2);
    expect(records[0]!.amountCents).toBe(records[1]!.amountCents);
  });
  it('rejects transfer to same account', async () => {
    const service = new TransactionService(new MemoryTransactions());
    await expect(
      service.transfer({
        description: 'Erro',
        amountCents: 1,
        date: '2026-01-10',
        fromAccountId: 'a',
        toAccountId: 'a'
      })
    ).rejects.toBeInstanceOf(DomainError);
  });
});
