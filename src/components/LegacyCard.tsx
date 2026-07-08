import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/GlassCard';
import { GlowButton } from '@/components/GlowButton';
import { CosmicTheme, Fonts, Spacing } from '@/constants/theme';

interface LegacyCardProps {
  heroLine: string;
  subtitle?: string;
  onEnter?: () => void;
  showButton?: boolean;
}

export function LegacyCard({ heroLine, subtitle, onEnter, showButton = true }: LegacyCardProps) {
  return (
    <GlassCard glow="gold" style={styles.card}>
      <View style={styles.iconRow}>
        <Text style={styles.icon}>✧</Text>
        <Text style={styles.icon}>✦</Text>
        <Text style={styles.icon}>✧</Text>
      </View>
      <Text style={styles.hero}>{heroLine}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {showButton && onEnter && (
        <GlowButton label="Enter Legacy" onPress={onEnter} style={styles.button} />
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  icon: {
    fontSize: 20,
    color: CosmicTheme.gold,
  },
  hero: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    fontWeight: '600',
    color: CosmicTheme.textPrimary,
    textAlign: 'center',
    lineHeight: 26,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: CosmicTheme.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  button: {
    marginTop: Spacing.lg,
    alignSelf: 'stretch',
  },
});
