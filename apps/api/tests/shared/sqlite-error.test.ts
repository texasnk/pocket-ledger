import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isForeignKeyConstraint, isUniqueConstraint } from '../../src/shared/sqlite-error.js';

describe('Classificação unitária de falhas SQLite', () => {
  it('deve reconhecer códigos diretos de chave estrangeira e unicidade', () => {
    assert.equal(isForeignKeyConstraint({ code: 'SQLITE_CONSTRAINT_FOREIGNKEY' }), true);
    assert.equal(isUniqueConstraint({ code: 'SQLITE_CONSTRAINT_UNIQUE' }), true);
  });

  it('deve reconhecer mensagens de constraint do driver node:sqlite', () => {
    assert.equal(
      isForeignKeyConstraint({
        code: 'ERR_SQLITE_ERROR',
        message: 'FOREIGN KEY constraint failed'
      }),
      true
    );
    assert.equal(
      isUniqueConstraint({
        code: 'ERR_SQLITE_ERROR',
        message: 'UNIQUE constraint failed: Category.name'
      }),
      true
    );
  });

  it('deve rejeitar erros SQLite sem código ou mensagem de constraint correspondente', () => {
    const unrelatedErrors: unknown[] = [
      null,
      undefined,
      'FOREIGN KEY constraint failed',
      {},
      { code: 'ERR_SQLITE_ERROR' },
      { code: 'ERR_SQLITE_ERROR', message: 'no such table: Account' },
      { code: 'SQLITE_CONSTRAINT_CHECK', message: 'FOREIGN KEY constraint failed' }
    ];

    for (const error of unrelatedErrors) {
      assert.equal(isForeignKeyConstraint(error), false);
      assert.equal(isUniqueConstraint(error), false);
    }
  });
});
