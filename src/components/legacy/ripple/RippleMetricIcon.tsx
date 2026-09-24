import { Text, StyleSheet } from 'react-native';

import type { RippleNodeIconKind } from '@/legacy/buildLegacyRippleViewModel';

const GLYPH: Record<RippleNodeIconKind, string> = {
  heart: '♥',
  leaf: '✿',
  star: '✦',
  people: '👥',
};

interface RippleMetricIconProps {
  kind: RippleNodeIconKind;
  color: string;
  size?: number;
}

export function RippleMetricIcon({ kind, color, size = 16 }: RippleMetricIconProps) {
  return (
    <Text style={[styles.icon, { color, fontSize: size }]} accessibilityElementsHidden>
      {GLYPH[kind]}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    lineHeight: 18,
  },
});
