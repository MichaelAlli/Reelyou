import type { MySkyViewportSnapshot } from '@/mySky/mySkyViewportSession';

/** World scale vs viewport — larger = more explorable space before pan clamps. */
export const MY_SKY_WORLD_FACTOR = 2.75;

export const MY_SKY_MIN_SCALE = 0.82;
export const MY_SKY_MAX_SCALE = 2.4;

/** Extra pan beyond strict content bounds — soft edges instead of abrupt stops. */
export const MY_SKY_PAN_BOUNDARY_RELAX = 1.12;

/** Pan must exceed this before activating — reduces accidental star taps while dragging. */
export const MY_SKY_PAN_MIN_DISTANCE = 14;

export const MY_SKY_JUMP_DURATION_MS = 520;
export const MY_SKY_BOUND_SNAP_MS = 280;

export const MY_SKY_LIVE_PUBLISH_MS = 96;

export function snapshotKey(snapshot: MySkyViewportSnapshot | undefined): string {
  if (!snapshot) return '';
  return `${snapshot.offsetX.toFixed(2)}|${snapshot.offsetY.toFixed(2)}|${snapshot.scale.toFixed(3)}`;
}

export function clamp(value: number, min: number, max: number): number {
  'worklet';
  return Math.min(max, Math.max(min, value));
}

export function computePanBounds(
  worldWidth: number,
  worldHeight: number,
  viewportWidth: number,
  viewportHeight: number,
  scale: number,
): { maxX: number; maxY: number } {
  'worklet';
  const scaledW = worldWidth * scale;
  const scaledH = worldHeight * scale;
  const maxX = Math.max(0, ((scaledW - viewportWidth) / 2) * MY_SKY_PAN_BOUNDARY_RELAX);
  const maxY = Math.max(0, ((scaledH - viewportHeight) / 2) * MY_SKY_PAN_BOUNDARY_RELAX);
  return { maxX, maxY };
}

export function clampOffsetToBounds(
  offsetX: number,
  offsetY: number,
  worldWidth: number,
  worldHeight: number,
  viewportWidth: number,
  viewportHeight: number,
  scale: number,
): { x: number; y: number } {
  'worklet';
  const { maxX, maxY } = computePanBounds(
    worldWidth,
    worldHeight,
    viewportWidth,
    viewportHeight,
    scale,
  );
  return {
    x: clamp(offsetX, -maxX, maxX),
    y: clamp(offsetY, -maxY, maxY),
  };
}

/** Preserve pinch focal point while scaling around the viewport center. */
export function applyPinchFocalOffset(
  focalX: number,
  focalY: number,
  viewportWidth: number,
  viewportHeight: number,
  offsetX: number,
  offsetY: number,
  previousScale: number,
  nextScale: number,
): { x: number; y: number } {
  'worklet';
  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2;
  const fx = focalX - centerX;
  const fy = focalY - centerY;
  const scaleDelta = nextScale / previousScale;
  return {
    x: fx - (fx - offsetX) * scaleDelta,
    y: fy - (fy - offsetY) * scaleDelta,
  };
}
