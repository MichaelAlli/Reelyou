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

/** One preview is on screen. The next cannot start until this one has fully faded. */
export type LivingSkyCyclePhase = 'visible' | 'fading-out' | 'hidden' | 'fading-in';

export interface LivingSkyCycleState {
  index: number;
  phase: LivingSkyCyclePhase;
}

export function createLivingSkyCycleState(): LivingSkyCycleState {
  return { index: 0, phase: 'visible' };
}

export function beginLivingSkyFadeOut(state: LivingSkyCycleState): LivingSkyCycleState {
  if (state.phase !== 'visible') return state;
  return { ...state, phase: 'fading-out' };
}

/** The current preview is gone. Advance only after that, before any fade-in. */
export function completeLivingSkyFadeOut(
  state: LivingSkyCycleState,
  count: number,
): LivingSkyCycleState {
  if (state.phase !== 'fading-out') return state;
  return { index: nextLivingSkyPreviewIndex(state.index, count), phase: 'hidden' };
}

/** Fade-in is allowed only from the fully hidden phase. */
export function beginLivingSkyFadeIn(state: LivingSkyCycleState): LivingSkyCycleState {
  if (state.phase !== 'hidden') return state;
  return { ...state, phase: 'fading-in' };
}

export function completeLivingSkyFadeIn(state: LivingSkyCycleState): LivingSkyCycleState {
  if (state.phase !== 'fading-in') return state;
  return { ...state, phase: 'visible' };
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
