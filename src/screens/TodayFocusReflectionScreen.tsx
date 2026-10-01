import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlowButton } from '@/components/GlowButton';
import { TodayFocusCopy } from '@/constants/todayFocusCopy';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { MAX_TODAY_FOCUS_REFLECTION_LENGTH, useOnboarding } from '@/onboarding';

/** Approved Today’s Focus reflection form — celestial palette (matches TodayFocusEntryForm). */
export function TodayFocusReflectionScreen() {
  const router = useRouter();
  const { todayFocus, setTodayFocusReflection } = useOnboarding();
  const [text, setText] = useState(todayFocus.reflection ?? '');

  const canSave = text.trim().length > 0;

  const handleSave = useCallback(() => {
    if (!canSave) return;
    setTodayFocusReflection(text);
    router.back();
  }, [canSave, router, setTodayFocusReflection, text]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={TodayFocusCopy.reflectionCancel}
            onPress={() => router.back()}
            style={styles.back}>
            <Text style={styles.backText}>{TodayFocusCopy.back}</Text>
          </Pressable>

          <Text style={styles.title}>{TodayFocusCopy.reflectionTitle}</Text>
          <Text style={styles.prompt}>{TodayFocusCopy.reflectionPrompt}</Text>

          {todayFocus.value ? (
            <View style={styles.contextBlock} accessibilityRole="text">
              <Text style={styles.contextLabel}>{TodayFocusCopy.reflectionContextLabel}</Text>
              <Text style={styles.contextValue}>{todayFocus.value}</Text>
            </View>
          ) : null}

          <TextInput
            accessibilityLabel={TodayFocusCopy.reflectionPlaceholder}
            value={text}
            onChangeText={(value) => setText(value.slice(0, MAX_TODAY_FOCUS_REFLECTION_LENGTH))}
            placeholder={TodayFocusCopy.reflectionPlaceholder}
            placeholderTextColor="rgba(235, 228, 248, 0.42)"
            multiline
            maxLength={MAX_TODAY_FOCUS_REFLECTION_LENGTH}
            style={styles.input}
          />

          <View style={styles.footer}>
            <GlowButton
              label={TodayFocusCopy.reflectionSaveCta}
              onPress={handleSave}
              disabled={!canSave}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={TodayFocusCopy.reflectionCancel}
              onPress={() => router.back()}
              style={styles.cancelBtn}>
              <Text style={styles.cancelText}>{TodayFocusCopy.reflectionCancel}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#070818',
  },
  keyboard: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  back: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    minHeight: 44,
    justifyContent: 'center',
  },
  backText: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: '#E8C872',
    fontWeight: '600',
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    fontWeight: '600',
    color: '#FFF8F0',
    marginTop: Spacing.sm,
    letterSpacing: -0.3,
  },
  prompt: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(248, 244, 236, 0.82)',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  contextBlock: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.28)',
    backgroundColor: 'rgba(12, 10, 28, 0.55)',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    gap: 4,
  },
  contextLabel: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#E8C872',
    textTransform: 'uppercase',
  },
  contextValue: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: '#FFF8F0',
  },
  input: {
    backgroundColor: 'rgba(12, 16, 36, 0.72)',
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(196, 168, 255, 0.32)',
    padding: Spacing.md,
    minHeight: 140,
    color: '#FFF8F0',
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 22,
    textAlignVertical: 'top',
    marginBottom: Spacing.lg,
  },
  footer: {
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(248, 244, 236, 0.55)',
  },
});
