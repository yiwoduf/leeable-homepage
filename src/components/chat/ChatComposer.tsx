import {
  type ReactElement,
  type KeyboardEvent,
  type ChangeEvent,
  type MutableRefObject,
  useRef,
  useEffect,
} from 'react';
import { cx } from '../../lib/cx';
import type { ChatLang } from './types';
import { CHAT_STRINGS } from './chatStrings';

const CHAR_COUNTER_THRESHOLD = 400;

interface ChatComposerProps {
  lang: ChatLang;
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onAbort: () => void;
  disabled: boolean;
  isStreaming: boolean;
  maxChars: number;
  /** Optional external ref forwarded from the parent (used for focus-on-open). */
  textareaRef?: MutableRefObject<HTMLTextAreaElement | null>;
}

/** Send icon — paper-plane style, inline SVG. */
function SendIcon(): ReactElement {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2 9 11M18 2 12 18 9 11M18 2 2 8l7 3" />
    </svg>
  );
}

/** Stop / X icon for aborting streaming. */
function StopIcon(): ReactElement {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="5" y="5" width="10" height="10" rx="2" strokeWidth="1.8" />
    </svg>
  );
}

/** Composer row: textarea + send/stop button + char counter. */
export function ChatComposer({
  lang,
  value,
  onChange,
  onSend,
  onAbort,
  disabled,
  isStreaming,
  maxChars,
  textareaRef,
}: ChatComposerProps): ReactElement {
  const strings = CHAT_STRINGS[lang];
  const internalRef = useRef<HTMLTextAreaElement | null>(null);
  // Use the external ref when provided, otherwise fall back to internal.
  const resolvedRef: MutableRefObject<HTMLTextAreaElement | null> = textareaRef ?? internalRef;
  const charCount = value.length;
  const showCounter = charCount >= CHAR_COUNTER_THRESHOLD;
  const canSend = value.trim().length > 0 && !disabled;
  const overLimit = charCount > maxChars;

  // Auto-resize textarea (1–3 rows)
  useEffect(() => {
    const el = resolvedRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineH = 24; // px, matches CSS line-height
    const maxH = lineH * 3 + 16; // 3 rows + padding
    el.style.height = `${Math.min(el.scrollHeight, maxH)}px`;
  }, [value, resolvedRef]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const next = e.target.value;
    if (next.length <= maxChars) {
      onChange(next);
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSend();
    }
  };

  return (
    <div className="chat-composer">
      <textarea
        ref={resolvedRef}
        className={cx('chat-composer-input', overLimit && 'chat-composer-input--over')}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKey}
        placeholder={strings.inputPlaceholder}
        disabled={disabled && !isStreaming}
        rows={1}
        maxLength={maxChars}
        aria-label={strings.inputPlaceholder}
      />
      <div className="chat-composer-row">
        {showCounter && (
          <span className="chat-char-counter" aria-live="off">
            {strings.charCounterPattern
              .replace('{n}', String(charCount))
              .replace('{max}', String(maxChars))}
          </span>
        )}
        <button
          className={cx(
            'chat-send-btn',
            canSend && 'chat-send-btn--active',
            isStreaming && 'chat-send-btn--stop',
          )}
          onClick={isStreaming ? onAbort : onSend}
          disabled={!isStreaming && !canSend}
          aria-label={isStreaming ? strings.stopAria : strings.sendAria}
        >
          {isStreaming ? <StopIcon /> : <SendIcon />}
        </button>
      </div>
    </div>
  );
}
