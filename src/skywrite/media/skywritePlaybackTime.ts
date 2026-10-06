/** Normalize unknown values to finite milliseconds or null. */
export function finiteMs(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return value;
}

/** Largest finite duration among candidates (ignores invalid). */
export function sanitizeDurationMs(...candidates: unknown[]): number {
  let max = 0;
  for (const candidate of candidates) {
    const ms = finiteMs(candidate);
    if (ms != null && ms > max) max = ms;
  }
  return max;
}

/** Combined timeline length for video + voiceover steps. */
export function resolveCombinedTimelineMs(...candidates: unknown[]): number {
  return sanitizeDurationMs(...candidates);
}

/**
 * Clamp a seek target to [0, maxDurationMs].
 * Returns null when the request is non-finite.
 * When maxDurationMs is unknown (0), only non-negative finite targets are returned unchanged.
 */
export function clampSeekTargetMs(requestedMs: unknown, maxDurationMs: number): number | null {
  const req = finiteMs(requestedMs);
  if (req == null) return null;
  const cap = sanitizeDurationMs(maxDurationMs);
  if (cap <= 0) return Math.max(0, req);
  return Math.max(0, Math.min(req, cap));
}

/** Seconds for HTMLMediaElement.currentTime from milliseconds. */
export function msToMediaElementSeconds(positionMs: number): number | null {
  const ms = finiteMs(positionMs);
  if (ms == null) return null;
  const seconds = ms / 1000;
  if (!Number.isFinite(seconds) || seconds < 0) return null;
  return seconds;
}
