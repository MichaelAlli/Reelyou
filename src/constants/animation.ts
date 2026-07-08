import { Easing } from 'react-native-reanimated';

/** Shared REELYOU motion language — use across every screen. */
export const ReelyouEasing = {
  inOut: Easing.inOut(Easing.ease),
  out: Easing.out(Easing.cubic),
  linear: Easing.linear,
} as const;

export const ReelyouMotion = {
  fadeIn: 500,
  slide: 500,
  scale: 350,
  screenTransition: 400,
  glowPulse: 3500,
  backgroundZoom: 25000,
  logoFadeDelay: 150,
  loadingFadeDelay: 700,
  starTwinkleMin: 2400,
  starTwinkleMax: 4600,
  spinnerRotate: 1100,
  splashAutoTransition: 2500,
  sunriseBreath: 4000,
  loadingTextBreath: 3200,
} as const;

export const ReelyouMotionValues = {
  backgroundZoomMin: 1,
  backgroundZoomMax: 1.018,
  backgroundPanX: 0,
  backgroundPanY: 0,
  backgroundDriftY: 4,
  logoLiftDistance: 8,
  starOpacityMin: 0.1,
  starOpacityMax: 0.52,
  glowOpacityMin: 0.28,
  glowOpacityMax: 0.62,
  sunriseOpacityMin: 0.22,
  sunriseOpacityMax: 0.48,
  loadingTextOpacityMin: 0.82,
  loadingTextOpacityMax: 1,
} as const;

/** Pre-composed organic star twinkle timings (low intensity, non-uniform). */
export const ReelyouStarTwinkles = [
  { id: 'o1', x: 0.18, y: 0.12, size: 2, delay: 0, duration: 2800 },
  { id: 'o2', x: 0.42, y: 0.08, size: 2, delay: 620, duration: 3600 },
  { id: 'o3', x: 0.68, y: 0.15, size: 2, delay: 1100, duration: 3100 },
  { id: 'o4', x: 0.82, y: 0.28, size: 2, delay: 340, duration: 4200 },
  { id: 'o5', x: 0.55, y: 0.22, size: 2, delay: 880, duration: 2900 },
  { id: 'o6', x: 0.3, y: 0.28, size: 2, delay: 1500, duration: 3800 },
  { id: 'o7', x: 0.14, y: 0.2, size: 2, delay: 450, duration: 3300 },
  { id: 'o8', x: 0.74, y: 0.1, size: 2, delay: 1250, duration: 2700 },
] as const;
