/**
 * In-memory Rate Limiter
 * Catatan: Jika di-deploy ke Serverless (seperti Vercel), in-memory Map bisa keriset antar cold-start 
 * atau tidak tersinkronisasi antar lambda/edge node. 
 * Namun ini cukup efektif untuk memblokir spam burst berkecepatan tinggi.
 */

const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || record.expiresAt < now) {
    rateLimitMap.set(key, { count: 1, expiresAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false; // Terkena Rate Limit
  }

  record.count += 1;
  return true;
}
