import { StyleSheet, type TextStyle } from 'react-native';

import { HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';

export type SkywriteTextStyleId =
  | 'plain'
  | 'classicReflection'
  | 'softAffirmation'
  | 'boldTruth'
  | 'poeticGlow';

export const SKYWRITE_TEXT_STYLE_OPTIONS: ReadonlyArray<{
  id: SkywriteTextStyleId;
  label: string;
  description: string;
  preview: string;
}> = [
  {
    id: 'plain',
    label: 'Plain',
    description: 'Simple and direct',
    preview: 'Aa',
  },
  {
    id: 'classicReflection',
    label: 'Classic Reflection',
    description: 'Elegant serif tone',
    preview: 'Aa',
  },
  {
    id: 'softAffirmation',
    label: 'Soft Affirmation',
    description: 'Gentle and supportive',
    preview: 'Aa',
  },
  {
    id: 'boldTruth',
    label: 'Bold Truth',
    description: 'Confident declaration',
    preview: 'Aa',
  },
  {
    id: 'poeticGlow',
    label: 'Poetic Glow',
    description: 'Expressive and dreamy',
    preview: 'Aa',
  },
];

const TEXT_STYLE_IDS = new Set(SKYWRITE_TEXT_STYLE_OPTIONS.map((o) => o.id));

export function isSkywriteTextStyle(value: unknown): value is SkywriteTextStyleId {
  return typeof value === 'string' && TEXT_STYLE_IDS.has(value as SkywriteTextStyleId);
}

export function getSkywriteTextStyleLabel(id: SkywriteTextStyleId): string {
  return SKYWRITE_TEXT_STYLE_OPTIONS.find((o) => o.id === id)?.label ?? 'Plain';
}

/** Live composer preview styles — stored id drives saved Skywrite presentation later. */
export function getSkywriteWriteInputStyle(textStyle: SkywriteTextStyleId): TextStyle {
  switch (textStyle) {
    case 'classicReflection':
      return styles.classicReflection;
    case 'softAffirmation':
      return styles.softAffirmation;
    case 'boldTruth':
      return styles.boldTruth;
    case 'poeticGlow':
      return styles.poeticGlow;
    default:
      return styles.plain;
  }
}

const styles = StyleSheet.create({
  plain: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    color: HomePalette.textPrimary,
  },
  classicReflection: {
    fontFamily: Fonts.serif,
    fontSize: 17,
    lineHeight: 27,
    letterSpacing: 0.25,
    color: 'rgba(245, 240, 255, 0.96)',
  },
  softAffirmation: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0.15,
    color: 'rgba(235, 228, 248, 0.94)',
  },
  boldTruth: {
    fontFamily: Fonts.sans,
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '700',
    letterSpacing: 0.1,
    color: HomePalette.textPrimary,
  },
  poeticGlow: {
    fontFamily: Fonts.serif,
    fontSize: 17,
    lineHeight: 28,
    letterSpacing: 0.35,
    color: 'rgba(228, 210, 255, 0.96)',
  },
});
