import { type ReactElement, useState, useCallback, useEffect } from 'react';
import { cx } from '../../lib/cx';
import type { ChatLang } from './types';
import { CHAT_STRINGS } from './chatStrings';
import { SimonAvatar } from './SimonAvatar';
import { ChatPanel } from './ChatPanel';

/** Close (X) glyph shown in the launcher when the panel is open. */
function XIcon(): ReactElement {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M5 5 15 15M15 5 5 15" />
    </svg>
  );
}

interface ChatWidgetProps {
  lang: ChatLang;
}

/**
 * Root chat widget — fixed bottom-right launcher button + floating panel.
 * Carries `data-overlay` so the section-snap pager ignores pointer events
 * inside this subtree.
 */
export function ChatWidget({ lang }: ChatWidgetProps): ReactElement {
  const [open, setOpen] = useState(false);
  const strings = CHAT_STRINGS[lang];

  // Slide the social rail off-screen while the panel is open so it never
  // covers the panel's close button. Clean up on unmount too.
  useEffect(() => {
    if (open) {
      document.documentElement.dataset['chatOpen'] = '';
    } else {
      delete document.documentElement.dataset['chatOpen'];
    }
    return () => {
      delete document.documentElement.dataset['chatOpen'];
    };
  }, [open]);

  const handleOpen = useCallback((): void => {
    setOpen(true);
  }, []);

  const handleClose = useCallback((): void => {
    setOpen(false);
  }, []);

  return (
    <div className="chat-root" data-overlay="">
      {open && <ChatPanel lang={lang} onClose={handleClose} />}

      <button
        className={cx('chat-launcher', open && 'chat-launcher--open')}
        onClick={open ? handleClose : handleOpen}
        aria-label={open ? strings.closeAria : strings.launcherAria}
        aria-expanded={open}
      >
        {open ? <XIcon /> : <SimonAvatar className="chat-launcher-avatar" />}
      </button>
    </div>
  );
}
