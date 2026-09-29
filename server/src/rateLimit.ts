const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

let openAiDailyCount = 0;
let openAiDailyReset = Date.now() + 24 * 60 * 60 * 1000;

export function consumeOpenAiBudget(): boolean {
  const now = Date.now();
  if (now > openAiDailyReset) {
    openAiDailyCount = 0;
    openAiDailyReset = now + 24 * 60 * 60 * 1000;
  }
  openAiDailyCount += 1;
  return openAiDailyCount <= (Number(process.env.OPENAI_DAILY_REQUEST_BUDGET ?? 500) || 500);
}
