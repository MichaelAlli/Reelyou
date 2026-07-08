import { StyleSheet, Text, View } from 'react-native';

import { CosmicTheme, Fonts, Radius, Spacing } from '@/constants/theme';

interface MetricPillProps {
  label: string;
  value: number | string;
  accent?: 'gold' | 'purple';
}

export function MetricPill({ label, value, accent = 'gold' }: MetricPillProps) {
  return (
    <View style={[styles.pill, accent === 'purple' && styles.purplePill]}>
      <Text style={[styles.value, accent === 'purple' && styles.purpleValue]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    backgroundColor: CosmicTheme.backgroundElevated,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CosmicTheme.cardBorder,
  },
  purplePill: {
    borderColor: CosmicTheme.purpleSoft,
  },
  value: {
    fontFamily: Fonts.sans,
    fontSize: 22,
    fontWeight: '700',
    color: CosmicTheme.gold,
  },
  purpleValue: {
    color: CosmicTheme.purple,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: CosmicTheme.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
});
