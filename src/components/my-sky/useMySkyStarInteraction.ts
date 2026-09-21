/** LOCKED REELYOU STAR INTERACTION/DETAIL SYSTEM — do not refactor or alter without explicit product approval. */
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { MySkyCopy } from '@/constants/mySkyCopy';
import { buildStarInsightBubble } from '@/mySky/buildStarInsightBubble';
import type { SkyOwnerProfile } from '@/mySky/skyIdentity';
import {
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
      openInsightForStar(star);
    },
    [openInsightForStar, tapAllowed],
  );

  const handleOwnIdentityPress = useCallback(() => {
    if (!tapAllowed()) return;
    closeInsightBubble();
    setActiveId(identityStar.id);
    setBubbleOpen(true);
  }, [closeInsightBubble, identityStar.id, tapAllowed]);

  const handleViewProfile = useCallback(() => {
    setBubbleOpen(false);
    if (skyOwner.isSelf) {
      router.push('/(tabs)/profile' as never);
    } else if (!visitorMode) {
      router.push(`/public-sky?id=${skyOwner.id}` as never);
    }
  }, [router, skyOwner.id, skyOwner.isSelf, visitorMode]);

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
