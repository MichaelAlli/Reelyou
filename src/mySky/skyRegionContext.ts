import type { NearbySkyAnchor } from '@/mySky/buildNearbySkies';
import type { MySkyViewportSnapshot } from '@/mySky/mySkyViewportSession';
import type { SkyProximityPhase, SkyProximityState } from '@/mySky/skyProximity';
import { viewportCenterInWorld } from '@/mySky/skyProximity';

export type SkyRegionMode = 'own' | 'approaching' | 'entered' | 'returning';

export interface SkyRegionContext {
  mode: SkyRegionMode;
  /** Whose Sky region the viewport is centered in — self when own/returning. */
  activeOwnerId: string;
  nearbyAnchor: NearbySkyAnchor | null;
  proximityPhase: SkyProximityPhase;
}

const OWN_SKY_RADIUS = 0.11;

function distanceBetween(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Lightweight internal sky-region model — no technical metadata exposed in UI. */
export function computeSkyRegionContext(
  proximity: SkyProximityState,
  selfOwnerId: string,
  selfIdentityPosition: { x: number; y: number },
  snapshot: MySkyViewportSnapshot,
  worldWidth: number,
  worldHeight: number,
  previousNearbyOwnerId: string | null,
): SkyRegionContext {
  const center = viewportCenterInWorld(snapshot, worldWidth, worldHeight);
  const ownDistance = distanceBetween(center, selfIdentityPosition);

  if (proximity.phase === 'entered' && proximity.anchor) {
    return {
      mode: 'entered',
      activeOwnerId: proximity.anchor.ownerId,
      nearbyAnchor: proximity.anchor,
      proximityPhase: proximity.phase,
    };
  }

  if (
    (proximity.phase === 'entering' || proximity.phase === 'nearby') &&
    proximity.anchor
  ) {
    return {
      mode: 'approaching',
      activeOwnerId: proximity.anchor.ownerId,
      nearbyAnchor: proximity.anchor,
      proximityPhase: proximity.phase,
    };
  }

  if (
    previousNearbyOwnerId &&
    ownDistance <= OWN_SKY_RADIUS * 1.35
  ) {
    return {
      mode: 'returning',
      activeOwnerId: selfOwnerId,
      nearbyAnchor: null,
      proximityPhase: 'none',
    };
  }

  return {
    mode: 'own',
    activeOwnerId: selfOwnerId,
    nearbyAnchor: null,
    proximityPhase: 'none',
  };
}
