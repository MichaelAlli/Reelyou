/** LOCKED MY SKY EXPERIENCE — preserve approved visuals/interactions unless explicitly authorized. */
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeHeaderLogo } from '@/components/home/HomeHeaderLogo';
import { MySkyConstellationDetailSheet } from '@/components/my-sky/MySkyConstellationDetailSheet';
import { MySkyImmersiveToggleButton } from '@/components/my-sky/MySkyImmersiveToggleButton';
import { MySkyControlRow } from '@/components/my-sky/MySkyControlRow';
import { MySkyInsightOverlay } from '@/components/my-sky/MySkyInsightOverlay';
import { MySkyLayerControls } from '@/components/my-sky/MySkyLayerControls';
import { MySkyProximityCue } from '@/components/my-sky/MySkyProximityCue';
import { PrivacyGlyph } from '@/components/my-sky/MySkyControlIcons';
import { MySkyControlColors } from '@/components/my-sky/mySkyControlColors';
import { MySkyLabeledControl } from '@/components/my-sky/MySkyLabeledControl';
import { MySkyPrivacySheet } from '@/components/my-sky/MySkyPrivacySheet';
import { MySkySearchSheet } from '@/components/my-sky/MySkySearchSheet';
import { MySkyStarCanvas } from '@/components/my-sky/MySkyStarCanvas';
import { MySkyCopy } from '@/constants/mySkyCopy';
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
  resolveJumpAnchor,
  type NearbySkyAnchor,
} from '@/mySky/buildNearbySkies';
import { buildSkySearchResults } from '@/mySky/skySearchSources';
import { computeSkyRegionContext } from '@/mySky/skyRegionContext';
import { resolveStarNavigation } from '@/mySky/resolveStarNavigation';
import type { MySkyStarDisplay } from '@/mySky/types';
import type { MySkyViewportSnapshot } from '@/mySky/mySkyViewportSession';
import { computeSkyProximity, viewportSnapshotForWorldPoint } from '@/mySky/skyProximity';
import { resolveSkyConnectionActivities } from '@/mySky/skyConnectionSources';
import {
  exploreResultCap,
  resolveEffectiveExploreEnabled,
} from '@/mySky/discoveryPreferencePolicy';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { useOnboarding } from '@/onboarding';

export function MySkyScreen() {
  const router = useRouter();
  const { preferences } = useReelyouConnect();
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
    mySkyVisibilitySettings,
    setMySkyVisibilitySettings,
  } = useOnboarding();
  const { visibleLayers } = mySkyView.viewState;
  const northStarText = mySkyView.northStar.originalVision.trim();

  const [cleanSkyActive, setCleanSkyActive] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightOwnerId, setHighlightOwnerId] = useState<string | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [worldSize, setWorldSize] = useState({ width: 0, height: 0 });
  const [liveViewport, setLiveViewport] = useState<MySkyViewportSnapshot>(mySkyViewport);
  const [jumpSnapshot, setJumpSnapshot] = useState<MySkyViewportSnapshot | null>(null);
  const [constellationDetailVisible, setConstellationDetailVisible] = useState(false);
  const [constellationDetail, setConstellationDetail] = useState<ConstellationDetailView | null>(
    null,
  );
  const [previousNearbyOwnerId, setPreviousNearbyOwnerId] = useState<string | null>(null);
  const [ephemeralAnchor, setEphemeralAnchor] = useState<NearbySkyAnchor | null>(null);
  const returningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const joinedCommunityIds = useMemo(
    () => communities.joined.map((entry) => entry.id),
    [communities.joined],
  );
  const guidanceActive = Boolean(guidingLightView.light?.title?.trim());

  const connectionActivities = useMemo(
    () => resolveSkyConnectionActivities(aroundYourSkyFeed),
    [aroundYourSkyFeed],
  );

  const effectiveExploreEnabled = useMemo(
    () => resolveEffectiveExploreEnabled(mySkyExploreEnabled, preferences.discoveryPreferences),
    [mySkyExploreEnabled, preferences.discoveryPreferences],
  );

  const exploreCap = useMemo(
    () => exploreResultCap(preferences.discoveryPreferences),
    [preferences.discoveryPreferences],
  );

  const nearbyAnchors = useMemo(
    () =>
      buildNearbySkies(
        aroundYourSkyFeed,
        connectionActivities,
        communities,
        effectiveExploreEnabled,
        mySkyView.skyOwner.id,
        exploreCap,
      ),
    [
      aroundYourSkyFeed,
      communities,
      connectionActivities,
      effectiveExploreEnabled,
      exploreCap,
      mySkyView.skyOwner.id,
    ],
  );

  const searchCatalog = useMemo(
    () =>
      buildSkySearchResults(
        '',
        aroundYourSkyFeed,
        connectionActivities,
        communities,
        effectiveExploreEnabled,
      ),
    [aroundYourSkyFeed, communities, connectionActivities, effectiveExploreEnabled],
  );

  const displayAnchors = useMemo(() => {
    if (!ephemeralAnchor) return nearbyAnchors;
    if (nearbyAnchors.some((anchor) => anchor.ownerId === ephemeralAnchor.ownerId)) {
      return nearbyAnchors;
    }
    return [...nearbyAnchors, ephemeralAnchor];
  }, [ephemeralAnchor, nearbyAnchors]);

  const proximity = useMemo(
    () => computeSkyProximity(liveViewport, worldSize.width, worldSize.height, displayAnchors),
    [displayAnchors, liveViewport, worldSize.height, worldSize.width],
  );

  const regionContext = useMemo(
    () =>
      computeSkyRegionContext(
        proximity,
        mySkyView.skyOwner.id,
        { x: mySkyView.identityStar.x, y: mySkyView.identityStar.y },
        liveViewport,
        worldSize.width,
        worldSize.height,
        previousNearbyOwnerId,
      ),
    [
      liveViewport,
      mySkyView.identityStar.x,
      mySkyView.identityStar.y,
      mySkyView.skyOwner.id,
      previousNearbyOwnerId,
      proximity,
      worldSize.height,
      worldSize.width,
    ],
  );

  useEffect(() => {
    if (
      (proximity.phase === 'entered' || proximity.phase === 'entering') &&
      proximity.anchor
    ) {
      setPreviousNearbyOwnerId(proximity.anchor.ownerId);
    }
  }, [proximity.anchor, proximity.phase]);

  useEffect(() => {
    if (returningTimerRef.current) {
      clearTimeout(returningTimerRef.current);
      returningTimerRef.current = null;
    }

    if (regionContext.mode !== 'returning') return;

    returningTimerRef.current = setTimeout(() => {
      setPreviousNearbyOwnerId(null);
    }, 1400);

    return () => {
      if (returningTimerRef.current) {
        clearTimeout(returningTimerRef.current);
        returningTimerRef.current = null;
      }
    };
  }, [regionContext.mode]);

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
      if (anchor.id.startsWith('nearby-sky-ephemeral-')) {
        setEphemeralAnchor(anchor);
      }
      setJumpSnapshot(snapshot);
      setLiveViewport(snapshot);
    },
    [worldSize.height, worldSize.width],
  );

  const resolveAnchorForOwner = useCallback(
    (ownerId: string) => {
      const searchResult = searchCatalog.find((entry) => entry.id === ownerId) ?? null;
      return resolveJumpAnchor(
        ownerId,
        nearbyAnchors,
        searchResult,
        effectiveExploreEnabled,
      );
    },
    [effectiveExploreEnabled, nearbyAnchors, searchCatalog],
  );

  const handleJumpFromSearch = useCallback(
    (ownerId: string) => {
      const anchor = resolveAnchorForOwner(ownerId);
      if (anchor) {
        jumpToAnchor(anchor);
        setHighlightOwnerId(ownerId);
        if (highlightTimerRef.current) {
          clearTimeout(highlightTimerRef.current);
        }
        highlightTimerRef.current = setTimeout(() => {
          setHighlightOwnerId(null);
          highlightTimerRef.current = null;
        }, 2600);
      }
      setSearchVisible(false);
    },
    [jumpToAnchor, resolveAnchorForOwner],
  );

  const handleViewSkyFromSearch = useCallback(
    (publicSkyId: string) => {
      setSearchVisible(false);
      router.push(`/public-sky?id=${publicSkyId}` as never);
    },
    [router],
  );

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

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
          router.push('/skywrite/compose' as never);
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
              <MySkyLabeledControl
                icon={
                  <PrivacyGlyph
                    size={15}
                    color={MySkyControlColors.iconDefault}
                    strokeWidth={1.5}
                  />
                }
                label={MySkyCopy.privacyControlLabel}
                onPress={() => setPrivacyVisible(true)}
                accessibilityLabel={MySkyCopy.privacyTitle}
              />
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
              regionMode={regionContext.mode}
              onPress={jumpToAnchor}
            />
          ) : null}
          <MySkyStarCanvas
            immersive
            cleanSky={cleanSkyActive}
            showLayerControls={false}
            showNearbySkies
            nearbyAnchors={displayAnchors}
            proximityOwnerId={proximity.anchor?.ownerId ?? null}
            proximityPhase={proximity.phase}
            highlightOwnerId={highlightOwnerId}
            onJumpToSky={jumpToAnchor}
            resolveAnchorForOwner={resolveAnchorForOwner}
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

      <MySkyPrivacySheet
        visible={privacyVisible}
        settings={mySkyVisibilitySettings}
        onClose={() => setPrivacyVisible(false)}
        onChange={setMySkyVisibilitySettings}
      />

      <MySkySearchSheet
        visible={searchVisible}
        query={searchQuery}
        onQueryChange={setSearchQuery}
        onClose={() => setSearchVisible(false)}
        exploreEnabled={effectiveExploreEnabled}
        discoveryPreferences={preferences.discoveryPreferences}
        nearbyAnchors={nearbyAnchors}
        onJumpToSky={handleJumpFromSearch}
        onViewSky={handleViewSkyFromSearch}
        resolveAnchorForOwner={resolveAnchorForOwner}
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
    paddingLeft: Spacing.xs,
    paddingRight: Spacing.sm,
    paddingBottom: 2,
    gap: 4,
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
