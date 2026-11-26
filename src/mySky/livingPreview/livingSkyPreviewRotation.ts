/** Visible time for one circular preview before the fade. */
export const LIVING_SKY_PREVIEW_INTERVAL_MS = 4000;

export const LIVING_SKY_PREVIEW_FADE_MS = 320;

export function shouldCycleLivingSkyPreviews(
  count: number,
  paused: boolean,
  reducedMotion: boolean,
): boolean {
  return count > 1 && !paused && !reducedMotion;
}

export function nextLivingSkyPreviewIndex(current: number, count: number): number {
  if (count <= 1) return 0;
  const safe = Number.isFinite(current) ? current : 0;
  return (safe + 1) % count;
}

/**
 * One interval for the active snapshot. The returned function always clears it.
 */
export function bindLivingSkyPreviewRotation(input: {
  count: number;
  paused: boolean;
  reducedMotion: boolean;
  intervalMs?: number;
  onAdvance: () => void;
  setIntervalFn?: (fn: () => void, ms: number) => number;
  clearIntervalFn?: (id: number) => void;
}): () => void {
  if (!shouldCycleLivingSkyPreviews(input.count, input.paused, input.reducedMotion)) {
    return () => {};
  }
  const setIntervalFn = input.setIntervalFn ?? setInterval;
  const clearIntervalFn = input.clearIntervalFn ?? clearInterval;
  const id = setIntervalFn(input.onAdvance, input.intervalMs ?? LIVING_SKY_PREVIEW_INTERVAL_MS);
  let stopped = false;
  return () => {
    if (stopped) return;
    stopped = true;
    clearIntervalFn(id);
  };
}
