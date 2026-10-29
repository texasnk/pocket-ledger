import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  assertDistinctAccounts,
  assertPositiveCents,
  DomainError,
  RecordNotFoundError
} from '../../src/domain/financial.js';

describe('Regras de domínio de valores monetários', () => {
  it('deve aceitar um centavo e o maior inteiro seguro quando validar valores positivos', () => {
    assert.doesNotThrow(() => assertPositiveCents(1));
    assert.doesNotThrow(() => assertPositiveCents(Number.MAX_SAFE_INTEGER));
  });

  it('deve rejeitar valores imediatamente fora dos limites ou sem precisão inteira', () => {
    for (const value of [0, -1, 1.01, Number.MAX_SAFE_INTEGER + 1, Number.NaN, Infinity]) {
      assert.throws(() => assertPositiveCents(value), DomainError);
    }
  });
});

describe('Regras de domínio de transferências', () => {
  it('deve permitir contas diferentes quando validar uma transferência', () => {
    assert.doesNotThrow(() => assertDistinctAccounts('account-a', 'account-b'));
  });

  it('deve rejeitar a mesma conta de origem e destino', () => {
    assert.throws(() => assertDistinctAccounts('account-a', 'account-a'), DomainError);
    assert.throws(() => assertDistinctAccounts('', ''), DomainError);
  });
});

describe('Erros de domínio financeiros', () => {
  it('deve identificar recursos ausentes como erro de domínio com mensagem pública definida', () => {
    const error = new RecordNotFoundError();

    assert.ok(error instanceof DomainError);
    assert.equal(error.name, 'RecordNotFoundError');
    assert.equal(error.message, 'Record not found.');
  });
});
