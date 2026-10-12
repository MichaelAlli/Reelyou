import { StyleSheet, Text, View } from 'react-native';

import { RippleMetricIcon } from '@/components/legacy/ripple/RippleMetricIcon';
import { rippleGlass } from '@/components/legacy/ripple/rippleGlass';
import { Fonts, Spacing } from '@/constants/theme';
import type { RippleHeroMetricSlot } from '@/legacy/buildLegacyRippleViewModel';

interface ImpactPremiumMetricCardProps {
  metric: RippleHeroMetricSlot;
  description: string;
}

export function ImpactPremiumMetricCard({ metric, description }: ImpactPremiumMetricCardProps) {
  return (
    <View style={[rippleGlass.panel, styles.card]}>
      <View style={styles.iconRow}>
        <View style={[styles.iconCircle, { borderColor: `${metric.iconColor}55` }]}>
          <RippleMetricIcon kind={metric.iconKind} color={metric.iconColor} size={15} />
        </View>
      </View>
      <View style={[styles.ring, { borderColor: metric.iconColor }]}>
        <Text style={[styles.value, { color: metric.iconColor }]}>{metric.value}</Text>
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {metric.label}
      </Text>
      <Text style={styles.description} numberOfLines={4}>
        {description}
      </Text>
    </View>
  );
}

const CARD_WIDTH = 168;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    marginRight: Spacing.sm,
    alignItems: 'center',
  },
  iconRow: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.xs,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  ring: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  value: {
    fontFamily: Fonts.sans,
    fontSize: 26,
    fontWeight: '700',
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 6,
    minHeight: 34,
  },
  description: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    lineHeight: 15,
    color: 'rgba(45, 55, 72, 0.72)',
    textAlign: 'center',
  },
});

export const IMPACT_METRIC_CARD_WIDTH = CARD_WIDTH;
