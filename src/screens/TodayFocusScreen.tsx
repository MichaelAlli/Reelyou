import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/BottomNav';
import { TodayFocusCopy } from '@/constants/todayFocusCopy';
import { TabBarHeight, Fonts, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/onboarding';
import { getLocalDateKey } from '@/onboarding/personalization/todayFocus/dateKey';
import { TodayFocusEntryForm } from '@/components/today-focus/TodayFocusEntryForm';

export function TodayFocusScreen() {
  const router = useRouter();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const insets = useSafeAreaInsets();
  const tabInset = TabBarHeight + Math.max(insets.bottom, 8);
  const horizontalPad = Math.max(Spacing.lg, insets.left, insets.right, 20);
  const { todayFocus, hasTodayFocus, hasTodayFocusReflection } = useOnboarding();

  const hasFocusToday = useMemo(() => {
    return (
      hasTodayFocus &&
      todayFocus.dateKey === getLocalDateKey() &&
      Boolean(todayFocus.value?.trim())
    );
  }, [hasTodayFocus, todayFocus.dateKey, todayFocus.value]);

  const forceEdit = edit === '1';
  const showSaved = hasFocusToday && !forceEdit;

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home' as never);
  }, [router]);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#12182A', '#1A2240', '#141A2E']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={[styles.content, { paddingBottom: tabInset, paddingHorizontal: horizontalPad }]}>
          <Pressable onPress={handleBack} style={styles.back}>
            <Text style={styles.backText}>{TodayFocusCopy.back}</Text>
          </Pressable>

          {showSaved ? (
            <>
              <Text style={styles.title}>{TodayFocusCopy.title}</Text>
              <Text style={styles.status}>{TodayFocusCopy.savedForToday}</Text>
              <View style={styles.focusCard}>
                <Text style={styles.focusStatement}>{todayFocus.value}</Text>
              </View>
              <Pressable
                onPress={() => router.push('/today-focus-edit' as never)}
                style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>{TodayFocusCopy.editFocusCta}</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/today-focus-reflection' as never)}
                style={styles.secondaryLink}>
                <Text style={styles.secondaryLinkText}>
                  {hasTodayFocusReflection
                    ? TodayFocusCopy.reflectionLink
                    : TodayFocusCopy.reflectionLink}
                </Text>
              </Pressable>
            </>
          ) : (
            <TodayFocusEntryForm onSaved={handleBack} />
          )}
        </View>
      </SafeAreaView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070A' },
  safe: { flex: 1 },
  content: { flex: 1, paddingTop: Spacing.sm },
  back: { minHeight: 44, justifyContent: 'center' },
  backText: { fontFamily: Fonts.sans, fontSize: 15, fontWeight: '600', color: '#E8C872' },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 26,
    fontWeight: '600',
    color: '#FFF8F0',
    marginTop: 4,
    marginBottom: 6,
  },
  status: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(232, 200, 114, 0.72)',
    marginBottom: 12,
  },
  focusCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(10, 14, 34, 0.82)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(196, 168, 255, 0.35)',
    marginBottom: 20,
  },
  focusStatement: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    lineHeight: 28,
    color: '#FFF8F0',
  },
  primaryBtn: {
    alignSelf: 'center',
    maxWidth: 320,
    width: '100%',
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: 'rgba(232, 200, 114, 0.92)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primaryBtnText: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1028',
    textAlign: 'center',
  },
  secondaryLink: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 8,
  },
  secondaryLinkText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(196, 168, 255, 0.9)',
  },
});
