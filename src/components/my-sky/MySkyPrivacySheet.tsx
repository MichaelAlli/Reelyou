import { memo, useCallback } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

interface MySkyPrivacySheetProps {
  visible: boolean;
  settings: SkyVisibilitySettings;
  onClose: () => void;
  onChange: (settings: SkyVisibilitySettings) => void;
}

const LEVELS: SkyVisibilityLevel[] = ['private', 'orbit', 'public'];

const OVERRIDE_KEYS: Array<{
  key: keyof SkyContentVisibilityOverrides;
  label: string;
}> = [
  { key: 'communities', label: MySkyCopy.privacyOverrideCommunities },
  { key: 'connections', label: MySkyCopy.privacyOverrideConnections },
  { key: 'impact', label: MySkyCopy.privacyOverrideImpact },
];

interface PrivacySheetStyles {
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
  sheetStyles: PrivacySheetStyles;
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

function MySkyPrivacySheetComponent({
  visible,
  settings,
  onClose,
  onChange,
}: MySkyPrivacySheetProps) {
  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      backdrop: {
        flex: 1,
        backgroundColor: 'rgba(4, 6, 16, 0.72)',
        justifyContent: 'flex-end',
      },
      sheet: {
        maxHeight: '88%',
        borderTopLeftRadius: Radius.xl,
        borderTopRightRadius: Radius.xl,
        backgroundColor: 'rgba(10, 12, 28, 0.98)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(167, 139, 250, 0.22)',
      },
      header: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.sm,
        gap: 4,
      },
      title: {
        fontFamily: Fonts.serif,
        fontSize: 22,
        fontWeight: '600',
        color: tokens.primaryText,
      },
      subtitle: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        lineHeight: 18,
        color: tokens.secondaryText,
      },
      scroll: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xl,
        gap: Spacing.lg,
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
      closeRow: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
      },
      closeBtn: {
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
      },
      closeText: {
        fontFamily: Fonts.sans,
        fontSize: 15,
        fontWeight: '600',
        color: tokens.gold,
      },
    }),
  );

  const pickerStyles: PrivacySheetStyles = {
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
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <SafeAreaView edges={['bottom']}>
            <View style={styles.header}>
              <Text style={styles.title}>{MySkyCopy.privacyTitle}</Text>
              <Text style={styles.subtitle}>{MySkyCopy.privacySubtitle}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
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
            </ScrollView>

            <View style={styles.closeRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={MySkyCopy.searchClose}
                onPress={onClose}
                style={styles.closeBtn}>
                <Text style={styles.closeText}>{MySkyCopy.searchClose}</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export const MySkyPrivacySheet = memo(MySkyPrivacySheetComponent);
