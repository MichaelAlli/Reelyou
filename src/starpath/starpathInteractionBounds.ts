import type { StarPathInteractionSignal } from '@/starpath/starpathInteractionTypes';

/** Keep explicit journey history bounded while preserving latest choices per node. */
export const STARPATH_MAX_INTERACTION_SIGNALS = 480;

export function boundInteractionSignals(signals: StarPathInteractionSignal[]): StarPathInteractionSignal[] {
  if (signals.length <= STARPATH_MAX_INTERACTION_SIGNALS) return signals;
  const sorted = [...signals].sort((a, b) => b.timestamp - a.timestamp);
  const explicit = sorted.filter((s) =>
    ['interested', 'saved', 'selected', 'dismissed'].includes(s.interactionType),
  );
  const rest = sorted.filter((s) => !explicit.includes(s));
  const keepExplicit = explicit.slice(0, Math.floor(STARPATH_MAX_INTERACTION_SIGNALS * 0.55));
  const keepRest = rest.slice(0, STARPATH_MAX_INTERACTION_SIGNALS - keepExplicit.length);
  return [...keepExplicit, ...keepRest].sort((a, b) => a.timestamp - b.timestamp);
}
