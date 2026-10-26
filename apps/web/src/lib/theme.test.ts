import { describe, expect, it } from 'vitest';
import { getStoredTheme, resolveTheme } from './theme';

describe('theme preference', () => {
  it('uses a system preference when storage is missing or invalid', () => {
    expect(getStoredTheme(null)).toBe('system');
    expect(getStoredTheme('purple')).toBe('system');
  });

  it('resolves system and explicit preferences predictably', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
  });
});
