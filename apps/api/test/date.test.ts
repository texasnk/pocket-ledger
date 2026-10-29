import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DomainError } from '../src/domain/financial.js';
import { isIsoDate, isIsoMonth, parseIsoDate } from '../src/shared/date.js';

describe('ISO date validation', () => {
  it('rejects calendar dates normalized by JavaScript', () => {
    assert.equal(isIsoDate('2026-02-31'), false);
    assert.throws(() => parseIsoDate('2026-02-31'), DomainError);
  });

  it('accepts leap days and rejects invalid months', () => {
    assert.equal(isIsoDate('2028-02-29'), true);
    assert.equal(isIsoMonth('2026-13'), false);
  });
});
