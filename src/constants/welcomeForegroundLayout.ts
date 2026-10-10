import { isAuthCompactViewport } from '@/constants/authViewportLayoutCore';

function isWebRuntime(): boolean {
  return typeof document !== 'undefined';
}

/** Estimated mobile browser chrome (Safari toolbars) subtracted on web. */
export function resolveMobileBrowserChromeReserve(height: number): number {
  if (!isWebRuntime()) {
    return 0;
  }
  if (height < 700) {
    return 96;
  }
  if (isAuthCompactViewport(height)) {
    return 88;
  }
  return 64;
}

export function resolveWelcomeEffectiveViewportHeight(layoutHeight: number): number {
  const base = layoutHeight > 0 ? layoutHeight : 844;
  return Math.max(320, base - resolveMobileBrowserChromeReserve(base));
}

/** Reserved vertical space for primary + secondary CTA and bottom safe padding. */
export function resolveWelcomeActionsReserve(height: number): number {
  const effective = resolveWelcomeEffectiveViewportHeight(height);
  return effective < 700 ? 176 : 196;
}

/**
 * Proportional scale for approved Welcome composition when vertical space is tight.
 * Preserves relationships; only shrinks enough to keep CTAs on-screen.
 */
export function resolveWelcomeContentScale(layoutHeight: number): number {
  const effective = resolveWelcomeEffectiveViewportHeight(layoutHeight);
  const heroEstimate = effective < 700 ? 280 : 310;
  const required = heroEstimate + resolveWelcomeActionsReserve(layoutHeight) + 40;
  if (effective >= required + 24) {
    return 1;
  }
  const ratio = (effective - resolveWelcomeActionsReserve(layoutHeight) - 40) / heroEstimate;
  return Math.min(1, Math.max(0.88, ratio));
}

/**
 * Slight downward shift after flex-centering so the lockup sits in the constellation ring.
 */
export function resolveWelcomeHeroOpticalOffset(layoutHeight: number): number {
  const effective = resolveWelcomeEffectiveViewportHeight(layoutHeight);
  const scale = resolveWelcomeContentScale(layoutHeight);
  if (effective < 700) {
    return Math.round(effective * 0.024 * scale);
  }
  if (isAuthCompactViewport(layoutHeight)) {
    return Math.round(effective * 0.028 * scale);
  }
  return Math.round(effective * 0.032 * scale);
}

/** Logo width — reference proportions with optional proportional scale. */
export function resolveWelcomeLogoWidth(
  viewportWidth: number,
  layoutHeight: number,
): number {
  const widthBase = viewportWidth > 0 ? viewportWidth : 390;
  const scale = resolveWelcomeContentScale(layoutHeight);
  const ratio = layoutHeight < 700 ? 0.74 : layoutHeight < 933 ? 0.78 : 0.82;
  const max = layoutHeight < 700 ? 278 : layoutHeight < 933 ? 302 : 318;
  return Math.min(Math.round(widthBase * ratio * scale), Math.round(max * scale));
}

export function welcomeForegroundFitsViewport(layoutHeight: number): boolean {
  const effective = resolveWelcomeEffectiveViewportHeight(layoutHeight);
  const heroEstimate = Math.round(310 * resolveWelcomeContentScale(layoutHeight));
  return effective >= heroEstimate + resolveWelcomeActionsReserve(layoutHeight) + 32;
}

export function welcomeNeedsScrollLayout(layoutHeight: number): boolean {
  if (isAuthCompactViewport(layoutHeight)) {
    return true;
  }
  return !welcomeForegroundFitsViewport(layoutHeight);
}
