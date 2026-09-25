import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/BottomNav';
import { buildGrowthAreaExperience } from '@/growthAreas/buildGrowthAreaExperience';
import { useHumanPotentialMetrics } from '@/humanPotential/HumanPotentialMetricsProvider';
import { useOnboarding } from '@/onboarding';
import { Fonts, Spacing, TabBarHeight } from '@/constants/theme';
import type { SkyAreaCategoryId } from '@/skyAreas/skyAreaCategory';
import { getSkyAreaCategory } from '@/skyAreas/skyAreaCategory';

function SectionBlock({
  title,
  items,
}: {
  title: string;
  items: Array<{ id: string; title: string; body: string; meta?: string }>;
}) {
  return (
    <View style={styles.sectionBlock}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardBody}>{item.body}</Text>
          {item.meta ? <Text style={styles.cardMeta}>{item.meta}</Text> : null}
        </View>
      ))}
    </View>
  );
}

export function GrowthAreaScreen() {
  const router = useRouter();
  const { skyAreaId: rawId } = useLocalSearchParams<{ skyAreaId?: string }>();
  const skyAreaId = (rawId ? decodeURIComponent(rawId) : 'growth') as SkyAreaCategoryId;
  const insets = useSafeAreaInsets();
  const tabInset = TabBarHeight + Math.max(insets.bottom, 8);
  const { skywrites, todayFocus } = useOnboarding();
  const { state: metrics } = useHumanPotentialMetrics();

  const view = useMemo(
    () =>
      buildGrowthAreaExperience({
        skyAreaId,
        skywrites,
        applicationEvidence: metrics.applicationEvidence,
        todayFocusValue: todayFocus.value,
      }),
    [metrics.applicationEvidence, skyAreaId, skywrites, todayFocus.value],
  );

  const category = getSkyAreaCategory(skyAreaId);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home' as never);
  }, [router]);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#12182A', '#1A2240', '#141A2E']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: tabInset }]}
          showsVerticalScrollIndicator={false}>
          <Pressable onPress={handleBack} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>{category.label}</Text>
          <Text style={styles.subtitle}>{view.subtitle}</Text>

          {view.todayFocusNote ? (
            <View style={styles.linkCard}>
              <Text style={styles.linkLabel}>Today&apos;s Focus</Text>
              <Text style={styles.linkBody}>{view.todayFocusNote}</Text>
            </View>
          ) : null}

          <SectionBlock title="Your journey here" items={view.journey} />
          <SectionBlock title="What you’re learning" items={view.learning} />
          <SectionBlock title="How you’re applying it" items={view.application} />
          <SectionBlock title="Recent reflections" items={view.reflections} />
          <SectionBlock title="Support & contribution" items={view.support} />

          <Text style={styles.footerNote}>
            This is your personal growth space — not a community feed. Like-hearted groups emerge
            separately when meaningful patterns support them.
          </Text>
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
    fontSize: 30,
    fontWeight: '600',
    color: '#FFF8F0',
    marginTop: 8,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(248, 244, 236, 0.72)',
    marginBottom: 16,
  },
  linkCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    backgroundColor: 'rgba(124, 92, 191, 0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(196, 168, 255, 0.28)',
  },
  linkLabel: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    color: '#E8C872',
    marginBottom: 4,
  },
  linkBody: { fontFamily: Fonts.sans, fontSize: 13, lineHeight: 18, color: '#FFF8F0' },
  sectionBlock: { marginBottom: 18, gap: 8 },
  sectionTitle: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: 'rgba(248, 244, 236, 0.55)',
    marginBottom: 4,
  },
  card: {
    borderRadius: 14,
    padding: 12,
    backgroundColor: 'rgba(10, 14, 34, 0.78)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.18)',
    gap: 4,
  },
  cardTitle: { fontFamily: Fonts.sans, fontSize: 14, fontWeight: '700', color: '#FFF8F0' },
  cardBody: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(248, 244, 236, 0.78)',
  },
  cardMeta: { fontFamily: Fonts.sans, fontSize: 11, color: 'rgba(248, 244, 236, 0.45)' },
  footerNote: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(248, 244, 236, 0.55)',
    marginTop: 8,
    marginBottom: 12,
  },
});
