import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  AppState,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { resolveActiveUserId } from '@/auth/resolveActiveUserId';
import { Fonts } from '@/constants/theme';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { useQaPreviewMode } from '@/qa/QaPreviewContext';
import { preserveQaPreviewRedirectHref } from '@/qa/preserveQaPreviewRedirectHref';
import { useLivingSkyFeaturedIds } from '@/mySky/livingPreview/livingSkyFeaturedDraft';
import { resolveFeaturedIdsForSky } from '@/mySky/livingPreview/livingSkyFeaturedLogic';
import { placeLivingSkyPreview } from '@/mySky/livingPreview/livingSkyPreviewPlacement';
import {
  bindLivingSkyPreviewRotation,
  LIVING_SKY_PREVIEW_FADE_MS,
  nextLivingSkyPreviewIndex,
} from '@/mySky/livingPreview/livingSkyPreviewRotation';
import {
  resolveLivingSkyPreviewTarget,
  selectLivingSkyFeaturedMoments,
} from '@/mySky/livingPreview/livingSkyPreviewSelection';
import type { LivingSkyPreviewStarRef } from '@/mySky/livingPreview/livingSkyPreviewTypes';
import { isModerationContentSuppressedSync } from '@/moderation/moderationContentRegistry';
import { isFollowingSkyUser } from '@/social/skyFollow/skyFollowLogic';
import { openSkywritePostView } from '@/skywrite/openSkywritePostView';
import { resolvePrimaryMediaStepIndex } from '@/skywrite/play/skywritePlayLogic';
import { useSkywriteLibrary } from '@/skywrite/library/SkywriteLibraryProvider';
import type { SkywriteRecord } from '@/skywrite/types';

interface LivingSkyPreviewOverlayProps {
  layoutWidth: number;
  layoutHeight: number;
  stars: readonly LivingSkyPreviewStarRef[];
  posts: readonly SkywriteRecord[];
  ownerId: string;
  /** Normalized points that must stay clear, such as the identity star. */
  protectedPoints?: readonly { x: number; y: number }[];
  /** Pixels at the bottom of this canvas that overlap a dock or tab bar. */
  bottomClearance?: number;
  /** Snapshot is on screen and the app is the active view. */
  active?: boolean;
  /** User is scrolling, opening a sheet, or exploring stars. */
  paused?: boolean;
  /**
   * undefined: owner's device draft when this viewer owns the sky.
   * null: automatic.
   * list: explicit ids for this sky (still privacy-filtered). QA only when not the owner.
   */
  featuredIdsOverride?: readonly string[] | null;
}

function LivingSkyPreviewOverlayComponent({
  layoutWidth,
  layoutHeight,
  stars,
  posts,
  ownerId,
  protectedPoints = [],
  bottomClearance = 8,
  active = true,
  paused = false,
  featuredIdsOverride,
}: LivingSkyPreviewOverlayProps) {
  const router = useRouter();
  const qaPreview = useQaPreviewMode();
  const { user } = useReelyouAuth();
  const viewerId = resolveActiveUserId(user) ?? '';
  const viewerIsOwner = Boolean(viewerId) && viewerId === ownerId;
  const { skyFollowGraph, messages, preferences } = useReelyouConnect();
  const library = useSkywriteLibrary();
  const deviceDraftIds = useLivingSkyFeaturedIds(ownerId, viewerIsOwner && featuredIdsOverride === undefined);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const [pageVisible, setPageVisible] = useState(true);
  const [holding, setHolding] = useState(false);
  const [screenFocused, setScreenFocused] = useState(true);
  const [failedIds, setFailedIds] = useState<ReadonlySet<string>>(() => new Set());
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;
  const countRef = useRef(0);
  const openedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setSystemReducedMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemReducedMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      setAppActive(next === 'active');
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const sync = () => setPageVisible(document.visibilityState !== 'hidden');
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  const unavailableIds = useMemo(() => {
    const ids = new Set<string>(failedIds);
    for (const post of posts) {
      if (library.isContentDeleted(post.id) || library.isArchived(post.id)) ids.add(post.id);
      if (isModerationContentSuppressedSync('skywrite', post.id)) ids.add(post.id);
    }
    return ids;
  }, [failedIds, library, posts]);

  const manualIds = useMemo(
    () =>
      resolveFeaturedIdsForSky({
        viewerIsOwner,
        deviceDraftIds,
        override: featuredIdsOverride,
      }),
    [deviceDraftIds, featuredIdsOverride, viewerIsOwner],
  );

  const selection = useMemo(
    () =>
      selectLivingSkyFeaturedMoments({
        stars,
        posts,
        skyOwnerId: ownerId,
        viewerIsOwner,
        access: {
          viewerId: viewerId || 'visitor',
          viewerFollowsAuthor: viewerId ? isFollowingSkyUser(skyFollowGraph, viewerId, ownerId) : false,
          authorFollowsViewer: viewerId ? isFollowingSkyUser(skyFollowGraph, ownerId, viewerId) : false,
          viewerBlockedAuthor: messages.blockedUserIds.includes(ownerId),
        },
        manualIds,
        unavailableIds,
      }),
    [
      manualIds,
      messages.blockedUserIds,
      ownerId,
      posts,
      skyFollowGraph,
      stars,
      unavailableIds,
      viewerId,
      viewerIsOwner,
    ],
  );

  const momentKey = selection.moments.map((moment) => moment.postId).join('|');
  const moments = selection.moments;
  countRef.current = moments.length;
  const safeIndex = moments.length === 0 ? 0 : index % moments.length;
  const moment = moments[safeIndex] ?? null;

  useEffect(() => {
    setIndex(0);
    opacity.setValue(1);
  }, [momentKey, opacity]);

  const reducedMotion =
    systemReducedMotion || preferences.accessibilityPreferences.preferReducedMotion;
  const rotationPaused = paused || holding || !active || !screenFocused || !appActive || !pageVisible;

  useEffect(() => {
    let fadeTimer: ReturnType<typeof setTimeout> | null = null;
    const stop = bindLivingSkyPreviewRotation({
      count: moments.length,
      paused: rotationPaused,
      reducedMotion,
      onAdvance: () => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: LIVING_SKY_PREVIEW_FADE_MS,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (!finished) return;
          fadeTimer = setTimeout(() => {
            setIndex((current) => nextLivingSkyPreviewIndex(current, countRef.current));
            Animated.timing(opacity, {
              toValue: 1,
              duration: LIVING_SKY_PREVIEW_FADE_MS,
              useNativeDriver: true,
            }).start();
          }, 0);
        });
      },
    });
    return () => {
      stop();
      if (fadeTimer) clearTimeout(fadeTimer);
      opacity.stopAnimation();
    };
  }, [momentKey, moments.length, opacity, reducedMotion, rotationPaused]);

  useEffect(() => {
    if (!rotationPaused && !reducedMotion && moments.length > 1) return;
    opacity.stopAnimation();
    opacity.setValue(1);
  }, [moments.length, opacity, reducedMotion, rotationPaused]);

  useEffect(() => {
    if (!active) return;
    openedRef.current = false;
    setHolding(false);
  }, [active]);

  useFocusEffect(
    useCallback(() => {
      setScreenFocused(true);
      openedRef.current = false;
      setHolding(false);
      return () => setScreenFocused(false);
    }, []),
  );

  if (!moment || layoutWidth <= 0 || layoutHeight <= 0) return null;

  const frame = placeLivingSkyPreview({
    starX: moment.starX,
    starY: moment.starY,
    width: layoutWidth,
    height: layoutHeight,
    bottomClearance,
    protectedPoints,
  });
  if (!frame) return null;

  const openMoment = () => {
    const target = resolveLivingSkyPreviewTarget(moment.postId);
    const post = posts.find((entry) => entry.id === target.skywriteId);
    if (!post || post.id !== moment.postId) return;
    openedRef.current = true;
    setHolding(true);
    if (qaPreview.active) {
      const href = preserveQaPreviewRedirectHref(
        `/skywrite/moment?skywriteId=${encodeURIComponent(post.id)}&step=${resolvePrimaryMediaStepIndex(post)}`,
        { qaPreviewActive: true },
      );
      router.push(href as never);
      return;
    }
    openSkywritePostView(router, post);
  };

  const glow = /^#[0-9A-Fa-f]{6}$/.test(moment.starColor) ? `${moment.starColor}73` : 'rgba(255,213,122,0.45)';

  return (
    <View style={styles.root} pointerEvents="box-none" testID="living-sky-preview">
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.circleWrap,
          {
            left: frame.left,
            top: frame.top,
            width: frame.diameter,
            height: frame.diameter,
            borderRadius: frame.diameter / 2,
            opacity,
            borderColor: moment.starColor,
            boxShadow: `0 0 16px ${glow}`,
          },
        ]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${moment.label}`}
          onPress={openMoment}
          onPressIn={() => setHolding(true)}
          onPressOut={() => {
            if (!openedRef.current) setHolding(false);
          }}
          testID="living-sky-preview-circle"
          style={[styles.circle, { borderRadius: frame.diameter / 2 }]}>
          {moment.presentation === 'text' ? (
            <View style={styles.textFill}>
              <Text style={styles.textBody} numberOfLines={5}>
                {moment.text || 'Reflection'}
              </Text>
            </View>
          ) : moment.imageUri ? (
            <Image
              source={{ uri: moment.imageUri }}
              style={styles.image}
              contentFit="cover"
              transition={0}
              accessibilityIgnoresInvertColors
              onError={() => {
                setFailedIds((current) => {
                  const next = new Set(current);
                  next.add(moment.postId);
                  return next;
                });
              }}
            />
          ) : (
            <View style={styles.fallback}>
              <Text style={styles.fallbackMark}>▶</Text>
            </View>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

export const LivingSkyPreviewOverlay = memo(LivingSkyPreviewOverlayComponent);

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 30,
  },
  circleWrap: {
    position: 'absolute',
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: 'rgba(8, 10, 24, 0.92)',
  },
  circle: {
    flex: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textFill: {
    flex: 1,
    backgroundColor: 'rgba(36, 22, 68, 0.94)',
    paddingHorizontal: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBody: {
    fontFamily: Fonts.serif,
    fontSize: 12,
    lineHeight: 16,
    color: '#FFF8F0',
    textAlign: 'center',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(18, 14, 28, 0.94)',
  },
  fallbackMark: {
    color: '#FFD57A',
    fontSize: 18,
  },
});
