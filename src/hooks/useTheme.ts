import { useCallback, useEffect, useState } from 'react';
import type { ThemeMode, ThemePreference } from '../types/design';
import { siteConfig } from '../config/site';

const STORAGE_KEY = 'leeable:theme';
const SYSTEM_QUERY = '(prefers-color-scheme: dark)';

function getInitialPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light' || saved === 'system') return saved;
  } catch {
    /* localStorage unavailable (private mode, etc.) — fall through to default */
  }
  return siteConfig.defaultTheme;
}

function getSystemTheme(): ThemeMode {
  return window.matchMedia(SYSTEM_QUERY).matches ? 'dark' : 'light';
}

/**
 * Theme state with three preferences: explicit `dark`/`light`, or `system`
 * (follow the OS). The saved value is the PREFERENCE; the applied `theme` is
 * the resolved ThemeMode — for `system` it tracks the OS and live-updates when
 * the OS scheme flips. Initializes from a returning visitor's saved choice,
 * else `siteConfig.defaultTheme`; reflects the resolved theme to
 * `<html data-theme>`.
 */
export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>(getInitialPreference);
  const [systemTheme, setSystemTheme] = useState<ThemeMode>(getSystemTheme);

  // Subscribe to the OS scheme only while following it — no listener cost when
  // the user has pinned an explicit theme.
  useEffect(() => {
    if (preference !== 'system') return;
    const mq = window.matchMedia(SYSTEM_QUERY);
    const onChange = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? 'dark' : 'light');
    setSystemTheme(mq.matches ? 'dark' : 'light'); // resync in case it changed while unsubscribed
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [preference]);

  const theme: ThemeMode = preference === 'system' ? systemTheme : preference;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore persistence failures */
    }
  }, []);

  return { theme, isDark: theme === 'dark', preference, setPreference } as const;
}
