import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/** Result from a rate-limit check. */
export interface RateLimitResult {
  allowed: boolean;
  /** Unix timestamp (ms) when the current window resets, if available. */
  reset?: number;
}

/**
 * Whether Upstash env vars are configured. Call before accessing the limiters.
 */
export function isRedisConfigured(): boolean {
  return (
    typeof process.env['UPSTASH_REDIS_REST_URL'] === 'string' &&
    process.env['UPSTASH_REDIS_REST_URL'].length > 0 &&
    typeof process.env['UPSTASH_REDIS_REST_TOKEN'] === 'string' &&
    process.env['UPSTASH_REDIS_REST_TOKEN'].length > 0
  );
}

/** Lazily-initialised module-level singletons (constructed once per cold start). */
let _redis: Redis | null = null;
let _perMinute: Ratelimit | null = null;
let _perDay: Ratelimit | null = null;

function getRedis(): Redis {
  if (!_redis) {
    _redis = Redis.fromEnv();
  }
  return _redis;
}

function getPerMinute(): Ratelimit {
  if (!_perMinute) {
    _perMinute = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(6, '1 m'),
      prefix: 'simon:rl:min',
      analytics: false,
    });
  }
  return _perMinute;
}

function getPerDay(): Ratelimit {
  if (!_perDay) {
    _perDay = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(40, '1 d'),
      prefix: 'simon:rl:day',
      analytics: false,
    });
  }
  return _perDay;
}

/**
 * Extract the client IP from the request headers.
 * On Vercel both headers are platform-set; x-real-ip is unambiguous (single value),
 * so it is checked first. x-forwarded-for may contain a comma-separated list —
 * the first hop is used as a fallback.
 */
export function getClientId(req: Request): string {
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0];
    if (first) return first.trim();
  }

  return 'unknown';
}

/**
 * Check per-minute then per-day rate limits for the given identifier.
 * Returns `{ allowed: false, reset }` as soon as either limit is hit.
 */
export async function checkRateLimit(id: string): Promise<RateLimitResult> {
  const minResult = await getPerMinute().limit(id);
  if (!minResult.success) {
    return { allowed: false, reset: minResult.reset };
  }

  const dayResult = await getPerDay().limit(id);
  if (!dayResult.success) {
    return { allowed: false, reset: dayResult.reset };
  }

  return { allowed: true };
}
