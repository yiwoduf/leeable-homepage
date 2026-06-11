// NOTE: relative imports carry the .js extension — the project is ESM
// ("type": "module") and Vercel compiles api/*.ts file-by-file, so Node's
// ESM resolver needs explicit extensions at runtime.
import { validateBody } from './_lib/validate.js';
import { buildSystemPrompt } from './_lib/simon.js';
import {
  isRedisConfigured,
  checkRateLimit,
  getClientId,
  type RateLimitResult,
} from './_lib/ratelimit.js';

/** Vercel Function max duration (seconds). */
export const maxDuration = 30;

/** Allowed origins for CORS / origin gating. */
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;

  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }

  const { protocol, hostname } = url;

  // Production domains
  if (
    protocol === 'https:' &&
    (hostname === 'leeable.dev' || hostname === 'www.leeable.dev')
  ) {
    return true;
  }

  // Vercel preview URLs start with the project name — adjust if the Vercel project is renamed
  const VERCEL_PREVIEW_PREFIX = 'leeable-homepage';
  if (
    protocol === 'https:' &&
    hostname.endsWith('.vercel.app') &&
    hostname.startsWith(VERCEL_PREVIEW_PREFIX)
  ) {
    return true;
  }

  // Local development (any port is fine)
  if (
    (protocol === 'http:' || protocol === 'https:') &&
    (hostname === 'localhost' || hostname === '127.0.0.1')
  ) {
    return true;
  }

  return false;
}

/** Build a JSON error response. */
function jsonError(
  status: number,
  code: string,
  extra?: Record<string, unknown>,
): Response {
  return new Response(JSON.stringify({ error: code, ...(extra ?? {}) }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Check whether required env vars are present. */
function isFullyConfigured(): boolean {
  return (
    typeof process.env['OPENAI_API_KEY'] === 'string' &&
    process.env['OPENAI_API_KEY'].length > 0 &&
    isRedisConfigured()
  );
}

/** OpenAI Chat Completions streaming endpoint. */
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIRequestBody {
  model: string;
  stream: boolean;
  max_completion_tokens: number;
  messages: OpenAIMessage[];
  reasoning_effort?: string;
}

/**
 * Fetch from OpenAI with optional reasoning_effort.
 * If the response is 400 and the error mentions 'reasoning_effort',
 * retries once without that parameter.
 */
async function fetchOpenAI(
  messages: OpenAIMessage[],
  signal: AbortSignal,
  withReasoning: boolean,
): Promise<Response> {
  const apiKey = process.env['OPENAI_API_KEY'] ?? '';

  const body: OpenAIRequestBody = {
    model: 'gpt-5-mini',
    stream: true,
    max_completion_tokens: 1200,
    messages,
  };

  if (withReasoning) {
    body.reasoning_effort = 'low';
  }

  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  });

  // Compat fallback: if 400 and error mentions reasoning_effort, retry without it
  if (res.status === 400 && withReasoning) {
    let bodyText = '';
    try {
      bodyText = await res.text();
    } catch {
      // ignore
    }
    if (bodyText.includes('reasoning_effort')) {
      return fetchOpenAI(messages, signal, false);
    }
    // Re-wrap the already-consumed body (no upstream headers — they are invalid for a buffered body)
    return new Response(bodyText, { status: res.status });
  }

  return res;
}

/**
 * Pump an OpenAI SSE stream → plain UTF-8 text ReadableStream.
 * Parses `data: {...}` lines, extracts delta.content, enqueues raw text.
 * Handles [DONE] and aborts cleanly on client disconnect.
 */
function pumpSSE(upstream: Response, signal: AbortSignal): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let settled = false;

      const safeClose = (): void => {
        if (!settled) {
          settled = true;
          controller.close();
        }
      };

      const safeError = (e: unknown): void => {
        if (!settled) {
          settled = true;
          controller.error(e);
        }
      };

      const abort = (): void => {
        void reader.cancel();
        safeError(new DOMException('Aborted', 'AbortError'));
      };

      signal.addEventListener('abort', abort, { once: true });

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          // The last element may be an incomplete chunk — keep it in the buffer
          buffer = parts.pop() ?? '';

          for (const part of parts) {
            for (const line of part.split('\n')) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data: ')) continue;
              const payload = trimmed.slice('data: '.length);
              if (payload === '[DONE]') {
                safeClose();
                return;
              }
              try {
                const json: unknown = JSON.parse(payload);
                if (json && typeof json === 'object') {
                  const obj = json as {
                    choices?: Array<{
                      delta?: { content?: unknown };
                    }>;
                  };
                  const content = obj.choices?.[0]?.delta?.content;
                  if (typeof content === 'string' && content.length > 0) {
                    controller.enqueue(encoder.encode(content));
                  }
                }
              } catch {
                // Malformed JSON chunk — skip
              }
            }
          }
        }

        safeClose();
      } catch (err) {
        const isAbort =
          err instanceof Error &&
          (err.name === 'AbortError' || signal.aborted);
        if (isAbort) {
          safeError(new DOMException('Aborted', 'AbortError'));
        } else {
          safeError(err);
        }
      } finally {
        signal.removeEventListener('abort', abort);
        void reader.cancel().catch(() => undefined);
      }
    },

    cancel() {
      // The client disconnected — nothing extra to do; the reader is already
      // cancelled in the finally block of start().
    },
  });
}

/**
 * GET /api/chat — health probe for the widget's status dot.
 * No origin gate here: browsers do NOT send an Origin header on same-origin
 * GET requests (it is only attached to POST/CORS), so requiring one would 403
 * every legitimate probe. The response carries no sensitive data — only
 * whether the chat backend is configured, which the widget reveals anyway.
 */
export async function GET(): Promise<Response> {
  const body = JSON.stringify({
    status: isFullyConfigured() ? 'online' : 'offline',
  });

  return new Response(body, {
    status: isFullyConfigured() ? 200 : 503,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

/** POST /api/chat — main entry point (Vercel Web API function). */
export async function POST(request: Request): Promise<Response> {
  // 1. Origin check
  const origin = request.headers.get('origin');
  if (!isAllowedOrigin(origin)) {
    return jsonError(403, 'forbidden_origin');
  }

  // 2. Env / configuration check
  if (!isFullyConfigured()) {
    return jsonError(503, 'unconfigured');
  }

  // 3. Validate body (before rate limit — reject malformed requests without burning quota)
  const validation = await validateBody(request);
  if (!validation.ok) {
    return jsonError(400, 'invalid_request');
  }

  const { messages, lang } = validation.data;

  // 4. Rate limiting (per-minute then per-day)
  const clientId = getClientId(request);
  let rlResult: RateLimitResult;
  try {
    rlResult = await checkRateLimit(clientId);
  } catch {
    // Redis transient failure — fail open (acceptable per spec)
    rlResult = { allowed: true };
  }

  if (!rlResult.allowed) {
    const extra: Record<string, unknown> = {};
    if (typeof rlResult.reset === 'number') {
      extra['reset'] = rlResult.reset;
    }
    return jsonError(429, 'rate_limited', extra);
  }

  // 5. Build OpenAI messages (system + validated history)
  const openAIMessages: OpenAIMessage[] = [
    { role: 'system', content: buildSystemPrompt(lang) },
    ...messages,
  ];

  // 6. Stream from OpenAI
  let upstream: Response;
  try {
    upstream = await fetchOpenAI(openAIMessages, request.signal, true);
  } catch (err) {
    // Network or abort error reaching OpenAI
    const isAbort =
      err instanceof Error &&
      (err.name === 'AbortError' || request.signal.aborted);
    if (isAbort) {
      return new Response(null, { status: 499 });
    }
    return jsonError(502, 'upstream_error');
  }

  if (!upstream.ok) {
    // Log only the status code — never log user content or the API key
    console.error('[chat] OpenAI responded with status:', upstream.status);
    return jsonError(502, 'upstream_error');
  }

  if (!upstream.body) {
    return jsonError(502, 'upstream_error');
  }

  // 7. Return streaming plain-text response
  const stream = pumpSSE(upstream, request.signal);

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
