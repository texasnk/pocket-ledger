export type ThemePreference = 'light' | 'dark';
export type ResolvedTheme = ThemePreference;

export const themeStorageKey = 'pocket-ledger-theme';

export function getStoredTheme(value: string | null): ThemePreference {
  return value === 'light' ? 'light' : 'dark';
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference;
}

export function applyTheme(theme: ResolvedTheme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
}
