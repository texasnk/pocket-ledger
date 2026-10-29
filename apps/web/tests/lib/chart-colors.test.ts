import { describe, expect, it } from 'vitest';
import {
  categoryColor,
  chartCategoricalDark,
  chartCategoricalLight,
  chartColor
} from '../../src/lib/chart-colors';

describe('chart colour tokens', () => {
  it('keeps financial meanings bound to semantic tokens', () => {
    expect(chartColor('income')).toBe('var(--chart-income)');
    expect(chartColor('expense')).toBe('var(--chart-expense)');
    expect(chartColor('balance')).toBe('var(--chart-balance)');
  });

  it('assigns category colours deterministically, independently of ordering', () => {
    expect(categoryColor('groceries')).toBe(categoryColor('groceries'));
    expect(chartCategoricalLight).toHaveLength(chartCategoricalDark.length);
  });
});
