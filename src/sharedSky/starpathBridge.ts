import type { SkyNode } from '@/mySky/skyNodeTypes';

import type { StarpathSkyReference } from '@/sharedSky/sharedSkyTypes';

/** Future backend handoff — stable references only, no duplicated Sky graph in StarPath. */
export function resolveStarpathReferencesFromSky(nodes: SkyNode[]): StarpathSkyReference[] {
  return nodes
    .filter((node) => node.destination === 'starpath' || node.type === 'guidance')
    .map((node) => ({
      skyNodeId: node.id,
      opportunityId: node.sourceId,
      reasonCode: node.provenance.reason,
    }));
}
