import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ContributionBeaconCopy } from '@/constants/contributionBeaconCopy';
import { Fonts, Radius } from '@/constants/theme';

interface ContributionBeaconIndicatorProps {
  count: number;
  onPress: () => void;
}

function ContributionBeaconIndicatorComponent({ count, onPress }: ContributionBeaconIndicatorProps) {
  if (count <= 0) return null;

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={ContributionBeaconCopy.indicatorA11y(count)}
        onPress={onPress}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.icon}>✦</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      </Pressable>
    </View>
  );
}

export const ContributionBeaconIndicator = memo(ContributionBeaconIndicatorComponent);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.38)',
    backgroundColor: 'rgba(8, 10, 24, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E8C872',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  pressed: { opacity: 0.88 },
  icon: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    color: '#E8C872',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: 'rgba(167, 139, 250, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(8, 10, 24, 0.9)',
  },
  badgeText: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF8F0',
  },
});
