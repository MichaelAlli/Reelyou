import { Platform, type ViewStyle } from 'react-native';

import { SPLASH_LAYOUT } from '@/constants/splashScene';

/**
 * REELYOU Nighttime Sign Up v1.0 — DESIGN LOCKED
 *
 * Status: DESIGN APPROVED | PRODUCTION READY | DESIGN LOCKED
 * Git rollback tag: "Nighttime Sign Up v1.0 Design Lock"
 *
 * Visual tokens in this file are frozen. Do not modify spacing, colors,
 * typography, shadows, or layout values without explicit design approval.
 * Functional, accessibility, responsive, and integration changes only.
 */
export const SignUpNightLayout = {
  horizontalPadding: 24,
  logoWidthMax: 300,
  topInsetRatio: 0.055,
  topInsetMin: 44,
  logoBottomGap: 10,
  segmentBottomGap: 14,
  headingBlockGap: 6,
  headingBottomGap: 10,
  fieldGap: 10,
  fieldHorizontalPadding: 16,
  fieldIconSlot: 22,
  termsTopGap: 8,
  ctaTopGap: 12,
  socialTopGap: 10,
  socialBlockGap: 8,
  footerTopGap: 12,
  scrollBottomPadding: 28,
  titleSize: 22,
  subtitleSize: 13.5,
  fieldMinHeight: 50,
  fieldRadius: 14,
  buttonMinHeight: 52,
  socialSize: 50,
  socialGap: 18,
  socialBorderWidth: 1,
  socialMarkGoogle: 20,
  socialMarkApple: 22,
  socialMarkFacebook: 22,
  fieldSurface: 'rgba(255, 255, 255, 0.13)',
  fieldFocusSurface: 'rgba(255, 255, 255, 0.15)',
  fieldBorder: 'rgba(212, 175, 55, 0.42)',
  fieldFocusBorder: 'rgba(221, 185, 69, 0.92)',
  fieldBorderWidth: 1,
  fieldPlaceholder: 'rgba(248, 249, 252, 0.68)',
  fieldInputText: '#FAFBFE',
  fieldIconColor: '#E8C547',
  fieldGlowColor: 'rgba(245, 230, 200, 0.18)',
  fieldGlowRadius: 8,
  fieldFocusGlowRadius: 10,
  goldAccent: '#D4AF37',
  goldHighlight: '#F5D76E',
  goldShadow: '#B8941F',
  goldDeep: '#A67C00',
} as const;

export function signUpNightWebViewportStyle(): ViewStyle | undefined {
  if (Platform.OS !== 'web') {
    return undefined;
  }

  return {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
  } as unknown as ViewStyle;
}

export function resolveSignUpNightLogoWidth(viewportWidth: number, viewportHeight?: number): number {
  const available = viewportWidth - SignUpNightLayout.horizontalPadding * 2;

  if (viewportHeight != null) {
    const splashLogoSize = Math.round(viewportHeight * SPLASH_LAYOUT.brandBlockHalfRatio * 2);
    return Math.min(available, splashLogoSize);
  }

  return Math.min(available, SignUpNightLayout.logoWidthMax);
}

export function resolveSignUpNightTopInset(viewportHeight: number, safeTop: number): number {
  return safeTop + Math.max(SignUpNightLayout.topInsetMin, Math.round(viewportHeight * SignUpNightLayout.topInsetRatio));
}
