import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RippleMetricIcon } from '@/components/legacy/ripple/RippleMetricIcon';
import { rippleGlass } from '@/components/legacy/ripple/rippleGlass';
import { Fonts } from '@/constants/theme';
import type { RippleHeroMetricSlot } from '@/legacy/buildLegacyRippleViewModel';

interface RippleHeroMetricsCardProps {
  metrics: RippleHeroMetricSlot[];
  onMetricPress?: (key: string) => void;
}

export function RippleHeroMetricsCard({ metrics, onMetricPress }: RippleHeroMetricsCardProps) {
  return (
    <View style={[rippleGlass.panel, styles.card]}>
      {metrics.map((metric) => (
        <Pressable
          key={metric.key}
          style={styles.slot}
          accessibilityRole="button"
          accessibilityLabel={`${metric.label}, ${metric.value}`}
          onPress={() => onMetricPress?.(metric.key)}>
          <RippleMetricIcon kind={metric.iconKind} color={metric.iconColor} size={14} />
          <Text style={styles.label} numberOfLines={2}>
            {metric.label}
          </Text>
          <Text style={styles.value}>{metric.value}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginTop: 12,
  },
  slot: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 2,
    paddingVertical: 6,
    minHeight: 72,
    justifyContent: 'center',
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '600',
    color: 'rgba(45, 55, 72, 0.78)',
    textAlign: 'center',
    minHeight: 22,
    maxWidth: 88,
  },
  value: {
    fontFamily: Fonts.sans,
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
  },
});
