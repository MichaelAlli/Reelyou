import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/GlassCard';
import { CosmicTheme, Fonts, Spacing } from '@/constants/theme';
import type { ImpactMoment } from '@/types';

interface ImpactMomentCardProps {
  moment: ImpactMoment;
}

export function ImpactMomentCard({ moment }: ImpactMomentCardProps) {
  return (
    <GlassCard glow="purple" style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.metric}>{moment.metric}</Text>
        <Text style={styles.time}>{moment.timeAgo}</Text>
      </View>
      <Text style={styles.title}>{moment.title}</Text>
      <Text style={styles.description}>{moment.description}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  metric: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    color: CosmicTheme.purple,
    textTransform: 'uppercase',
  },
  time: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: CosmicTheme.textMuted,
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '700',
    color: CosmicTheme.textPrimary,
    marginBottom: Spacing.xs,
  },
  description: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: CosmicTheme.textSecondary,
    lineHeight: 20,
  },
});
