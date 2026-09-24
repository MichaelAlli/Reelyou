import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { RippleExploreButton } from '@/components/legacy/ripple/RippleExploreButton';
import { RippleHeroMetricsCard } from '@/components/legacy/ripple/RippleHeroMetricsCard';
import { LegacyRippleScreenShell } from '@/components/legacy/ripple/LegacyRippleScreenShell';
import { RippleMapCanvas } from '@/components/legacy/ripple/RippleMapCanvas';
import { RippleMetricDetailSheet } from '@/components/legacy/ripple/RippleMetricDetailSheet';
import { RippleNodeDetailPopup } from '@/components/legacy/ripple/RippleNodeDetailPopup';
import { RippleRecentImpactCard } from '@/components/legacy/ripple/RippleRecentImpactCard';
import { RippleCopy } from '@/constants/rippleCopy';
import { Fonts, Spacing } from '@/constants/theme';
import { currentUser, orbitUsers } from '@/data/mockData';
import {
  buildRippleMetricDetailView,
  type RippleMetricDetailKind,
} from '@/legacy/buildRippleMetricDetails';
import {
  getRecentImpactExpanded,
  setRecentImpactExpanded,
} from '@/legacy/recentImpactCollapseSession';
import { resolveRippleCenterOriginLabel } from '@/legacy/rippleCenterOrigin';
import { useRippleNodePopup } from '@/legacy/useRippleNodePopup';
import { useSubjectRippleViewModel } from '@/legacy/useSubjectRippleViewModel';
import { useOnboarding } from '@/onboarding';
import { buildVisitorProfileHref } from '@/profile/visitorProfileRoute';
import { visitorRippleMapRoute } from '@/profile/visitorLegacyRoutes';
import { resolveSkyVisibilitySettingsForOwner } from '@/mySky/skyVisibilitySettings';
import { resolveVisitorMetricDetailEligible } from '@/legacy/legacyViewerAccess';

interface VisitorRippleScreenProps {
  ownerId?: string;
}

export function VisitorRippleScreen({ ownerId }: VisitorRippleScreenProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const mapWidth = Math.min(width - Spacing.lg * 2, 361);
  const subjectId = ownerId ?? '';
  const { skywrites } = useOnboarding();
  const {
    model,
    ownerUserId,
    metrics,
    contributions,
    userDirectory,
    blockedUserIds,
    viewerContext,
    accessAllowed,
  } = useSubjectRippleViewModel(subjectId);

  const [metricKind, setMetricKind] = useState<RippleMetricDetailKind | null>(null);
  const [recentExpanded, setRecentExpanded] = useState(getRecentImpactExpanded);
  const popup = useRippleNodePopup({ ownerUserId, metrics, userDirectory });

  const subjectUser = useMemo(
    () => orbitUsers.find((entry) => entry.id === subjectId) ?? currentUser,
    [subjectId],
  );
  const centerLabel = useMemo(() => resolveRippleCenterOriginLabel(subjectUser as typeof currentUser), [subjectUser]);

  const visibility = resolveSkyVisibilitySettingsForOwner(subjectId);
  const metricsDetailEligible = resolveVisitorMetricDetailEligible(
    visibility.skyVisibility,
    viewerContext,
  );

  const metricDetailView = useMemo(() => {
    if (!metricKind) return null;
    return buildRippleMetricDetailView({
      kind: metricKind,
      ownerUserId,
      metrics,
      contributions,
      userDirectory,
      blockedUserIds,
      mode: viewerContext.viewerUserId === ownerUserId ? 'owner' : 'visitor',
      viewerContext,
      skywrites,
    });
  }, [
    blockedUserIds,
    contributions,
    metricKind,
    metrics,
    ownerUserId,
    skywrites,
    userDirectory,
    viewerContext,
  ]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (subjectId) {
      router.replace(buildVisitorProfileHref(subjectId) as never);
      return;
    }
    router.replace('/(tabs)/home' as never);
  }, [router, subjectId]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => subscription.remove();
  }, [handleBack]);

  if (!subjectId || !accessAllowed) {
    return (
      <View style={styles.blocked}>
        <Text style={styles.blockedText}>Profile unavailable.</Text>
      </View>
    );
  }

  return (
    <LegacyRippleScreenShell onBack={handleBack}>
      <Text style={styles.title}>{RippleCopy.screenTitle}</Text>
      <Text style={styles.subtitle}>Shared ripple view — only what they have chosen to show.</Text>
      <RippleHeroMetricsCard
        metrics={model.heroMetrics}
        onMetricPress={
          metricsDetailEligible
            ? (key) => setMetricKind(key as RippleMetricDetailKind)
            : undefined
        }
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
      <RippleExploreButton onPress={() => router.push(visitorRippleMapRoute(subjectId) as never)} />
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
    color: 'rgba(45, 55, 72, 0.82)',
  },
  curvedBanner: {
    marginTop: 12,
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    color: 'rgba(90, 74, 18, 0.88)',
  },
  blocked: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  blockedText: { fontFamily: Fonts.sans, fontSize: 14, color: '#2D3748' },
});
