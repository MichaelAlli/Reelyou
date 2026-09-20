import type { StarPathBranchId } from '@/starpath/starpathTheme';

export interface NormalizedPoint {
  x: number;
  y: number;
}

export interface BranchGeometry {
  id: StarPathBranchId;
  junction: NormalizedPoint;
  tip: NormalizedPoint;
}

export function scalePoint(point: NormalizedPoint, width: number, height: number) {
  return { x: point.x * width, y: point.y * height };
}

/** Reference UI — North Star summit focal point. */
export const NORTH_STAR_ANCHOR: NormalizedPoint = { x: 0.5, y: 0.2 };
export const POTENTIAL_ANCHOR: NormalizedPoint = { x: 0.5, y: 0.58 };
export const BEACON_PEAK_ANCHOR: NormalizedPoint = { x: 0.5, y: 0.24 };

/** Single-screen reference composition (393×852). */
export function computeWorldHeight(viewportHeight: number): number {
  return viewportHeight;
}

/** Golden path aligned to cinematic background ascent. */
export function buildCentralPathD(width: number, height: number): string {
  const cx = width * 0.5;
  const yStart = height * 0.62;
  const yEnd = height * 0.22;

  return `
    M ${cx} ${yStart}
    C ${cx + width * 0.1} ${height * 0.56},
      ${cx - width * 0.08} ${height * 0.5},
      ${cx + width * 0.06} ${height * 0.44}
    C ${cx - width * 0.07} ${height * 0.38},
      ${cx + width * 0.04} ${height * 0.3},
      ${cx} ${yEnd}
  `.trim();
}

export function buildBranchPathD(
  junction: NormalizedPoint,
  tip: NormalizedPoint,
  width: number,
  height: number,
): string {
  const j = scalePoint(junction, width, height);
  const t = scalePoint(tip, width, height);
  const bend = (t.x - j.x) * 0.38 + (t.x > j.x ? width * 0.05 : -width * 0.05);
  const ctrlX = j.x + bend;
  const ctrlY = j.y + (t.y - j.y) * 0.35;

  return `M ${j.x} ${j.y} Q ${ctrlX} ${ctrlY} ${t.x} ${t.y}`;
}

/** Left/right constellation branches from white UI reference. */
export const STARPATH_BRANCHES: BranchGeometry[] = [
  { id: 'relationships', junction: { x: 0.49, y: 0.54 }, tip: { x: 0.2, y: 0.5 } },
  { id: 'creativity', junction: { x: 0.48, y: 0.5 }, tip: { x: 0.16, y: 0.44 } },
  { id: 'purpose', junction: { x: 0.47, y: 0.46 }, tip: { x: 0.18, y: 0.38 } },
  { id: 'growth', junction: { x: 0.51, y: 0.5 }, tip: { x: 0.84, y: 0.44 } },
  { id: 'community', junction: { x: 0.52, y: 0.46 }, tip: { x: 0.82, y: 0.38 } },
  { id: 'learning', junction: { x: 0.51, y: 0.42 }, tip: { x: 0.78, y: 0.34 } },
  { id: 'wellness', junction: { x: 0.5, y: 0.38 }, tip: { x: 0.22, y: 0.32 } },
];

export const PATH_SPARKS: NormalizedPoint[] = [
  { x: 0.5, y: 0.6 },
  { x: 0.52, y: 0.54 },
  { x: 0.48, y: 0.48 },
  { x: 0.51, y: 0.42 },
  { x: 0.49, y: 0.36 },
  { x: 0.5, y: 0.28 },
];

export function buildStarField(count: number, seed = 11): { x: number; y: number; r: number; o: number }[] {
  const stars: { x: number; y: number; r: number; o: number }[] = [];
  let s = seed;
  for (let i = 0; i < count; i += 1) {
    s = (s * 16807 + 7) % 2147483647;
    const r1 = s / 2147483647;
    s = (s * 16807 + 7) % 2147483647;
    const r2 = s / 2147483647;
    s = (s * 16807 + 7) % 2147483647;
    const r3 = s / 2147483647;
    stars.push({
      x: r1,
      y: r2 * 0.78,
      r: 0.35 + r3 * 1.35,
      o: 0.2 + r3 * 0.65,
    });
  }
  return stars;
}
