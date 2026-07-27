import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { THEME_MODE_LABELS, THEME_MODES, type ThemeMode } from '@/theme/types';
import { useTheme } from '@/theme/useTheme';

export interface AppearanceModeSelectorProps {
  /** Optional section title — omit when Profile Settings supplies its own header. */
  title?: string;
  style?: ViewStyle;
}

/**
 * Reusable appearance preference control for Profile → Settings → Appearance.
 * Not mounted on Splash, Welcome, or Onboarding.
 */
export function AppearanceModeSelector({ title = 'Appearance', style }: AppearanceModeSelectorProps) {
  const { themeMode, resolvedAppearance, setThemeMode, setTimeOverride, tokens } = useTheme();

  const selectMode = (mode: ThemeMode) => {
    setTimeOverride(null);
    setThemeMode(mode);
  };

  return (
    <View style={[styles.container, style]}>
      {title ? (
        <Text style={[styles.title, { color: tokens.primaryText }]}>{title}</Text>
      ) : null}
      <Text style={[styles.meta, { color: tokens.secondaryText }]}>
        Currently {THEME_MODE_LABELS[themeMode]} · {resolvedAppearance === 'light' ? 'Light' : 'Dark'}{' '}
        theme
      </Text>

      <View style={styles.row}>
        {THEME_MODES.map((mode) => {
          const selected = themeMode === mode;

          return (
            <Pressable
              key={mode}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => selectMode(mode)}
              style={[
                styles.option,
                { borderColor: tokens.border, backgroundColor: tokens.surface },
                selected && {
                  backgroundColor: tokens.primaryAction,
                  borderColor: tokens.primaryAction,
                },
              ]}>
              <Text
                style={[
                  styles.optionLabel,
                  { color: selected ? tokens.appBackground : tokens.primaryText },
                ]}>
                {THEME_MODE_LABELS[mode]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
