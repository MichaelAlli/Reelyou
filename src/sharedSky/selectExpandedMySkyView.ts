import type { MySkyView } from '@/mySky/types';

import type { SharedSkyState } from '@/sharedSky/sharedSkyTypes';

/** Expansive My Sky camera — same graph, full projection (no duplicate data). */
export function selectExpandedMySkyView(shared: SharedSkyState): MySkyView {
  return shared.expandedView;
}
