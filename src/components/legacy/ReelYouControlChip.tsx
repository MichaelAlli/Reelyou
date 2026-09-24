import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Fonts } from '@/constants/theme';

type ReelIconName = SymbolViewProps['name'];

interface ReelYouControlChipProps {
  icon: ReelIconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  primary?: boolean;
  accentColor: string;
  textColor: string;
  mutedTextColor: string;
}

function ReelYouControlChipComponent({
  icon,
  label,
  onPress,
  disabled = false,
  primary = false,
  accentColor,
  textColor,
  mutedTextColor,
}: ReelYouControlChipProps) {
  const tint = disabled ? mutedTextColor : primary ? accentColor : textColor;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        primary && styles.chipPrimary,
        disabled && styles.chipDisabled,
        pressed && !disabled && styles.chipPressed,
      ]}>
      <SymbolView
        name={icon}
        size={primary ? 26 : 22}
        tintColor={tint}
        weight="semibold"
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
      <Text style={[styles.label, { color: disabled ? mutedTextColor : textColor }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export const ReelYouControlChip = memo(ReelYouControlChipComponent);

export const ReelYouIcons = {
  previous: {
    ios: 'backward.fill',
    android: 'skip_previous',
    web: 'skip_previous',
  },
  next: {
    ios: 'forward.fill',
    android: 'skip_next',
    web: 'skip_next',
  },
  play: {
    ios: 'play.fill',
    android: 'play_arrow',
    web: 'play_arrow',
  },
  pause: {
    ios: 'pause.fill',
    android: 'pause',
    web: 'pause',
  },
  replay: {
    ios: 'arrow.counterclockwise',
    android: 'refresh',
    web: 'refresh',
  },
  review: {
    ios: 'square.and.pencil',
    android: 'edit',
    web: 'edit',
  },
} as const satisfies Record<string, ReelIconName>;

const styles = StyleSheet.create({
  chip: {
    minWidth: 76,
    minHeight: 56,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  chipPrimary: {
    minWidth: 88,
    minHeight: 62,
    borderColor: 'rgba(212, 175, 55, 0.65)',
    backgroundColor: 'rgba(212, 175, 55, 0.16)',
  },
  chipDisabled: {
    opacity: 0.45,
  },
  chipPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
