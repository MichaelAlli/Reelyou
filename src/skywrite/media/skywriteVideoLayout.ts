import { Platform, StyleSheet, type ViewStyle } from 'react-native';

import { Radius } from '@/constants/theme';

/** Web: expo-av renders <video>; enforce contain fit on the element. */
export function skywriteVideoElementStyle(): ViewStyle {
  const base = StyleSheet.absoluteFill;
  if (Platform.OS !== 'web') return base;
  return { ...base, objectFit: 'contain' } as ViewStyle;
}

/** Prefer stored dimensions; fall back to a neutral frame (not forced 9:16). */
export function skywriteVideoAspectRatio(width?: number, height?: number): number {
  if (width != null && height != null && height > 0) {
    return width / height;
  }
  return 16 / 9;
}

export interface ContainedVideoFrame {
  width: number;
  height: number;
}

/** Fit entire frame inside a box (object-fit: contain). */
export function measureContainedVideoFrame(
  aspectRatio: number,
  containerWidth: number,
  containerHeight: number,
): ContainedVideoFrame {
  const safeW = Math.max(1, containerWidth);
  const safeH = Math.max(1, containerHeight);
  let width = safeW;
  let height = width / aspectRatio;
  if (height > safeH) {
    height = safeH;
    width = height * aspectRatio;
  }
  return { width: Math.floor(width), height: Math.floor(height) };
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

export function skywriteContainedVideoFrameStyle(
  aspectRatio: number,
  containerWidth: number,
  containerHeight: number,
): ViewStyle {
  const frame = measureContainedVideoFrame(aspectRatio, containerWidth, containerHeight);
  return {
    width: frame.width,
    height: frame.height,
    alignSelf: 'center',
    backgroundColor: '#050508',
    borderRadius: Radius.lg,
    overflow: 'hidden',
  };
}
