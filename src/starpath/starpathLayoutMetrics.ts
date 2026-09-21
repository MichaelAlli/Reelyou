/**
 * StarPath world vs viewport — reference layout (0–1 y) maps into a taller scrollable world.
 * Initial scroll position preserves the approved 393×852 composition as the first viewport.
 */

export interface StarPathLayoutMetrics {
  worldWidth: number;
  /** Total scrollable content height (px). */
  worldHeight: number;
  /** Height of the reference band where REF_* y coordinates apply. */
  contentBandHeight: number;
  paddingTop: number;
  paddingBottom: number;
  /** Scroll offset that aligns the reference band with the device viewport. */
  initialScrollY: number;
}

/** Room for future branches above the North Star band and below the current journey. */
export const STARPATH_WORLD_PADDING_TOP_RATIO = 0.14;
export const STARPATH_WORLD_PADDING_BOTTOM_RATIO = 0.38;

export function createStarPathLayoutMetrics(
  viewportWidth: number,
  viewportHeight: number,
): StarPathLayoutMetrics {
  const paddingTop = viewportHeight * STARPATH_WORLD_PADDING_TOP_RATIO;
  const paddingBottom = viewportHeight * STARPATH_WORLD_PADDING_BOTTOM_RATIO;
  const contentBandHeight = viewportHeight;
  const worldHeight = paddingTop + contentBandHeight + paddingBottom;

  return {
    worldWidth: viewportWidth,
    worldHeight,
    contentBandHeight,
    paddingTop,
    paddingBottom,
    initialScrollY: paddingTop,
  };
}

export interface LayoutPointRef {
  x: number;
  y: number;
}

/** Map normalized reference coordinates into world pixel space. */
export function refPointToWorldPx(
  point: LayoutPointRef,
  metrics: StarPathLayoutMetrics,
): { x: number; y: number } {
  return {
    x: point.x * metrics.worldWidth,
    y: metrics.paddingTop + point.y * metrics.contentBandHeight,
  };
}

/** Convert world Y to reference-band normalized y (for incremental growth APIs). */
export function worldYToRefY(worldY: number, metrics: StarPathLayoutMetrics): number {
  return (worldY - metrics.paddingTop) / metrics.contentBandHeight;
}

/** Expand scrollable world when dynamic growth extends below the reference band. */
export function applyDynamicWorldExpansion(
  metrics: StarPathLayoutMetrics,
  extraBottomPx: number,
): StarPathLayoutMetrics {
  if (extraBottomPx <= 0) return metrics;
  return {
    ...metrics,
    paddingBottom: metrics.paddingBottom + extraBottomPx,
    worldHeight: metrics.worldHeight + extraBottomPx,
  };
}
