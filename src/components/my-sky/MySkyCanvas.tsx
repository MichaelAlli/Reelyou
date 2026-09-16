import { memo } from 'react';

import { MySkyArrivalCanvas } from '@/components/my-sky/MySkyArrivalCanvas';
import type { MySkyView } from '@/mySky/types';

interface MySkyCanvasProps {
  view: Pick<
    MySkyView,
    'stars' | 'vitality' | 'relationships' | 'nodes' | 'viewState'
  >;
  highlightStarId?: string | null;
  animateArrival?: boolean;
}

/** Immersive sky canvas — renders projected stars from centralized My Sky model. */
function MySkyCanvasComponent({
  view,
  highlightStarId = null,
  animateArrival = false,
}: MySkyCanvasProps) {
  return (
    <MySkyArrivalCanvas
      stars={view.stars}
      highlightStarId={highlightStarId}
      vitality={view.vitality}
      patternRelationships={view.relationships}
      patternNodes={view.nodes}
      visibleLayers={view.viewState.visibleLayers}
      animateArrival={animateArrival}
    />
  );
}

export const MySkyCanvas = memo(MySkyCanvasComponent);
