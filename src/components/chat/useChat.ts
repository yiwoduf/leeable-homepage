import { useState, useRef, useCallback, useEffect } from 'react';
import type { ChatLang, ChatMessageT, ChatStatus } from './types';
import { CHAT_STRINGS } from './chatStrings';

const SESSION_KEY = 'leeable:chat:v1';
const MAX_INPUT_CHARS = 500;
const MAX_USER_MESSAGES_PER_SESSION = 20;

/** Generate a simple unique id for messages. */
function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Both greeting strings — used to drop stored greetings on load (backward compat). */
const GREETING_STRINGS: ReadonlySet<string> = new Set([
  CHAT_STRINGS.en.greeting,
  CHAT_STRINGS.ko.greeting,
]);

/** Load persisted messages from sessionStorage. Returns [] on any failure. */
function loadSession(): ChatMessageT[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Validate shape, drop empty-content messages and any stored greeting (backward compat).
    return (parsed as ChatMessageT[]).filter(
      (m) =>
        m &&
        typeof m === 'object' &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim() !== '' &&
        !GREETING_STRINGS.has(m.content),
    );
  } catch {
    // Storage read or parse error — start fresh silently
    return [];
  }
}

/** Persist messages to sessionStorage. Intentionally tolerates quota errors. */
function saveSession(messages: ChatMessageT[]): void {
  try {
    // Persist all displayed messages: user bubbles, assistant replies, and local
    // notice messages (error/offline/limit notices) — so the thread survives
    // close/reopen within the session. The streaming assistant placeholder
    // (local:true, content:'') is excluded by the empty-content guard.
    // API payload exclusion of local messages is handled in send(), not here.
    const toSave = messages.filter((m) => m.content.trim() !== '');
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(toSave));
  } catch {
    // Quota exceeded or private browsing — acceptable, session just won't persist
  }
}

interface UseChatReturn {
  messages: ChatMessageT[];
  status: ChatStatus;
  /** null = unknown (probe not yet resolved), true = online, false = offline */
  online: boolean | null;
  inputDisabled: boolean;
  maxInputChars: number;
  send: (text: string) => Promise<void>;
  abort: () => void;
  /** Trigger the health probe manually (e.g. on panel open). */
  probe: () => void;
}

/** Manages chat session state: messages, streaming, error handling, persistence. */
export function useChat(lang: ChatLang): UseChatReturn {
  const strings = CHAT_STRINGS[lang];

  // Greeting is rendered statically in ChatPanel — do not seed it into state.
  const [messages, setMessages] = useState<ChatMessageT[]>(() => loadSession());

  const [status, setStatus] = useState<ChatStatus>('idle');

  // null = not yet probed, true = online, false = offline
  const [online, setOnline] = useState<boolean | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // Cancel any in-flight stream when the component that owns this hook unmounts.
  useEffect(
    () => () => {
      abortRef.current?.abort();
      abortRef.current = null;
    },
    [],
  );

  // Persist non-local, non-empty messages whenever state changes.
  useEffect(() => {
    saveSession(messages);
  }, [messages]);

  const userMessageCount = messages.filter(
    (m) => m.role === 'user' && !m.local,
  ).length;
  const sessionLimitReached = userMessageCount >= MAX_USER_MESSAGES_PER_SESSION;
  const inputDisabled = status === 'streaming' || sessionLimitReached;

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus('idle');
  }, []);

  const probe = useCallback((): void => {
    void (async () => {
      try {
        const res = await fetch('/api/chat', {
          method: 'GET',
          signal: AbortSignal.timeout(4000),
        });
        setOnline(res.ok);
      } catch {
        setOnline(false);
      }
    })();
  }, []);

  const send = useCallback(
    async (text: string): Promise<void> => {
      const trimmed = text.trim();
      if (!trimmed || status === 'streaming') return;
      if (trimmed.length > MAX_INPUT_CHARS) return;
      if (sessionLimitReached) return;

      // Append user message
      const userMsg: ChatMessageT = {
        id: uid(),
        role: 'user',
        content: trimmed,
      };

      // Count of user messages AFTER this one is successfully sent
      const newUserCount = userMessageCount + 1;

      setMessages((prev) => [...prev, userMsg]);
      setStatus('streaming');

      // Abort any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // Build assistant placeholder — local:true keeps it out of the API
      // payload; promoted to a persistent message when the stream finalizes.
      const assistantId = uid();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', local: true },
      ]);

      try {
        // Build API payload: non-local messages with non-empty content only.
        const toSend = [...messages, userMsg]
          .filter((m) => !m.local && m.content.trim() !== '')
          .map(({ role, content }) => ({ role, content }));

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: toSend, lang }),
          signal: controller.signal,
        });

        if (!res.ok) {
          let errorCode = 'generic';
          try {
            const json: unknown = await res.json();
            if (
              json &&
              typeof json === 'object' &&
              'error' in json &&
              typeof (json as { error: unknown }).error === 'string'
            ) {
              errorCode = (json as { error: string }).error;
            }
          } catch {
            // Body read failed — use generic code
          }

          // 503 (unconfigured) → offline; 429 (rate_limited) → still online
          if (errorCode === 'unconfigured') {
            setOnline(false);
          } else if (errorCode !== 'rate_limited') {
            // Unknown server error — don't change online status
          }

          const errorContent =
            errorCode === 'rate_limited'
              ? strings.errorRateLimited
              : errorCode === 'unconfigured'
                ? strings.errorOffline
                : strings.errorGeneric;

          // Replace placeholder with an error notice (local:true = excluded
          // from the API payload; still persisted so it survives reopen).
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: errorContent, local: true }
                : m,
            ),
          );
          setStatus('error');
          abortRef.current = null;

          // Only show the session-limit notice after a SUCCESSFUL exchange.
          // A failed final send lets the user retry — do not append the limit notice.
          return;
        }

        if (!res.body) {
          throw new TypeError('Response has no body');
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: accumulated } : m,
            ),
          );
        }

        // Stream completed successfully — we know the API is reachable.
        setOnline(true);

        if (accumulated.trim() === '') {
          // Empty response — remove placeholder entirely.
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        } else {
          // Promote from local (ephemeral) to persistent so it joins API history.
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, local: false } : m,
            ),
          );
        }

        setStatus('idle');
        abortRef.current = null;

        // Session limit notice — only after a successful exchange that consumes the slot.
        if (newUserCount >= MAX_USER_MESSAGES_PER_SESSION) {
          setMessages((prev) => [
            ...prev,
            {
              id: uid(),
              role: 'assistant',
              content: strings.sessionLimitReached,
              local: true,
            },
          ]);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // AbortError from user stop OR unmount abort — remove placeholder, stay idle.
          // Never show an error notice for self-inflicted aborts.
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          setStatus('idle');
          return;
        }

        // Network / unexpected error — treat as offline.
        setOnline(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: strings.errorOffline, local: true }
              : m,
          ),
        );
        setStatus('error');
        abortRef.current = null;
      }
    },
    [
      messages,
      status,
      lang,
      sessionLimitReached,
      userMessageCount,
      strings.errorGeneric,
      strings.errorOffline,
      strings.errorRateLimited,
      strings.sessionLimitReached,
    ],
  );

  return {
    messages,
    status,
    online,
    inputDisabled,
    maxInputChars: MAX_INPUT_CHARS,
    send,
    abort,
    probe,
  };
}
