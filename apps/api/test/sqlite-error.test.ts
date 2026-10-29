import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isForeignKeyConstraint, isUniqueConstraint } from '../src/shared/sqlite-error.js';

describe('SQLite foreign-key errors', () => {
  it('recognizes the error returned by node:sqlite', () => {
    assert.equal(
      isForeignKeyConstraint({
        code: 'ERR_SQLITE_ERROR',
        message: 'FOREIGN KEY constraint failed'
      }),
      true
    );
  });

  it('does not classify unrelated SQLite errors as relationship conflicts', () => {
    assert.equal(
      isForeignKeyConstraint({ code: 'ERR_SQLITE_ERROR', message: 'no such table: Account' }),
      false
    );
  });

  it('recognizes uniqueness violations without classifying other SQLite errors', () => {
    assert.equal(
      isUniqueConstraint({
        code: 'ERR_SQLITE_ERROR',
        message: 'UNIQUE constraint failed: Account.name'
      }),
      true
    );
    assert.equal(
      isUniqueConstraint({ code: 'ERR_SQLITE_ERROR', message: 'no such table: Account' }),
      false
    );
  });
});
