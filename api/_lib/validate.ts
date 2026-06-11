/** Strict input validation for the /api/chat endpoint. Pure functions, no deps. */

/** ASCII control chars except \n (0x0A) and \t (0x09). */
const CONTROL_CHAR_RE = /[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g;

const MAX_BODY_BYTES = 32 * 1024; // 32 KB
const MAX_MESSAGES = 32;
const MIN_MESSAGES = 1;
const MAX_CONTENT_CHARS = 2_000;
const MAX_TOTAL_CHARS = 16_000;
const TRUNCATE_TO = 12; // keep only last N messages for model call

export type ValidLang = 'en' | 'ko';

export interface ValidMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ValidBody {
  messages: ValidMessage[];
  lang: ValidLang;
}

export type ValidationError =
  | 'body_too_large'
  | 'invalid_json'
  | 'invalid_messages'
  | 'invalid_role'
  | 'empty_content'
  | 'content_too_long'
  | 'total_too_long'
  | 'last_not_user';

export type ValidationResult =
  | { ok: true; data: ValidBody }
  | { ok: false; error: ValidationError };

/** Strip disallowed ASCII control characters from message content. */
function sanitiseContent(raw: string): string {
  return raw.replace(CONTROL_CHAR_RE, '');
}

/**
 * Parse and validate the request body.
 * Rejects bodies larger than 32 KB (checked via Content-Length header AND
 * measured text length after reading).
 */
export async function validateBody(
  req: Request,
): Promise<ValidationResult> {
  // Check Content-Length header first (fast-path rejection)
  const contentLength = req.headers.get('content-length');
  if (contentLength !== null) {
    const len = parseInt(contentLength, 10);
    if (!Number.isNaN(len) && len > MAX_BODY_BYTES) {
      return { ok: false, error: 'body_too_large' };
    }
  }

  let text: string;
  try {
    text = await req.text();
  } catch {
    return { ok: false, error: 'invalid_json' };
  }

  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    return { ok: false, error: 'body_too_large' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'invalid_json' };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, error: 'invalid_messages' };
  }

  const body = parsed as Record<string, unknown>;

  // Validate messages array
  const rawMessages = body['messages'];
  if (
    !Array.isArray(rawMessages) ||
    rawMessages.length < MIN_MESSAGES ||
    rawMessages.length > MAX_MESSAGES
  ) {
    return { ok: false, error: 'invalid_messages' };
  }

  let totalChars = 0;
  const messages: ValidMessage[] = [];

  for (const item of rawMessages) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return { ok: false, error: 'invalid_messages' };
    }
    const msg = item as Record<string, unknown>;

    // Role must be exactly 'user' or 'assistant' — never 'system'/'developer'/'tool'
    const role = msg['role'];
    if (role !== 'user' && role !== 'assistant') {
      return { ok: false, error: 'invalid_role' };
    }

    const rawContent = msg['content'];
    if (typeof rawContent !== 'string') {
      return { ok: false, error: 'invalid_messages' };
    }

    const content = sanitiseContent(rawContent).trim();

    if (content.length === 0) {
      return { ok: false, error: 'empty_content' };
    }
    if (content.length > MAX_CONTENT_CHARS) {
      return { ok: false, error: 'content_too_long' };
    }

    totalChars += content.length;
    if (totalChars > MAX_TOTAL_CHARS) {
      return { ok: false, error: 'total_too_long' };
    }

    messages.push({ role, content });
  }

  // Last message must be from user
  if (messages[messages.length - 1].role !== 'user') {
    return { ok: false, error: 'last_not_user' };
  }

  // Parse lang (default 'en' if absent or invalid)
  const rawLang = body['lang'];
  const lang: ValidLang =
    rawLang === 'en' || rawLang === 'ko' ? rawLang : 'en';

  // Truncate to last TRUNCATE_TO messages for the model
  const truncated = messages.slice(-TRUNCATE_TO);

  return { ok: true, data: { messages: truncated, lang } };
}
