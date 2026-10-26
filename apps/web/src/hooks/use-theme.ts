import { useEffect, useState } from 'react';
import {
  applyTheme,
  getStoredTheme,
  resolveTheme,
  themeStorageKey,
  type ThemePreference
} from '../lib/theme';

const systemPrefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

/** Keeps the persisted preference and the document colour scheme in sync. */
export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(() =>
    getStoredTheme(localStorage.getItem(themeStorageKey))
  );
  const [prefersDark, setPrefersDark] = useState(systemPrefersDark);
  const resolvedTheme = resolveTheme(preference, prefersDark);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setPrefersDark(mediaQuery.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    applyTheme(resolvedTheme);
    localStorage.setItem(themeStorageKey, preference);
  }, [preference, resolvedTheme]);

  return { preference, resolvedTheme, setPreference };
}
