import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { CosmicTheme, Fonts, Radius, Spacing } from '@/constants/theme';

interface GlowButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: ViewStyle;
  disabled?: boolean;
}

export function GlowButton({
  label,
  onPress,
  variant = 'primary',
  style,
  disabled,
}: GlowButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <Text
        style={[
          styles.label,
          variant === 'primary' && styles.primaryLabel,
          variant === 'secondary' && styles.secondaryLabel,
          variant === 'ghost' && styles.ghostLabel,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: CosmicTheme.gold,
    shadowColor: CosmicTheme.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  secondary: {
    backgroundColor: CosmicTheme.purpleSoft,
    borderWidth: 1,
    borderColor: CosmicTheme.purple,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: CosmicTheme.cardBorder,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '600',
  },
  primaryLabel: {
    color: CosmicTheme.background,
  },
  secondaryLabel: {
    color: CosmicTheme.purple,
  },
  ghostLabel: {
    color: CosmicTheme.textPrimary,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
