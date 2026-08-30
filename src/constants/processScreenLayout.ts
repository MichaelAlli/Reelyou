import { BrandDayLogoSpec } from '@/constants/branding';

export const ProcessScreenLayout = {
  horizontalPadding: 22,
  logoWidthMax: 200,
  logoAspect: BrandDayLogoSpec.height / BrandDayLogoSpec.width,
  headerTopGap: 8,
  titleTopGap: 20,
  titleSize: 20,
  subtitleSize: 13.5,
  subtitleLineHeight: 20,
  copyMaxWidth: 318,
  heroMinHeight: 440,
  heroPreferredRatio: 0.54,
  graphicMinHeight: 440,
  graphicPreferredRatio: 0.54,
  sectionGap: 18,
  heroTopGap: 12,
  heroBottomGap: 16,
  progressCardRadius: 22,
  progressBarHeight: 6,
  footerTopGap: 14,
  starPathRiverWidth: 2.8,
  starPathGlowWidth: 10,
  starPathRiverEndWidth: 1,
  linkTrackWidth: 1,
  linkPulseLength: 18,
  nodeGlassSize: 58,
  nodeIconSize: 26,
  coreGlassSize: 136,
  coreStarSize: 54,
  radialLabelWidth: 100,
  footerCopyGap: 6,
  gold: '#D4AF37',
  goldDeep: '#9A7209',
  goldAccent: '#E8A830',
  goldBright: '#F5D76E',
  goldPale: '#F7F0DC',
  goldWarm: '#E2C275',
  lavender: '#C3B1E1',
  lavenderSoft: '#B8A4DB',
  lavenderMuted: 'rgba(195, 177, 225, 0.92)',
  lavenderBorder: 'rgba(168, 144, 254, 0.38)',
  trackDark: 'rgba(16, 12, 32, 0.92)',
  glassFill: 'rgba(6, 5, 14, 0.68)',
  plateFill: 'rgba(12, 10, 26, 0.62)',
  canvasDeep: '#030208',
  canvasBg: '#05040E',
  canvasMidnight: '#04030C',
  canvasWarm: '#0E0A1E',
} as const;

/** Total simulated processing duration in ms */
export const PROCESS_SCREEN_DURATION_MS = 4800;

/** Responsive layout metrics for Process Screen only. */
export function getProcessScreenMetrics(width: number, height: number) {
  const compact = height < 700;
  const large = height >= 860;

  const logoWidth = Math.min(width * (compact ? 0.46 : 0.48), compact ? 184 : ProcessScreenLayout.logoWidthMax);
  const titleSize = compact ? 17 : large ? 20 : ProcessScreenLayout.titleSize;
  const subtitleSize = compact ? 12.5 : ProcessScreenLayout.subtitleSize;
  const titleTopGap = compact ? 12 : ProcessScreenLayout.titleTopGap;

  const headerReserve = compact ? 172 : large ? 192 : 182;
  const footerReserve = compact ? 218 : 228;
  const sectionGap = compact ? 14 : ProcessScreenLayout.sectionGap;
  const safeBuffer = compact ? 12 : 10;

  const maxHero = height - headerReserve - footerReserve - safeBuffer - sectionGap * 2;
  const ratioHero = Math.round(
    height * (compact ? 0.46 : large ? 0.5 : ProcessScreenLayout.heroPreferredRatio),
  );
  const heroHeight = Math.round(
    Math.max(compact ? 340 : ProcessScreenLayout.heroMinHeight, Math.min(ratioHero, maxHero)),
  );

  return {
    compact,
    large,
    logoWidth,
    titleSize,
    subtitleSize,
    titleTopGap,
    heroHeight,
    graphicHeight: heroHeight,
    sectionGap,
    contentPaddingBottom: compact ? 18 : 28,
  };
}
