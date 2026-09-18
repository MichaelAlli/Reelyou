import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeHeaderLogo } from '@/components/home/HomeHeaderLogo';
import { MySkyConstellationDetailSheet } from '@/components/my-sky/MySkyConstellationDetailSheet';
import { MySkyImmersiveToggleButton } from '@/components/my-sky/MySkyImmersiveToggleButton';
import { MySkyControlRow } from '@/components/my-sky/MySkyControlRow';
import { MySkyInsightOverlay } from '@/components/my-sky/MySkyInsightOverlay';
import { MySkyLayerControls } from '@/components/my-sky/MySkyLayerControls';
import { MySkyProximityCue } from '@/components/my-sky/MySkyProximityCue';
import { MySkySearchSheet } from '@/components/my-sky/MySkySearchSheet';
import { MySkyStarCanvas } from '@/components/my-sky/MySkyStarCanvas';
import { HomePalette } from '@/constants/homeLayout';
import { SkyArrivalCopy } from '@/constants/skyArrivalCopy';
import { Fonts, Spacing } from '@/constants/theme';
import {
  buildConstellationDetailView,
  type ConstellationDetailView,
} from '@/mySky/buildConstellationDetailView';
import { findPatternForNodeId } from '@/mySky/buildConstellationIntelligence';
import {
  buildNearbySkies,
  findNearbySkyAnchor,
  type NearbySkyAnchor,
} from '@/mySky/buildNearbySkies';
import { resolveStarNavigation } from '@/mySky/resolveStarNavigation';
import type { MySkyStarDisplay } from '@/mySky/types';
import type { MySkyViewportSnapshot } from '@/mySky/mySkyViewportSession';
import { computeSkyProximity, viewportSnapshotForWorldPoint } from '@/mySky/skyProximity';
import { resolveSkyConnectionActivities } from '@/mySky/skyConnectionSources';
import { useOnboarding } from '@/onboarding';

export function MySkyScreen() {
  const router = useRouter();
  const {
    mySkyView,
    toggleMySkyLayer,
    triggerConstellationReveal,
    constellationRevealCount,
    constellationRevealActive,
    constellationRevealPatternId,
    completeConstellationReveal,
    mySkyViewport,
    setMySkyViewport,
    mySkyExploreEnabled,
    setMySkyExploreEnabled,
    aroundYourSkyFeed,
    communities,
    skywrites,
    guidingLightView,
  } = useOnboarding();
  const { visibleLayers } = mySkyView.viewState;
  const northStarText = mySkyView.northStar.originalVision.trim();

  const [cleanSkyActive, setCleanSkyActive] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [worldSize, setWorldSize] = useState({ width: 0, height: 0 });
  const [liveViewport, setLiveViewport] = useState<MySkyViewportSnapshot>(mySkyViewport);
  const [jumpSnapshot, setJumpSnapshot] = useState<MySkyViewportSnapshot | null>(null);
  const [constellationDetailVisible, setConstellationDetailVisible] = useState(false);
  const [constellationDetail, setConstellationDetail] = useState<ConstellationDetailView | null>(
    null,
  );

  const joinedCommunityIds = useMemo(
    () => communities.joined.map((entry) => entry.id),
    [communities.joined],
  );
  const guidanceActive = Boolean(guidingLightView.light?.title?.trim());

  const connectionActivities = useMemo(
    () => resolveSkyConnectionActivities(aroundYourSkyFeed),
    [aroundYourSkyFeed],
  );

  const nearbyAnchors = useMemo(
    () =>
      buildNearbySkies(
        aroundYourSkyFeed,
        connectionActivities,
        communities,
        mySkyExploreEnabled,
        mySkyView.skyOwner.id,
      ),
    [
      aroundYourSkyFeed,
      communities,
      connectionActivities,
      mySkyExploreEnabled,
      mySkyView.skyOwner.id,
    ],
  );

  const proximity = useMemo(
    () => computeSkyProximity(liveViewport, worldSize.width, worldSize.height, nearbyAnchors),
    [liveViewport, nearbyAnchors, worldSize.height, worldSize.width],
  );

  useEffect(() => {
    setLiveViewport(mySkyViewport);
  }, [mySkyViewport]);

  const handleViewportChange = useCallback(
    (snapshot: MySkyViewportSnapshot) => {
      setMySkyViewport(snapshot);
      setLiveViewport(snapshot);
      setJumpSnapshot(null);
    },
    [setMySkyViewport],
  );

  const handleViewportLiveChange = useCallback((snapshot: MySkyViewportSnapshot) => {
    setLiveViewport(snapshot);
  }, []);

  const jumpToAnchor = useCallback(
    (anchor: NearbySkyAnchor) => {
      if (worldSize.width <= 0 || worldSize.height <= 0) return;
      const snapshot = viewportSnapshotForWorldPoint(
        anchor.x,
        anchor.y,
        worldSize.width,
        worldSize.height,
        anchor.tier === 'explore' ? 1.05 : 1.12,
      );
      setJumpSnapshot(snapshot);
      setLiveViewport(snapshot);
    },
    [worldSize.height, worldSize.width],
  );

  const handleJumpFromSearch = useCallback(
    (ownerId: string) => {
      const anchor = findNearbySkyAnchor(nearbyAnchors, ownerId);
      if (anchor) {
        jumpToAnchor(anchor);
      }
      setSearchVisible(false);
    },
    [jumpToAnchor, nearbyAnchors],
  );

  const toggleCleanSky = useCallback(() => {
    setCleanSkyActive((active) => !active);
  }, []);

  const openConstellationDetail = useCallback(
    (patternId: string) => {
      const pattern = mySkyView.patterns.find((entry) => entry.id === patternId);
      if (!pattern) return;
      triggerConstellationReveal(pattern.id);
      setConstellationDetail(
        buildConstellationDetailView(pattern, mySkyView.nodes, mySkyView.stars),
      );
      setConstellationDetailVisible(true);
    },
    [mySkyView.nodes, mySkyView.patterns, mySkyView.stars, triggerConstellationReveal],
  );

  const handlePatternStarPress = useCallback(
    (star: MySkyStarDisplay) => {
      const pattern = findPatternForNodeId(mySkyView.patterns, star.id);
      if (!pattern) return;
      openConstellationDetail(pattern.id);
    },
    [mySkyView.patterns, openConstellationDetail],
  );

  const navigateStarById = useCallback(
    (nodeId: string) => {
      const star = mySkyView.stars.find((entry) => entry.id === nodeId);
      if (!star) return;

      const target = resolveStarNavigation(star, {
        skywrites,
        joinedCommunityIds,
        guidanceActive,
      });

      switch (target.kind) {
        case 'skywrite-detail':
          router.push(`/skywrite/${target.skywriteId}` as never);
          return;
        case 'skywrite-compose':
          router.push('/skywrite' as never);
          return;
        case 'public-sky':
          router.push(`/public-sky?id=${target.param}` as never);
          return;
        case 'community-detail':
          router.push(`/community?id=${target.communityId}` as never);
          return;
        case 'starpath':
          router.push('/starpath' as never);
          return;
        case 'impact-tab':
          router.push('/(tabs)/impact' as never);
          return;
        case 'star-detail':
          router.push(`/my-sky-star/${target.nodeId}` as never);
          return;
        default:
          return;
      }
    },
    [guidanceActive, joinedCommunityIds, mySkyView.stars, router, skywrites],
  );

  const handleConstellationStarSelect = useCallback(
    (nodeId: string) => {
      setConstellationDetailVisible(false);
      navigateStarById(nodeId);
    },
    [navigateStarById],
  );

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {!cleanSkyActive ? (
          <>
            <View style={styles.header}>
              <HomeHeaderLogo />
              <Text style={styles.headerTitle}>{SkyArrivalCopy.mySkyTitle}</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {SkyArrivalCopy.mySkySubtitle}
              </Text>
            </View>

            <View style={styles.controls}>
              <MySkyControlRow
                northStarText={northStarText}
                exploreEnabled={mySkyExploreEnabled}
                onToggleExplore={setMySkyExploreEnabled}
                onOpenSearch={() => setSearchVisible(true)}
              />
            </View>

            <View style={styles.layerRow}>
              <View style={styles.layerScroll}>
                <MySkyLayerControls
                  compact
                  minimal
                  visibleLayers={visibleLayers}
                  onToggleLayer={toggleMySkyLayer}
                  onRevealConstellations={triggerConstellationReveal}
                  constellationRevealActive={constellationRevealActive}
                />
              </View>
              <MySkyImmersiveToggleButton
                immersiveActive={cleanSkyActive}
                onPress={toggleCleanSky}
              />
            </View>
          </>
        ) : null}

        <View style={[styles.skyArea, cleanSkyActive && styles.skyAreaClean]}>
          {!cleanSkyActive ? (
            <MySkyProximityCue
              anchor={proximity.anchor}
              phase={proximity.phase}
              onPress={jumpToAnchor}
            />
          ) : null}
          <MySkyStarCanvas
            immersive
            cleanSky={cleanSkyActive}
            showLayerControls={false}
            showNearbySkies
            nearbyAnchors={nearbyAnchors}
            proximityOwnerId={proximity.anchor?.ownerId ?? null}
            proximityPhase={proximity.phase}
            view={mySkyView}
            onToggleLayer={toggleMySkyLayer}
            onRevealConstellations={() => triggerConstellationReveal(null)}
            constellationRevealCount={constellationRevealCount}
            constellationRevealActive={constellationRevealActive}
            constellationRevealPatternId={constellationRevealPatternId}
            onConstellationRevealComplete={completeConstellationReveal}
            onPatternStarPress={handlePatternStarPress}
            viewportSnapshot={mySkyViewport}
            jumpSnapshot={jumpSnapshot}
            onViewportChange={handleViewportChange}
            onViewportLiveChange={handleViewportLiveChange}
            onWorldSizeChange={setWorldSize}
          />
          {!cleanSkyActive ? (
            <MySkyInsightOverlay
              view={mySkyView}
              visibleLayers={visibleLayers}
              showConstellations={constellationRevealActive || constellationDetailVisible}
              onPatternPress={openConstellationDetail}
            />
          ) : (
            <MySkyImmersiveToggleButton
              immersiveActive={cleanSkyActive}
              onPress={toggleCleanSky}
              floating
            />
          )}
        </View>
      </SafeAreaView>

      <MySkySearchSheet
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        nearbyAnchors={nearbyAnchors}
        onJumpToSky={handleJumpFromSearch}
      />

      <MySkyConstellationDetailSheet
        visible={constellationDetailVisible}
        detail={constellationDetail}
        onClose={() => setConstellationDetailVisible(false)}
        onSelectStar={handleConstellationStarSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#05070A',
  },
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: 0,
    paddingBottom: 0,
    alignItems: 'center',
    gap: 1,
    zIndex: 2,
  },
  headerTitle: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    fontWeight: '600',
    color: HomePalette.textPrimary,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    lineHeight: 14,
    color: 'rgba(235, 228, 248, 0.62)',
    textAlign: 'center',
    maxWidth: 280,
  },
  controls: {
    paddingHorizontal: Spacing.sm,
    paddingTop: 2,
    zIndex: 3,
  },
  layerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.sm,
    paddingRight: Spacing.sm,
    paddingBottom: 2,
    gap: 6,
    zIndex: 2,
  },
  layerScroll: {
    flex: 1,
    minWidth: 0,
  },
  skyArea: {
    flex: 1,
    paddingHorizontal: 0,
    minHeight: 0,
    marginTop: 2,
  },
  skyAreaClean: {
    marginTop: 0,
  },
});
