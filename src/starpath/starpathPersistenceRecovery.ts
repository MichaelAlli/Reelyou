export function safeJsonParse<T>(raw: string | null): { value: T | null; ok: boolean } {
  if (!raw) return { value: null, ok: true };
  try {
    return { value: JSON.parse(raw) as T, ok: true };
  } catch {
    return { value: null, ok: false };
  }
}

export function clampNumber(n: unknown, min: number, max: number, fallback: number): number {
  if (typeof n !== 'number' || Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
