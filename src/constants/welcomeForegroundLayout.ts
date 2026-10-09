import { isAuthCompactViewport } from '@/constants/authViewportLayoutCore';

export interface WelcomeForegroundLayoutInput {
  height: number;
  topInset: number;
}

/** Top padding for Welcome hero — logo sits inside the constellation ring (reference mobile comp). */
export function resolveWelcomeForegroundTop(input: WelcomeForegroundLayoutInput): number {
  const { height, topInset } = input;
  const mobileCompact = isAuthCompactViewport(height);

  if (height < 700) {
    return topInset + Math.round(height * 0.12);
  }
  if (mobileCompact) {
    return topInset + Math.round(height * 0.125);
  }
  if (height < 900) {
    return topInset + Math.round(height * 0.13);
  }
  return topInset + Math.round(height * 0.15);
}

/** Logo width — reference proportions; smaller than prior 0.92 fill. */
export function resolveWelcomeLogoWidth(viewportWidth: number, viewportHeight: number): number {
  const widthBase = viewportWidth > 0 ? viewportWidth : 390;
  const ratio = viewportHeight < 700 ? 0.74 : viewportHeight < 933 ? 0.78 : 0.82;
  const max = viewportHeight < 700 ? 278 : viewportHeight < 933 ? 302 : 318;
  return Math.min(Math.round(widthBase * ratio), max);
}

/** Ensures CTA + Sign In fit above mobile browser chrome (reference widths). */
export function welcomeForegroundFitsViewport(height: number): boolean {
  const top = resolveWelcomeForegroundTop({ height, topInset: 0 });
  const reservedBottom = height < 700 ? 188 : 204;
  const reservedHero = height < 700 ? 300 : 330;
  return top + reservedHero + reservedBottom <= height;
}

export function welcomeNeedsScrollLayout(height: number): boolean {
  return !welcomeForegroundFitsViewport(height);
}
