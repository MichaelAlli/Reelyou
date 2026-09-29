import { useRouter } from 'expo-router';
import { memo, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { MySkyRenderer } from '@/components/my-sky/MySkyRenderer';
import { MySkyStarInteractionOverlay } from '@/components/my-sky/MySkyStarInteractionOverlay';
import { SkywriteSkyOwnerHeader } from '@/components/skywrite/SkywriteSkyOwnerHeader';
import { SkywritePlayCopy } from '@/constants/skywritePlayCopy';
import { Fonts, Spacing } from '@/constants/theme';
import { currentUser } from '@/data/mockData';
import { buildPublicSkyView, resolvePublicSkyConnectionStatus } from '@/mySky/buildPublicSkyView';
import type { SkyConnectionStatus } from '@/mySky/skyIdentity';
import { loadSkyHeaderStyleId } from '@/profile/skyHeaderStylePersistence';
import type { SkyHeaderStyleId } from '@/profile/skyHeaderStyleTypes';
import { resolveOrbitOwnerSkywrites } from '@/profile/orbitProfileSkywriteFixtures';
import { buildVisitorProfileHref } from '@/profile/visitorProfileRoute';
import { usePlaySkySequenceRegistry } from '@/skywrite/play/usePlaySkySequenceRegistry';
import {
  defaultFocusedSkywriteIds,
  resolveFocusedSkyPlaySteps,
} from '@/skywrite/play/skywritePlayLogic';
import { loadSkywritePlaySequence } from '@/skywrite/play/skywritePlayPersistence';
import type { SkywriteRecord } from '@/skywrite/types';

interface SkywriteOwnerSkySnapshotPanelProps {
  ownerId: string;
  displayName: string;
  connectionStatus: SkyConnectionStatus;
  kind: 'connected' | 'suggested';
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
  const { width } = useWindowDimensions();
  const canvasWidth = width - Spacing.md * 2;
  const panelHeight = Math.min(Math.round(width * 0.72), 420);
  const [headerStyleId, setHeaderStyleId] = useState<SkyHeaderStyleId>('starlight');
  const { registry, ready: registryReady } = usePlaySkySequenceRegistry();
  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    void loadSkyHeaderStyleId(ownerId).then(setHeaderStyleId);
  }, [ownerId]);

  const skyView = useMemo(() => {
    const posts =
      ownerId === currentUser.id
        ? ownerSkywrites
        : ownerSkywrites ?? resolveOrbitOwnerSkywrites(ownerId);
    return buildPublicSkyView(ownerId, connectionStatus, undefined, undefined, posts ?? undefined);
  }, [connectionStatus, ownerId, ownerSkywrites]);

  useEffect(() => {
    if (!registryReady || !skyView) {
      setCanPlay(false);
      return;
    }
    let mounted = true;
    void loadSkywritePlaySequence().then((config) => {
      if (!mounted) return;
      const steps = resolveFocusedSkyPlaySteps(
        skyView.stars,
        ownerId === currentUser.id ? (ownerSkywrites ?? []) : resolveOrbitOwnerSkywrites(ownerId),
        config.focusedSky,
        config.singleBySkywriteId,
        { playSkyRegistry: registry },
      );
      setCanPlay(steps.length > 0);
    });
    return () => {
      mounted = false;
    };
  }, [ownerId, ownerSkywrites, registry, registryReady, skyView]);

  const exploreLabel =
    ownerId === currentUser.id
      ? SkywritePlayCopy.exploreFullSkySelf
      : SkywritePlayCopy.exploreFullSkyVisitor(displayName.split(' ')[0] ?? displayName);

  const openProfile = () => {
    if (ownerId === currentUser.id) {
      router.push('/(tabs)/profile' as never);
      return;
    }
    router.push(buildVisitorProfileHref(ownerId) as never);
  };

  const openFullSky = () => {
    router.push(`/public-sky?id=${encodeURIComponent(ownerId)}` as never);
  };

  const openPlaySky = () => {
    if (ownerId === currentUser.id) {
      router.push('/skywrite/play?scope=focused&autoplay=1' as never);
      return;
    }
    const ids = skyView
      ? defaultFocusedSkywriteIds(
          skyView.stars,
          ownerSkywrites ?? resolveOrbitOwnerSkywrites(ownerId),
        )
      : [];
    const first = ids[0];
    if (first) {
      router.push(`/skywrite/play?scope=single&id=${encodeURIComponent(first)}&autoplay=1` as never);
    }
  };

  if (!skyView) {
    return (
      <View style={styles.section}>
        <SkywriteSkyOwnerHeader
          displayName={displayName}
          headerStyleId={headerStyleId}
          onPressProfile={openProfile}
        />
        <Text style={styles.unavailable}>This Sky isn&apos;t available in Explore right now.</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <SkywriteSkyOwnerHeader
        displayName={displayName}
        headerStyleId={headerStyleId}
        onPressProfile={openProfile}
      />
      <Text style={styles.meta}>
        {kind === 'connected' ? 'Connected Sky' : 'Suggested · not connected'}
      </Text>
      <View style={[styles.canvas, { height: panelHeight }]}>
        <MySkyRenderer view={skyView} mode="resting" />
        <MySkyStarInteractionOverlay
          layoutWidth={canvasWidth}
          layoutHeight={panelHeight}
          view={skyView}
          skywrites={[...(ownerSkywrites ?? resolveOrbitOwnerSkywrites(ownerId))]}
          joinedCommunityIds={[...joinedCommunityIds]}
          guidanceActive={guidanceActive}
          showIdentityStar
          directIdentityProfileNavigation
          allowTapDuringGesture
          focusedSkywriteImmersiveTap
        />
      </View>
      {canPlay ? (
        <Pressable style={styles.action} onPress={openPlaySky}>
          <Text style={styles.actionText}>{SkywritePlayCopy.playSky}</Text>
        </Pressable>
      ) : null}
      <Pressable style={styles.link} onPress={openFullSky}>
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
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.22)',
    backgroundColor: 'rgba(8, 10, 28, 0.45)',
    padding: Spacing.md,
    gap: 8,
  },
  meta: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(248,244,236,0.55)',
    textAlign: 'center',
  },
  canvas: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.18)',
    backgroundColor: 'rgba(4, 6, 16, 0.35)',
  },
  action: { alignSelf: 'center', minHeight: 40, justifyContent: 'center' },
  actionText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#E8C872',
  },
  link: { alignSelf: 'center', minHeight: 36, justifyContent: 'center' },
  linkText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(232, 200, 114, 0.72)',
    textAlign: 'center',
  },
  unavailable: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(248,244,236,0.75)',
    textAlign: 'center',
    marginVertical: 12,
  },
});
