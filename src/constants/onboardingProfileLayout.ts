import { Platform, type ImageStyle, type ViewStyle } from 'react-native';

/**
 * REELYOU Onboarding Screen 1 v1.0 — DESIGN LOCKED
 *
 * Status: DESIGN APPROVED | DESIGN LOCKED | READY FOR ONBOARDING FLOW
 * Git rollback tag: "Onboarding Screen 1 v1.0 Design Lock"
 *
 * Layout tokens are frozen. Do not modify spacing, colors, typography, or
 * composition values without explicit design approval.
 */
export const OnboardingProfileLayout = {
  horizontalPadding: 22,
  logoWidthMax: 300,
  logoAspect: 1254 / 1254,
  topInsetMin: 48,
  logoBottomGap: 8,
  titleSize: 26,
  subtitleSize: 14,
  questionSize: 22,
  hintSize: 12.5,
  headingGap: 6,
  sectionGap: 14,
  chipGap: 10,
  chipMinHeight: 44,
  chipRadius: 999,
  chipBorderWidth: 1,
  chipHorizontalPadding: 10,
  chipIconSize: 16,
  indicatorSize: 18,
  ctaTopGap: 18,
  skipTopGap: 14,
  scrollBottomPadding: 32,
  goldAccent: '#D4AF37',
  goldHighlight: '#F5D76E',
  goldShadow: '#B8941F',
  chipBorder: 'rgba(212, 175, 55, 0.72)',
  chipSurface: 'rgba(5, 8, 24, 0.42)',
  chipSelectedSurface: 'rgba(212, 175, 55, 0.14)',
  titleColor: '#F8F9FC',
  subtitleColor: 'rgba(248, 249, 252, 0.78)',
  hintColor: 'rgba(248, 249, 252, 0.62)',
  infoLinkColor: '#D4AF37',
  errorColor: '#F87171',
} as const;

export function onboardingWebViewportStyle(): ViewStyle {
  if (Platform.OS !== 'web') {
    return {};
  }

  return {
    width: '100%',
    minHeight: '100%',
  };
}

export function onboardingBackgroundImageStyle(): ImageStyle {
  if (Platform.OS === 'web') {
    return {
      height: '100%',
      width: '100%',
      objectFit: 'cover',
      objectPosition: 'center center',
    } as ImageStyle;
  }

  return {
    height: '100%',
    width: '100%',
  };
}

export function onboardingTitleShadow() {
  return Platform.select({
    ios: {
      textShadowColor: 'rgba(255, 255, 255, 0.35)',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 6,
    },
    android: {
      textShadowColor: 'rgba(255, 255, 255, 0.28)',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 4,
    },
    web: {
      textShadow: '0 0 8px rgba(255, 255, 255, 0.28)',
    } as object,
    default: {},
  });
}
