import { memo } from 'react';

import { MySkyRenderer } from '@/components/my-sky/MySkyRenderer';
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
    <MySkyRenderer
      view={view}
      mode="arrival"
      highlightStarId={highlightStarId}
      animateArrival={animateArrival}
      revealLinks={false}
    />
  );
}

export const MySkyCanvas = memo(MySkyCanvasComponent);
