const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

type Attempt = { count: number; resetAt: number };
const attempts = new Map<string, Attempt>();

export function checkLoginRateLimit(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }
  current.count += 1;
  if (current.count <= MAX_ATTEMPTS) return { allowed: true, retryAfter: 0 };
  return { allowed: false, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
}

export function clearLoginRateLimit(key: string) {
  attempts.delete(key);
}
