import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/BottomNav';
import { GlowButton } from '@/components/GlowButton';
import { TodayFocusExperienceCopy } from '@/constants/todayFocusExperienceCopy';
import { TabBarHeight, Fonts, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/onboarding';
import { getLocalDateKey } from '@/onboarding/personalization/todayFocus/dateKey';
import { TodayFocusResourcesSection } from '@/components/today-focus/TodayFocusResourcesSection';
import { dismissTodayFocusForDateKey, isTodayFocusDismissed } from '@/todayFocus/todayFocusSession';

export function TodayFocusScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabInset = TabBarHeight + Math.max(insets.bottom, 8);
  const {
    todayFocus,
    todayFocusSuggestions,
    personalizationProfile,
    setTodayFocus,
    hasTodayFocusReflection,
    hasTodayFocus,
  } = useOnboarding();

  const dateKey = getLocalDateKey();
  const dismissed = isTodayFocusDismissed(dateKey);

  const focusStatement = useMemo(() => {
    if (todayFocus.value) return todayFocus.value;
    return todayFocusSuggestions[0] ?? TodayFocusExperienceCopy.emptyTitle;
  }, [todayFocus.value, todayFocusSuggestions]);

  const whyMatters = useMemo(() => {
    if (todayFocus.source === 'custom') {
      return 'You chose this in your own words — it reflects what matters to you right now.';
    }
    return 'This suggestion draws from your StarPath, Sky Areas, and recent meaningful choices — never as a score to keep.';
  }, [todayFocus.source]);

  const oneStep = useMemo(() => {
    return 'Take one small, honest step — even five minutes counts.';
  }, []);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home' as never);
  }, [router]);

  const handleAccept = useCallback(() => {
    if (!todayFocus.value && focusStatement) {
      setTodayFocus(focusStatement, 'suggested');
    }
  }, [focusStatement, setTodayFocus, todayFocus.value]);

  const handleDismiss = useCallback(() => {
    dismissTodayFocusForDateKey(dateKey);
    handleBack();
  }, [dateKey, handleBack]);

  if (dismissed) {
    return (
      <View style={styles.root}>
        <LinearGradient colors={['#12182A', '#1A2240', '#141A2E']} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={[styles.safe, { paddingBottom: tabInset }]}>
          <Pressable onPress={handleBack} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>{TodayFocusExperienceCopy.screenTitle}</Text>
          <Text style={styles.body}>You set this aside for today. You can choose a new focus anytime.</Text>
          <GlowButton
            label={TodayFocusExperienceCopy.setFocusCta}
            onPress={() => router.push('/today-focus-edit' as never)}
          />
        </SafeAreaView>
        <BottomNav />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#12182A', '#1A2240', '#141A2E']} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(124, 92, 191, 0.12)', 'transparent', 'rgba(232, 200, 114, 0.08)']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: tabInset }]}
          showsVerticalScrollIndicator={false}>
          <Pressable onPress={handleBack} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>{TodayFocusExperienceCopy.screenTitle}</Text>
          <View style={styles.focusCard}>
            <Text style={styles.focusStatement}>{focusStatement}</Text>
          </View>
          <Text style={styles.guide}>{TodayFocusExperienceCopy.guideNote}</Text>

          <Text style={styles.section}>{TodayFocusExperienceCopy.whyTitle}</Text>
          <Text style={styles.body}>{whyMatters}</Text>

          <Text style={styles.section}>{TodayFocusExperienceCopy.oneStepTitle}</Text>
          <Text style={styles.body}>{oneStep}</Text>

          {hasTodayFocus ? <TodayFocusResourcesSection /> : null}

          <Text style={styles.section}>{TodayFocusExperienceCopy.reflectTitle}</Text>
          <Pressable
            onPress={() => router.push('/today-focus-reflection' as never)}
            style={styles.reflectLink}>
            <Text style={styles.reflectText}>
              {hasTodayFocusReflection
                ? 'View or update your reflection'
                : TodayFocusExperienceCopy.reflectCta}
            </Text>
          </Pressable>

          <View style={styles.actions}>
            <GlowButton label={TodayFocusExperienceCopy.accept} onPress={handleAccept} />
            <Pressable
              onPress={() => router.push('/today-focus-edit' as never)}
              style={styles.secondary}>
              <Text style={styles.secondaryText}>{TodayFocusExperienceCopy.chooseAnother}</Text>
            </Pressable>
            <Pressable onPress={handleDismiss} style={styles.secondary}>
              <Text style={styles.secondaryMuted}>{TodayFocusExperienceCopy.dismissToday}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070A' },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.lg },
  back: { minHeight: 44, justifyContent: 'center', marginTop: Spacing.sm },
  backText: { fontFamily: Fonts.sans, fontSize: 15, fontWeight: '600', color: '#E8C872' },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 32,
    fontWeight: '600',
    color: '#FFF8F0',
    marginTop: 8,
    marginBottom: 16,
  },
  focusCard: {
    borderRadius: 18,
    padding: 18,
    backgroundColor: 'rgba(10, 14, 34, 0.82)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(196, 168, 255, 0.35)',
    marginBottom: 12,
  },
  focusStatement: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    lineHeight: 30,
    color: '#FFF8F0',
  },
  guide: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(248, 244, 236, 0.68)',
    marginBottom: 20,
  },
  section: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#E8C872',
    marginTop: 12,
    marginBottom: 6,
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(248, 244, 236, 0.82)',
  },
  reflectLink: { minHeight: 44, justifyContent: 'center' },
  reflectText: { fontFamily: Fonts.sans, fontSize: 14, fontWeight: '600', color: '#C4B5FD' },
  actions: { marginTop: 28, gap: 12 },
  secondary: { alignItems: 'center', paddingVertical: 10 },
  secondaryText: { fontFamily: Fonts.sans, fontSize: 14, fontWeight: '600', color: '#E8C872' },
  secondaryMuted: { fontFamily: Fonts.sans, fontSize: 13, color: 'rgba(248, 244, 236, 0.55)' },
});
