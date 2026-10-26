import { describe, expect, it } from 'vitest';
import { isForeignKeyConstraint, isUniqueConstraint } from '../src/shared/sqlite-error.js';

describe('SQLite foreign-key errors', () => {
  it('recognizes the error returned by node:sqlite', () => {
    expect(
      isForeignKeyConstraint({
        code: 'ERR_SQLITE_ERROR',
        message: 'FOREIGN KEY constraint failed'
      })
    ).toBe(true);
  });

  it('does not classify unrelated SQLite errors as relationship conflicts', () => {
    expect(
      isForeignKeyConstraint({ code: 'ERR_SQLITE_ERROR', message: 'no such table: Account' })
    ).toBe(false);
  });

  it('recognizes uniqueness violations without classifying other SQLite errors', () => {
    expect(
      isUniqueConstraint({
        code: 'ERR_SQLITE_ERROR',
        message: 'UNIQUE constraint failed: Account.name'
      })
    ).toBe(true);
    expect(isUniqueConstraint({ code: 'ERR_SQLITE_ERROR', message: 'no such table: Account' })).toBe(
      false
    );
  });
});
