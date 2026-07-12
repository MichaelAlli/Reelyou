import { memo } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, shadows, spacing, typography } from '@/theme';

export interface SecondaryButtonProps {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
}

function SecondaryButtonComponent({ label, onPress, style }: SecondaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.underline} />
    </Pressable>
  );
}

export const SecondaryButton = memo(SecondaryButtonComponent);

const styles = StyleSheet.create({
  pressable: {
    alignItems: 'center',
    paddingVertical: spacing.Spacing12,
  },
  pressed: {
    opacity: 0.72,
  },
  label: {
    ...typography.Caption,
    color: colors.TextSecondary,
    ...shadows.TextSoft,
  },
  underline: {
    marginTop: spacing.Spacing8,
    width: spacing.Spacing64 + spacing.Spacing8,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.Divider,
  },
});
