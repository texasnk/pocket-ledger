import { randomUUID } from 'node:crypto';
import { addMonths, parseIsoDate } from '../shared/date.js';
import {
  assertDistinctAccounts,
  assertPositiveCents,
  DomainError,
  type TransactionType
} from '../domain/financial.js';
import type { TransactionRecord, TransactionRepository } from '../domain/repositories.js';

export interface CreateTransactionInput {
  description: string;
  amountCents: number;
  date: string;
  type: Exclude<TransactionType, 'TRANSFER'>;
  accountId: string;
  categoryId: string;
  installments?: number;
  recurringMonths?: number;
}
export interface TransferInput {
  description: string;
  amountCents: number;
  date: string;
  fromAccountId: string;
  toAccountId: string;
}

/** Cria lançamentos simples, parcelas ou recorrências como registros explícitos e auditáveis. */
export class TransactionService {
  public constructor(private readonly repository: TransactionRepository) {}

  public async create(input: CreateTransactionInput): Promise<TransactionRecord[]> {
    assertPositiveCents(input.amountCents);
    const date = parseIsoDate(input.date);
    const installments = input.installments ?? 1;
    const recurringMonths = input.recurringMonths ?? 1;
    if (!Number.isInteger(installments) || installments < 1 || installments > 120)
      throw new DomainError('Quantidade de parcelas inválida.');
    if (!Number.isInteger(recurringMonths) || recurringMonths < 1 || recurringMonths > 120)
      throw new DomainError('Quantidade de recorrências inválida.');
    if (installments > 1 && recurringMonths > 1)
      throw new DomainError('Uma transação não pode ser parcelada e recorrente ao mesmo tempo.');
    const total = Math.max(installments, recurringMonths);
    const groupId = total > 1 ? randomUUID() : null;
    const divisor = installments > 1 ? installments : 1;
    const base = Math.floor(input.amountCents / divisor);
    const remainder = input.amountCents % divisor;
    return this.repository.runAtomically(async () =>
      Promise.all(
        Array.from({ length: total }, (_, index) =>
          this.repository.create({
            description: input.description,
            amountCents: base + (index < remainder ? 1 : 0),
            date: addMonths(date, index),
            type: input.type,
            accountId: input.accountId,
            categoryId: input.categoryId,
            transferFromAccountId: null,
            transferToAccountId: null,
            installmentGroupId: installments > 1 ? groupId : null,
            installmentNumber: installments > 1 ? index + 1 : null,
            installmentTotal: installments > 1 ? installments : null,
            recurrenceGroupId: recurringMonths > 1 ? groupId : null
          })
        )
      )
    );
  }

  public async transfer(input: TransferInput): Promise<TransactionRecord[]> {
    assertPositiveCents(input.amountCents);
    assertDistinctAccounts(input.fromAccountId, input.toAccountId);
    const date = parseIsoDate(input.date);
    const group = randomUUID();
    return this.repository.runAtomically(() =>
      Promise.all([
        this.repository.create({
          description: input.description,
          amountCents: input.amountCents,
          date,
          type: 'TRANSFER',
          accountId: input.fromAccountId,
          categoryId: null,
          transferFromAccountId: input.fromAccountId,
          transferToAccountId: input.toAccountId,
          installmentGroupId: null,
          installmentNumber: null,
          installmentTotal: null,
          recurrenceGroupId: group
        }),
        this.repository.create({
          description: input.description,
          amountCents: input.amountCents,
          date,
          type: 'TRANSFER',
          accountId: input.toAccountId,
          categoryId: null,
          transferFromAccountId: input.fromAccountId,
          transferToAccountId: input.toAccountId,
          installmentGroupId: null,
          installmentNumber: null,
          installmentTotal: null,
          recurrenceGroupId: group
        })
      ])
    );
  }
}
