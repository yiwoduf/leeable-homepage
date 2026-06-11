import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Lang } from './types';
import { LANGS } from './types';
import { UI_STRINGS } from './ui';
import type { UiStrings } from './ui';
import { portfolio } from '../data/portfolio';
import { portfolioKo } from '../data/portfolio.ko';
import type { PortfolioData } from '../types/portfolio';

const STORAGE_KEY = 'leeable:lang';

function getInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'ko') return saved;
  } catch {
    /* localStorage unavailable (private mode, etc.) — fall through */
  }

  // Check browser language preferences.
  const navLangs: readonly string[] =
    navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const l of navLangs) {
    if (l.startsWith('ko')) return 'ko';
  }

  return 'en';
}

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: UiStrings;
  content: PortfolioData;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/** Provides lang state + t() + content to the whole tree. Wrap <App/> with this. */
export function LanguageProvider({ children }: { children: ReactNode }): ReactNode {
  const [lang, setLangState] = useState<Lang>(getInitialLang);
  const firstRender = useRef(true);

  const setLang = useCallback((next: Lang): void => {
    if (!LANGS.includes(next)) return;
    setLangState(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore persistence failures */
    }

    // Section heights can shift when the language changes (Korean text is
    // typically denser). Dispatch a resize event so useResizeRealign re-aligns
    // the viewport onto the current section — skipped on first mount, where
    // nothing has shifted yet.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.dispatchEvent(new Event('resize'));
  }, [lang]);

  // Memoized so context consumers only re-render on an actual language change
  // (a fresh object every render would cascade re-renders through every section).
  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang,
      t: UI_STRINGS[lang],
      content: lang === 'ko' ? portfolioKo : portfolio,
    }),
    [lang, setLang],
  );

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Access the current language, UI strings, and portfolio content.
 * Must be called inside a <LanguageProvider>.
 */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n() must be used inside <LanguageProvider>');
  return ctx;
}
