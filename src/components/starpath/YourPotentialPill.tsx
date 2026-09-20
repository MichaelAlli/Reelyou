import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import type { StarPathThemeTokens } from '@/starpath/starpathTheme';

interface YourPotentialPillProps {
  theme: StarPathThemeTokens;
}

function YourPotentialPillComponent({ theme }: YourPotentialPillProps) {
  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: 'rgba(8, 12, 28, 0.62)',
          borderColor: theme.uiGlassBorder,
        },
      ]}
      accessibilityRole="text"
    >
      <Text style={[styles.text, { color: theme.labelBright }]}>Your Potential</Text>
    </View>
  );
}

export const YourPotentialPill = memo(YourPotentialPillComponent);

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  text: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
