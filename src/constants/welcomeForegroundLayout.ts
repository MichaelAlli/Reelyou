import { isAuthCompactViewport } from '@/constants/authViewportLayoutCore';

/** Reserved vertical space for primary + secondary CTA and bottom safe padding. */
export function resolveWelcomeActionsReserve(height: number): number {
  return height < 700 ? 172 : 192;
}

/**
 * Slight downward shift after flex-centering so the lockup sits in the constellation ring
 * (optical center, not geometric center of the hero band).
 */
export function resolveWelcomeHeroOpticalOffset(height: number): number {
  if (height < 700) {
    return Math.round(height * 0.028);
  }
  if (isAuthCompactViewport(height)) {
    return Math.round(height * 0.032);
  }
  return Math.round(height * 0.036);
}

/** Logo width — reference proportions; smaller than prior 0.92 fill. */
export function resolveWelcomeLogoWidth(viewportWidth: number, viewportHeight: number): number {
  const widthBase = viewportWidth > 0 ? viewportWidth : 390;
  const ratio = viewportHeight < 700 ? 0.74 : viewportHeight < 933 ? 0.78 : 0.82;
  const max = viewportHeight < 700 ? 278 : viewportHeight < 933 ? 302 : 318;
  return Math.min(Math.round(widthBase * ratio), max);
}

/** Hero + actions fit without scroll on typical phone heights. */
export function welcomeForegroundFitsViewport(height: number): boolean {
  const heroEstimate = height < 700 ? 290 : 320;
  return height >= heroEstimate + resolveWelcomeActionsReserve(height) + 48;
}

export function welcomeNeedsScrollLayout(height: number): boolean {
  return !welcomeForegroundFitsViewport(height);
}
