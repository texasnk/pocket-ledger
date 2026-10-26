import { useEffect, useState } from 'react';
import {
  applyTheme,
  getStoredTheme,
  resolveTheme,
  themeStorageKey,
  type ThemePreference
} from '../lib/theme';

/** Mantém a preferência persistida e o esquema de cores do documento sincronizados. */
export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(() =>
    getStoredTheme(localStorage.getItem(themeStorageKey))
  );
  const resolvedTheme = resolveTheme(preference);

  useEffect(() => {
    applyTheme(resolvedTheme);
    localStorage.setItem(themeStorageKey, preference);
  }, [preference, resolvedTheme]);

  return { preference, resolvedTheme, setPreference };
}
