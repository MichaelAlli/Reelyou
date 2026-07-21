import { StyleSheet, Text, View } from 'react-native';

import { SignUpDayLayout } from '@/constants/signUpDayLayout';
import { Fonts, Spacing } from '@/constants/theme';
import { useAuthAppearance } from '@/hooks/use-auth-appearance';
import { useTheme, useThemedStyles } from '@/theme';

interface AuthDividerProps {
  label: string;
}

export function AuthDivider({ label }: AuthDividerProps) {
  const isLight = useAuthAppearance();
  const day = SignUpDayLayout;

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.three,
        paddingVertical: isLight ? 4 : 0,
      },
      line: {
        flex: 1,
        height: 1,
        backgroundColor: isLight ? 'rgba(8, 16, 42, 0.18)' : tokens.divider,
        opacity: isLight ? 1 : 0.45,
      },
      label: {
        fontFamily: Fonts.sans,
        fontSize: 12.5,
        fontWeight: '400',
        letterSpacing: 0.1,
        color: isLight ? day.dividerLabelColor : tokens.secondaryText,
      },
    }),
  );

  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}
