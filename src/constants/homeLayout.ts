export const HomeLayout = {
  padH: 20,
  sectionGap: 14,
  cardRadius: 18,
  cardPad: 14,
  cardBorder: 1,
  iconCircle: 40,
  iconCircleSm: 38,
  avatarGlowPad: 6,
  profileOffsetTop: 2,
  headerHeight: 52,
  headerBottomGap: 6,
  heroBottomGap: 4,
  logoWidth: 172,
  logoHeight: 48,
  starpathHeight: 192,
  starpathVisual: 128,
  mySkyHeight: 168,
  mySkyVisual: 108,
  skywriteHeight: 62,
  focusMinHeight: 72,
  growingInMinHeight: 88,
  navIconSize: 21,
} as const;

/** Portrait diameter — reference scale (~105–120px on 430px viewport). */
export function measureHomeAvatarSize(screenWidth: number): number {
  const base = Math.round(screenWidth * 0.279);
  return Math.min(120, Math.max(105, base));
}

export const HomeMotion = {
  screenTransitionMs: 420,
  greetingFadeMs: 520,
  contentFadeMs: 480,
  contentStaggerMs: 55,
  ambientDriftMs: 26000,
  glowPulseMs: 3400,
  returnFadeMs: 280,
} as const;

export const HomePalette = {
  cardFill: 'rgba(5, 7, 20, 0.88)',
  cardEdge: 'rgba(232, 200, 114, 0.32)',
  gold: '#E8C872',
  goldBright: '#F5E6B8',
  goldDeep: '#C8942E',
  purple: '#A78BFA',
  purpleDeep: '#7C5CBF',
  blue: '#5BC0FF',
  blueDeep: '#3A8FD4',
  green: '#5EEAD4',
  greenDeep: '#2DB89A',
  magenta: '#E879A8',
  horizon: '#E8843A',
  sunset: '#FF6B35',
  navyDeep: '#05070A',
  navyMid: '#0C1028',
  lavender: 'rgba(210, 198, 235, 0.72)',
  textPrimary: '#FCFBF8',
  textSecondary: 'rgba(235, 228, 248, 0.78)',
} as const;
