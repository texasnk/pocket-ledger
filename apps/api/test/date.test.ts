import { describe, expect, it } from 'vitest';
import { DomainError } from '../src/domain/financial.js';
import { isIsoDate, isIsoMonth, parseIsoDate } from '../src/shared/date.js';

describe('ISO date validation', () => {
  it('rejects calendar dates normalized by JavaScript', () => {
    expect(isIsoDate('2026-02-31')).toBe(false);
    expect(() => parseIsoDate('2026-02-31')).toThrow(DomainError);
  });

  it('accepts leap days and rejects invalid months', () => {
    expect(isIsoDate('2028-02-29')).toBe(true);
    expect(isIsoMonth('2026-13')).toBe(false);
  });
});
