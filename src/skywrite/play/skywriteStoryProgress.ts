import { finiteMs, sanitizeDurationMs } from '@/skywrite/media/skywritePlaybackTime';

/** Clamp to a finite 0–1 story segment fill (never NaN/Infinity). */
export function safeStoryFillRatio(positionMs: unknown, durationMs: unknown): number {
  const dur = sanitizeDurationMs(finiteMs(durationMs) ?? 0);
  if (dur <= 0) return 0;
  const pos = finiteMs(positionMs) ?? 0;
  const ratio = pos / dur;
  if (!Number.isFinite(ratio)) return 0;
  return Math.max(0, Math.min(1, ratio));
}

export function storyFillForEnded(hasEnded: boolean, fill: number): number {
  return hasEnded ? 1 : fill;
}
