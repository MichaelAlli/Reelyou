/** LOCKED REELYOU STAR INTERACTION/DETAIL SYSTEM — do not refactor or alter without explicit product approval. */
import { useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';

import { MySkyExplorableViewport } from '@/components/my-sky/MySkyExplorableViewport';
import { MySkyBackdrop } from '@/components/my-sky/MySkyBackdrop';
import { MySkyIdentityProfileBubble } from '@/components/my-sky/MySkyIdentityProfileBubble';
import { MySkyIdentityStar } from '@/components/my-sky/MySkyIdentityStar';
import { MySkyVisibilityBadge } from '@/components/my-sky/MySkyVisibilityBadge';
import { MySkyLayerControls } from '@/components/my-sky/MySkyLayerControls';
import { MySkyNearbySkiesLayer } from '@/components/my-sky/MySkyNearbySkiesLayer';
import { MySkyRenderer } from '@/components/my-sky/MySkyRenderer';
import { MySkyStarInsightBubble } from '@/components/my-sky/MySkyStarInsightBubble';
import { MySkyCopy } from '@/constants/mySkyCopy';
import { buildStarInsightBubble } from '@/mySky/buildStarInsightBubble';
import type { StarNavigationTarget } from '@/mySky/resolveStarNavigation';
import type { NearbySkyAnchor } from '@/mySky/buildNearbySkies';
import type { MySkyViewportSnapshot } from '@/mySky/mySkyViewportSession';
import type { SkyProximityPhase } from '@/mySky/skyProximity';
import type { SkyOwnerProfile } from '@/mySky/skyIdentity';
import type { SkyConnectionStatus } from '@/mySky/skyIdentity';
import type { SkyNode } from '@/mySky/skyNodeTypes';
import { resolveStarNavigation } from '@/mySky/resolveStarNavigation';
import { resolveVisitorStarNavigation } from '@/mySky/resolveVisitorStarNavigation';
import type { MySkyLayerId } from '@/mySky/skyLayers';
import type { MySkyStarDisplay, MySkyView } from '@/mySky/types';
import {
  resolveSkyVisibilitySettingsForOwner,
  type SkyVisibilityLevel,
} from '@/mySky/skyVisibilitySettings';
import { useOnboarding } from '@/onboarding';
import { useThemedStyles } from '@/theme/useTheme';
import { Fonts, Radius, Spacing } from '@/constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MySkyStarCanvasProps {
  view: Pick<
    MySkyView,
    | 'stars'
    | 'vitality'
    | 'relationships'
    | 'nodes'
    | 'patterns'
    | 'viewState'
    | 'skyOwner'
    | 'identityStar'
  >;
  onToggleLayer: (layer: MySkyLayerId) => void;
  onRevealConstellations: () => void;
  constellationRevealCount: number;
  constellationRevealActive?: boolean;
  constellationRevealPatternId?: string | null;
  onConstellationRevealComplete?: () => void;
  onPatternStarPress?: (star: MySkyStarDisplay) => void;
  immersive?: boolean;
  showLayerControls?: boolean;
  cleanSky?: boolean;
  showNearbySkies?: boolean;
  nearbyAnchors?: NearbySkyAnchor[];
  proximityOwnerId?: string | null;
  proximityPhase?: SkyProximityPhase;
  highlightOwnerId?: string | null;
  onJumpToSky?: (anchor: NearbySkyAnchor) => void;
  resolveAnchorForOwner?: (ownerId: string) => NearbySkyAnchor | null;
  viewportSnapshot?: MySkyViewportSnapshot;
  jumpSnapshot?: MySkyViewportSnapshot | null;
  onViewportChange?: (snapshot: MySkyViewportSnapshot) => void;
  onViewportLiveChange?: (snapshot: MySkyViewportSnapshot) => void;
  onWorldSizeChange?: (worldSize: { width: number; height: number }) => void;
  visitorMode?: boolean;
  publicSkyOwnerId?: string;
  publicSkyNodes?: SkyNode[];
  publicSkyConnectionStatus?: SkyConnectionStatus;
  onConnect?: () => void;
}

function MySkyStarCanvasComponent({
  view,
  onToggleLayer,
  onRevealConstellations,
  constellationRevealCount,
  constellationRevealActive = false,
  constellationRevealPatternId = null,
  onConstellationRevealComplete,
  onPatternStarPress,
  immersive = false,
  showLayerControls = true,
  cleanSky = false,
  showNearbySkies = false,
  nearbyAnchors = [],
  proximityOwnerId = null,
  proximityPhase = 'none',
  highlightOwnerId = null,
  onJumpToSky,
  resolveAnchorForOwner,
  viewportSnapshot,
  jumpSnapshot = null,
  onViewportChange,
  onViewportLiveChange,
  onWorldSizeChange,
  visitorMode = false,
  publicSkyOwnerId,
  publicSkyNodes = [],
  publicSkyConnectionStatus = 'none',
  onConnect,
}: MySkyStarCanvasProps) {
  const { stars, viewState, skyOwner, identityStar } = view;
  const router = useRouter();
  const { skywrites, communities, guidingLightView } = useOnboarding();
  const guidanceActive = Boolean(guidingLightView.light?.title?.trim());
  const joinedCommunityIds = useMemo(
    () => communities.joined.map((entry) => entry.id),
    [communities.joined],
  );
  const starSignature = useMemo(() => stars.map((star) => star.id).join('|'), [stars]);
  const visitorVisibilitySettings = useMemo(
    () =>
      visitorMode && publicSkyOwnerId
        ? resolveSkyVisibilitySettingsForOwner(publicSkyOwnerId)
        : undefined,
    [publicSkyOwnerId, visitorMode],
  );
  const [worldSize, setWorldSize] = useState({ width: 0, height: 0 });
  const [skyGestureActive, setSkyGestureActive] = useState(false);
  const lastGestureEndRef = useRef(0);

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      outer: immersive ? { flex: 1 } : { gap: Spacing.sm },
      wrap: immersive
        ? { flex: 1, width: '100%', overflow: 'hidden' }
        : {
            width: '100%',
            aspectRatio: 0.72,
            minHeight: 320,
            borderRadius: Radius.lg,
            overflow: 'hidden',
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: 'rgba(167, 139, 250, 0.22)',
          },
      world: {
        flex: 1,
        width: '100%',
        height: '100%',
      },
      starHit: {
        position: 'absolute',
        width: 44,
        height: 44,
        marginLeft: -22,
        marginTop: -22,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 12,
      },
      hitGlow: {
        width: 20,
        height: 20,
        borderRadius: 10,
        opacity: 0.01,
      },
      tooltip: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        right: 8,
        padding: 8,
        borderRadius: Radius.md,
        backgroundColor: 'rgba(12, 10, 28, 0.88)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: tokens.border,
      },
      tooltipText: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        lineHeight: 16,
        color: tokens.primaryText,
      },
      exploreHint: {
        position: 'absolute',
        top: 8,
        alignSelf: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: Radius.full,
        backgroundColor: 'rgba(8, 8, 24, 0.55)',
      },
      exploreHintText: {
        fontFamily: Fonts.sans,
        fontSize: 10,
        color: tokens.mutedText,
      },
      missingHint: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        lineHeight: 15,
        color: tokens.mutedText,
        paddingHorizontal: 2,
      },
    }),
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [insightStar, setInsightStar] = useState<MySkyStarDisplay | null>(null);
  const [insightOpen, setInsightOpen] = useState(false);
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [bubbleOwner, setBubbleOwner] = useState<SkyOwnerProfile | null>(null);
  const [bubbleStar, setBubbleStar] = useState<MySkyStarDisplay | null>(null);
  const [bubbleAnchor, setBubbleAnchor] = useState<NearbySkyAnchor | null>(null);
  const [missingHint, setMissingHint] = useState<string | null>(null);

  const insightDetail = useMemo(() => {
    if (!insightStar) return null;
    return buildStarInsightBubble(
      insightStar,
      view.nodes,
      view.patterns,
      skywrites,
    );
  }, [insightStar, skywrites, view.nodes, view.patterns]);

  const activeBubbleOwner = bubbleOwner ?? skyOwner;
  const activeBubbleStar = bubbleStar ?? identityStar;
  const ownBubbleActive = bubbleOpen && activeBubbleOwner.id === skyOwner.id;

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [starSignature]);

  const handleWorldSizeChange = useCallback(
    (size: { width: number; height: number }) => {
      setWorldSize(size);
      onWorldSizeChange?.(size);
    },
    [onWorldSizeChange],
  );

  const openProfileBubble = useCallback(
    (owner: SkyOwnerProfile, star: MySkyStarDisplay, anchor: NearbySkyAnchor | null = null) => {
      setBubbleOwner(owner);
      setBubbleStar(star);
      setBubbleAnchor(anchor);
      setBubbleOpen(true);
    },
    [],
  );

  const closeProfileBubble = useCallback(() => {
    setBubbleOpen(false);
    setBubbleAnchor(null);
    if (activeId === identityStar.id) {
      setActiveId(null);
    }
  }, [activeId, identityStar.id]);

  const closeInsightBubble = useCallback(() => {
    setInsightOpen(false);
    setInsightStar(null);
    setActiveId(null);
    setMissingHint(null);
  }, []);

  const resolveNavigationTarget = useCallback(
    (star: MySkyStarDisplay): StarNavigationTarget => {
      return visitorMode
        ? resolveVisitorStarNavigation(
            star,
            publicSkyNodes,
            publicSkyConnectionStatus,
            publicSkyOwnerId ?? skyOwner.id,
            visitorVisibilitySettings,
          )
        : resolveStarNavigation(star, {
            skywrites,
            joinedCommunityIds,
            guidanceActive,
          });
    },
    [
      guidanceActive,
      joinedCommunityIds,
      publicSkyConnectionStatus,
      publicSkyNodes,
      publicSkyOwnerId,
      skyOwner.id,
      skywrites,
      visitorMode,
      visitorVisibilitySettings,
    ],
  );

  const navigateStar = useCallback(
    (star: MySkyStarDisplay) => {
      setMissingHint(null);

      const target = resolveNavigationTarget(star);

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
          router.push(
            visitorMode
              ? (`/my-sky-star/${target.nodeId}?ownerId=${publicSkyOwnerId ?? skyOwner.id}` as never)
              : (`/my-sky-star/${target.nodeId}` as never),
          );
          return;
        case 'none':
          setMissingHint(visitorMode ? MySkyCopy.publicStarUnavailable : MySkyCopy.starMissingToast);
          return;
        default:
          return;
      }
    },
    [resolveNavigationTarget, router, visitorMode, publicSkyOwnerId, skyOwner.id],
  );

  const openInsightForStar = useCallback((star: MySkyStarDisplay) => {
    setBubbleOpen(false);
    setBubbleAnchor(null);
    setActiveId(star.id);
    setInsightStar(star);
    setInsightOpen(true);
    setMissingHint(null);
  }, []);

  const handleOpenInsightDetail = useCallback(() => {
    if (!insightStar) return;
    const star = insightStar;
    if (star.constellationId && onPatternStarPress) {
      closeInsightBubble();
      onPatternStarPress(star);
      return;
    }
    closeInsightBubble();
    navigateStar(star);
  }, [closeInsightBubble, insightStar, navigateStar, onPatternStarPress]);

  const insightActionAvailable = useMemo(() => {
    if (!insightStar) return false;
    if (insightStar.constellationId && onPatternStarPress) return true;
    const target = resolveNavigationTarget(insightStar);
    return target.kind !== 'none';
  }, [insightStar, onPatternStarPress, resolveNavigationTarget]);

  const handleGestureActiveChange = useCallback((active: boolean) => {
    setSkyGestureActive(active);
    if (!active) {
      lastGestureEndRef.current = Date.now();
    }
  }, []);

  const handleStarPress = useCallback(
    (star: MySkyStarDisplay) => {
      if (skyGestureActive || Date.now() - lastGestureEndRef.current < 120) {
        return;
      }
      openInsightForStar(star);
    },
    [openInsightForStar, skyGestureActive],
  );

  const handleOwnIdentityPress = useCallback(() => {
    if (skyGestureActive || Date.now() - lastGestureEndRef.current < 120) {
      return;
    }
    closeInsightBubble();
    setActiveId(identityStar.id);
    openProfileBubble(skyOwner, identityStar, null);
  }, [closeInsightBubble, identityStar, openProfileBubble, skyGestureActive, skyOwner]);

  const handleNearbyIdentityPress = useCallback(
    (anchor: NearbySkyAnchor) => {
      openProfileBubble(anchor.owner, anchor.identityStar, anchor);
    },
    [openProfileBubble],
  );

  const handleViewProfile = useCallback(() => {
    setBubbleOpen(false);
    if (activeBubbleOwner.isSelf) {
      router.push('/(tabs)/profile' as never);
      return;
    }
    if (!visitorMode) {
      router.push(`/public-sky?id=${activeBubbleOwner.id}` as never);
    }
  }, [activeBubbleOwner.isSelf, activeBubbleOwner.id, router, visitorMode]);

  const handleViewFullSky = useCallback(() => {
    setBubbleOpen(false);
    if (!activeBubbleOwner.isSelf && bubbleAnchor?.canViewFullSky !== false) {
      router.push(`/public-sky?id=${activeBubbleOwner.id}` as never);
    }
  }, [activeBubbleOwner.id, activeBubbleOwner.isSelf, bubbleAnchor?.canViewFullSky, router]);

  const handleJumpToSkyFromBubble = useCallback(() => {
    if (!onJumpToSky || activeBubbleOwner.isSelf) return;
    const anchor =
      bubbleAnchor ??
      resolveAnchorForOwner?.(activeBubbleOwner.id) ??
      nearbyAnchors.find((entry) => entry.ownerId === activeBubbleOwner.id) ??
      null;
    if (!anchor) return;
    setBubbleOpen(false);
    onJumpToSky(anchor);
  }, [
    activeBubbleOwner.id,
    activeBubbleOwner.isSelf,
    bubbleAnchor,
    nearbyAnchors,
    onJumpToSky,
    resolveAnchorForOwner,
  ]);

  const handleConnect = useCallback(() => {
    setBubbleOpen(false);
    onConnect?.();
  }, [onConnect]);

  const bubbleCanViewFullSky = activeBubbleOwner.isSelf
    ? false
    : bubbleAnchor?.canViewFullSky ?? true;
  const bubbleCanJumpToSky =
    !activeBubbleOwner.isSelf &&
    Boolean(
      bubbleAnchor ??
        resolveAnchorForOwner?.(activeBubbleOwner.id) ??
        nearbyAnchors.find((entry) => entry.ownerId === activeBubbleOwner.id),
    );

  const accessibilityLabel = useCallback((star: MySkyStarDisplay) => {
    if (star.type === 'skywrite' && star.sourceId) {
      return `Open skywrite: ${star.title ?? 'moment'}`;
    }
    if (star.type === 'community') {
      return `Open community: ${star.title ?? 'community'}`;
    }
    if (star.type === 'connection') {
      return `Open connection: ${star.title ?? 'connection'}`;
    }
    if (star.type === 'guidance') {
      return `Open guidance: ${star.title ?? 'guidance'}`;
    }
    if (star.type === 'contribution') {
      return `Open contribution: ${star.title ?? 'impact'}`;
    }
    return star.title ? `View star: ${star.title}` : 'View star';
  }, []);

  const renderWorld = useCallback(
    (world: { width: number; height: number }) => (
      <>
        <MySkyBackdrop dim fillScale={1.38} />
        <MySkyRenderer
          view={view}
          mode="resting"
          constellationRevealCount={constellationRevealCount}
          constellationRevealActive={constellationRevealActive}
          revealPatternId={constellationRevealPatternId}
          onConstellationRevealComplete={onConstellationRevealComplete}
        />

        {showNearbySkies && nearbyAnchors.length > 0 ? (
          <MySkyNearbySkiesLayer
            anchors={nearbyAnchors}
            worldWidth={world.width}
            worldHeight={world.height}
            activeOwnerId={bubbleOpen ? activeBubbleOwner.id : null}
            proximityOwnerId={proximityOwnerId}
            proximityPhase={proximityPhase}
            highlightOwnerId={highlightOwnerId}
            onIdentityPress={handleNearbyIdentityPress}
          />
        ) : null}

        <MySkyIdentityStar
          star={identityStar}
          worldWidth={world.width}
          worldHeight={world.height}
          active={ownBubbleActive}
          prominence={1.06}
          onPress={handleOwnIdentityPress}
        />

        {stars.map((star) => (
          <Pressable
            key={star.id}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel(star)}
            onPress={() => handleStarPress(star)}
            style={[
              styles.starHit,
              {
                left: `${star.x * 100}%`,
                top: `${star.y * 100}%`,
              },
            ]}>
            <View style={styles.hitGlow} />
            {!visitorMode &&
            (star.visibility === 'private' || star.visibility === 'orbit') ? (
              <MySkyVisibilityBadge
                visibility={star.visibility as SkyVisibilityLevel}
                compact
              />
            ) : null}
          </Pressable>
        ))}

        <MySkyIdentityProfileBubble
          owner={activeBubbleOwner}
          anchorStar={activeBubbleStar}
          visible={bubbleOpen}
          canViewFullSky={bubbleCanViewFullSky}
          onClose={closeProfileBubble}
          onViewProfile={handleViewProfile}
          onJumpToSky={bubbleCanJumpToSky ? handleJumpToSkyFromBubble : undefined}
          onViewFullSky={
            activeBubbleOwner.isSelf || visitorMode ? undefined : handleViewFullSky
          }
          onConnect={
            activeBubbleOwner.isSelf
              ? undefined
              : visitorMode
                ? onConnect
                : handleConnect
          }
        />

        <MySkyStarInsightBubble
          star={insightStar}
          detail={insightDetail}
          visible={insightOpen}
          onClose={closeInsightBubble}
          onOpenDetail={insightActionAvailable ? handleOpenInsightDetail : undefined}
        />

        {immersive && !cleanSky ? (
          <View style={styles.exploreHint} pointerEvents="none">
            <Text style={styles.exploreHintText}>{MySkyCopy.exploreGestureHint}</Text>
          </View>
        ) : null}
        {visitorMode && cleanSky ? (
          <View style={styles.exploreHint} pointerEvents="none">
            <Text style={styles.exploreHintText}>{MySkyCopy.publicSkyGestureHint}</Text>
          </View>
        ) : null}
      </>
    ),
    [
      activeBubbleOwner,
      closeInsightBubble,
      insightActionAvailable,
      insightDetail,
      insightOpen,
      insightStar,
      handleOpenInsightDetail,
      activeBubbleStar,
      bubbleCanJumpToSky,
      bubbleCanViewFullSky,
      bubbleOpen,
      cleanSky,
      closeProfileBubble,
      constellationRevealActive,
      constellationRevealCount,
      constellationRevealPatternId,
      handleConnect,
      handleJumpToSkyFromBubble,
      handleNearbyIdentityPress,
      handleOwnIdentityPress,
      handleStarPress,
      handleViewFullSky,
      handleViewProfile,
      highlightOwnerId,
      identityStar,
      immersive,
      missingHint,
      nearbyAnchors,
      onConnect,
      onConstellationRevealComplete,
      ownBubbleActive,
      proximityOwnerId,
      proximityPhase,
      showNearbySkies,
      stars,
      visitorMode,
      view,
    ],
  );

  return (
    <View style={styles.outer}>
      {showLayerControls ? (
        <MySkyLayerControls
          compact={immersive}
          visibleLayers={viewState.visibleLayers}
          onToggleLayer={onToggleLayer}
          onRevealConstellations={onRevealConstellations}
          constellationRevealActive={constellationRevealActive}
        />
      ) : null}
      <View style={styles.wrap}>
        {immersive ? (
          <MySkyExplorableViewport
            initialSnapshot={viewportSnapshot}
            jumpSnapshot={jumpSnapshot}
            onSnapshotChange={onViewportChange}
            onViewportLiveChange={onViewportLiveChange}
            onWorldSizeChange={handleWorldSizeChange}
            onGestureActiveChange={handleGestureActiveChange}
            renderWorld={renderWorld}
          />
        ) : (
          <>
            <MySkyBackdrop dim />
            {renderWorld(worldSize.width > 0 ? worldSize : { width: 320, height: 400 })}
          </>
        )}
      </View>
      {missingHint ? <Text style={styles.missingHint}>{missingHint}</Text> : null}
    </View>
  );
}

export const MySkyStarCanvas = memo(MySkyStarCanvasComponent);
