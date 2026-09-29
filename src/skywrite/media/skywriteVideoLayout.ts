import type { ViewStyle } from 'react-native';

import { Radius } from '@/constants/theme';

/** Prefer stored dimensions; fall back to a neutral frame (not forced 9:16). */
export function skywriteVideoAspectRatio(width?: number, height?: number): number {
  if (width != null && height != null && height > 0) {
    return width / height;
  }
  return 16 / 9;
}

export function skywriteVideoFrameStyle(
  aspectRatio: number,
  maxHeight = 480,
): ViewStyle {
  return {
    width: '100%',
    maxHeight,
    aspectRatio,
    alignSelf: 'center',
    backgroundColor: '#050508',
    borderRadius: Radius.lg,
    overflow: 'hidden',
  };
}
