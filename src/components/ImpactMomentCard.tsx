import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/GlassCard';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useThemedStyles } from '@/theme/useTheme';
import type { ImpactMoment } from '@/types';

interface ImpactMomentCardProps {
  moment: ImpactMoment;
}

export function ImpactMomentCard({ moment }: ImpactMomentCardProps) {
  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
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
        color: tokens.purple,
        textTransform: 'uppercase',
      },
      time: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        color: tokens.mutedText,
      },
      title: {
        fontFamily: Fonts.sans,
        fontSize: 16,
        fontWeight: '700',
        color: tokens.primaryText,
        marginBottom: Spacing.xs,
      },
      description: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        color: tokens.secondaryText,
        lineHeight: 20,
      },
    }),
  );

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
