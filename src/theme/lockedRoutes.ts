import { LOCKED_CINEMATIC_BACKGROUND } from './types';

/** Routes that permanently use cinematic dark styling regardless of global theme. */
const LOCKED_ROUTE_SEGMENTS = new Set(['', 'index', 'welcome']);

/**
 * Splash and Welcome ignore global theme selection.
 * Matches expo-router pathnames such as `/`, `/welcome`.
 */
export function isLockedDarkRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  if (normalized === '/') {
    return true;
  }

  const segment = normalized.split('/').filter(Boolean).pop() ?? '';
  return LOCKED_ROUTE_SEGMENTS.has(segment);
}

export function getRouteBackground(pathname: string, themedBackground: string): string {
  return isLockedDarkRoute(pathname) ? LOCKED_CINEMATIC_BACKGROUND : themedBackground;
}
