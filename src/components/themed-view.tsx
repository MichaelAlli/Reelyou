import { View, type ViewProps } from 'react-native';

import { type ThemeColor } from '@/constants/theme';
import { useTheme as useLegacyTheme } from '@/hooks/use-theme';
import { useTheme as useAppTheme } from '@/theme/useTheme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
  surface?: 'app' | 'elevated' | 'card';
};

export function ThemedView({ style, type, surface = 'app', ...otherProps }: ThemedViewProps) {
  const legacyTheme = useLegacyTheme();
  const { tokens } = useAppTheme();

  const backgroundColor = type
    ? legacyTheme[type]
    : surface === 'elevated'
      ? tokens.elevatedSurface
      : surface === 'card'
        ? tokens.cardSurface
        : tokens.appBackground;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
