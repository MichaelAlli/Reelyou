import { Platform } from 'react-native';

import {
  ReelyouMotion,
  ReelyouMotionValues,
  ReelyouStarTwinkles,
} from '@/constants/animation';
import { CosmicTheme, Fonts, Radius, Spacing } from '@/constants/theme';

/** Colors sampled from the approved REELYOU splash mockup. */
export const SplashColors = {
  ...CosmicTheme,
  navyDeep: '#0A0E1A',
  navyMid: '#0D1224',
  navySoft: '#161B33',
  goldBright: '#E8C872',
  goldMetallic: '#D4AF37',
  goldChampagne: '#C9A962',
  goldMuted: '#A8894A',
  goldGlow: 'rgba(212, 175, 55, 0.38)',
  goldSpinner: '#D4AF37',
  goldSpinnerTrack: 'rgba(212, 175, 55, 0.22)',
  goldSpinnerHead: '#FFF4C2',
  sunriseGlow: 'rgba(255, 140, 50, 0.24)',
  sunriseCore: 'rgba(255, 220, 150, 0.5)',
  loadingText: '#C9A962',
} as const;

export const SplashGradients = {
  goldGlow: SplashColors.goldGlow,
  vignette: 'rgba(3, 5, 16, 0.35)',
} as const;

export const SplashSpacing = {
  ...Spacing,
  loadingBottom: Platform.select({ web: 48, default: 64 }) ?? 64,
  logoMaxWidth: 340,
  logoGlowSize: 120,
} as const;

export const SplashTypography = {
  wordmark: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    letterSpacing: 5.2,
    textTransform: 'uppercase' as const,
  },
  tagline: {
    fontFamily: Fonts.sans,
    fontSize: 7.5,
    fontWeight: '500' as const,
    letterSpacing: 3,
    textTransform: 'uppercase' as const,
    color: SplashColors.goldChampagne,
  },
  loadingLabel: {
    fontFamily: Fonts.sans,
    fontSize: 9.5,
    fontWeight: '400' as const,
    letterSpacing: 3.6,
    textTransform: 'uppercase' as const,
    color: SplashColors.loadingText,
  },
} as const;

/** Splash-specific aliases mapped to the global motion system. */
export const SplashAnimation = {
  logoFadeIn: ReelyouMotion.fadeIn,
  logoFadeDelay: ReelyouMotion.logoFadeDelay,
  glowPulse: ReelyouMotion.glowPulse,
  backgroundPan: ReelyouMotion.backgroundZoom,
  backgroundZoomMin: ReelyouMotionValues.backgroundZoomMin,
  backgroundZoomMax: ReelyouMotionValues.backgroundZoomMax,
  backgroundPanX: ReelyouMotionValues.backgroundPanX,
  backgroundPanY: ReelyouMotionValues.backgroundPanY,
  loadingFadeIn: ReelyouMotion.fadeIn,
  loadingFadeDelay: ReelyouMotion.loadingFadeDelay,
  loadingTextBreath: ReelyouMotion.loadingTextBreath,
  spinnerRotate: ReelyouMotion.spinnerRotate,
  screenTransition: ReelyouMotion.screenTransition,
  autoTransition: ReelyouMotion.splashAutoTransition,
  sunriseBreath: ReelyouMotion.sunriseBreath,
} as const;

export const SplashStars = ReelyouStarTwinkles;
export const SplashRadius = Radius;
