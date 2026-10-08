/** iPhone 14-class through Pro Max portrait heights (excludes typical tablets/desktop). */
export const AUTH_COMPACT_VIEWPORT_MAX_HEIGHT = 933;

/** Fallback width when `useWindowDimensions` has not measured yet (mobile web first paint). */
export const AUTH_VIEWPORT_WIDTH_FALLBACK = 390;

export function isAuthCompactViewport(viewportHeight: number): boolean {
  return viewportHeight > 0 && viewportHeight < AUTH_COMPACT_VIEWPORT_MAX_HEIGHT;
}

export function resolveAuthAvailableContentWidth(
  viewportWidth: number,
  horizontalPadding: number,
): number {
  const widthBase = viewportWidth > 0 ? viewportWidth : AUTH_VIEWPORT_WIDTH_FALLBACK;
  return Math.max(0, widthBase - horizontalPadding * 2);
}

export function resolveAuthTopInset(
  viewportHeight: number,
  safeTop: number,
  options: { ratio: number; minInset: number; compactRatio?: number; compactMin?: number },
): number {
  const compact = isAuthCompactViewport(viewportHeight);
  const ratio = compact ? (options.compactRatio ?? options.ratio * 0.55) : options.ratio;
  const minInset = compact ? (options.compactMin ?? Math.max(20, options.minInset - 20)) : options.minInset;
  const heightBase = viewportHeight > 0 ? viewportHeight : 844;
  return safeTop + Math.max(minInset, Math.round(heightBase * ratio));
}

export function authScrollBottomPadding(bottomInset: number, extra: number, webChrome = 0): number {
  return bottomInset + extra + webChrome;
}
