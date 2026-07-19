import { Pressable, StyleSheet, Text, View } from 'react-native';

import { THEME_MODE_LABELS, THEME_MODES } from '@/theme/types';
import { runThemeLogicVerification } from '@/theme/verifyThemeLogic';
import { useTheme } from '@/theme/useTheme';
import { Fonts, Radius, Spacing } from '@/constants/theme';

/**
 * TEMP DEV-ONLY control for validating all four theme modes.
 * Remove this component once a real Settings screen ships.
 */
export function ThemeModeDevControl() {
  const { themeMode, resolvedAppearance, setThemeMode, setTimeOverride, tokens } = useTheme();

  if (!__DEV__) {
    return null;
  }

  const runVerification = () => {
    const result = runThemeLogicVerification();
    if (result.failed.length === 0) {
      console.info(`[REELYOU Theme] ${result.passed} verification checks passed.`);
    } else {
      console.warn('[REELYOU Theme] Verification failures:', result.failed);
    }
  };

  const simulateDaytime = () => {
    setThemeMode('timeOfDay');
    setTimeOverride(new Date(2026, 6, 19, 12, 0));
  };

  const simulateNighttime = () => {
    setThemeMode('timeOfDay');
    setTimeOverride(new Date(2026, 6, 19, 22, 0));
  };

  const clearSimulation = () => {
    setTimeOverride(null);
  };

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { borderColor: tokens.border, backgroundColor: tokens.elevatedSurface }]}>
      <Text style={[styles.title, { color: tokens.primaryText }]}>DEV: Theme Modes</Text>
      <Text style={[styles.meta, { color: tokens.secondaryText }]}>
        Mode: {THEME_MODE_LABELS[themeMode]} · Resolved: {resolvedAppearance}
      </Text>

      <View style={styles.row}>
        {THEME_MODES.map((mode) => (
          <Pressable
            key={mode}
            onPress={() => {
              setTimeOverride(null);
              setThemeMode(mode);
            }}
            style={[
              styles.chip,
              { borderColor: tokens.border },
              themeMode === mode && { backgroundColor: tokens.primaryAction, borderColor: tokens.primaryAction },
            ]}>
            <Text
              style={[
                styles.chipLabel,
                { color: themeMode === mode ? tokens.appBackground : tokens.primaryText },
              ]}>
              {THEME_MODE_LABELS[mode]}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.row}>
        <Pressable onPress={simulateDaytime} style={[styles.chip, { borderColor: tokens.border }]}>
          <Text style={[styles.chipLabel, { color: tokens.primaryText }]}>Sim Day</Text>
        </Pressable>
        <Pressable onPress={simulateNighttime} style={[styles.chip, { borderColor: tokens.border }]}>
          <Text style={[styles.chipLabel, { color: tokens.primaryText }]}>Sim Night</Text>
        </Pressable>
        <Pressable onPress={clearSimulation} style={[styles.chip, { borderColor: tokens.border }]}>
          <Text style={[styles.chipLabel, { color: tokens.primaryText }]}>Clear Sim</Text>
        </Pressable>
        <Pressable onPress={runVerification} style={[styles.chip, { borderColor: tokens.border }]}>
          <Text style={[styles.chipLabel, { color: tokens.primaryText }]}>Verify</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    zIndex: 9999,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
  },
  meta: {
    fontFamily: Fonts.sans,
    fontSize: 11,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  chipLabel: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
  },
});
