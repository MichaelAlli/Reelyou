import { Platform, type ViewStyle } from 'react-native';

/**
 * REELYOU Daytime Sign Up v1.0 — DESIGN LOCKED
 *
 * Status: DESIGN APPROVED | PRODUCTION READY | DESIGN LOCKED
 * Git rollback tag: "Daytime Sign Up v1.0 Design Lock"
 *
 * Visual tokens in this file are frozen. Do not modify spacing, colors,
 * typography, shadows, or layout values without explicit design approval.
 * Functional, accessibility, responsive, and integration changes only.
 */
export const SignUpDayLayout = {
  horizontalPadding: 24,
  logoWidthMax: 347,
  topInsetRatio: 0.062,
  topInsetMin: 48,
  logoBottomGap: 8,
  segmentBottomGap: 12,
  headingBlockGap: 6,
  headingBottomGap: 8,
  fieldGap: 5,
  fieldHorizontalPadding: 15,
  fieldIconSlot: 22,
  termsTopGap: 6,
  ctaTopGap: 10,
  socialTopGap: 8,
  socialBlockGap: 6,
  footerTopGap: 10,
  scrollBottomPadding: 24,
  titleSize: 21,
  subtitleSize: 13.5,
  fieldMinHeight: 50,
  fieldRadius: 999,
  buttonMinHeight: 50,
  socialSize: 50,
  socialGap: 18,
  socialBorderWidth: 1,
  socialMarkGoogle: 20,
  socialMarkApple: 22,
  socialMarkFacebook: 22,
  navyBorder: 'rgba(8, 16, 42, 0.62)',
  navyText: '#061028',
  subtitleColor: 'rgba(6, 16, 40, 0.72)',
  legalTextColor: 'rgba(6, 16, 40, 0.86)',
  dividerLabelColor: 'rgba(6, 16, 40, 0.74)',
  placeholderColor: 'rgba(6, 16, 40, 0.55)',
  fieldSurface: '#FFFFFF',
  fieldFocusSurface: '#FFFFFF',
  goldAccent: '#DDB945',
  goldHighlight: '#F0D078',
  goldShadow: '#B8912A',
  goldDeep: '#A67C00',
} as const;

export function signUpDayWebViewportStyle(): ViewStyle | undefined {
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

export function resolveSignUpDayLogoWidth(viewportWidth: number): number {
  const available = viewportWidth - SignUpDayLayout.horizontalPadding * 2;
  return Math.min(available, SignUpDayLayout.logoWidthMax);
}

export function resolveSignUpDayTopInset(viewportHeight: number, safeTop: number): number {
  return safeTop + Math.max(SignUpDayLayout.topInsetMin, Math.round(viewportHeight * SignUpDayLayout.topInsetRatio));
}

/** Subtle localized contrast for text over bright sky — readability only, not a redesign. */
export function signUpDayTextReadabilityShadow(): object {
  return (
    Platform.select({
      ios: {
        textShadowColor: 'rgba(255, 255, 255, 0.9)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
      },
      android: {
        textShadowColor: 'rgba(255, 255, 255, 0.9)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
      web: {
        textShadow: '0 1px 4px rgba(255, 255, 255, 0.9)',
      } as object,
      default: {},
    }) ?? {}
  );
}

/** Localized contrast for logo tagline over bright sky — alpha-aware, no background darkening. */
export function signUpDayLogoReadabilityStyle(): object {
  return (
    Platform.select({
      ios: {
        shadowColor: 'rgba(255, 255, 255, 0.94)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 5,
      },
      android: {},
      web: {
        filter: 'drop-shadow(0 1px 3px rgba(255, 255, 255, 0.92))',
      } as object,
      default: {},
    }) ?? {}
  );
}

/** Apple-quality font rendering — craftsmanship only, no layout change. */
export function signUpDayFontRender(): object {
  return (
    Platform.OS === 'web'
      ? ({
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
        } as object)
      : {}
  );
}
