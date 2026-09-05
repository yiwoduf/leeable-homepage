import {
  type ReactElement,
  type RefObject,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { cx } from '../../lib/cx';
import type { ChatLang, ChatMessageT } from './types';
import { CHAT_STRINGS } from './chatStrings';
import { UI_STRINGS } from '../../i18n/ui';
import { ChatMessage } from './ChatMessage';
import { ChatComposer } from './ChatComposer';
import { SimonAvatar } from './SimonAvatar';
import { useChat } from './useChat';

/** Close (X) icon — inline SVG. */
function CloseIcon(): ReactElement {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M5 5 15 15M15 5 5 15" />
    </svg>
  );
}

interface ChatPanelProps {
  onOpenMeeting: () => void;
  lang: ChatLang;
  onClose: () => void;
}

/** Scrolls the messages container to the bottom, if user is near the bottom. */
function useAutoScroll(
  messages: ChatMessageT[],
  containerRef: RefObject<HTMLDivElement | null>,
): void {
  const nearBottomRef = useRef(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = (): void => {
      const threshold = 80; // px from bottom
      nearBottomRef.current =
        el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !nearBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, containerRef]);
}

/**
 * The floating chat panel — glass surface, scrollable message list, composer.
 * Mounts above the launcher button; unmounting keeps messages alive in useChat.
 */
export function ChatPanel({ lang, onClose, onOpenMeeting }: ChatPanelProps): ReactElement {
  const strings = CHAT_STRINGS[lang];
  const { messages, status, online, inputDisabled, maxInputChars, send, abort, probe } =
    useChat(lang);

  const [inputValue, setInputValue] = useState('');
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  useAutoScroll(messages, messagesRef);

  // Focus the composer when the panel opens — desktop only. On touch devices
  // auto-focus would pop the virtual keyboard (and resize the viewport) the
  // moment the panel opens, which is jarring; preventScroll keeps the page
  // from being scrolled to the focused element.
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    composerRef.current?.focus({ preventScroll: true });
  }, []);

  // Probe the health endpoint when the panel first mounts (= panel open).
  useEffect(() => {
    probe();
  }, [probe]);

  const handleSend = useCallback((): void => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue('');
    void send(text);
  }, [inputValue, send]);

  const isStreaming = status === 'streaming';

  // Find the last assistant message to show typing indicator in.
  const lastMsg = messages[messages.length - 1];
  const showTyping =
    isStreaming && lastMsg?.role === 'assistant' && lastMsg.content === '';

  // Compute the sr-only live region text:
  // - while typing indicator is showing: typingAria
  // - when a stream just completed (last msg is assistant with content): that content
  // - otherwise: ''
  const lastAssistantContent =
    !isStreaming && lastMsg?.role === 'assistant' && lastMsg.content !== ''
      ? lastMsg.content
      : '';
  const srLiveText = showTyping
    ? strings.typingAria
    : lastAssistantContent.replace(/\[\[card:meeting\]\]/g, UI_STRINGS[lang].meeting.title);

  return (
    <div className="chat-panel" role="dialog" aria-label={strings.panelTitle} data-overlay="">
      {/* Header */}
      <div className="chat-panel-header">
        <div className="chat-panel-identity">
          <span className="chat-panel-avatar-wrap">
            <SimonAvatar className="chat-panel-avatar" />
          </span>
          <div className="chat-panel-meta">
            <span className="chat-panel-name">{strings.panelTitle}</span>
            <span className="chat-panel-sub">{strings.panelSubtitle}</span>
          </div>
          {/* null (still probing) renders as gray too — never flash a false "online" */}
          <span
            className={cx('chat-online-dot', online !== true && 'chat-online-dot--offline')}
            role="status"
            tabIndex={0}
            aria-label={online === true ? strings.statusOnline : strings.statusOffline}
            data-tip={online === true ? strings.statusOnline : strings.statusOffline}
          />
        </div>
        <button
          className="chat-close-btn"
          onClick={onClose}
          aria-label={strings.closeAria}
        >
          <CloseIcon />
        </button>
      </div>

      {/* Messages — no aria-live here; announcements go through the sr-only span */}
      <div
        ref={messagesRef}
        className="chat-messages"
      >
        {/* Static greeting bubble — always reflects current language */}
        <div className="chat-msg chat-msg--assistant">
          <span className="chat-avatar-wrap">
            <SimonAvatar className="chat-avatar" />
          </span>
          <div className="chat-bubble chat-bubble--assistant">
            <span className="chat-text">{strings.greeting}</span>
          </div>
        </div>

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onOpenMeeting={onOpenMeeting}
            isStreaming={isStreaming && msg.id === lastMsg?.id}
          />
        ))}
      </div>

      {/* Visually-hidden live region for screen-reader announcements */}
      <span className="chat-sr-live" aria-live="polite">{srLiveText}</span>

      {/* Composer */}
      <div className={cx('chat-composer-wrap', inputDisabled && !isStreaming && 'chat-composer-wrap--disabled')}>
        <ChatComposer
          lang={lang}
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          onAbort={abort}
          disabled={inputDisabled}
          isStreaming={isStreaming}
          maxChars={maxInputChars}
          textareaRef={composerRef}
        />
      </div>
    </div>
  );
}
