export const PROFILE_PHOTO_CROP_VIEWPORT_PX = 260;
export const PROFILE_PHOTO_CROP_OUTPUT_PX = 512;

export interface ProfilePhotoCropTransform {
  /** Multiplier on top of min cover scale (1 = fill circle). */
  userScale: number;
  offsetX: number;
  offsetY: number;
}

export interface ProfilePhotoCropImageSize {
  width: number;
  height: number;
}

export const DEFAULT_PROFILE_PHOTO_CROP_TRANSFORM: ProfilePhotoCropTransform = {
  userScale: 1,
  offsetX: 0,
  offsetY: 0,
};

export function clampProfilePhotoCropTransform(
  transform: ProfilePhotoCropTransform,
): ProfilePhotoCropTransform {
  return {
    userScale: Math.min(3, Math.max(1, transform.userScale)),
    offsetX: transform.offsetX,
    offsetY: transform.offsetY,
  };
}

export function computeProfilePhotoCoverScale(
  image: ProfilePhotoCropImageSize,
  viewport = PROFILE_PHOTO_CROP_VIEWPORT_PX,
): number {
  const w = Math.max(image.width, 1);
  const h = Math.max(image.height, 1);
  return Math.max(viewport / w, viewport / h);
}
