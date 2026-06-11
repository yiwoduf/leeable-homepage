import { useEffect, useRef } from 'react';
import type { ReactElement, MouseEvent } from 'react';
import { useI18n } from '../../i18n';
import { Icon } from '../ui/Icon';
import { cx } from '../../lib/cx';

/** Selector for the elements a modal focus trap should cycle through. */
const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

/**
 * Settings modal — theme + language switcher.
 * Mounted/unmounted per open state (avoids .reveal observer issues).
 * CSS entrance animation only; exit is instant (KISS).
 */
export function SettingsModal({ open, onClose, isDark, onToggleTheme }: SettingsModalProps): null | ReactElement {
  const { lang, setLang, t } = useI18n();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  // Keep the latest onClose in a ref so the open/close effect depends on
  // `open` only — App passes an inline arrow, and re-firing the effect on
  // every render would clobber the saved focus target mid-session.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement;
    panelRef.current?.focus({ preventScroll: true });

    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      // Trap Tab / Shift+Tab inside the panel while the modal is open.
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || active === panelRef.current)) {
          e.preventDefault();
          last.focus({ preventScroll: true });
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus({ preventScroll: true });
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus({ preventScroll: true });
      }
    };
  }, [open]);

  if (!open) return null;

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="modal-backdrop"
      data-overlay=""
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={t.settings.title}
        tabIndex={-1}
        ref={panelRef}
      >
        {/* Title row */}
        <div className="modal-title-row">
          <span className="modal-title">{t.settings.title}</span>
          <button className="modal-close" onClick={onClose} aria-label={t.settings.close}>
            <Icon name="close" />
          </button>
        </div>

        {/* Theme option group */}
        <div className="modal-group">
          <div className="modal-group-label">{t.settings.theme}</div>
          <div className="seg">
            <button
              className={cx('seg-btn', isDark && 'active')}
              aria-pressed={isDark}
              onClick={() => { if (!isDark) onToggleTheme(); }}
            >
              {t.settings.themeDark}
            </button>
            <button
              className={cx('seg-btn', !isDark && 'active')}
              aria-pressed={!isDark}
              onClick={() => { if (isDark) onToggleTheme(); }}
            >
              {t.settings.themeLight}
            </button>
          </div>
        </div>

        {/* Language option group */}
        <div className="modal-group">
          <div className="modal-group-label">{t.settings.language}</div>
          <div className="seg">
            {/* Each label is always in its own language, regardless of current lang */}
            <button
              className={cx('seg-btn', lang === 'en' && 'active')}
              aria-pressed={lang === 'en'}
              onClick={() => setLang('en')}
            >
              English
            </button>
            <button
              className={cx('seg-btn', lang === 'ko' && 'active')}
              aria-pressed={lang === 'ko'}
              onClick={() => setLang('ko')}
            >
              한국어
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
