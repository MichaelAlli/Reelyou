import type { SkyConnectionStatus } from '@/mySky/skyIdentity';
import { isPublicSkyNodeVisible } from '@/mySky/skyPublicVisibility';
import type { SkyNode } from '@/mySky/skyNodeTypes';
import type { MySkyStarDisplay } from '@/mySky/types';

import type { StarNavigationTarget } from './resolveStarNavigation';
import type { SkyVisibilitySettings } from './skyVisibilitySettings';

/** Visitor-safe star navigation — no compose, no private destinations. */
export function resolveVisitorStarNavigation(
  star: MySkyStarDisplay,
  ownerNodes: SkyNode[],
  connectionStatus: SkyConnectionStatus,
  ownerId: string,
  visibilitySettings?: SkyVisibilitySettings,
): StarNavigationTarget {
  const node = ownerNodes.find((entry) => entry.id === star.id);
  if (
    !node ||
    !isPublicSkyNodeVisible(node, connectionStatus, visibilitySettings)
  ) {
    return { kind: 'none', reason: 'missing-skywrite' };
  }

  if (star.type === 'skywrite') {
    return { kind: 'star-detail', nodeId: star.id };
  }

  if (star.destination === 'community' && star.destinationParam) {
    return { kind: 'star-detail', nodeId: star.id };
  }

  if (star.destination === 'public-sky' && star.destinationParam) {
    if (star.destinationParam !== ownerId) {
      return { kind: 'public-sky', param: star.destinationParam };
    }
    return { kind: 'star-detail', nodeId: star.id };
  }

  if (star.type === 'contribution' || star.type === 'connection' || star.type === 'community') {
    return { kind: 'star-detail', nodeId: star.id };
  }

  return { kind: 'star-detail', nodeId: star.id };
}
