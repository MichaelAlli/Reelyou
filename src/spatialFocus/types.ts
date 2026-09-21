export type SpatialFocusDirection = 'left' | 'right';

export type SpatialFocusHintSurface = 'skywrite' | 'mysky' | 'starpath';

/** Screen-space focus target — uses existing canonical object ids only. */
export interface SpatialFocusCandidate {
  id: string;
  centerX: number;
  centerY: number;
  /** Higher wins directional ties (pinned/active). */
  relevance?: number;
}

export interface SpatialFocusLayout {
  width: number;
  height: number;
}

export interface SpatialFocusReferencePoint {
  x: number;
  y: number;
}

export const SPATIAL_FOCUS_EDGE_WIDTH_RATIO = 0.12;

export const SPATIAL_FOCUS_DIRECTION_EPSILON_PX = 4;
