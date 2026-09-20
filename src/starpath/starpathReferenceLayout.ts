/** Center-axis layout @ 393×852 — deliberate branch lanes + interaction anchors. */

import type { StarPathLayoutMetrics } from '@/starpath/starpathLayoutMetrics';
import { createStarPathLayoutMetrics, refPointToWorldPx } from '@/starpath/starpathLayoutMetrics';

export const STARPATH_CENTER_X = 0.5;

export interface LayoutPoint {
  x: number;
  y: number;
}

export const REF_NORTH_STAR_LABEL: LayoutPoint = { x: STARPATH_CENTER_X, y: 0.088 };
export const REF_TRAVELER: LayoutPoint = { x: STARPATH_CENTER_X, y: 0.744 };
/** Collapsed Next Step waypoint — on trail just below avatar feet. */
export const REF_NEXT_STEP_WAYPOINT: LayoutPoint = { x: STARPATH_CENTER_X, y: 0.768 };

export interface PortraitNodeSpec {
  id: string;
  x: number;
  y: number;
  ringColor: string;
  portraitSeed: number;
  branchId: string;
}

export interface SymbolNodeSpec {
  id: string;
  x: number;
  y: number;
  ringColor: string;
  icon: string;
  branchId: string;
  size?: 'md' | 'lg';
}

export interface OrganicTrailSpec {
  id: string;
  d: string;
  color: string;
  glowColor?: string;
  opacity?: number;
  strokeWidth?: number;
  sparks?: { x: number; y: number }[];
  checkpoints?: { x: number; y: number }[];
}

export interface StarPathBranchSpec {
  id: string;
  color: string;
  glowColor: string;
  opacity: number;
  side: 'left' | 'right';
  waypoints: LayoutPoint[];
}

/** Peel-off points on the golden path (center-adjacent, not on avatar). */
const JUNCTION = {
  blue: { x: 0.442, y: 0.548 },
  /** Lower peel — keeps pink tied to network without rising toward North Star. */
  purple: { x: 0.558, y: 0.542 },
  green: { x: 0.556, y: 0.592 },
  community: { x: 0.438, y: 0.628 },
} as const;

/** Blue learning lane — left upper/mid: profile → profile → book milestone. */
export const REF_PORTRAIT_NODES: PortraitNodeSpec[] = [
  { id: 'p-blue-1', x: 0.168, y: 0.522, ringColor: '#5EC8FF', portraitSeed: 32, branchId: 'learning' },
  { id: 'p-blue-2', x: 0.138, y: 0.448, ringColor: '#5EC8FF', portraitSeed: 12, branchId: 'learning' },
  { id: 'p-violet-1', x: 0.832, y: 0.432, ringColor: '#E879A8', portraitSeed: 45, branchId: 'relationships' },
  { id: 'p-violet-2', x: 0.858, y: 0.368, ringColor: '#E879A8', portraitSeed: 22, branchId: 'relationships' },
  { id: 'p-green-r1', x: 0.828, y: 0.612, ringColor: '#7EE8A8', portraitSeed: 18, branchId: 'growth' },
];

export const REF_SYMBOL_NODES: SymbolNodeSpec[] = [
  { id: 'sym-book', x: 0.102, y: 0.362, ringColor: '#5EC8FF', icon: '◫', branchId: 'learning', size: 'lg' },
  { id: 'sym-heart', x: 0.898, y: 0.292, ringColor: '#E879A8', icon: '♥', branchId: 'relationships', size: 'lg' },
  { id: 'sym-growth', x: 0.882, y: 0.672, ringColor: '#7EE8A8', icon: '✦', branchId: 'growth', size: 'lg' },
  {
    id: 'sym-community',
    x: 0.108,
    y: 0.702,
    ringColor: '#B794F6',
    icon: '⚭',
    branchId: 'community',
    size: 'lg',
  },
];

function pxRef(p: LayoutPoint, metrics: StarPathLayoutMetrics) {
  return refPointToWorldPx(p, metrics);
}

/** Overlay golden path stops here — no SVG stem into North Star (background art carries upward). */
export const GOLDEN_PATH_OVERLAY_TOP_Y = 0.292 + 0.026;

export function buildMainGoldenPathD(metrics: StarPathLayoutMetrics): string {
  const { worldWidth: width, contentBandHeight: bandH, paddingTop } = metrics;
  const cx = width * STARPATH_CENTER_X;
  const y0 = paddingTop + bandH * REF_TRAVELER.y;
  const yStop = paddingTop + bandH * GOLDEN_PATH_OVERLAY_TOP_Y;

  return `
    M ${cx} ${y0}
    C ${cx + width * 0.048} ${paddingTop + bandH * 0.668},
      ${cx - width * 0.032} ${paddingTop + bandH * 0.548},
      ${cx + width * 0.018} ${paddingTop + bandH * 0.418}
    S ${cx + width * 0.012} ${paddingTop + bandH * 0.34},
      ${cx} ${yStop}
  `.trim();
}

type LaneSide = 'left' | 'right';

function branchThroughWaypoints(
  waypoints: LayoutPoint[],
  metrics: StarPathLayoutMetrics,
  side: LaneSide,
): string {
  const pts = waypoints.map((p) => pxRef(p, metrics));
  const width = metrics.worldWidth;
  if (pts.length < 2) return '';

  const outward = side === 'left' ? -1 : 1;
  const laneBow = outward * width * 0.065;
  const centerX = width * STARPATH_CENTER_X;

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i += 1) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    const dist = Math.hypot(dx, dy) || 1;
    const pull = Math.min(width * 0.08, dist * 0.42);

    const midX = (prev.x + curr.x) / 2;
    const awayFromCenter = midX < centerX ? -1 : 1;
    const bow = laneBow + awayFromCenter * width * 0.018;

    const cx1 = prev.x + dx * 0.22 + bow;
    const cy1 = prev.y + dy * 0.38 - pull * 0.08;
    const cx2 = prev.x + dx * 0.78 + bow * 0.65;
    const cy2 = curr.y - dy * 0.06 + pull * 0.05;
    d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
  }
  return d;
}

function trailSparks(
  waypoints: LayoutPoint[],
  metrics: StarPathLayoutMetrics,
): { x: number; y: number }[] {
  const pts = waypoints.map((p) => pxRef(p, metrics));
  const sparks: { x: number; y: number }[] = [];
  for (let i = 0; i < pts.length - 1; i += 1) {
    const a = pts[i];
    const b = pts[i + 1];
    for (const t of [0.33, 0.66]) {
      sparks.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  }
  return sparks;
}

function trailCheckpoints(
  waypoints: LayoutPoint[],
  metrics: StarPathLayoutMetrics,
): { x: number; y: number }[] {
  return waypoints.slice(1).map((p) => pxRef(p, metrics));
}

export function buildOrganicTrailsForMetrics(
  metrics: StarPathLayoutMetrics,
  branches: StarPathBranchSpec[],
): OrganicTrailSpec[] {
  return branches.map((s) => ({
    id: s.id,
    color: s.color,
    glowColor: s.glowColor,
    opacity: s.opacity,
    strokeWidth: 2.4,
    d: branchThroughWaypoints(s.waypoints, metrics, s.side),
    sparks: trailSparks(s.waypoints, metrics),
    checkpoints: trailCheckpoints(s.waypoints, metrics),
  }));
}

/** @deprecated Use buildOrganicTrailsForMetrics with layout metrics + world graph branches. */
export function buildOrganicTrails(width: number, height: number): OrganicTrailSpec[] {
  const metrics = createStarPathLayoutMetrics(width, height);
  return buildOrganicTrailsForMetrics(metrics, getReferenceBranchSpecs());
}

/** Reference branch topology for the beta world graph. */
export function getReferenceBranchSpecs(): StarPathBranchSpec[] {
  const sym = Object.fromEntries(REF_SYMBOL_NODES.map((n) => [n.id, { x: n.x, y: n.y }])) as Record<
    string,
    LayoutPoint
  >;
  const port = Object.fromEntries(REF_PORTRAIT_NODES.map((n) => [n.id, { x: n.x, y: n.y }])) as Record<
    string,
    LayoutPoint
  >;

  return [
    {
      id: 'learning',
      color: '#9AE8FF',
      glowColor: '#5EC8FF',
      opacity: 0.48,
      side: 'left',
      waypoints: [JUNCTION.blue, port['p-blue-1'], port['p-blue-2'], sym['sym-book']],
    },
    {
      id: 'relationships',
      color: '#FFABD0',
      glowColor: '#E879A8',
      opacity: 0.52,
      side: 'right',
      waypoints: [JUNCTION.purple, port['p-violet-1'], port['p-violet-2'], sym['sym-heart']],
    },
    {
      id: 'growth',
      color: '#B8FFD4',
      glowColor: '#7EE8A8',
      opacity: 0.44,
      side: 'right',
      waypoints: [JUNCTION.green, port['p-green-r1'], sym['sym-growth']],
    },
    {
      id: 'community',
      color: '#DEC4FF',
      glowColor: '#B794F6',
      opacity: 0.42,
      side: 'left',
      waypoints: [JUNCTION.community, { x: 0.118, y: 0.652 }, sym['sym-community']],
    },
  ];
}
