import { describe, expect, it } from 'vitest';
import { currentMonth, formatCents } from '../../../src/lib/api';
describe('financial formatting', () => {
  it('formats cents as Brazilian currency', () => expect(formatCents(12345)).toBe('R$ 123,45'));
  it('returns a valid current month query', () => expect(currentMonth()).toMatch(/^\d{4}-\d{2}$/));
});
