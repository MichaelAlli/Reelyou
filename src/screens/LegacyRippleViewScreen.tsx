import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, StyleSheet, Text, useWindowDimensions } from 'react-native';

import { LegacySegmentToggle } from '@/components/legacy/LegacySegmentToggle';
import { RippleExploreButton } from '@/components/legacy/ripple/RippleExploreButton';
import { RippleHeroMetricsCard } from '@/components/legacy/ripple/RippleHeroMetricsCard';
import { LegacyRippleScreenShell } from '@/components/legacy/ripple/LegacyRippleScreenShell';
import { RippleMapCanvas } from '@/components/legacy/ripple/RippleMapCanvas';
import { RippleMetricDetailSheet } from '@/components/legacy/ripple/RippleMetricDetailSheet';
import { RippleNodeDetailPopup } from '@/components/legacy/ripple/RippleNodeDetailPopup';
import { RippleRecentImpactCard } from '@/components/legacy/ripple/RippleRecentImpactCard';
import { RippleCopy } from '@/constants/rippleCopy';
import { Fonts, Spacing } from '@/constants/theme';
import {
  buildRippleMetricDetailView,
  type RippleMetricDetailKind,
} from '@/legacy/buildRippleMetricDetails';
import { leaveLegacyRippleRoute } from '@/legacy/legacyRippleLeaveNavigation';
import { resolveRippleCenterOriginLabel } from '@/legacy/rippleCenterOrigin';
import {
  getRecentImpactExpanded,
  setRecentImpactExpanded,
} from '@/legacy/recentImpactCollapseSession';
import { useRippleNodePopup } from '@/legacy/useRippleNodePopup';
import { useLegacyRippleViewModel } from '@/legacy/useLegacyRippleViewModel';

export function LegacyRippleViewScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const mapWidth = Math.min(width - Spacing.lg * 2, 361);
  const { model, ownerUserId, metrics, contributions, userDirectory, blockedUserIds } =
    useLegacyRippleViewModel();
  const [metricKind, setMetricKind] = useState<RippleMetricDetailKind | null>(null);
  const [recentExpanded, setRecentExpanded] = useState(getRecentImpactExpanded);
  const centerLabel = useMemo(() => resolveRippleCenterOriginLabel(), []);
  const popup = useRippleNodePopup({ ownerUserId, metrics, userDirectory });

  const metricDetailView = useMemo(() => {
    if (!metricKind) return null;
    return buildRippleMetricDetailView({
      kind: metricKind,
      ownerUserId,
      metrics,
      contributions,
      userDirectory,
      blockedUserIds,
    });
  }, [
    blockedUserIds,
    contributions,
    metricKind,
    metrics,
    ownerUserId,
    userDirectory,
  ]);

  const handleBack = useCallback(() => {
    leaveLegacyRippleRoute(router);
  }, [router]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => subscription.remove();
  }, [handleBack]);

  return (
    <LegacyRippleScreenShell onBack={handleBack}>
      <LegacySegmentToggle
        active="ripples"
        variant="light"
        onJourney={() => router.replace('/legacy' as never)}
        onRipples={() => {}}
      />
      <Text style={styles.title}>{RippleCopy.screenTitle}</Text>
      <Text style={styles.subtitle}>{RippleCopy.screenSubtitle}</Text>
      <RippleHeroMetricsCard
        metrics={model.heroMetrics}
        onMetricPress={(key) => setMetricKind(key as RippleMetricDetailKind)}
      />
      <Text style={styles.curvedBanner}>{model.curvedMessage}</Text>
      <RippleMapCanvas
        width={mapWidth}
        height={368}
        directNodes={model.directNodes}
        density="landing"
        centerOriginLabel={centerLabel}
        onNodePress={popup.openNode}
      />
      <RippleExploreButton onPress={() => router.push('/legacy/ripple/map' as never)} />
      <RippleRecentImpactCard
        items={model.recentImpact}
        expanded={recentExpanded}
        onToggleExpanded={() => {
          setRecentExpanded((value) => {
            const next = !value;
            setRecentImpactExpanded(next);
            return next;
          });
        }}
      />
      <RippleMetricDetailSheet
        visible={metricKind != null}
        view={metricDetailView}
        onClose={() => setMetricKind(null)}
      />
      <RippleNodeDetailPopup
        visible={popup.visible}
        detail={popup.detail}
        onClose={popup.closeNode}
        fullStoryHref={
          popup.personUserId
            ? `/legacy/ripple/${encodeURIComponent(popup.personUserId)}`
            : null
        }
      />
    </LegacyRippleScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 4,
    fontFamily: Fonts.serif,
    fontSize: 28,
    fontWeight: '600',
    color: '#2D3748',
  },
  subtitle: {
    marginTop: 6,
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(45, 55, 72, 0.78)',
  },
  curvedBanner: {
    marginTop: 14,
    marginBottom: 6,
    fontFamily: Fonts.serif,
    fontSize: 15,
    lineHeight: 21,
    fontStyle: 'italic',
    color: 'rgba(45, 55, 72, 0.88)',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
