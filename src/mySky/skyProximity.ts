import type { MySkyViewportSnapshot } from '@/mySky/mySkyViewportSession';
import type { NearbySkyAnchor } from '@/mySky/buildNearbySkies';

export type SkyProximityPhase = 'none' | 'nearby' | 'entering';

export interface SkyProximityState {
  anchor: NearbySkyAnchor | null;
  phase: SkyProximityPhase;
  distance: number;
}

const NEARBY_THRESHOLD = 0.13;
const ENTERING_THRESHOLD = 0.065;

/** Viewport center in normalized world coordinates (0–1). */
export function viewportCenterInWorld(
  snapshot: MySkyViewportSnapshot,
  worldWidth: number,
  worldHeight: number,
): { x: number; y: number } {
  if (worldWidth <= 0 || worldHeight <= 0) {
    return { x: 0.5, y: 0.5 };
  }

  return {
    x: 0.5 - snapshot.offsetX / (worldWidth * snapshot.scale),
    y: 0.5 - snapshot.offsetY / (worldHeight * snapshot.scale),
  };
}

export function computeSkyProximity(
  snapshot: MySkyViewportSnapshot,
  worldWidth: number,
  worldHeight: number,
  anchors: NearbySkyAnchor[],
): SkyProximityState {
  if (anchors.length === 0 || worldWidth <= 0 || worldHeight <= 0) {
    return { anchor: null, phase: 'none', distance: 1 };
  }

  const center = viewportCenterInWorld(snapshot, worldWidth, worldHeight);

  let closest: NearbySkyAnchor | null = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const anchor of anchors) {
    const dx = center.x - anchor.x;
    const dy = center.y - anchor.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < closestDistance) {
      closestDistance = distance;
      closest = anchor;
    }
  }

  if (!closest || closestDistance > NEARBY_THRESHOLD) {
    return { anchor: null, phase: 'none', distance: closestDistance };
  }

  return {
    anchor: closest,
    phase: closestDistance <= ENTERING_THRESHOLD ? 'entering' : 'nearby',
    distance: closestDistance,
  };
}

/** Offset that centers a normalized world point in the viewport. */
export function viewportSnapshotForWorldPoint(
  x: number,
  y: number,
  worldWidth: number,
  worldHeight: number,
  scale = 1.15,
): MySkyViewportSnapshot {
  return {
    offsetX: (0.5 - x) * worldWidth * scale,
    offsetY: (0.5 - y) * worldHeight * scale,
    scale,
  };
}
