import { useCallback, useMemo, useState } from 'react';

import {
  resolveSpatialFocusReference,
  selectNextSpatialFocusCandidate,
} from '@/spatialFocus/selectNextSpatialFocusCandidate';
import { logSpatialFocusTarget } from '@/spatialFocus/spatialFocusDevLog';
import type { SpatialFocusCandidate, SpatialFocusLayout } from '@/spatialFocus/types';

export function useSpatialFocusNavigator(
  candidates: SpatialFocusCandidate[],
  layout: SpatialFocusLayout,
) {
  const [selectedSpatialObjectId, setSelectedSpatialObjectId] = useState<string | null>(null);
  const [noCandidatePulse, setNoCandidatePulse] = useState(0);

  const selectedCandidate = useMemo(
    () => candidates.find((entry) => entry.id === selectedSpatialObjectId) ?? null,
    [candidates, selectedSpatialObjectId],
  );

  const reference = useMemo(
    () =>
      resolveSpatialFocusReference(
        candidates,
        selectedSpatialObjectId,
        layout.width,
        layout.height,
      ),
    [candidates, layout.height, layout.width, selectedSpatialObjectId],
  );

  const step = useCallback(
    (direction: 'left' | 'right') => {
      const result = selectNextSpatialFocusCandidate(
        direction,
        candidates,
        reference,
        selectedSpatialObjectId,
      );
      if (result.nextId) {
        setSelectedSpatialObjectId(result.nextId);
        logSpatialFocusTarget(result.nextId);
        return;
      }
      logSpatialFocusTarget(null);
      setNoCandidatePulse((tick) => tick + 1);
    },
    [candidates, reference, selectedSpatialObjectId],
  );

  const navigateLeft = useCallback(() => step('left'), [step]);
  const navigateRight = useCallback(() => step('right'), [step]);

  const clearFocus = useCallback(() => {
    setSelectedSpatialObjectId(null);
  }, []);

  return {
    selectedSpatialObjectId,
    selectedCandidate,
    navigateLeft,
    navigateRight,
    clearFocus,
    noCandidatePulse,
    reference,
  };
}
