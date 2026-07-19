import { StyleSheet, Text, View } from 'react-native';

import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useThemedStyles } from '@/theme/useTheme';

interface MetricPillProps {
  label: string;
  value: number | string;
  accent?: 'gold' | 'purple';
}

export function MetricPill({ label, value, accent = 'gold' }: MetricPillProps) {
  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      pill: {
        flex: 1,
        backgroundColor: tokens.elevatedSurface,
        borderRadius: Radius.md,
        padding: Spacing.sm,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: tokens.border,
      },
      purplePill: {
        borderColor: tokens.purpleSoft,
      },
      value: {
        fontFamily: Fonts.sans,
        fontSize: 22,
        fontWeight: '700',
        color: tokens.gold,
      },
      purpleValue: {
        color: tokens.purple,
      },
      label: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        color: tokens.mutedText,
        textAlign: 'center',
        marginTop: 2,
      },
    }),
  );

  return (
    <View style={[styles.pill, accent === 'purple' && styles.purplePill]}>
      <Text style={[styles.value, accent === 'purple' && styles.purpleValue]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
