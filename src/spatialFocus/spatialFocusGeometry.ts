import type { MySkyViewportSnapshot } from '@/mySky/mySkyViewportSession';

export function mySkyWorldPointToScreen(
  normalizedX: number,
  normalizedY: number,
  worldWidth: number,
  worldHeight: number,
  viewport: MySkyViewportSnapshot,
  originLeft = 0,
  originTop = 0,
): { centerX: number; centerY: number } {
  const worldX = normalizedX * worldWidth;
  const worldY = normalizedY * worldHeight;
  return {
    centerX: originLeft + worldX * viewport.scale + viewport.offsetX,
    centerY: originTop + worldY * viewport.scale + viewport.offsetY,
  };
}

export function isPointInViewport(
  centerX: number,
  centerY: number,
  layoutWidth: number,
  layoutHeight: number,
  marginPx = 28,
): boolean {
  return (
    centerX >= -marginPx &&
    centerX <= layoutWidth + marginPx &&
    centerY >= -marginPx &&
    centerY <= layoutHeight + marginPx
  );
}
