import { ProcessScreenCopy } from '@/constants/processScreenCopy';
import type { SymbolViewProps } from 'expo-symbols';

/** Normalized coordinates traced from foreground UI reference — NOT from legacy code */
export interface ProcessNodeSpec {
  id: string;
  label: string;
  icon: SymbolViewProps['name'];
  x: number;
  y: number;
  order: number;
}

export const PROCESS_CENTER = { x: 0.5, y: 0.38 };

export const PROCESS_NODES: ProcessNodeSpec[] = [
  {
    id: 'purpose',
    label: ProcessScreenCopy.nodes.purpose,
    icon: { ios: 'sparkle', android: 'star', web: 'star' },
    x: 0.5,
    y: 0.05,
    order: 0,
  },
  {
    id: 'interests',
    label: ProcessScreenCopy.nodes.interests,
    icon: { ios: 'heart', android: 'favorite_border', web: 'favorite_border' },
    x: 0.14,
    y: 0.2,
    order: 1,
  },
  {
    id: 'challenges',
    label: ProcessScreenCopy.nodes.challenges,
    icon: { ios: 'mountain.2', android: 'terrain', web: 'terrain' },
    x: 0.86,
    y: 0.2,
    order: 2,
  },
  {
    id: 'goals',
    label: ProcessScreenCopy.nodes.goals,
    icon: { ios: 'scope', android: 'track_changes', web: 'track_changes' },
    x: 0.17,
    y: 0.68,
    order: 3,
  },
  {
    id: 'growth',
    label: ProcessScreenCopy.nodes.growthPath,
    icon: { ios: 'chart.line.uptrend.xyaxis', android: 'trending_up', web: 'trending_up' },
    x: 0.83,
    y: 0.68,
    order: 4,
  },
];

export const PROCESS_NODE_COUNT = PROCESS_NODES.length;

export const ProcessCopy = {
  title: ProcessScreenCopy.title,
  subtitle: ProcessScreenCopy.subtitle,
  status: ProcessScreenCopy.statusPrimary,
  hint: ProcessScreenCopy.statusHint,
  footer1: ProcessScreenCopy.footerLine1,
  footer2: ProcessScreenCopy.footerLine2,
} as const;

export const ProcessPalette = {
  canvas: '#04030C',
  canvasDeep: '#030208',
  gold: '#E8C872',
  goldBright: '#F5E6B8',
  goldDeep: '#8A6914',
  goldLine: 'rgba(232, 200, 114, 0.58)',
  goldSoft: 'rgba(245, 230, 184, 0.94)',
  white: 'rgba(252, 251, 248, 0.97)',
  label: 'rgba(252, 251, 248, 0.9)',
  muted: 'rgba(195, 177, 225, 0.88)',
  glass: 'rgba(8, 7, 18, 0.84)',
  glassBorder: 'rgba(168, 144, 254, 0.26)',
  track: 'rgba(12, 9, 24, 0.94)',
  starCore: '#FFF8DC',
  starMid: '#D4AF37',
} as const;

export const ProcessMetrics = {
  padH: 18,
  logoMax: 204,
  logoRatio: 0.52,
  headerGap: 16,
  titleSize: 21,
  subtitleSize: 14,
  subtitleNetworkGap: 36,
  networkTopInset: 21,
  networkCardGap: 14,
  heroMin: 400,
  heroRatio: 0.52,
  sectionGap: 14,
  dockGap: 12,
  footerGap: 6,
  footerPad: 12,
  nodeSize: 66,
  nodeIcon: 28,
  labelW: 108,
  starSize: 58,
  starHalo: 78,
  linkW: 0.9,
  linkPulse: 12,
  cardRadius: 30,
  cardPad: 28,
  cardPadTop: 18,
  cardPadBottom: 18,
  cardIcon: 58,
  cardIconSvg: 20,
  cardRowGap: 18,
  cardHintBarGap: 16,
  statusSize: 20,
  hintSize: 15,
  barH: 6,
  pctSize: 16,
  pctMinW: 46,
} as const;

export function measureProcessLogo(w: number, compact: boolean) {
  return Math.min(w * (compact ? 0.48 : ProcessMetrics.logoRatio), compact ? 188 : ProcessMetrics.logoMax);
}

export function measureProcessHero(viewport: number, compact: boolean) {
  const header = compact ? 204 : 226;
  const dock = compact ? 292 : 312;
  const gaps = compact ? 38 : 46;
  const available = viewport - header - dock - gaps;
  const ratio = Math.round(viewport * (compact ? 0.47 : ProcessMetrics.heroRatio));
  return Math.round(Math.max(compact ? 352 : ProcessMetrics.heroMin, Math.min(ratio, available)));
}

export function scaleProcessNetwork(width: number) {
  const base = Math.min(width - ProcessMetrics.padH * 2, 394);
  const scale = base / 340;
  return {
    nodeSize: Math.round(Math.min(68, Math.max(56, ProcessMetrics.nodeSize * scale))),
    nodeIcon: Math.round(Math.min(28, Math.max(22, ProcessMetrics.nodeIcon * scale))),
    starSize: Math.round(Math.min(62, Math.max(54, ProcessMetrics.starSize * scale))),
    labelW: Math.round(ProcessMetrics.labelW * scale),
  };
}

export function shouldScrollProcessLayout(_viewport: number) {
  return true;
}
