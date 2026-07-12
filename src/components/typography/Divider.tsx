import { memo } from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

import { colors, spacing } from '@/theme';

export interface DividerProps {
  style?: ViewStyle;
  lineStyle?: ViewStyle;
  accentStyle?: TextStyle;
}

/**
 * Decorative section divider — layout separator, not a brand asset.
 */
function DividerComponent({ style, lineStyle, accentStyle }: DividerProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={[styles.line, lineStyle]} />
      <Text style={[styles.accent, accentStyle]}>✦</Text>
      <View style={[styles.line, lineStyle]} />
    </View>
  );
}

export const Divider = memo(DividerComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 280,
    gap: spacing.Spacing12,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.Divider,
    opacity: 0.85,
  },
  accent: {
    color: colors.Gold,
    fontSize: 9,
    lineHeight: spacing.Spacing12,
  },
});
