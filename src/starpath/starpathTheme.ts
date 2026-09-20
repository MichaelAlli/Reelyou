/**
 * StarPath visual tokens — Night primary, Day architected for future reuse.
 */
export type StarPathVisualMode = 'night' | 'day';

export interface StarPathThemeTokens {
  canvasDeep: string;
  skyTop: string;
  skyMid: string;
  skyHorizon: string;
  nebulaViolet: string;
  nebulaIndigo: string;
  horizonGlow: string;
  beaconColumn: string;
  mist: string;
  mistSoft: string;
  vignette: string;
  mountainFar: string;
  mountainMid: string;
  mountainNear: string;
  peakHighlight: string;
  pathGold: string;
  pathGoldBright: string;
  pathGoldGlow: string;
  pathGoldDim: string;
  pathGoldDeep: string;
  starField: string;
  starTwinkle: string;
  northStarCore: string;
  northStarGlow: string;
  northStarRay: string;
  labelMuted: string;
  labelBright: string;
  uiGlass: string;
  uiGlassBorder: string;
  uiGlassHighlight: string;
  uiGlassDeep: string;
}

export const STARPATH_NIGHT: StarPathThemeTokens = {
  canvasDeep: '#020308',
  skyTop: '#060818',
  skyMid: '#0C1230',
  skyHorizon: '#182040',
  nebulaViolet: 'rgba(123, 79, 212, 0.22)',
  nebulaIndigo: 'rgba(45, 35, 95, 0.35)',
  horizonGlow: 'rgba(255, 160, 70, 0.28)',
  beaconColumn: 'rgba(255, 220, 140, 0.12)',
  mist: 'rgba(196, 168, 255, 0.12)',
  mistSoft: 'rgba(255, 244, 214, 0.08)',
  vignette: 'rgba(2, 3, 8, 0.55)',
  mountainFar: '#12182E',
  mountainMid: '#0A1022',
  mountainNear: '#050812',
  peakHighlight: 'rgba(255, 200, 120, 0.15)',
  pathGold: '#E8C872',
  pathGoldBright: '#FFF8E7',
  pathGoldGlow: 'rgba(255, 220, 150, 0.72)',
  pathGoldDim: 'rgba(232, 200, 114, 0.28)',
  pathGoldDeep: 'rgba(180, 130, 40, 0.45)',
  starField: '#FFFEF8',
  starTwinkle: 'rgba(255, 254, 248, 0.85)',
  northStarCore: '#FFFFFF',
  northStarGlow: 'rgba(255, 230, 160, 0.95)',
  northStarRay: 'rgba(255, 244, 214, 0.35)',
  labelMuted: 'rgba(196, 168, 255, 0.78)',
  labelBright: 'rgba(255, 248, 235, 0.96)',
  uiGlass: 'rgba(6, 10, 24, 0.78)',
  uiGlassDeep: 'rgba(4, 6, 16, 0.92)',
  uiGlassBorder: 'rgba(232, 200, 114, 0.32)',
  uiGlassHighlight: 'rgba(255, 244, 214, 0.1)',
};

export const STARPATH_DAY: StarPathThemeTokens = {
  ...STARPATH_NIGHT,
  canvasDeep: '#E8EEF8',
  skyTop: '#C8D8F0',
  skyMid: '#A8C0E8',
  skyHorizon: '#F0E6D0',
  nebulaViolet: 'rgba(180, 160, 220, 0.25)',
  nebulaIndigo: 'rgba(140, 160, 200, 0.2)',
  horizonGlow: 'rgba(255, 200, 100, 0.35)',
  vignette: 'rgba(240, 245, 255, 0.35)',
  mountainFar: '#8BA4C8',
  mountainMid: '#6E8AB0',
  mountainNear: '#4A6088',
  pathGold: '#C8960C',
  pathGoldBright: '#FFE8A8',
  pathGoldGlow: 'rgba(200, 150, 12, 0.45)',
  labelMuted: 'rgba(60, 72, 100, 0.72)',
  labelBright: 'rgba(28, 36, 56, 0.92)',
  uiGlass: 'rgba(255, 255, 255, 0.82)',
  uiGlassDeep: 'rgba(255, 255, 255, 0.92)',
  uiGlassBorder: 'rgba(200, 150, 12, 0.35)',
};

export const STARPATH_BRANCH_COLORS = {
  purpose: '#C4A8FF',
  relationships: '#E879A8',
  creativity: '#8FD4FF',
  growth: '#7EE8A8',
  contribution: '#FFD57A',
  community: '#5EEAD4',
  courage: '#B794F6',
  wellness: '#86EFAC',
  learning: '#A5B4FC',
} as const;

export type StarPathBranchId = keyof typeof STARPATH_BRANCH_COLORS;

export function getStarPathTheme(mode: StarPathVisualMode = 'night'): StarPathThemeTokens {
  return mode === 'day' ? STARPATH_DAY : STARPATH_NIGHT;
}
