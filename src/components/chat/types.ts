/** Supported UI languages for the chat widget. */
export type ChatLang = 'en' | 'ko';

/** A single message in the chat thread. */
export interface ChatMessageT {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  /**
   * True for hardcoded client-only messages (greeting, error notices).
   * These are NEVER sent to the API.
   */
  local?: boolean;
}

/** Overall chat state driven by useChat. */
export type ChatStatus = 'idle' | 'streaming' | 'error';
