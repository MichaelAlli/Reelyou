import { useRouter } from 'expo-router';
import { memo, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { MySkyRenderer } from '@/components/my-sky/MySkyRenderer';
import { MySkyStarInteractionOverlay } from '@/components/my-sky/MySkyStarInteractionOverlay';
import { PlaySkyCue } from '@/components/skywrite/PlaySkyCue';
import { SkywriteSkyOwnerHeader } from '@/components/skywrite/SkywriteSkyOwnerHeader';
import { SkywritePlayCopy } from '@/constants/skywritePlayCopy';
import { Fonts, Spacing } from '@/constants/theme';
import { currentUser } from '@/data/mockData';
import { useOnboarding } from '@/onboarding';
import { buildPublicSkyView, resolvePublicSkyConnectionStatus } from '@/mySky/buildPublicSkyView';
import type { SkyConnectionStatus } from '@/mySky/skyIdentity';
import { loadSkyHeaderStyleId } from '@/profile/skyHeaderStylePersistence';
import type { SkyHeaderStyleId } from '@/profile/skyHeaderStyleTypes';
import { resolveOrbitOwnerSkywrites } from '@/profile/orbitProfileSkywriteFixtures';
import { isExploreDemoOwnerId } from '@/explore/exploreDemoSkies';
import { buildVisitorProfileHref } from '@/profile/visitorProfileRoute';
import { usePlaySkySequenceRegistry } from '@/skywrite/play/usePlaySkySequenceRegistry';
import { pushSkyreelPlay } from '@/skywrite/play/skyreelNavigation';
import { resolveOwnerPlaySkySteps } from '@/skywrite/play/resolveOwnerPlaySkySteps';
import type { SkywriteRecord } from '@/skywrite/types';

interface SkywriteOwnerSkySnapshotPanelProps {
  ownerId: string;
  displayName: string;
  connectionStatus: SkyConnectionStatus;
  kind: 'connected' | 'suggested' | 'demo';
  ownerSkywrites?: readonly SkywriteRecord[];
  joinedCommunityIds: readonly string[];
  guidanceActive: boolean;
}

function SkywriteOwnerSkySnapshotPanelComponent({
  ownerId,
  displayName,
  connectionStatus,
  kind,
  ownerSkywrites,
  joinedCommunityIds,
  guidanceActive,
}: SkywriteOwnerSkySnapshotPanelProps) {
  const router = useRouter();
  const { setMySkyExploreEnabled } = useOnboarding();
  const { width, height } = useWindowDimensions();
  const canvasWidth = width - Spacing.sm * 2;
  const panelHeight = Math.min(Math.max(Math.round(height * 0.58), 320), 520);
  const [headerStyleId, setHeaderStyleId] = useState<SkyHeaderStyleId>('starlight');
  const { registry, ready: registryReady } = usePlaySkySequenceRegistry();
  const [canPlay, setCanPlay] = useState(false);

  const ownerPosts = useMemo(() => {
    if (ownerId === currentUser.id) return ownerSkywrites ?? [];
    return ownerSkywrites ?? resolveOrbitOwnerSkywrites(ownerId);
  }, [ownerId, ownerSkywrites]);

  useEffect(() => {
    void loadSkyHeaderStyleId(ownerId).then(setHeaderStyleId);
  }, [ownerId]);

  const skyView = useMemo(() => {
    return buildPublicSkyView(
      ownerId,
      connectionStatus,
      undefined,
      undefined,
      ownerPosts.length ? ownerPosts : undefined,
    );
  }, [connectionStatus, ownerId, ownerPosts]);

  useEffect(() => {
    if (!registryReady) {
      setCanPlay(false);
      return;
    }
    const steps = resolveOwnerPlaySkySteps({
      ownerId,
      connectionStatus,
      ownerSkywrites: ownerPosts,
      registry,
    });
    setCanPlay(steps.length > 0);
  }, [connectionStatus, ownerId, ownerPosts, registry, registryReady]);

  const exploreLabel =
    ownerId === currentUser.id
      ? SkywritePlayCopy.exploreFullSkySelf
      : SkywritePlayCopy.exploreFullSkyVisitor(displayName.split(' ')[0] ?? displayName);

  const metaLabel =
    kind === 'demo'
      ? 'Demo Sky'
      : kind === 'connected'
        ? 'Connected Sky'
        : 'Suggested Sky';

  const openProfile = () => {
    if (ownerId === currentUser.id) {
      router.push('/(tabs)/profile' as never);
      return;
    }
    router.push(buildVisitorProfileHref(ownerId) as never);
  };

  const openFullSky = () => {
    if (ownerId === currentUser.id) {
      setMySkyExploreEnabled(false);
      router.push('/(tabs)/sky' as never);
      return;
    }
    router.push(`/public-sky?id=${encodeURIComponent(ownerId)}` as never);
  };

  const openPlaySky = () => {
    if (!canPlay) return;
    pushSkyreelPlay(
      router,
      `/skywrite/play?scope=owner&ownerId=${encodeURIComponent(ownerId)}&autoplay=1`,
    );
  };

  if (!skyView) {
    return (
      <View style={styles.section}>
        <SkywriteSkyOwnerHeader
          displayName={displayName}
          headerStyleId={headerStyleId}
          onPressProfile={openProfile}
          onPressIdentityStar={openProfile}
        />
        <Text style={styles.meta}>{metaLabel}</Text>
        <Text style={styles.unavailable}>This Sky isn&apos;t available in Explore right now.</Text>
      </View>
    );
  }

  const hasVisibleStars = skyView.stars.some((star) => star.type === 'skywrite' && star.sourceId);

  return (
    <View style={styles.section}>
      <SkywriteSkyOwnerHeader
        displayName={displayName}
        headerStyleId={headerStyleId}
        onPressProfile={openProfile}
        onPressIdentityStar={openProfile}
      />
      <PlaySkyCue
        onPress={openPlaySky}
        disabled={!canPlay}
        disabledHint={SkywritePlayCopy.playSkyNoRecent}
      />
      <Text style={styles.meta}>{metaLabel}</Text>
      <View style={[styles.canvas, { height: panelHeight, width: canvasWidth }]}>
        {hasVisibleStars ? (
          <>
            <MySkyRenderer view={skyView} mode="resting" />
            <MySkyStarInteractionOverlay
              layoutWidth={canvasWidth}
              layoutHeight={panelHeight}
              view={skyView}
              skywrites={[...ownerPosts]}
              joinedCommunityIds={[...joinedCommunityIds]}
              guidanceActive={guidanceActive}
              showIdentityStar={false}
              visitorMode
              publicSkyOwnerId={ownerId}
              publicSkyNodes={skyView.nodes}
              publicSkyConnectionStatus={connectionStatus}
              directIdentityProfileNavigation
              allowTapDuringGesture
              focusedSkywriteImmersiveTap
            />
          </>
        ) : (
          <View style={styles.emptySky}>
            <Text style={styles.emptySkyText}>No visible Skywrites in this view yet.</Text>
          </View>
        )}
      </View>
      <Pressable
        onPress={openFullSky}
        accessibilityRole="button"
        accessibilityLabel={exploreLabel}
        hitSlop={10}
        style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}>
        <Text style={styles.linkText}>{exploreLabel}</Text>
      </Pressable>
    </View>
  );
}

export const SkywriteOwnerSkySnapshotPanel = memo(SkywriteOwnerSkySnapshotPanelComponent);

export function connectionStatusForExploreOwner(
  ownerId: string,
  connectedActorIds: readonly string[],
): SkyConnectionStatus {
  return resolvePublicSkyConnectionStatus(ownerId, [...connectedActorIds]);
}

const styles = StyleSheet.create({
  section: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  meta: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(248,244,236,0.48)',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  canvas: {
    alignSelf: 'center',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.18)',
    backgroundColor: 'rgba(4, 6, 16, 0.35)',
  },
  link: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  linkPressed: { opacity: 0.88 },
  linkText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(232, 200, 114, 0.85)',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  unavailable: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(248,244,236,0.75)',
    textAlign: 'center',
    marginVertical: 12,
    paddingHorizontal: 8,
  },
  emptySky: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  emptySkyText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(248,244,236,0.65)',
    textAlign: 'center',
  },
});
