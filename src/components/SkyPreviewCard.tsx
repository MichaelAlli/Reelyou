import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/GlassCard';
import { MetricPill } from '@/components/MetricPill';
import { Fonts, Spacing } from '@/constants/theme';
import { useThemedStyles } from '@/theme/useTheme';
import type { ProfileStats } from '@/types';

interface SkyPreviewCardProps {
  description?: string;
  stats?: ProfileStats;
}

export function SkyPreviewCard({ description, stats }: SkyPreviewCardProps) {
  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      constellation: {
        height: 140,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
      },
      centerStar: {
        width: 16,
        height: 16,
        borderRadius: 999,
        backgroundColor: tokens.gold,
        shadowColor: tokens.gold,
        shadowOpacity: 0.8,
        shadowRadius: 10,
        zIndex: 2,
      },
      orbitStar: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 999,
        backgroundColor: tokens.purple,
      },
      orbitRing: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: tokens.purpleSoft,
      },
      description: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        color: tokens.secondaryText,
        lineHeight: 21,
        textAlign: 'center',
      },
      stats: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.md,
      },
    }),
  );

  return (
    <GlassCard glow="purple">
      <View style={styles.constellation}>
        <View style={styles.centerStar} />
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <View
            key={deg}
            style={[
              styles.orbitStar,
              {
                transform: [
                  { rotate: `${deg}deg` },
                  { translateX: 50 },
                  { rotate: `-${deg}deg` },
                ],
              },
            ]}
          />
        ))}
        <View style={styles.orbitRing} />
      </View>
      {description && <Text style={styles.description}>{description}</Text>}
      {stats && (
        <View style={styles.stats}>
          <MetricPill label="Skywrites Written" value={stats.skywritesWritten} />
          <MetricPill label="Lives Encouraged" value={stats.livesEncouraged} accent="purple" />
          <MetricPill label="Contributions Made" value={stats.contributionsMade} />
        </View>
      )}
    </GlassCard>
  );
}
