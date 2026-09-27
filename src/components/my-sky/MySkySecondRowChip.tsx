import { memo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MySkyControlColors } from '@/components/my-sky/mySkyControlColors';
import { Fonts, Radius } from '@/constants/theme';
interface MySkySecondRowChipProps {
  label: string;
  accessibilityLabel: string;
  icon: ReactNode;
  onPress: () => void;
  active?: boolean;
}

function MySkySecondRowChipComponent({
  label,
  accessibilityLabel,
  icon,
  onPress,
  active = false,
}: MySkySecondRowChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active ? styles.chipActive : styles.chipIdle,
        pressed && styles.chipPressed,
      ]}>
      <View style={styles.iconSlot}>{icon}</View>
      <Text
        style={[
          styles.label,
          { color: active ? MySkyControlColors.labelActive : 'rgba(248, 244, 236, 0.88)' },
          active && styles.labelActive,
        ]}
        numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    minHeight: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipIdle: {
    borderColor: 'rgba(167, 139, 250, 0.16)',
    backgroundColor: 'rgba(8, 10, 26, 0.38)',
  },
  chipActive: {
    borderColor: MySkyControlColors.goldBorderActive,
    backgroundColor: MySkyControlColors.goldBgActive,
    shadowColor: '#E8C872',
    shadowOpacity: 0.28,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  chipPressed: {
    opacity: 0.92,
  },
  iconSlot: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '600',
    includeFontPadding: false,
  },
  labelActive: {
    fontWeight: '700',
    textShadowColor: 'rgba(255, 213, 122, 0.28)',
    textShadowRadius: 3,
    textShadowOffset: { width: 0, height: 0 },
  },
});

export const MySkySecondRowChip = memo(MySkySecondRowChipComponent);
