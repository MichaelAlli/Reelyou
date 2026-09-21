import {
  SPATIAL_FOCUS_DIRECTION_EPSILON_PX,
  type SpatialFocusCandidate,
  type SpatialFocusDirection,
  type SpatialFocusReferencePoint,
} from '@/spatialFocus/types';

function directionalDistance(
  candidate: SpatialFocusCandidate,
  reference: SpatialFocusReferencePoint,
): number {
  const dx = candidate.centerX - reference.x;
  const dy = candidate.centerY - reference.y;
  return Math.abs(dx) * 1.35 + Math.abs(dy) * 0.65;
}

export interface SpatialFocusSelectionResult {
  nextId: string | null;
  noCandidate: boolean;
}

/** Pick the nearest eligible object in the requested horizontal direction (no wrap). */
export function selectNextSpatialFocusCandidate(
  direction: SpatialFocusDirection,
  candidates: SpatialFocusCandidate[],
  reference: SpatialFocusReferencePoint,
  currentSelectedId: string | null,
): SpatialFocusSelectionResult {
  if (candidates.length === 0) {
    return { nextId: null, noCandidate: true };
  }

  const eps = SPATIAL_FOCUS_DIRECTION_EPSILON_PX;
  const filtered = candidates.filter((candidate) => {
    if (candidate.id === currentSelectedId) return false;
    if (direction === 'right') {
      return candidate.centerX > reference.x + eps;
    }
    return candidate.centerX < reference.x - eps;
  });

  if (filtered.length === 0) {
    return { nextId: null, noCandidate: true };
  }

  filtered.sort((a, b) => {
    const distA = directionalDistance(a, reference);
    const distB = directionalDistance(b, reference);
    if (distA !== distB) return distA - distB;
    const relA = a.relevance ?? 0;
    const relB = b.relevance ?? 0;
    if (relA !== relB) return relB - relA;
    return a.id.localeCompare(b.id);
  });

  return { nextId: filtered[0]?.id ?? null, noCandidate: false };
}

export function resolveSpatialFocusReference(
  candidates: SpatialFocusCandidate[],
  selectedId: string | null,
  layoutWidth: number,
  layoutHeight: number,
): SpatialFocusReferencePoint {
  if (selectedId) {
    const selected = candidates.find((entry) => entry.id === selectedId);
    if (selected) {
      return { x: selected.centerX, y: selected.centerY };
    }
  }
  return { x: layoutWidth / 2, y: layoutHeight / 2 };
}
