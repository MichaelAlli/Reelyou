import { MY_SKY_SHOOTING_STAR_PATH } from '@/mySky/constellationLayout';

export interface QuadraticPathPoint {
  x: number;
  y: number;
}

export interface NormalizedQuadraticPath {
  start: QuadraticPathPoint;
  control: QuadraticPathPoint;
  end: QuadraticPathPoint;
}

/** Sample a point along a normalized quadratic bezier (t = 0–1). */
export function sampleQuadraticPath(
  t: number,
  path: NormalizedQuadraticPath,
  width: number,
  height: number,
): QuadraticPathPoint {
  const inv = 1 - t;
  const sx = path.start.x * width;
  const sy = path.start.y * height;
  const cx = path.control.x * width;
  const cy = path.control.y * height;
  const ex = path.end.x * width;
  const ey = path.end.y * height;
  return {
    x: inv * inv * sx + 2 * inv * t * cx + t * t * ex,
    y: inv * inv * sy + 2 * inv * t * cy + t * t * ey,
  };
}

/** Build SVG path `d` for the approved shooting-star arc. */
export function buildShootingStarPathD(
  width: number,
  height: number,
  path: NormalizedQuadraticPath = MY_SKY_SHOOTING_STAR_PATH,
): string {
  return `M ${path.start.x * width} ${path.start.y * height} Q ${path.control.x * width} ${path.control.y * height} ${path.end.x * width} ${path.end.y * height}`;
}
