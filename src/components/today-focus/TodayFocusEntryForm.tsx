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

import { TodayFocusSuggestionChip } from '@/components/today-focus/TodayFocusSuggestionChip';
import { TodayFocusCopy } from '@/constants/todayFocusCopy';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { MAX_TODAY_FOCUS_LENGTH, useOnboarding } from '@/onboarding';

interface TodayFocusEntryFormProps {
  onSaved?: () => void;
  showTitle?: boolean;
}

export function TodayFocusEntryForm({ onSaved, showTitle = true }: TodayFocusEntryFormProps) {
  const { todayFocus, todayFocusSuggestions, setTodayFocus, clearTodayFocus, hasTodayFocus } =
    useOnboarding();

  const [customText, setCustomText] = useState(
    todayFocus.source === 'custom' ? todayFocus.value ?? '' : '',
  );
  const [selectedSuggestion, setSelectedSuggestion] = useState(
    todayFocus.source === 'suggested' ? todayFocus.value ?? '' : '',
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const resolvedValue = useMemo(() => {
    const custom = customText.trim();
    if (custom) return custom;
    return selectedSuggestion.trim();
  }, [customText, selectedSuggestion]);

  const suggestionChips = useMemo(
    () => todayFocusSuggestions.slice(0, 4),
    [todayFocusSuggestions],
  );

  const handleSave = useCallback(() => {
    if (!resolvedValue || isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    const source = customText.trim() ? ('custom' as const) : ('suggested' as const);
    void setTodayFocus(resolvedValue, source).then((saved) => {
      setIsSaving(false);
      if (!saved) {
        setSaveError(TodayFocusCopy.saveError);
        return;
      }
      onSaved?.();
    });
  }, [customText, isSaving, onSaved, resolvedValue, setTodayFocus]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        {showTitle ? <Text style={styles.title}>{TodayFocusCopy.title}</Text> : null}
        <Text style={styles.prompt}>{TodayFocusCopy.prompt}</Text>

        <TextInput
          value={customText}
          onChangeText={(text) => {
            setCustomText(text.slice(0, MAX_TODAY_FOCUS_LENGTH));
            setSaveError(null);
          }}
          placeholder={TodayFocusCopy.inputPlaceholder}
          placeholderTextColor="rgba(235, 228, 248, 0.42)"
          multiline
          maxLength={MAX_TODAY_FOCUS_LENGTH}
          style={styles.input}
        />

        {suggestionChips.length > 0 ? (
          <View style={styles.chips}>
            {suggestionChips.map((suggestion) => (
              <TodayFocusSuggestionChip
                key={suggestion}
                label={suggestion}
                selected={!customText.trim() && selectedSuggestion === suggestion}
                onPress={() => {
                  setSelectedSuggestion(suggestion);
                  setCustomText('');
                  setSaveError(null);
                }}
              />
            ))}
          </View>
        ) : null}

        {saveError ? <Text style={styles.error}>{saveError}</Text> : null}

        <Pressable
          onPress={handleSave}
          disabled={!resolvedValue || isSaving}
          style={({ pressed }) => [
            styles.primaryBtn,
            (!resolvedValue || isSaving) && styles.primaryBtnDisabled,
            pressed && resolvedValue && !isSaving && styles.pressed,
          ]}>
          <Text style={styles.primaryBtnText}>{TodayFocusCopy.saveFocusCta}</Text>
        </Pressable>

        {hasTodayFocus ? (
          <Pressable
            onPress={() => {
              clearTodayFocus();
              setCustomText('');
              setSelectedSuggestion('');
            }}
            style={styles.clearBtn}>
            <Text style={styles.clearText}>{TodayFocusCopy.clearFocusCta}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: Spacing.xl, gap: 12 },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 26,
    fontWeight: '600',
    color: '#FFF8F0',
  },
  prompt: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 21,
    color: 'rgba(248, 244, 236, 0.82)',
  },
  input: {
    backgroundColor: 'rgba(12, 16, 36, 0.72)',
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(196, 168, 255, 0.32)',
    padding: Spacing.md,
    minHeight: 96,
    color: '#FFF8F0',
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  chips: { gap: 8 },
  error: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: '#E8A0A0',
    textAlign: 'center',
  },
  primaryBtn: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 320,
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: 'rgba(232, 200, 114, 0.92)',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 4,
  },
  primaryBtnDisabled: { opacity: 0.45 },
  primaryBtnText: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1028',
    textAlign: 'center',
  },
  pressed: { opacity: 0.92 },
  clearBtn: { alignItems: 'center', paddingVertical: 10 },
  clearText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(248, 244, 236, 0.55)',
  },
});
