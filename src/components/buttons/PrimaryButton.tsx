import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '@/theme';

export interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  showArrow?: boolean;
  style?: ViewStyle;
}

function PrimaryButtonComponent({
  label,
  onPress,
  showArrow = true,
  style,
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed, style]}>
      <LinearGradient
        colors={[colors.Gold, colors.Purple]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradient}>
        <Text style={[styles.label, !showArrow && styles.labelCentered]}>{label}</Text>
        {showArrow ? <Text style={styles.arrow}>→</Text> : null}
      </LinearGradient>
    </Pressable>
  );
}

export const PrimaryButton = memo(PrimaryButtonComponent);

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
    borderRadius: radius.Pill,
    ...shadows.Large,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
    ...shadows.Medium,
  },
  gradient: {
    minHeight: 54,
    borderRadius: radius.Pill,
    paddingHorizontal: spacing.Spacing24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.Divider,
  },
  label: {
    ...typography.Button,
    flex: 1,
    textAlign: 'center',
    paddingLeft: spacing.Spacing20,
  },
  labelCentered: {
    paddingLeft: 0,
  },
  arrow: {
    ...typography.Title,
    color: colors.White,
    fontWeight: '300',
    width: spacing.Spacing20,
    textAlign: 'right',
  },
});
