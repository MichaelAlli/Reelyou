export const HomeLayout = {
  padH: 20,
  padHCompact: 16,
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
  /** Reference heights — cards grow from content + aspect ratio on narrow devices. */
  starpathHeight: 192,
  starpathVisual: 128,
  starpathAspect: 320 / 128,
  mySkyHeight: 168,
  mySkyVisual: 108,
  mySkyAspect: 320 / 108,
  skywriteHeight: 62,
  focusMinHeight: 72,
  growingInMinHeight: 88,
  navIconSize: 21,
  scrollBottomExtra: 28,
} as const;

/** Horizontal page inset — 16px on narrow phones, 20px otherwise. */
export function measureHomePadH(screenWidth: number): number {
  return screenWidth <= 375 ? HomeLayout.padHCompact : HomeLayout.padH;
}

/** Usable content width inside Home horizontal padding. */
export function measureHomeContentWidth(screenWidth: number): number {
  const pad = measureHomePadH(screenWidth);
  return Math.max(0, screenWidth - pad * 2);
}

/** Portrait diameter — scales with content width; stays legible on narrow phones. */
export function measureHomeAvatarSize(screenWidth: number): number {
  const contentWidth = measureHomeContentWidth(screenWidth);
  const ratio = screenWidth <= 375 ? 0.24 : 0.26;
  const base = Math.round(contentWidth * ratio);
  if (screenWidth <= 360) {
    return Math.min(108, Math.max(88, base));
  }
  if (screenWidth <= 390) {
    return Math.min(112, Math.max(96, base));
  }
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
