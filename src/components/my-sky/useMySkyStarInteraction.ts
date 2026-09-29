/** LOCKED REELYOU STAR INTERACTION/DETAIL SYSTEM — do not refactor or alter without explicit product approval. */
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { MySkyCopy } from '@/constants/mySkyCopy';
import { buildStarInsightBubble } from '@/mySky/buildStarInsightBubble';
import type { SkyOwnerProfile } from '@/mySky/skyIdentity';
import {
  pushStarNavigationTarget,
  resolveStarNavigation,
  type StarNavigationTarget,
} from '@/mySky/resolveStarNavigation';
import { resolveVisitorStarNavigation } from '@/mySky/resolveVisitorStarNavigation';
import type { SkyConnectionStatus } from '@/mySky/skyIdentity';
import type { SkyNode } from '@/mySky/skyNodeTypes';
import type { MySkyStarDisplay, MySkyView } from '@/mySky/types';
import type { SkywriteRecord } from '@/skywrite/types';

export interface MySkyStarInteractionOptions {
  view: Pick<MySkyView, 'stars' | 'nodes' | 'patterns' | 'skyOwner' | 'identityStar'>;
  skywrites: SkywriteRecord[];
  joinedCommunityIds?: string[];
  guidanceActive?: boolean;
  onPatternStarPress?: (star: MySkyStarDisplay) => void;
  visitorMode?: boolean;
  publicSkyNodes?: SkyNode[];
  publicSkyConnectionStatus?: SkyConnectionStatus;
  publicSkyOwnerId?: string;
  /** When true, skip pan/zoom debounce (Skywrite full-screen sky). */
  allowTapDuringGesture?: boolean;
  isGestureBlocked?: () => boolean;
  /** Focused Skywrite sky only — one tap opens immersive moment (no insight preview card). */
  focusedSkywriteImmersiveTap?: boolean;
  /** Skip identity bubble — open profile directly (Skywrite Sky header / identity star). */
  directIdentityProfileNavigation?: boolean;
  /** Called when a post star opens its Skywrite moment. */
  onSkywriteStarOpened?: () => void;
}

export function useMySkyStarInteraction({
  view,
  skywrites,
  joinedCommunityIds = [],
  guidanceActive = false,
  onPatternStarPress,
  visitorMode = false,
  publicSkyNodes = [],
  publicSkyConnectionStatus = 'none',
  publicSkyOwnerId,
  allowTapDuringGesture = false,
  isGestureBlocked,
  focusedSkywriteImmersiveTap = false,
  directIdentityProfileNavigation = false,
  onSkywriteStarOpened,
}: MySkyStarInteractionOptions) {
  const router = useRouter();
  const { stars, nodes, patterns, skyOwner, identityStar } = view;

  const [activeId, setActiveId] = useState<string | null>(null);
  const [insightStar, setInsightStar] = useState<MySkyStarDisplay | null>(null);
  const [insightOpen, setInsightOpen] = useState(false);
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [missingHint, setMissingHint] = useState<string | null>(null);

  const insightDetail = useMemo(() => {
    if (!insightStar) return null;
    return buildStarInsightBubble(insightStar, nodes, patterns, skywrites);
  }, [insightStar, nodes, patterns, skywrites]);

  const resolveNavigationTarget = useCallback(
    (star: MySkyStarDisplay): StarNavigationTarget => {
      return visitorMode
        ? resolveVisitorStarNavigation(
            star,
            publicSkyNodes,
            publicSkyConnectionStatus,
            publicSkyOwnerId ?? skyOwner.id,
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
    ],
  );

  const navigateStar = useCallback(
    (star: MySkyStarDisplay) => {
      setMissingHint(null);
      const target = resolveNavigationTarget(star);
      if (target.kind === 'none') {
        setMissingHint(visitorMode ? MySkyCopy.publicStarUnavailable : MySkyCopy.starMissingToast);
        return;
      }
      pushStarNavigationTarget(router, target, {
        visitorMode,
        publicSkyOwnerId,
        skyOwnerId: skyOwner.id,
      });
    },
    [resolveNavigationTarget, router, visitorMode, publicSkyOwnerId, skyOwner.id],
  );

  const closeInsightBubble = useCallback(() => {
    setInsightOpen(false);
    setInsightStar(null);
    setActiveId(null);
    setMissingHint(null);
  }, []);

  const closeProfileBubble = useCallback(() => {
    setBubbleOpen(false);
    if (activeId === identityStar.id) {
      setActiveId(null);
    }
  }, [activeId, identityStar.id]);

  const openInsightForStar = useCallback((star: MySkyStarDisplay) => {
    setBubbleOpen(false);
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
    return resolveNavigationTarget(insightStar).kind !== 'none';
  }, [insightStar, onPatternStarPress, resolveNavigationTarget]);

  const tapAllowed = useCallback(() => {
    if (allowTapDuringGesture) return true;
    return !isGestureBlocked?.();
  }, [allowTapDuringGesture, isGestureBlocked]);

  const handleStarPress = useCallback(
    (star: MySkyStarDisplay) => {
      if (!tapAllowed()) return;
      const target = resolveNavigationTarget(star);
      if (
        (focusedSkywriteImmersiveTap || star.type === 'skywrite') &&
        target.kind === 'skywrite-play'
      ) {
        setMissingHint(null);
        closeInsightBubble();
        pushStarNavigationTarget(router, target, {
          visitorMode,
          publicSkyOwnerId,
          skyOwnerId: skyOwner.id,
        });
        onSkywriteStarOpened?.();
        return;
      }
      openInsightForStar(star);
    },
    [
      closeInsightBubble,
      focusedSkywriteImmersiveTap,
      onSkywriteStarOpened,
      openInsightForStar,
      publicSkyOwnerId,
      resolveNavigationTarget,
      router,
      skyOwner.id,
      tapAllowed,
      visitorMode,
    ],
  );

  const handleViewProfile = useCallback(() => {
    setBubbleOpen(false);
    if (skyOwner.isSelf) {
      router.push('/(tabs)/profile' as never);
    } else if (!visitorMode) {
      router.push(`/visitor-profile?id=${skyOwner.id}` as never);
    }
  }, [router, skyOwner.id, skyOwner.isSelf, visitorMode]);

  const handleOwnIdentityPress = useCallback(() => {
    if (!tapAllowed()) return;
    closeInsightBubble();
    if (directIdentityProfileNavigation) {
      handleViewProfile();
      return;
    }
    setActiveId(identityStar.id);
    setBubbleOpen(true);
  }, [closeInsightBubble, directIdentityProfileNavigation, handleViewProfile, identityStar.id, tapAllowed]);

  return {
    stars,
    identityStar,
    skyOwner,
    activeId,
    insightStar,
    insightOpen,
    insightDetail,
    bubbleOpen,
    missingHint,
    ownBubbleActive: bubbleOpen,
    closeInsightBubble,
    closeProfileBubble,
    handleStarPress,
    handleOwnIdentityPress,
    handleOpenInsightDetail,
    insightActionAvailable,
    handleViewProfile,
  };
}
