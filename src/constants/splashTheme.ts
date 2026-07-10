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
  navyDeep: '#101848',
  navyMid: '#101840',
  navySoft: '#18204A',
  goldBright: '#E8C872',
  goldMetallic: '#D4AF37',
  goldChampagne: '#C9A962',
  goldMuted: '#A8894A',
  goldGlow: 'rgba(232, 200, 114, 0.4)',
  goldBloom: 'rgba(255, 210, 120, 0.26)',
  goldSpinner: '#D4AF37',
  goldSpinnerTrack: 'rgba(212, 175, 55, 0.2)',
  goldSpinnerHead: '#FFF4C2',
  sunriseGlow: 'rgba(255, 150, 55, 0.28)',
  sunriseCore: 'rgba(255, 225, 160, 0.54)',
  loadingText: '#C9A962',
  cloudRim: 'rgba(255, 168, 60, 0.58)',
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
    fontSize: 18.5,
    letterSpacing: 6.8,
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
    fontSize: 10,
    fontWeight: '500' as const,
    letterSpacing: 4.2,
    textTransform: 'uppercase' as const,
    color: SplashColors.goldBright,
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
