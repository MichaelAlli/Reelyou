import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { CosmicTheme, Radius, Spacing } from '@/constants/theme';

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  glow?: 'gold' | 'purple' | 'none';
}

export function GlassCard({ children, style, glow = 'gold' }: GlassCardProps) {
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: CosmicTheme.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
  },
  goldBorder: {
    borderColor: CosmicTheme.cardBorder,
  },
  purpleBorder: {
    borderColor: CosmicTheme.purpleSoft,
  },
  noBorder: {
    borderColor: 'transparent',
  },
});
