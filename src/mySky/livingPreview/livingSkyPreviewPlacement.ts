export const LIVING_SKY_PREVIEW_MIN_DIAMETER = 80;
export const LIVING_SKY_PREVIEW_MAX_DIAMETER = 96;

export interface LivingSkyPreviewFrame {
  left: number;
  top: number;
  diameter: number;
}

export function livingSkyPreviewDiameter(layoutWidth: number): number {
  if (layoutWidth <= 375) return LIVING_SKY_PREVIEW_MIN_DIAMETER;
  if (layoutWidth >= 430) return LIVING_SKY_PREVIEW_MAX_DIAMETER;
  return 88;
}

/**
 * Places the circle beside its star, inside the canvas, clear of protected points
 * such as the identity star and a bottom dock overlap.
 * Returns null when the circle cannot sit in the safe area without covering the star.
 */
export function placeLivingSkyPreview(input: {
  starX: number;
  starY: number;
  width: number;
  height: number;
  diameter?: number;
  pad?: number;
  bottomClearance?: number;
  protectedPoints?: readonly { x: number; y: number }[];
}): LivingSkyPreviewFrame | null {
  const { width, height } = input;
  if (!(width >= 64) || !(height >= 64)) return null;

  const diameter = input.diameter ?? livingSkyPreviewDiameter(width);
  const pad = input.pad ?? 8;
  const bottomInset = Math.max(pad, input.bottomClearance ?? pad);
  const maxRight = width - pad;
  const maxBottom = height - bottomInset;
  if (maxRight - pad < diameter || maxBottom - pad < diameter) return null;

  const radius = diameter / 2;
  const gap = 22;
  const starX = input.starX * width;
  const starY = input.starY * height;
  const inwardX = starX < width / 2 ? 1 : -1;
  const inwardY = starY > height * 0.62 ? -1 : starY < height * 0.28 ? 1 : -1;

  const offsets = [
    { dx: inwardX * (radius + gap), dy: inwardY * radius * 0.35 },
    { dx: -inwardX * (radius + gap), dy: inwardY * radius * 0.35 },
    { dx: inwardX * radius * 0.15, dy: -(radius + gap) },
    { dx: inwardX * radius * 0.15, dy: radius + gap },
    { dx: -(radius + gap), dy: 0 },
    { dx: radius + gap, dy: 0 },
    { dx: 0, dy: -(radius + gap) },
    { dx: 0, dy: radius + gap },
  ];

  const protectedPoints = (input.protectedPoints ?? []).map((point) => ({
    x: point.x * width,
    y: point.y * height,
  }));

  const tryFrame = (dx: number, dy: number): LivingSkyPreviewFrame | null => {
    const left = Math.min(Math.max(starX + dx - radius, pad), maxRight - diameter);
    const top = Math.min(Math.max(starY + dy - radius, pad), maxBottom - diameter);
    const centerX = left + radius;
    const centerY = top + radius;
    if (Math.hypot(centerX - starX, centerY - starY) < radius + 16) return null;
    for (const point of protectedPoints) {
      if (Math.hypot(centerX - point.x, centerY - point.y) < radius + 18) return null;
    }
    if (left < pad - 0.01 || top < pad - 0.01) return null;
    if (left + diameter > maxRight + 0.01) return null;
    if (top + diameter > maxBottom + 0.01) return null;
    return { left, top, diameter };
  };

  for (const offset of offsets) {
    const frame = tryFrame(offset.dx, offset.dy);
    if (frame) return frame;
  }
  return null;
}
