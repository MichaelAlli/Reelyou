interface CacheEntry<T> {
  value: T;
  storedAt: number;
  ttlMs: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export function cacheGet<T>(key: string): { value: T; ageMs: number; stale: boolean } | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  const ageMs = Date.now() - entry.storedAt;
  const stale = ageMs > entry.ttlMs;
  return { value: entry.value, ageMs, stale };
}

export function cacheSet<T>(key: string, value: T, ttlMs: number): void {
  store.set(key, { value, storedAt: Date.now(), ttlMs });
}
