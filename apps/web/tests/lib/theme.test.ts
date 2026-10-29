import { describe, expect, it } from 'vitest';
import { getStoredTheme, resolveTheme } from '../../src/lib/theme';

describe('theme preference', () => {
  it('uses dark mode when storage is missing or invalid', () => {
    expect(getStoredTheme(null)).toBe('dark');
    expect(getStoredTheme('purple')).toBe('dark');
    expect(getStoredTheme('system')).toBe('dark');
  });

  it('resolves explicit preferences predictably', () => {
    expect(resolveTheme('dark')).toBe('dark');
    expect(resolveTheme('light')).toBe('light');
  });
});
