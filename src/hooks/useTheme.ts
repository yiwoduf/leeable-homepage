import { useCallback, useEffect, useState } from 'react';
import type { ThemeMode } from '../types/design';
import { siteConfig } from '../config/site';

const STORAGE_KEY = 'leeable:theme';

function getInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    /* localStorage unavailable (private mode, etc.) — fall through to default */
  }
  return siteConfig.defaultTheme;
}

/**
 * Dark/light theme state. Initializes from a returning visitor's saved choice,
 * else `siteConfig.defaultTheme`; reflects to `<html data-theme>` and persists.
 */
export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore persistence failures */
    }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, isDark: theme === 'dark', toggle } as const;
}
