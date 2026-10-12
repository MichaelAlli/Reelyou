import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { RippleMetricIcon } from '@/components/legacy/ripple/RippleMetricIcon';
import { Fonts, Spacing } from '@/constants/theme';
import type { RippleRecentItem } from '@/legacy/buildLegacyRippleViewModel';

interface ImpactRippleMomentRowProps {
  item: RippleRecentItem;
  onPress?: () => void;
  showDivider?: boolean;
}

export function ImpactRippleMomentRow({ item, onPress, showDivider }: ImpactRippleMomentRowProps) {
  return (
    <>
      {showDivider ? <View style={styles.divider} /> : null}
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        accessibilityRole="button"
        disabled={!onPress}>
        <View style={[styles.iconCircle, { borderColor: `${item.iconColor}55` }]}>
          <RippleMetricIcon kind={item.iconKind} color={item.iconColor} size={14} />
        </View>
        <Text style={styles.label} numberOfLines={2}>
          {item.label}
        </Text>
        <Text style={styles.time}>{item.relativeTime}</Text>
        <SymbolView
          name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
          size={14}
          tintColor="rgba(45, 55, 72, 0.35)"
          weight="semibold"
        />
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: Spacing.sm,
    minHeight: 44,
  },
  rowPressed: {
    opacity: 0.88,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(45, 55, 72, 0.12)',
    marginHorizontal: Spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    flexShrink: 0,
  },
  label: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 19,
    color: '#2D3748',
  },
  time: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(45, 55, 72, 0.5)',
    flexShrink: 0,
  },
});
