import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';

import { MySkyCopy } from '@/constants/mySkyCopy';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import {
  SKY_VISIBILITY_ICONS,
  SKY_VISIBILITY_LABELS,
  type SkyContentVisibilityOverrides,
  type SkyVisibilityLevel,
  type SkyVisibilitySettings,
} from '@/mySky/skyVisibilitySettings';
import { useThemedStyles } from '@/theme/useTheme';

const LEVELS: SkyVisibilityLevel[] = ['private', 'orbit', 'public'];

const OVERRIDE_KEYS: Array<{
  key: keyof SkyContentVisibilityOverrides;
  label: string;
}> = [
  { key: 'communities', label: MySkyCopy.privacyOverrideCommunities },
  { key: 'connections', label: MySkyCopy.privacyOverrideConnections },
  { key: 'impact', label: MySkyCopy.privacyOverrideImpact },
];

interface PrivacyControlsStyles {
  levelRow: ViewStyle;
  levelChip: ViewStyle;
  levelChipActive: ViewStyle;
  levelIcon: TextStyle;
  levelLabel: TextStyle;
  levelLabelActive: TextStyle;
}

function LevelPicker({
  value,
  onSelect,
  sheetStyles,
}: {
  value: SkyVisibilityLevel;
  onSelect: (level: SkyVisibilityLevel) => void;
  sheetStyles: PrivacyControlsStyles;
}) {
  return (
    <View style={sheetStyles.levelRow}>
      {LEVELS.map((level) => {
        const active = value === level;
        return (
          <Pressable
            key={level}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${SKY_VISIBILITY_LABELS[level]} visibility`}
            onPress={() => onSelect(level)}
            style={[sheetStyles.levelChip, active && sheetStyles.levelChipActive]}>
            <Text style={sheetStyles.levelIcon}>{SKY_VISIBILITY_ICONS[level]}</Text>
            <Text style={[sheetStyles.levelLabel, active && sheetStyles.levelLabelActive]}>
              {SKY_VISIBILITY_LABELS[level]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

interface MySkyPrivacyControlsProps {
  settings: SkyVisibilitySettings;
  onChange: (settings: SkyVisibilitySettings) => void;
}

function MySkyPrivacyControlsComponent({ settings, onChange }: MySkyPrivacyControlsProps) {
  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      root: {
        gap: Spacing.lg,
        paddingBottom: Spacing.md,
      },
      section: {
        gap: Spacing.sm,
      },
      sectionTitle: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        color: tokens.gold,
      },
      sectionHint: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        lineHeight: 17,
        color: tokens.mutedText,
      },
      levelRow: {
        flexDirection: 'row',
        gap: 8,
      },
      levelChip: {
        flex: 1,
        minHeight: 56,
        borderRadius: Radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(167, 139, 250, 0.2)',
        backgroundColor: 'rgba(8, 10, 26, 0.55)',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingHorizontal: 6,
        paddingVertical: 8,
      },
      levelChipActive: {
        borderColor: 'rgba(232, 200, 114, 0.45)',
        backgroundColor: 'rgba(232, 200, 114, 0.1)',
      },
      levelIcon: {
        fontSize: 14,
      },
      levelLabel: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        fontWeight: '600',
        color: tokens.secondaryText,
        textAlign: 'center',
      },
      levelLabelActive: {
        color: tokens.gold,
      },
      overrideRow: {
        gap: 6,
        paddingTop: 4,
      },
      overrideLabel: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        color: tokens.primaryText,
      },
    }),
  );

  const pickerStyles: PrivacyControlsStyles = {
    levelRow: styles.levelRow,
    levelChip: styles.levelChip,
    levelChipActive: styles.levelChipActive,
    levelIcon: styles.levelIcon,
    levelLabel: styles.levelLabel,
    levelLabelActive: styles.levelLabelActive,
  };

  const setSkyVisibility = useCallback(
    (skyVisibility: SkyVisibilityLevel) => {
      onChange({ ...settings, skyVisibility });
    },
    [onChange, settings],
  );

  const setDefaultVisibility = useCallback(
    (defaultVisibility: SkyVisibilityLevel) => {
      onChange({ ...settings, defaultVisibility });
    },
    [onChange, settings],
  );

  const setOverride = useCallback(
    (key: keyof SkyContentVisibilityOverrides, level: SkyVisibilityLevel) => {
      onChange({
        ...settings,
        contentOverrides: { ...settings.contentOverrides, [key]: level },
      });
    },
    [onChange, settings],
  );

  return (
    <View style={styles.root}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{MySkyCopy.privacySkyVisibility}</Text>
        <Text style={styles.sectionHint}>{MySkyCopy.privacySkyVisibilityHint}</Text>
        <LevelPicker
          value={settings.skyVisibility}
          onSelect={setSkyVisibility}
          sheetStyles={pickerStyles}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{MySkyCopy.privacyDefaultVisibility}</Text>
        <Text style={styles.sectionHint}>{MySkyCopy.privacyDefaultVisibilityHint}</Text>
        <LevelPicker
          value={settings.defaultVisibility}
          onSelect={setDefaultVisibility}
          sheetStyles={pickerStyles}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{MySkyCopy.privacyOverridesTitle}</Text>
        <Text style={styles.sectionHint}>{MySkyCopy.privacyOverridesHint}</Text>
        {OVERRIDE_KEYS.map(({ key, label }) => (
          <View key={key} style={styles.overrideRow}>
            <Text style={styles.overrideLabel}>{label}</Text>
            <LevelPicker
              value={settings.contentOverrides[key] ?? settings.defaultVisibility}
              onSelect={(level) => setOverride(key, level)}
              sheetStyles={pickerStyles}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

export const MySkyPrivacyControls = memo(MySkyPrivacyControlsComponent);
