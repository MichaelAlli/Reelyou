import type { MySkyViewportSnapshot } from '@/mySky/mySkyViewportSession';
import type { MySkyStarDisplay } from '@/mySky/types';
import { isPointInViewport, mySkyWorldPointToScreen } from '@/spatialFocus/spatialFocusGeometry';
import type { SpatialFocusCandidate } from '@/spatialFocus/types';

const MEANINGFUL_STAR_TYPES = new Set<MySkyStarDisplay['type']>([
  'skywrite',
  'connection',
  'community',
  'guidance',
  'contribution',
  'moment',
  'identity',
]);

export function isMySkyStarFocusEligible(star: MySkyStarDisplay): boolean {
  if (star.isIdentityStar) return true;
  return MEANINGFUL_STAR_TYPES.has(star.type);
}

export function buildMySkyStarFocusCandidates(input: {
  stars: MySkyStarDisplay[];
  identityStar?: MySkyStarDisplay | null;
  includeIdentity?: boolean;
  worldWidth: number;
  worldHeight: number;
  layoutWidth: number;
  layoutHeight: number;
  viewport: MySkyViewportSnapshot;
  originLeft?: number;
  originTop?: number;
}): SpatialFocusCandidate[] {
  const {
    stars,
    identityStar,
    includeIdentity = false,
    worldWidth,
    worldHeight,
    layoutWidth,
    layoutHeight,
    viewport,
    originLeft = 0,
    originTop = 0,
  } = input;

  const candidates: SpatialFocusCandidate[] = [];

  for (const star of stars) {
    if (!isMySkyStarFocusEligible(star)) continue;
    const { centerX, centerY } = mySkyWorldPointToScreen(
      star.x,
      star.y,
      worldWidth,
      worldHeight,
      viewport,
      originLeft,
      originTop,
    );
    if (!isPointInViewport(centerX, centerY, layoutWidth, layoutHeight)) continue;
    candidates.push({
      id: star.id,
      centerX,
      centerY,
      relevance: star.isNewlyAdded ? 2 : star.type === 'skywrite' ? 1 : 0,
    });
  }

  if (includeIdentity && identityStar) {
    const { centerX, centerY } = mySkyWorldPointToScreen(
      identityStar.x,
      identityStar.y,
      worldWidth,
      worldHeight,
      viewport,
      originLeft,
      originTop,
    );
    if (isPointInViewport(centerX, centerY, layoutWidth, layoutHeight)) {
      candidates.push({
        id: identityStar.id,
        centerX,
        centerY,
        relevance: 3,
      });
    }
  }

  return candidates;
}

/** Focused Skywrite panels use normalized layout coordinates (no pan/zoom). */
export function buildFocusedSkywriteFocusCandidates(input: {
  stars: MySkyStarDisplay[];
  identityStar?: MySkyStarDisplay | null;
  includeIdentity?: boolean;
  layoutWidth: number;
  layoutHeight: number;
}): SpatialFocusCandidate[] {
  const { stars, identityStar, includeIdentity = false, layoutWidth, layoutHeight } = input;
  const candidates: SpatialFocusCandidate[] = [];

  for (const star of stars) {
    if (!isMySkyStarFocusEligible(star)) continue;
    candidates.push({
      id: star.id,
      centerX: star.x * layoutWidth,
      centerY: star.y * layoutHeight,
      relevance: star.isNewlyAdded ? 2 : star.type === 'skywrite' ? 1 : 0,
    });
  }

  if (includeIdentity && identityStar) {
    candidates.push({
      id: identityStar.id,
      centerX: identityStar.x * layoutWidth,
      centerY: identityStar.y * layoutHeight,
      relevance: 3,
    });
  }

  return candidates;
}
