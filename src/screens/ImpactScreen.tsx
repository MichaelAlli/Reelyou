import { ImageBackground } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ImpactPremiumMetricCard } from '@/components/impact/ImpactPremiumMetricCard';
import { ImpactRippleMomentRow } from '@/components/impact/ImpactRippleMomentRow';
import { ImpactSupportBanner } from '@/components/impact/ImpactSupportBanner';
import { ImpactTopHeader } from '@/components/impact/ImpactTopHeader';
import { rippleGlass } from '@/components/legacy/ripple/rippleGlass';
import {
  IMPACT_METRIC_DESCRIPTIONS,
  ImpactCopy,
} from '@/constants/impactCopy';
import { RippleLakeBackground } from '@/constants/rippleAssets';
import { Fonts, Spacing, TabBarHeight } from '@/constants/theme';
import { useLegacyRippleViewModel } from '@/legacy/useLegacyRippleViewModel';
import { useQaPreviewMode } from '@/qa/QaPreviewContext';

export function ImpactScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 393);
  const bottomInset = TabBarHeight + Math.max(insets.bottom, Spacing.sm);

  const { model, isLoaded, ownerUserId } = useLegacyRippleViewModel();
  const qaPreview = useQaPreviewMode();
  const showPreviewHint = qaPreview.active && !ownerUserId;

  const hasAnyMetric = useMemo(
    () => model.heroMetrics.some((metric) => metric.value > 0),
    [model.heroMetrics],
  );

  return (
    <View style={styles.root}>
      <ImageBackground source={RippleLakeBackground} style={StyleSheet.absoluteFill} contentFit="cover" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset }]}
          bounces={false}>
          <View style={[styles.content, { width: contentWidth }]}>
            <ImpactTopHeader />

            <Text style={styles.heroTitle}>{ImpactCopy.heroTitle}</Text>
            <Text style={styles.heroSubtitle}>{ImpactCopy.heroSubtitle}</Text>
            <View style={[rippleGlass.pill, styles.heroPill]}>
              <Text style={styles.heroPillText}>♥  {ImpactCopy.heroPill}</Text>
            </View>

            {showPreviewHint ? (
              <Text style={styles.previewHint}>{ImpactCopy.previewMetricsHint}</Text>
            ) : null}

            {!isLoaded ? (
              <ActivityIndicator style={styles.loader} color="#8B6FD4" />
            ) : (
              <>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.metricsRow}
                  decelerationRate="fast"
                  snapToInterval={168 + Spacing.sm}>
                  {model.heroMetrics.map((metric) => (
                    <ImpactPremiumMetricCard
                      key={metric.key}
                      metric={metric}
                      description={
                        IMPACT_METRIC_DESCRIPTIONS[metric.key] ??
                        'Meaningful impact you have created in the Reelyou community.'
                      }
                    />
                  ))}
                </ScrollView>

                <ImpactSupportBanner
                  accentMessage={hasAnyMetric ? model.curvedMessage : undefined}
                  lead={ImpactCopy.supportBannerLead}
                  tail={ImpactCopy.supportBannerTail}
                />

                <Text style={styles.sectionTitle}>{ImpactCopy.recentSectionTitle}</Text>
                {model.recentImpact.length === 0 ? (
                  <View style={[rippleGlass.panel, styles.emptyPanel]}>
                    <Text style={styles.emptyTitle}>{ImpactCopy.emptyMomentsTitle}</Text>
                    <Text style={styles.emptyBody}>{ImpactCopy.emptyMomentsBody}</Text>
                  </View>
                ) : (
                  <View style={[rippleGlass.panel, styles.listPanel]}>
                    {model.recentImpact.map((item, index) => (
                      <ImpactRippleMomentRow
                        key={item.id}
                        item={item}
                        showDivider={index > 0}
                        onPress={() => router.push('/legacy/ripple' as never)}
                      />
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#8CB4D4',
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
  },
  heroTitle: {
    fontFamily: Fonts.serif,
    fontSize: 34,
    fontWeight: '600',
    color: '#1A202C',
    letterSpacing: -0.4,
    marginTop: Spacing.sm,
  },
  heroSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(45, 55, 72, 0.82)',
    marginTop: 8,
    marginBottom: Spacing.sm,
    maxWidth: 320,
  },
  heroPill: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: Spacing.md,
  },
  heroPillText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(45, 55, 72, 0.85)',
  },
  previewHint: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(45, 55, 72, 0.65)',
    marginBottom: Spacing.sm,
    fontStyle: 'italic',
  },
  loader: {
    marginVertical: Spacing.xl,
  },
  metricsRow: {
    paddingRight: Spacing.md,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: 'rgba(45, 55, 72, 0.55)',
    marginBottom: Spacing.sm,
  },
  listPanel: {
    paddingVertical: 4,
    marginBottom: Spacing.lg,
  },
  emptyPanel: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  emptyBody: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(45, 55, 72, 0.75)',
  },
});
