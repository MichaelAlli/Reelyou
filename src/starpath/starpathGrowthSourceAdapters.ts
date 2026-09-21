import type { StarPathGrowthSignal } from '@/starpath/starpathWorldModel';

/** Future growth inputs — interfaces only until sources ship. */
export type StarPathGrowthSourceKey =
  | 'starpath_interactions'
  | 'skywrites'
  | 'reflections'
  | 'todays_focus'
  | 'communities'
  | 'connections'
  | 'contributions'
  | 'goals_intentions'
  | 'completed_next_steps';

export interface StarPathGrowthSourceAdapter {
  sourceKey: StarPathGrowthSourceKey;
  pullGrowthSignals?: () => StarPathGrowthSignal[] | Promise<StarPathGrowthSignal[]>;
}

export const STARPATH_GROWTH_SOURCE_ADAPTERS: StarPathGrowthSourceAdapter[] = [];

export async function collectGrowthSourceSignals(): Promise<StarPathGrowthSignal[]> {
  const out: StarPathGrowthSignal[] = [];
  for (const adapter of STARPATH_GROWTH_SOURCE_ADAPTERS) {
    if (!adapter.pullGrowthSignals) continue;
    const batch = await adapter.pullGrowthSignals();
    out.push(...batch);
  }
  return out;
}
