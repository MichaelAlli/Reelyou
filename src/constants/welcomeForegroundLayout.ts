import { isAuthCompactViewport } from '@/constants/authViewportLayoutCore';

export interface WelcomeForegroundLayoutInput {
  height: number;
  topInset: number;
}

/** Top padding for Welcome hero block — sits inside the constellation ring, not on the upper arc. */
export function resolveWelcomeForegroundTop(input: WelcomeForegroundLayoutInput): number {
  const { height, topInset } = input;
  const mobileCompact = isAuthCompactViewport(height);

  if (mobileCompact) {
    return topInset + Math.round(height * 0.08);
  }
  if (height < 700) {
    return topInset + Math.round(height * 0.11);
  }
  if (height < 900) {
    return topInset + Math.round(height * 0.14);
  }
  return topInset + Math.round(height * 0.16);
}

/** Ensures CTA + Sign In fit above mobile browser chrome (reference widths). */
export function welcomeForegroundFitsViewport(height: number): boolean {
  const top = resolveWelcomeForegroundTop({ height, topInset: 0 });
  const reservedBottom = height < 700 ? 200 : 220;
  const reservedHero = height < 700 ? 340 : 380;
  return top + reservedHero + reservedBottom <= height;
}
