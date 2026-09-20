import type { StarPathInteractionSignal } from '@/starpath/starpathInteractionTypes';

/**
 * Future structured signal sources (Skywrites, reflections, Today’s Focus, etc.).
 * Adapters only — no invented data until each source is implemented.
 */
export type StarPathFutureSignalSourceKey =
  | 'skywrites'
  | 'reflections'
  | 'todays_focus'
  | 'communities'
  | 'connections'
  | 'goals_intentions'
  | 'contribution_impact'
  | 'completed_next_steps';

export interface StarPathExternalSignalAdapter {
  sourceKey: StarPathFutureSignalSourceKey;
  /** When wired, returns normalized interaction-shaped signals for the sifting engine. */
  pullSignals?: () => StarPathInteractionSignal[] | Promise<StarPathInteractionSignal[]>;
}

/** Registered adapters (empty until future tickets implement them). */
export const STARPATH_EXTERNAL_SIGNAL_ADAPTERS: StarPathExternalSignalAdapter[] = [];

export function normalizeInteractionSignals(
  primary: StarPathInteractionSignal[],
  external: StarPathInteractionSignal[] = [],
): StarPathInteractionSignal[] {
  const merged = [...primary, ...external];
  const byId = new Map<string, StarPathInteractionSignal>();
  for (const s of merged) {
    byId.set(s.id, s);
  }
  return [...byId.values()].sort((a, b) => a.timestamp - b.timestamp);
}

export async function collectExternalSignals(): Promise<StarPathInteractionSignal[]> {
  const out: StarPathInteractionSignal[] = [];
  for (const adapter of STARPATH_EXTERNAL_SIGNAL_ADAPTERS) {
    if (!adapter.pullSignals) continue;
    const batch = await adapter.pullSignals();
    out.push(...batch);
  }
  return out;
}
