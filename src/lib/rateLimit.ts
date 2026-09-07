/**
 * Minimal in-memory rate limiter for API routes.
 *
 * Scoped, deliberate limitation: this counts requests per running server
 * process. On a single long-lived dev/staging server this works exactly
 * as expected. On serverless production (e.g. Vercel functions), each
 * cold-started instance has its own counter, so the *effective* global
 * limit is looser than the configured one. That's an acceptable V1
 * trade-off to stop the two known unmetered endpoints from being wide
 * open — replace with a shared store (Upstash Redis or similar) if/when
 * real abuse patterns are observed in production.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Periodically forget old buckets so this Map can't grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, 60_000).unref?.();

/**
 * Returns `true` if the call is within the allowed rate, `false` if the
 * caller should be rejected (429).
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;

  bucket.count += 1;
  return true;
}
