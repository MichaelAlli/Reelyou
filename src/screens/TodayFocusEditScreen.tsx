import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { GlowButton } from '@/components/GlowButton';
import { ScreenLayout } from '@/components/ScreenLayout';
import { TodayFocusSuggestionChip } from '@/components/today-focus/TodayFocusSuggestionChip';
import { TodayFocusCopy } from '@/constants/todayFocusCopy';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { MAX_TODAY_FOCUS_LENGTH, useOnboarding } from '@/onboarding';
import { useThemedStyles } from '@/theme/useTheme';

export function TodayFocusEditScreen() {
  const router = useRouter();
  const {
    todayFocus,
    todayFocusSuggestions,
    setTodayFocus,
    clearTodayFocus,
    hasTodayFocus,
  } = useOnboarding();

  const initialSelection = todayFocus.value ?? '';
  const initialCustom =
    todayFocus.source === 'custom' ? todayFocus.value ?? '' : '';

  const [selectedSuggestion, setSelectedSuggestion] = useState(initialSelection);
  const [customText, setCustomText] = useState(initialCustom);
  const [mode, setMode] = useState<'suggested' | 'custom'>(
    todayFocus.source === 'custom' ? 'custom' : 'suggested',
  );

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      back: {
        marginTop: Spacing.sm,
        marginBottom: Spacing.xs,
      },
      backText: {
        fontFamily: Fonts.sans,
        fontSize: 15,
        color: tokens.gold,
        fontWeight: '600',
      },
      title: {
        fontFamily: Fonts.serif,
        fontSize: 28,
        fontWeight: '600',
        color: tokens.primaryText,
        marginTop: Spacing.sm,
        letterSpacing: -0.3,
      },
      subtitle: {
        fontFamily: Fonts.sans,
        fontSize: 15,
        lineHeight: 22,
        color: tokens.secondaryText,
        marginBottom: Spacing.lg,
      },
      sectionTitle: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        fontWeight: '700',
        color: tokens.gold,
        letterSpacing: 0.4,
        marginBottom: Spacing.xs,
      },
      sectionNote: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        lineHeight: 17,
        color: tokens.mutedText,
        marginBottom: Spacing.sm,
      },
      suggestions: {
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
      },
      input: {
        backgroundColor: tokens.inputBackground,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: tokens.border,
        padding: Spacing.md,
        minHeight: 96,
        color: tokens.inputText,
        fontFamily: Fonts.sans,
        fontSize: 16,
        lineHeight: 22,
        textAlignVertical: 'top',
        marginBottom: Spacing.lg,
      },
      footer: {
        gap: Spacing.sm,
        marginTop: Spacing.sm,
      },
      clearBtn: {
        alignItems: 'center',
        paddingVertical: Spacing.sm,
      },
      clearText: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        fontWeight: '600',
        color: tokens.mutedText,
      },
    }),
  );

  const resolvedValue = useMemo(() => {
    if (mode === 'custom') {
      return customText.trim();
    }
    return selectedSuggestion.trim();
  }, [customText, mode, selectedSuggestion]);

  const canSave = resolvedValue.length > 0;

  const handleSelectSuggestion = useCallback((label: string) => {
    setMode('suggested');
    setSelectedSuggestion(label);
    setCustomText('');
  }, []);

  const handleCustomChange = useCallback((text: string) => {
    setMode('custom');
    setCustomText(text.slice(0, MAX_TODAY_FOCUS_LENGTH));
    setSelectedSuggestion('');
  }, []);

  const handleSave = useCallback(() => {
    if (!canSave) return;
    setTodayFocus(resolvedValue, mode);
    router.back();
  }, [canSave, mode, resolvedValue, router, setTodayFocus]);

  const handleClear = useCallback(() => {
    clearTodayFocus();
    setSelectedSuggestion('');
    setCustomText('');
    setMode('suggested');
    router.back();
  }, [clearTodayFocus, router]);

  return (
    <ScreenLayout>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>{TodayFocusCopy.back}</Text>
      </Pressable>

      <Text style={styles.title}>{TodayFocusCopy.title}</Text>
      <Text style={styles.subtitle}>{TodayFocusCopy.subtitle}</Text>

      <Text style={styles.sectionTitle}>{TodayFocusCopy.suggestionsTitle}</Text>
      <Text style={styles.sectionNote}>{TodayFocusCopy.suggestionsNote}</Text>
      <View style={styles.suggestions}>
        {todayFocusSuggestions.map((suggestion) => (
          <TodayFocusSuggestionChip
            key={suggestion}
            label={suggestion}
            selected={mode === 'suggested' && selectedSuggestion === suggestion}
            onPress={() => handleSelectSuggestion(suggestion)}
          />
        ))}
      </View>

      <Text style={styles.sectionTitle}>{TodayFocusCopy.customTitle}</Text>
      <TextInput
        value={customText}
        onChangeText={handleCustomChange}
        placeholder={TodayFocusCopy.customPlaceholder}
        placeholderTextColor="rgba(235, 228, 248, 0.42)"
        multiline
        maxLength={MAX_TODAY_FOCUS_LENGTH}
        style={styles.input}
      />

      <View style={styles.footer}>
        <GlowButton
          label={TodayFocusCopy.setFocusCta}
          onPress={handleSave}
          disabled={!canSave}
        />
        {hasTodayFocus ? (
          <Pressable onPress={handleClear} style={styles.clearBtn}>
            <Text style={styles.clearText}>{TodayFocusCopy.clearFocusCta}</Text>
          </Pressable>
        ) : null}
      </View>
    </ScreenLayout>
  );
}
