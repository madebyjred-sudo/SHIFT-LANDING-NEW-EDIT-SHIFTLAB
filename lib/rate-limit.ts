type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_HITS = 8;

function prune(now: number) {
  if (buckets.size < 5000) return;
  const stale: string[] = [];
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) stale.push(key);
  }
  for (const key of stale) buckets.delete(key);
}

/**
 * Best-effort in-memory limiter per key (e.g. client IP).
 * On multi-instance/serverless deploys each instance has its own counter; pair with
 * an edge/WAF or Redis-based limiter for strict global caps.
 */
export function rateLimit(key: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  prune(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }

  if (existing.count >= MAX_HITS) {
    const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return { ok: false, retryAfterSec };
  }

  existing.count += 1;
  return { ok: true };
}
