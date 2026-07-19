import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useThemedStyles } from '@/theme/useTheme';

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  glow?: 'gold' | 'purple' | 'none';
}

export function GlassCard({ children, style, glow = 'gold' }: GlassCardProps) {
  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      card: {
        backgroundColor: tokens.cardSurface,
        borderRadius: Radius.lg,
        padding: Spacing.md,
        borderWidth: 1,
      },
      goldBorder: {
        borderColor: tokens.border,
      },
      purpleBorder: {
        borderColor: tokens.purpleSoft,
      },
      noBorder: {
        borderColor: 'transparent',
      },
    }),
  );

  return (
    <View
      style={[
        styles.card,
        glow === 'gold' && styles.goldBorder,
        glow === 'purple' && styles.purpleBorder,
        glow === 'none' && styles.noBorder,
        style,
      ]}>
      {children}
    </View>
  );
}
