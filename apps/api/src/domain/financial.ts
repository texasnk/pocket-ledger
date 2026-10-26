export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';
export type CategoryType = 'INCOME' | 'EXPENSE';

export class DomainError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class RecordNotFoundError extends DomainError {
  public constructor() {
    super('Record not found.');
    this.name = 'RecordNotFoundError';
  }
}

/** Valida valores monetários representados exclusivamente em centavos inteiros positivos. */
export function assertPositiveCents(value: number): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new DomainError('O valor deve ser um número inteiro positivo em centavos.');
  }
}

/** Impede uma transferência entre a mesma conta, que não produz efeito financeiro válido. */
export function assertDistinctAccounts(fromAccountId: string, toAccountId: string): void {
  if (fromAccountId === toAccountId)
    throw new DomainError('As contas de origem e destino devem ser diferentes.');
}
