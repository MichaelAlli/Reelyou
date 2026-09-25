import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/BottomNav';
import { GlowButton } from '@/components/GlowButton';
import { TodayFocusSuggestionChip } from '@/components/today-focus/TodayFocusSuggestionChip';
import { TodayFocusCopy } from '@/constants/todayFocusCopy';
import { Fonts, Radius, Spacing, TabBarHeight } from '@/constants/theme';
import { MAX_TODAY_FOCUS_LENGTH, useOnboarding } from '@/onboarding';

export function TodayFocusEditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabInset = TabBarHeight + Math.max(insets.bottom, 8);
  const {
    todayFocus,
    todayFocusSuggestions,
    setTodayFocus,
    clearTodayFocus,
    hasTodayFocus,
    personalizationProfile,
  } = useOnboarding();

  const initialSelection = todayFocus.value ?? '';
  const initialCustom = todayFocus.source === 'custom' ? todayFocus.value ?? '' : '';

  const [selectedSuggestion, setSelectedSuggestion] = useState(initialSelection);
  const [customText, setCustomText] = useState(initialCustom);
  const [mode, setMode] = useState<'suggested' | 'custom'>(
    todayFocus.source === 'custom' ? 'custom' : 'suggested',
  );
  const [savedNotice, setSavedNotice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const resolvedValue = useMemo(() => {
    if (mode === 'custom') return customText.trim();
    return selectedSuggestion.trim();
  }, [customText, mode, selectedSuggestion]);

  const canSave = resolvedValue.length > 0;

  const connectedAreaLabel = useMemo(() => {
    const priority = personalizationProfile.growthPriorities[0];
    return priority?.trim() || null;
  }, [personalizationProfile.growthPriorities]);

  const handleSelectSuggestion = useCallback((label: string) => {
    setMode('suggested');
    setSelectedSuggestion(label);
    setCustomText('');
    setSavedNotice(false);
  }, []);

  const handleCustomChange = useCallback((text: string) => {
    setMode('custom');
    setCustomText(text.slice(0, MAX_TODAY_FOCUS_LENGTH));
    setSelectedSuggestion('');
    setSavedNotice(false);
  }, []);

  const handleSave = useCallback(() => {
    if (!canSave || isSaving) return;
    setIsSaving(true);
    setTodayFocus(resolvedValue, mode);
    setSavedNotice(true);
    setTimeout(() => {
      setIsSaving(false);
      if (router.canGoBack()) router.back();
      else router.replace('/(tabs)/home' as never);
    }, 900);
  }, [canSave, isSaving, mode, resolvedValue, router, setTodayFocus]);

  const handleClear = useCallback(() => {
    clearTodayFocus();
    setSelectedSuggestion('');
    setCustomText('');
    setMode('suggested');
    router.back();
  }, [clearTodayFocus, router]);

  const displayFocus =
    mode === 'custom' ? customText.trim() : selectedSuggestion.trim() || todayFocusSuggestions[0];

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0B1024', '#141B38', '#0E1428']} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(124, 92, 191, 0.14)', 'transparent', 'rgba(232, 200, 114, 0.1)']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.scroll, { paddingBottom: tabInset }]}
            showsVerticalScrollIndicator={false}>
            <Pressable onPress={() => router.back()} style={styles.back}>
              <Text style={styles.backText}>{TodayFocusCopy.back}</Text>
            </Pressable>

            <Text style={styles.title}>{TodayFocusCopy.title}</Text>
            <Text style={styles.subtitle}>{TodayFocusCopy.subtitle}</Text>

            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>YOUR FOCUS</Text>
              <Text style={styles.heroValue}>{displayFocus || 'Choose one intention below'}</Text>
              {connectedAreaLabel ? (
                <Text style={styles.heroContext}>Connected to: {connectedAreaLabel}</Text>
              ) : null}
            </View>

            <Text style={styles.sectionTitle}>{TodayFocusCopy.suggestionsTitle}</Text>
            <Text style={styles.sectionNote}>{TodayFocusCopy.suggestionsGuideNote}</Text>
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
            <Text style={styles.customSub}>{TodayFocusCopy.customSubtext}</Text>
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
              {savedNotice ? (
                <Text style={styles.confirmation}>{TodayFocusCopy.savedConfirmation}</Text>
              ) : null}
              <GlowButton
                label={TodayFocusCopy.setFocusCtaPrimary}
                onPress={handleSave}
                disabled={!canSave || isSaving}
              />
              {hasTodayFocus ? (
                <Pressable onPress={handleClear} style={styles.clearBtn}>
                  <Text style={styles.clearText}>{TodayFocusCopy.clearFocusCta}</Text>
                </Pressable>
              ) : null}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070A' },
  flex: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.lg },
  back: { minHeight: 44, justifyContent: 'center', marginTop: Spacing.sm },
  backText: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: '#E8C872',
    fontWeight: '600',
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 30,
    fontWeight: '600',
    color: '#FFF8F0',
    marginTop: Spacing.sm,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(248, 244, 236, 0.78)',
    marginBottom: Spacing.lg,
  },
  heroCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: Spacing.lg,
    backgroundColor: 'rgba(10, 14, 34, 0.78)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(196, 168, 255, 0.38)',
    shadowColor: '#7C5CBF',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    gap: 8,
  },
  heroLabel: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#E8C872',
  },
  heroValue: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    lineHeight: 30,
    color: '#FFF8F0',
  },
  heroContext: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(196, 168, 255, 0.9)',
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    color: '#E8C872',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionNote: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(248, 244, 236, 0.62)',
    marginBottom: Spacing.sm,
  },
  customSub: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(248, 244, 236, 0.62)',
    marginBottom: Spacing.sm,
  },
  suggestions: { gap: Spacing.sm, marginBottom: Spacing.lg },
  input: {
    backgroundColor: 'rgba(12, 16, 36, 0.72)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(196, 168, 255, 0.32)',
    padding: Spacing.md,
    minHeight: 108,
    color: '#FFF8F0',
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 22,
    textAlignVertical: 'top',
    marginBottom: Spacing.lg,
  },
  footer: { gap: Spacing.sm, marginTop: Spacing.sm },
  confirmation: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: '#C4B5FD',
    textAlign: 'center',
    marginBottom: 4,
  },
  clearBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  clearText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(248, 244, 236, 0.55)',
  },
});
