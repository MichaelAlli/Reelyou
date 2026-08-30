import type { ProcessStarPathPoint } from '@/components/process-starpath/types';
import { PROCESS_CENTER, PROCESS_NODES, type ProcessNodeSpec } from '@/components/process-starpath/processStarPathSpec';

export interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  len: number;
}

export interface ConstellationNode {
  spec: ProcessNodeSpec;
  cx: number;
  cy: number;
  radius: number;
}

export interface ConstellationLayout {
  width: number;
  height: number;
  cx: number;
  cy: number;
  starRadius: number;
  starHaloRadius: number;
  nodes: ConstellationNode[];
  links: Array<Segment & { order: number }>;
  anchorPoint: ProcessStarPathPoint;
}

export function segment(from: ProcessStarPathPoint, to: ProcessStarPathPoint): Segment {
  const len = Math.hypot(to.x - from.x, to.y - from.y);
  return { x1: from.x, y1: from.y, x2: to.x, y2: to.y, len };
}

export function trim(from: ProcessStarPathPoint, to: ProcessStarPathPoint, d: number): ProcessStarPathPoint {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const l = Math.hypot(dx, dy) || 1;
  return { x: from.x + (dx / l) * d, y: from.y + (dy / l) * d };
}

/** Uniform downward shift — preserves node alignment, adds subtitle breathing room */
export const NETWORK_Y_SHIFT = 0.055;

export interface CelestialRay {
  d: string;
  weight: number;
}

export interface ReelyouSignatureCelestial {
  coreR: number;
  rays: CelestialRay[];
  facets: string[];
}

/** REELYOU signature celestial — 8 tapered rays + dimensional core (not a cartoon star) */
export function buildReelyouSignatureCelestial(size: number): ReelyouSignatureCelestial {
  const coreR = size * 0.12;
  const specs: Array<{ angle: number; len: number; halfW: number }> = [
    { angle: -Math.PI / 2, len: size * 0.49, halfW: size * 0.048 },
    { angle: 0, len: size * 0.47, halfW: size * 0.045 },
    { angle: Math.PI / 2, len: size * 0.45, halfW: size * 0.043 },
    { angle: Math.PI, len: size * 0.45, halfW: size * 0.043 },
    { angle: -Math.PI / 4, len: size * 0.27, halfW: size * 0.028 },
    { angle: Math.PI / 4, len: size * 0.27, halfW: size * 0.028 },
    { angle: (3 * Math.PI) / 4, len: size * 0.27, halfW: size * 0.028 },
    { angle: (-3 * Math.PI) / 4, len: size * 0.27, halfW: size * 0.028 },
  ];

  const rays = specs.map(({ angle, len, halfW }) => {
    const tipX = Math.cos(angle) * len;
    const tipY = Math.sin(angle) * len;
    const baseX = Math.cos(angle) * coreR * 0.92;
    const baseY = Math.sin(angle) * coreR * 0.92;
    const perp = angle + Math.PI / 2;
    const taper = 0.12;
    const bx1 = baseX + Math.cos(perp) * halfW;
    const by1 = baseY + Math.sin(perp) * halfW;
    const bx2 = baseX - Math.cos(perp) * halfW;
    const by2 = baseY - Math.sin(perp) * halfW;
    const tx1 = tipX + Math.cos(perp) * halfW * taper;
    const ty1 = tipY + Math.sin(perp) * halfW * taper;
    const tx2 = tipX - Math.cos(perp) * halfW * taper;
    const ty2 = tipY - Math.sin(perp) * halfW * taper;
    return {
      d: `M${bx1.toFixed(2)},${by1.toFixed(2)} L${tx1.toFixed(2)},${ty1.toFixed(2)} L${tx2.toFixed(2)},${ty2.toFixed(2)} L${bx2.toFixed(2)},${by2.toFixed(2)} Z`,
      weight: len / size,
    };
  });

  const facets = [
    { angle: -Math.PI / 2, len: size * 0.19, halfW: size * 0.022 },
    { angle: 0, len: size * 0.17, halfW: size * 0.02 },
    { angle: Math.PI / 2, len: size * 0.16, halfW: size * 0.019 },
    { angle: Math.PI, len: size * 0.16, halfW: size * 0.019 },
  ].map(({ angle, len, halfW }) => {
    const tipX = Math.cos(angle) * len;
    const tipY = Math.sin(angle) * len;
    const baseX = Math.cos(angle) * coreR * 0.55;
    const baseY = Math.sin(angle) * coreR * 0.55;
    const perp = angle + Math.PI / 2;
    const bx1 = baseX + Math.cos(perp) * halfW;
    const by1 = baseY + Math.sin(perp) * halfW;
    const bx2 = baseX - Math.cos(perp) * halfW;
    const by2 = baseY - Math.sin(perp) * halfW;
    const tx1 = tipX + Math.cos(perp) * halfW * 0.15;
    const ty1 = tipY + Math.sin(perp) * halfW * 0.15;
    const tx2 = tipX - Math.cos(perp) * halfW * 0.15;
    const ty2 = tipY - Math.sin(perp) * halfW * 0.15;
    return `M${bx1.toFixed(2)},${by1.toFixed(2)} L${tx1.toFixed(2)},${ty1.toFixed(2)} L${tx2.toFixed(2)},${ty2.toFixed(2)} L${bx2.toFixed(2)},${by2.toFixed(2)} Z`;
  });

  return { coreR, rays, facets };
}

/** @deprecated Use buildReelyouSignatureCelestial for hero */
export function reelyouHeroStarPath(size: number): string {
  const r = size / 2;
  const inner = r * 0.62;
  const parts: string[] = [];
  for (let i = 0; i < 5; i += 1) {
    const outerAngle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const innerAngle = outerAngle + Math.PI / 5;
    const outerR = i === 0 ? r * 1.08 : r * 0.97;
    const ox = (Math.cos(outerAngle) * outerR).toFixed(2);
    const oy = (Math.sin(outerAngle) * outerR).toFixed(2);
    const ix = (Math.cos(innerAngle) * inner).toFixed(2);
    const iy = (Math.sin(innerAngle) * inner).toFixed(2);
    parts.push(i === 0 ? `M${ox},${oy}` : `L${ox},${oy}`, `L${ix},${iy}`);
  }
  return `${parts.join(' ')} Z`;
}

/** Premium 5-point celestial star path centered at origin */
export function fivePointStarPath(size: number, innerRatio = 0.44): string {
  const r = size / 2;
  const inner = r * innerRatio;
  const parts: string[] = [];
  for (let i = 0; i < 5; i += 1) {
    const outerAngle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const innerAngle = outerAngle + Math.PI / 5;
    const ox = (Math.cos(outerAngle) * r).toFixed(2);
    const oy = (Math.sin(outerAngle) * r).toFixed(2);
    const ix = (Math.cos(innerAngle) * inner).toFixed(2);
    const iy = (Math.sin(innerAngle) * inner).toFixed(2);
    parts.push(i === 0 ? `M${ox},${oy}` : `L${ox},${oy}`, `L${ix},${iy}`);
  }
  return `${parts.join(' ')} Z`;
}

/** Small card emblem star */
export function fivePointStarCompact(size: number): string {
  return fivePointStarPath(size, 0.46);
}

/** Single shared coordinate system for star, nodes, and connectors */
export function buildConstellationLayout(
  width: number,
  height: number,
  nodeRadius: number,
  starRadius: number,
): ConstellationLayout {
  const cx = width * PROCESS_CENTER.x;
  const cy = height * (PROCESS_CENTER.y + NETWORK_Y_SHIFT);
  const starHaloRadius = starRadius * 1.14;

  const nodes: ConstellationNode[] = PROCESS_NODES.map((spec) => ({
    spec,
    cx: spec.x * width,
    cy: (spec.y + NETWORK_Y_SHIFT) * height,
    radius: nodeRadius,
  }));

  const links = nodes.map(({ spec, cx: nx, cy: ny, radius }) => {
    const from = trim({ x: nx, y: ny }, { x: cx, y: cy }, radius + 1);
    const to = trim({ x: cx, y: cy }, { x: nx, y: ny }, starHaloRadius + 1);
    return { ...segment(from, to), order: spec.order };
  });

  const anchorPoint: ProcessStarPathPoint = {
    x: cx,
    y: cy + starRadius * 0.82,
  };

  return {
    width,
    height,
    cx,
    cy,
    starRadius,
    starHaloRadius,
    nodes,
    links,
    anchorPoint,
  };
}

function cubicPoint(
  p0: ProcessStarPathPoint,
  p1: ProcessStarPathPoint,
  p2: ProcessStarPathPoint,
  p3: ProcessStarPathPoint,
  t: number,
): ProcessStarPathPoint {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

export function energyTrailControls(origin: ProcessStarPathPoint, target: ProcessStarPathPoint) {
  const rise = origin.y - target.y;
  const dx = target.x - origin.x;
  return {
    origin,
    target,
    c1: { x: origin.x + dx * 0.06, y: origin.y - rise * 0.32 },
    c2: { x: target.x - dx * 0.1, y: target.y + rise * 0.28 },
  };
}

export function energyTrailPathD(origin: ProcessStarPathPoint, target: ProcessStarPathPoint): string {
  const { c1, c2 } = energyTrailControls(origin, target);
  return `M ${origin.x.toFixed(1)} ${origin.y.toFixed(1)} C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${target.x.toFixed(1)} ${target.y.toFixed(1)}`;
}

export function sampleEnergyTrail(
  origin: ProcessStarPathPoint,
  target: ProcessStarPathPoint,
  samples = 36,
): ProcessStarPathPoint[] {
  const { origin: p0, target: p3, c1, c2 } = energyTrailControls(origin, target);
  const pts: ProcessStarPathPoint[] = [];
  for (let i = 0; i <= samples; i += 1) {
    pts.push(cubicPoint(p0, c1, c2, p3, i / samples));
  }
  return pts;
}

export function walkPolyline(points: ProcessStarPathPoint[], t: number): ProcessStarPathPoint {
  if (points.length < 2) return points[0] ?? { x: 0, y: 0 };
  const lens: number[] = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const l = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
    lens.push(l);
    total += l;
  }
  let dist = t * total;
  for (let i = 0; i < lens.length; i += 1) {
    if (dist <= lens[i]) {
      const r = lens[i] ? dist / lens[i] : 0;
      return {
        x: points[i].x + (points[i + 1].x - points[i].x) * r,
        y: points[i].y + (points[i + 1].y - points[i].y) * r,
      };
    }
    dist -= lens[i];
  }
  return points[points.length - 1];
}

export function easedProgress(elapsed: number, start: number, end: number): number {
  'worklet';
  if (elapsed <= start) return 0;
  if (elapsed >= end) return 1;
  const t = (elapsed - start) / (end - start);
  return 1 - Math.pow(1 - t, 3);
}
