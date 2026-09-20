import { useCallback, useMemo, useState } from 'react';

import { applyGrowthSignals } from '@/starpath/starpathWorldGrowth';
import {
  createInitialStarPathWorldGraph,
  type StarPathGrowthSignal,
  type StarPathWorldGraph,
} from '@/starpath/starpathWorldModel';

export function useStarPathWorldGraph(initialSignals: StarPathGrowthSignal[] = []) {
  const [graph, setGraph] = useState<StarPathWorldGraph>(() => {
    const base = createInitialStarPathWorldGraph();
    return initialSignals.length ? applyGrowthSignals(base, initialSignals) : base;
  });

  const ingestSignals = useCallback((signals: StarPathGrowthSignal[]) => {
    if (!signals.length) return;
    setGraph((prev) => applyGrowthSignals(prev, signals));
  }, []);

  const resetWorld = useCallback(() => {
    setGraph(createInitialStarPathWorldGraph());
  }, []);

  return useMemo(
    () => ({
      graph,
      ingestSignals,
      resetWorld,
    }),
    [graph, ingestSignals, resetWorld],
  );
}
