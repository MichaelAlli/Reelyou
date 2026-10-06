import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeBackdrop } from '@/components/home/HomeBackdrop';
import { SkywriteImmersiveMomentView } from '@/components/skywrite/SkywriteImmersiveMomentView';
import { SkywritePlayCopy } from '@/constants/skywritePlayCopy';
import { Fonts, Spacing } from '@/constants/theme';
import { resolveActiveUserId } from '@/auth/resolveActiveUserId';
import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { useEffectiveViewerId } from '@/auth/useSessionUserId';
import { useUserAvatar } from '@/identity/UserAvatarProvider';
import { fetchSkyreelViewersForOwner } from '@/social/skyreelViewsApi';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { useOnboarding } from '@/onboarding';
import { resolveSkywriteViewerAccess } from '@/skywrite/access/resolveSkywriteViewerAccess';
import { useOverlayAudioPreviewScope } from '@/skywrite/media/useOverlayAudioPreviewScope';
import { usePlaySkySequenceRegistry } from '@/skywrite/play/usePlaySkySequenceRegistry';
import {
  resolveFocusedSkyPlaySteps,
  resolveStepsForSkywrite,
} from '@/skywrite/play/skywritePlayLogic';
import { resolveOwnerPlaySkySteps } from '@/skywrite/play/resolveOwnerPlaySkySteps';
import { resolveOrbitOwnerSkywrites } from '@/profile/orbitProfileSkywriteFixtures';
import { resolvePublicSkyConnectionStatus } from '@/mySky/buildPublicSkyView';
import { resolvePublicSkyOwnerProfile } from '@/mySky/skyIdentity';
import { resolveSkyConnectionActivities } from '@/mySky/skyConnectionSources';
import { loadSkywritePlaySequence } from '@/skywrite/play/skywritePlayPersistence';
import type { SkywritePlayScope, SkywritePlayStep } from '@/skywrite/play/skywritePlayTypes';
import {
  fetchAuthorServerSkywrites,
  fetchSkywriteFromServer,
  mapServerSkywriteToRecord,
} from '@/social/sharedSkywriteApi';
import {
  cacheRemoteSkywrite,
  cacheRemoteSkywrites,
  getCachedAuthorSkywrites,
} from '@/social/sharedSkywriteCache';
import { isSharedSocialPersistenceEnabled } from '@/social/sharedSocialApi';
import { resolveSkywriteById } from '@/skywrite/resolveSkywriteById';
import { useSkywriteLibrary } from '@/skywrite/library/SkywriteLibraryProvider';
import {
  afterFirstPostLeftRestart,
  nextFirstPostLeftTapState,
  resetFirstPostLeftTapState,
  type FirstPostLeftTapState,
} from '@/skywrite/play/skyreelFirstPostEdgeNavigation';
import { exitSkyreel, persistSkyreelReturnFromParam } from '@/skywrite/play/skyreelNavigation';
import {
  formatSkyReelAgeLabel,
  isSkyReelActive,
  resolveSkyReelAppearanceStartMs,
} from '@/skywrite/play/skyReelActive';
import { resolveSkyReelActiveUntilMs } from '@/skywrite/play/skyReelExpiry';
import { useSkyReelViewRecorder } from '@/skywrite/play/useSkyReelViewRecorder';
import {
  findFirstEligibleStepIndex,
  findNextEligibleStepIndexAfter,
} from '@/skywrite/play/skywriteGuidedPlayExpiry';
import {
  findNextStoryStepIndex,
  findPreviousStoryStepIndex,
  resolveStorySegmentCount,
  resolveStorySegmentIndex,
} from '@/skywrite/play/skywriteStorySegments';
import { stepUsesAttachedVoiceover } from '@/skywrite/voiceoverStepUtils';
import { subscribeProtectedPlaybackStop } from '@/media/protectedPlaybackStop';
import { useResolvedSkywriteRecord } from '@/social/useResolvedSkywriteRecord';
import { resolveSkyReelStoryStillDwellMs } from '@/skywrite/play/skyReelStoryTiming';

const MANUAL_NAV_AUTO_ADVANCE_BLOCK_MS = 900;

export function SkywriteGuidedPlayScreen() {
  const router = useRouter();
  const { scope, id, ownerId, start, autoplay, returnTo } = useLocalSearchParams<{
    scope?: SkywritePlayScope;
    id?: string;
    ownerId?: string;
    start?: string;
    autoplay?: string;
    returnTo?: string;
  }>();
  const playScope: SkywritePlayScope =
    scope === 'single' ? 'single' : scope === 'owner' ? 'owner' : 'focused';
  const { user: authUser } = useReelyouAuth();
  const activeUserId = resolveActiveUserId(authUser);
  const viewerId = useEffectiveViewerId();
  const { profilePhotoDisplayUri } = useUserAvatar();
  const { skywrites, mySkyView, aroundYourSkyFeed } = useOnboarding();
  const [viewerSheetOpen, setViewerSheetOpen] = useState(false);
  const [viewerRows, setViewerRows] = useState<
    { userId: string; displayName: string; lastViewedAt: number }[]
  >([]);
  const [viewerCount, setViewerCount] = useState(0);
  const { messages, skyFollowGraph } = useReelyouConnect();
  const { lifecycle: contentLifecycle } = useSkywriteLibrary();
  const { registry, ready: registryReady, mergeServerRows } = usePlaySkySequenceRegistry();
  const audioPreview = useOverlayAudioPreviewScope(true);
  const [remoteSingleRecord, setRemoteSingleRecord] = useState<import('@/skywrite/types').SkywriteRecord | null>(
    null,
  );
  const [remoteFetchTick, setRemoteFetchTick] = useState(0);
  const [stepsLoaded, setStepsLoaded] = useState(false);
  const [steps, setSteps] = useState<SkywritePlayStep[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [needsTapToPlay, setNeedsTapToPlay] = useState(false);
  const [manualPlayNonce, setManualPlayNonce] = useState(0);
  const [mediaStartNonce, setMediaStartNonce] = useState(0);
  const [playSessionId, setPlaySessionId] = useState(0);
  const playSessionRef = useRef(0);
  const stopPlaybackRef = useRef<() => void>(() => undefined);
  const [userStartedPlayback, setUserStartedPlayback] = useState(false);
  const startedRef = useRef(false);
  const autoAdvancePulseRef = useRef(0);
  const manualNavUntilRef = useRef(0);
  const firstPostLeftRef = useRef<FirstPostLeftTapState>(resetFirstPostLeftTapState());
  const [hourLabelTick, setHourLabelTick] = useState(0);
  const [sequenceRefreshKey, setSequenceRefreshKey] = useState(0);
  const [sequenceComplete, setSequenceComplete] = useState(false);
  const [recordHydration, setRecordHydration] = useState<'idle' | 'loading' | 'failed'>('idle');
  const [recordFetchNonce, setRecordFetchNonce] = useState(0);
  const initialPlayIndexResolvedRef = useRef(false);
  const exitPlaybackOnceRef = useRef(false);
  const transitionGenerationRef = useRef(0);

  useEffect(() => {
    persistSkyreelReturnFromParam(returnTo);
  }, [returnTo]);

  useEffect(() => {
    if (!isSharedSocialPersistenceEnabled() || playScope !== 'owner' || !ownerId) return;
    let mounted = true;
    void fetchAuthorServerSkywrites(ownerId).then((serverRows) => {
      if (!mounted || serverRows.length === 0) return;
      const posts = serverRows.map((row) =>
        mapServerSkywriteToRecord(row),
      );
      cacheRemoteSkywrites(ownerId, posts);
      void mergeServerRows(serverRows);
      setRemoteFetchTick((tick) => tick + 1);
    });
    return () => {
      mounted = false;
    };
  }, [mergeServerRows, ownerId, playScope]);

  useEffect(() => {
    if (!isSharedSocialPersistenceEnabled() || playScope !== 'single' || !id) return;
    let mounted = true;
    void fetchSkywriteFromServer(id).then((remote) => {
      if (!mounted || !remote) return;
      cacheRemoteSkywrite(remote);
      setRemoteSingleRecord(remote);
      setRemoteFetchTick((tick) => tick + 1);
    });
    return () => {
      mounted = false;
    };
  }, [id, playScope]);

  useEffect(() => {
    if (!registryReady) return;
    let mounted = true;
    void loadSkywritePlaySequence().then((config) => {
      if (!mounted) return;
      if (playScope === 'owner' && ownerId) {
        const connectedActorIds = resolveSkyConnectionActivities(aroundYourSkyFeed).map(
          (entry) => entry.actorId,
        );
        const connectionStatus = resolvePublicSkyConnectionStatus(ownerId, connectedActorIds);
        const ownerPosts =
          activeUserId && ownerId === activeUserId
            ? skywrites
            : [...resolveOrbitOwnerSkywrites(ownerId), ...getCachedAuthorSkywrites(ownerId)];
        setSteps(
          resolveOwnerPlaySkySteps({
            ownerId,
            sessionOwnerId: activeUserId,
            connectionStatus,
            ownerSkywrites: ownerPosts,
            registry,
            nowMs: Date.now(),
            retainExpiredInSequence: false,
          }),
        );
      } else if (playScope === 'single' && id) {
        const record =
          resolveSkywriteById(skywrites, id, contentLifecycle) ??
          (remoteSingleRecord?.id === id ? remoteSingleRecord : null);
        const allowed =
          record &&
          viewerId &&
          resolveSkywriteViewerAccess({
            viewerId,
            authorId: record.authorId ?? '',
            visibility: record.visibility,
            followGraph: skyFollowGraph,
            blockedUserIds: messages.blockedUserIds,
          });
        if (record && allowed) {
          setSteps(resolveStepsForSkywrite(record, config.singleBySkywriteId[id]));
        } else {
          setSteps([]);
        }
      } else {
        setSteps(
          resolveFocusedSkyPlaySteps(
            mySkyView.stars,
            skywrites,
            config.focusedSky,
            config.singleBySkywriteId,
            {
              playSkyRegistry: registry,
              retainExpiredInSequence: false,
              nowMs: Date.now(),
              sessionOwnerId: activeUserId,
            },
          ),
        );
      }
      setStepsLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, [
    activeUserId,
    contentLifecycle,
    id,
    messages.blockedUserIds,
    aroundYourSkyFeed,
    mySkyView.stars,
    ownerId,
    playScope,
    registry,
    registryReady,
    skyFollowGraph,
    viewerId,
    skywrites,
    remoteSingleRecord,
    remoteFetchTick,
    sequenceRefreshKey,
  ]);

  useEffect(() => {
    const startIndex = Number(start);
    if (Number.isFinite(startIndex) && startIndex >= 0) {
      setIndex(Math.min(startIndex, Math.max(0, steps.length - 1)));
    }
  }, [start, steps.length]);

  const current = steps[index];
  const record = useMemo(() => {
    if (!current) return undefined;
    const local = resolveSkywriteById(skywrites, current.skywriteId, contentLifecycle);
    if (local) return local;
    if (remoteSingleRecord?.id === current.skywriteId) return remoteSingleRecord;
    if (ownerId && playScope === 'owner') {
      const cached = getCachedAuthorSkywrites(ownerId).find((p) => p.id === current.skywriteId);
      if (cached) return cached;
    }
    return undefined;
  }, [
    contentLifecycle,
    current,
    ownerId,
    playScope,
    remoteSingleRecord,
    skywrites,
  ]);

  const postsById = useMemo(() => {
    const map = new Map(skywrites.map((post) => [post.id, post]));
    if (remoteSingleRecord) map.set(remoteSingleRecord.id, remoteSingleRecord);
    for (const post of getCachedAuthorSkywrites(ownerId ?? '')) {
      map.set(post.id, post);
    }
    return map;
  }, [ownerId, remoteSingleRecord, skywrites]);

  const { record: resolvedRecord } = useResolvedSkywriteRecord(record);
  const playbackRecord = resolvedRecord ?? record;

  const storyAuthorId =
    playbackRecord?.authorId ?? record?.authorId ?? ownerId ?? activeUserId;
  const isOwnerStory = storyAuthorId === activeUserId;
  const connectedActorIds = useMemo(
    () => resolveSkyConnectionActivities(aroundYourSkyFeed).map((entry) => entry.actorId),
    [aroundYourSkyFeed],
  );
  const storyAuthorProfile = useMemo(() => {
    if (isOwnerStory) return null;
    const connectionStatus = resolvePublicSkyConnectionStatus(
      storyAuthorId,
      connectedActorIds,
    );
    return resolvePublicSkyOwnerProfile(storyAuthorId, connectionStatus);
  }, [connectedActorIds, isOwnerStory, storyAuthorId]);
  const storyAuthorName = isOwnerStory
    ? authUser?.fullName?.trim() || 'You'
    : storyAuthorProfile?.name?.trim() || 'Sky friend';
  const storyAuthorAvatar = isOwnerStory
    ? profilePhotoDisplayUri
    : storyAuthorProfile?.avatarUri ?? null;

  useSkyReelViewRecorder({
    skywriteId: current?.skywriteId,
    active: Boolean(current && !paused && playScope !== 'single'),
    isOwner: isOwnerStory,
    enabled: isSharedSocialPersistenceEnabled(),
  });

  useEffect(() => {
    if (!stepsLoaded || !current || record) {
      if (record) setRecordHydration('idle');
      return;
    }
    if (!isSharedSocialPersistenceEnabled()) {
      setRecordHydration('failed');
      return;
    }
    setRecordHydration('loading');
    let mounted = true;
    void fetchSkywriteFromServer(current.skywriteId).then((remote) => {
      if (!mounted) return;
      if (remote) {
        cacheRemoteSkywrite(remote);
        setRemoteFetchTick((tick) => tick + 1);
        setRecordHydration('idle');
      } else {
        setRecordHydration('failed');
      }
    });
    return () => {
      mounted = false;
    };
  }, [current, record, recordFetchNonce, stepsLoaded]);

  useEffect(() => () => {
    void audioPreview.stopAll();
  }, [audioPreview]);

  const previewId = current ? `guided-play-${current.skywriteId}-${current.stepId}` : '';
  const audioPlaying = audioPreview.isPreviewPlaying(previewId);
  const shouldAutoplayVideo =
    !paused &&
    !needsTapToPlay &&
    (autoplay === '1' ||
      playScope === 'focused' ||
      playScope === 'owner' ||
      playScope === 'single') &&
    current?.kind === 'video';

  const bumpPlaySession = useCallback(() => {
    playSessionRef.current += 1;
    setPlaySessionId(playSessionRef.current);
    autoAdvancePulseRef.current = Date.now();
  }, []);

  const haltOutgoingPlayback = useCallback(() => {
    stopPlaybackRef.current();
    void audioPreview.stopAll();
  }, [audioPreview]);

  useEffect(() => {
    return subscribeProtectedPlaybackStop(() => {
      haltOutgoingPlayback();
      setPaused(true);
    });
  }, [haltOutgoingPlayback]);

  const handleExit = useCallback(() => {
    haltOutgoingPlayback();
    bumpPlaySession();
    setPaused(true);
    setNeedsTapToPlay(false);
    exitSkyreel(router, returnTo);
  }, [audioPreview, bumpPlaySession, haltOutgoingPlayback, returnTo, router]);

  const advance = useCallback(() => {
    haltOutgoingPlayback();
    bumpPlaySession();
    setMediaStartNonce((n) => n + 1);
    setIndex((value) => {
      const next = findNextStoryStepIndex(steps, value);
      if (next == null) {
        setSequenceComplete(true);
        return value;
      }
      return next;
    });
  }, [bumpPlaySession, haltOutgoingPlayback, steps]);

  const restartCurrentStep = useCallback(() => {
    haltOutgoingPlayback();
    bumpPlaySession();
    setMediaStartNonce((n) => n + 1);
  }, [audioPreview, bumpPlaySession, haltOutgoingPlayback]);

  const goNext = useCallback(() => {
    firstPostLeftRef.current = resetFirstPostLeftTapState();
    manualNavUntilRef.current = Date.now() + MANUAL_NAV_AUTO_ADVANCE_BLOCK_MS;
    autoAdvancePulseRef.current = Date.now();
    haltOutgoingPlayback();
    bumpPlaySession();
    setNeedsTapToPlay(false);
    setMediaStartNonce((n) => n + 1);
    setIndex((value) => {
      const next = findNextStoryStepIndex(steps, value);
      if (next == null) {
        setSequenceComplete(true);
        return value;
      }
      return next;
    });
  }, [bumpPlaySession, haltOutgoingPlayback, steps]);

  const goPrevious = useCallback(() => {
    firstPostLeftRef.current = resetFirstPostLeftTapState();
    manualNavUntilRef.current = Date.now() + MANUAL_NAV_AUTO_ADVANCE_BLOCK_MS;
    autoAdvancePulseRef.current = Date.now();
    haltOutgoingPlayback();
    bumpPlaySession();
    setNeedsTapToPlay(false);
    setMediaStartNonce((n) => n + 1);
    setIndex((value) => {
      const prev = findPreviousStoryStepIndex(steps, value);
      return prev ?? value;
    });
  }, [bumpPlaySession, haltOutgoingPlayback, steps]);

  const dismissTapToPlay = useCallback(() => {
    setNeedsTapToPlay(false);
  }, []);

  const handleTapToStartSkyreel = useCallback(() => {
    setPaused(false);
    setUserStartedPlayback(true);
    startedRef.current = true;
    setNeedsTapToPlay(false);
    setManualPlayNonce((n) => n + 1);
    setMediaStartNonce((n) => n + 1);
    autoAdvancePulseRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (index !== 0) {
      firstPostLeftRef.current = resetFirstPostLeftTapState();
    }
  }, [index]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') setPaused(true);
      if (state === 'active') {
        setHourLabelTick((t) => t + 1);
        setSequenceRefreshKey((k) => k + 1);
        if (isSharedSocialPersistenceEnabled()) {
          const refreshOwnerId =
            playScope === 'owner' && ownerId
              ? ownerId
              : playScope === 'focused'
                ? activeUserId
                : null;
          if (refreshOwnerId) {
            void fetchAuthorServerSkywrites(refreshOwnerId).then((serverRows) => {
              if (serverRows.length === 0) return;
              cacheRemoteSkywrites(
                refreshOwnerId,
                serverRows.map((row) => mapServerSkywriteToRecord(row)),
              );
              void mergeServerRows(serverRows);
              setRemoteFetchTick((tick) => tick + 1);
            });
          }
        }
      }
    });
    return () => sub.remove();
  }, [mergeServerRows, ownerId, playScope]);

  useEffect(() => {
    const timer = setInterval(() => {
      setHourLabelTick((t) => t + 1);
      setSequenceRefreshKey((k) => k + 1);
    }, 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!stepsLoaded || steps.length === 0 || !current) return;
    if (playScope === 'single') return;
    const stillPresent = steps.some(
      (step) => step.skywriteId === current.skywriteId && step.stepId === current.stepId,
    );
    if (!stillPresent) {
      const first = findFirstEligibleStepIndex(steps, registry, Date.now(), postsById);
      if (first != null) setIndex(first);
      else handleExit();
    }
  }, [current, handleExit, playScope, postsById, registry, steps, stepsLoaded]);

  useEffect(() => {
    if (!stepsLoaded || !registryReady || playScope === 'single') return;
    if (initialPlayIndexResolvedRef.current) return;
    initialPlayIndexResolvedRef.current = true;
    const startIndex = Number(start);
    if (Number.isFinite(startIndex) && startIndex >= 0) return;
    const firstEligible = findFirstEligibleStepIndex(steps, registry, Date.now(), postsById);
    if (firstEligible != null) {
      setIndex(firstEligible);
    }
  }, [playScope, postsById, registry, registryReady, start, steps, stepsLoaded]);

  const skyReelAgeLabel = useMemo(() => {
    if (playScope === 'single' || !record) return null;
    const start = resolveSkyReelAppearanceStartMs(record, registry);
    return formatSkyReelAgeLabel(start, Date.now());
  }, [playScope, record, registry, hourLabelTick]);

  const hasNextEligibleSkyReel = useMemo(() => {
    if (playScope === 'single') return index < steps.length - 1;
    return (
      findNextEligibleStepIndexAfter(steps, index, registry, Date.now(), postsById) != null
    );
  }, [index, playScope, postsById, registry, steps]);

  useEffect(() => {
    if (!isOwnerStory || !current?.skywriteId || playScope === 'single') return;
    void fetchSkyreelViewersForOwner(current.skywriteId).then((result) => {
      if (!result) return;
      setViewerCount(result.count);
      setViewerRows(result.viewers);
    });
  }, [current?.skywriteId, isOwnerStory, playScope, hourLabelTick]);

  const applyExpiryTransition = useCallback(
    (toIndex: number | 'exit') => {
      const generation = transitionGenerationRef.current + 1;
      transitionGenerationRef.current = generation;
      manualNavUntilRef.current = Date.now() + MANUAL_NAV_AUTO_ADVANCE_BLOCK_MS;
      autoAdvancePulseRef.current = Date.now();
      haltOutgoingPlayback();
      bumpPlaySession();
      setMediaStartNonce((n) => n + 1);
      if (toIndex === 'exit') {
        if (exitPlaybackOnceRef.current) return;
        exitPlaybackOnceRef.current = true;
        handleExit();
        return;
      }
      setIndex(toIndex);
    },
    [bumpPlaySession, handleExit, haltOutgoingPlayback],
  );

  useEffect(() => {
    if (playScope === 'single' || !record) return;
    if (!isSkyReelActive(record, registry, Date.now())) {
      const nextEligible = findNextEligibleStepIndexAfter(
        steps,
        index,
        registry,
        Date.now(),
        postsById,
      );
      applyExpiryTransition(nextEligible ?? 'exit');
    }
  }, [
    applyExpiryTransition,
    hourLabelTick,
    index,
    playScope,
    postsById,
    record,
    registry,
    steps,
  ]);

  const handleEdgePrevious = useCallback(() => {
    if (index === 0) {
      const action = nextFirstPostLeftTapState(firstPostLeftRef.current);
      if (action === 'exit') {
        firstPostLeftRef.current = resetFirstPostLeftTapState();
        handleExit();
        return;
      }
      firstPostLeftRef.current = afterFirstPostLeftRestart();
      restartCurrentStep();
      return;
    }
    goPrevious();
  }, [goPrevious, handleExit, index, restartCurrentStep]);

  const handleEdgeNext = useCallback(() => {
    firstPostLeftRef.current = resetFirstPostLeftTapState();
    goNext();
  }, [goNext]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleExit();
      if (event.key === 'ArrowLeft') handleEdgePrevious();
      if (event.key === 'ArrowRight') handleEdgeNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleEdgeNext, handleEdgePrevious, handleExit]);

  const storySegmentIndex = resolveStorySegmentIndex(steps, index);
  const storySegmentCount = resolveStorySegmentCount(steps);

  const tryAutoAdvance = useCallback(() => {
    if (paused || needsTapToPlay) return;
    if (Date.now() < manualNavUntilRef.current) return;
    if (Date.now() - autoAdvancePulseRef.current < 500) return;
    const sessionAtFinish = playSessionRef.current;
    autoAdvancePulseRef.current = Date.now();
    if (sessionAtFinish !== playSessionRef.current) return;
    advance();
  }, [advance, needsTapToPlay, paused]);

  const attachedVoiceoverStep =
    record && current ? stepUsesAttachedVoiceover(record, current.kind) : false;

  useEffect(() => {
    if (!current || paused || needsTapToPlay) return;
    if (attachedVoiceoverStep && (current.kind === 'text' || current.kind === 'photo')) {
      return;
    }
    if (current.kind === 'text' || current.kind === 'photo') {
      const dwellMs = resolveSkyReelStoryStillDwellMs(
        current.kind,
        record?.text,
      );
      const timer = setTimeout(() => {
        tryAutoAdvance();
      }, dwellMs);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [
    attachedVoiceoverStep,
    current,
    needsTapToPlay,
    paused,
    record?.text,
    tryAutoAdvance,
  ]);

  if (!stepsLoaded || !registryReady) {
    return (
      <View style={styles.root}>
        <HomeBackdrop />
        <SafeAreaView style={styles.safe}>
          <Text style={styles.loading}>…</Text>
        </SafeAreaView>
      </View>
    );
  }

  if (steps.length === 0 || !current) {
    const isOwner =
      playScope === 'focused' ||
      (playScope === 'owner' && activeUserId && ownerId === activeUserId);
    return (
      <View style={styles.root}>
        <HomeBackdrop />
        <SafeAreaView style={styles.safe}>
          <Text style={styles.empty}>{SkywritePlayCopy.emptySequence}</Text>
          {isOwner ? (
            <Text style={styles.emptyHint}>{SkywritePlayCopy.playSkyEmptyOwnerHint}</Text>
          ) : null}
          {isOwner ? (
            <View style={styles.emptyActions}>
              <Pressable
                onPress={() => {
                  handleExit();
                  router.push('/skywrite/compose' as never);
                }}
                style={styles.exitBtn}>
                <Text style={styles.exitText}>{SkywritePlayCopy.addSkywrite}</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  handleExit();
                  router.push('/skywrite' as never);
                }}
                style={styles.exitBtn}>
                <Text style={styles.exitText}>{SkywritePlayCopy.openMySkywrites}</Text>
              </Pressable>
            </View>
          ) : null}
          <Pressable onPress={handleExit} style={styles.exitBtn}>
            <Text style={styles.exitText}>{SkywritePlayCopy.exitPlay}</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  if (!record) {
    return (
      <View style={styles.root}>
        <HomeBackdrop />
        <SafeAreaView style={styles.safe}>
          {recordHydration === 'loading' ? (
            <Text style={styles.loading}>…</Text>
          ) : (
            <>
              <Text style={styles.empty}>{SkywritePlayCopy.postLoadFailedTitle}</Text>
              <Text style={styles.emptyHint}>{SkywritePlayCopy.postLoadFailedHint}</Text>
              <Text style={styles.emptyHint} accessibilityLabel="Post identifier">
                {current.skywriteId}
              </Text>
              <View style={styles.emptyActions}>
                <Pressable
                  onPress={() => {
                    setRecordHydration('idle');
                    setRecordFetchNonce((n) => n + 1);
                  }}
                  style={styles.exitBtn}>
                  <Text style={styles.exitText}>{SkywritePlayCopy.retryLoadPost}</Text>
                </Pressable>
                <Pressable onPress={goNext} style={styles.exitBtn}>
                  <Text style={styles.exitText}>{SkywritePlayCopy.skipUnavailablePost}</Text>
                </Pressable>
              </View>
            </>
          )}
          <Pressable onPress={handleExit} style={styles.exitBtn}>
            <Text style={styles.exitText}>{SkywritePlayCopy.exitPlay}</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  if (sequenceComplete && index >= steps.length - 1) {
    return (
      <View style={styles.root}>
        <HomeBackdrop />
        <SafeAreaView style={styles.safe}>
          <Text style={styles.empty}>{SkywritePlayCopy.emptySequence}</Text>
          <Pressable onPress={handleExit} style={styles.exitBtn}>
            <Text style={styles.exitText}>{SkywritePlayCopy.exitPlay}</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <SkywriteImmersiveMomentView
          record={playbackRecord ?? record}
          viewerMode="skyreel"
          stepKind={current.kind}
          stepIndex={index}
          stepCount={steps.length}
          storySegmentIndex={storySegmentIndex}
          storySegmentCount={storySegmentCount}
          previewId={previewId}
          audioPlaying={audioPlaying}
          overlayAudioProgress={audioPreview.getPreviewProgress(previewId)}
          onToggleAudio={(pid, uri) => void audioPreview.togglePreview(pid, uri)}
          onExit={handleExit}
          onPrevious={handleEdgePrevious}
          onNext={handleEdgeNext}
          canPrevious
          canNext={hasNextEligibleSkyReel}
          showSkyReelExpiry={false}
          storyAuthorName={playScope === 'single' ? undefined : storyAuthorName}
          storyAuthorAvatarUri={storyAuthorAvatar}
          storyAgeLabel={skyReelAgeLabel}
          showSkyReelViewerAffordance={isOwnerStory && playScope !== 'single'}
          skyReelViewerCount={viewerCount}
          onOpenSkyReelViewers={() => setViewerSheetOpen(true)}
          onStoryProfilePress={
            playScope === 'single'
              ? undefined
              : () => {
                  setPaused(true);
                  if (isOwnerStory) {
                    router.push('/profile' as never);
                    return;
                  }
                  router.push(
                    `/visitor-profile?id=${encodeURIComponent(storyAuthorId)}` as never,
                  );
                }
          }
          onStoryHoldPauseStart={() => setPaused(true)}
          onStoryHoldPauseEnd={() => setPaused(false)}
          onMediaPlaybackStarted={dismissTapToPlay}
          onRegisterMediaStop={(stop) => {
            stopPlaybackRef.current = stop;
          }}
          onBeforeStepChange={haltOutgoingPlayback}
          autoPlayVideo={shouldAutoplayVideo}
          sequencePaused={paused}
          layoutMode="viewport"
          manualPlayNonce={manualPlayNonce}
          onVideoAutoplayBlocked={() => {
            if (!userStartedPlayback) setNeedsTapToPlay(true);
          }}
          tapToPlayPrompt={needsTapToPlay}
          mediaStartNonce={mediaStartNonce}
          playSessionId={playSessionId}
          onTapToPlayContinue={handleTapToStartSkyreel}
          onToggleSequencePause={() => {
            setPaused((value) => {
              const next = !value;
              if (!next) setMediaStartNonce((n) => n + 1);
              return next;
            });
          }}
          navigationMode="edgeTap"
          narrationAutoplay={!paused && !needsTapToPlay}
          narrationPaused={paused}
          onNarrationFinished={() => {
            tryAutoAdvance();
          }}
          onVideoFinished={() => {
            tryAutoAdvance();
          }}
        />
      </SafeAreaView>
      <Modal visible={viewerSheetOpen} transparent animationType="slide">
        <Pressable style={styles.viewerBackdrop} onPress={() => setViewerSheetOpen(false)}>
          <View style={styles.viewerSheet}>
            <Text style={styles.viewerTitle}>SkyReel viewers</Text>
            <ScrollView style={styles.viewerList}>
              {viewerRows.length === 0 ? (
                <Text style={styles.viewerEmpty}>No viewers yet.</Text>
              ) : (
                viewerRows.map((row) => (
                  <Text key={row.userId} style={styles.viewerRow}>
                    {row.displayName}
                  </Text>
                ))
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050508' },
  safe: { flex: 1 },
  loading: { color: '#FFF8F0', textAlign: 'center', marginTop: 40 },
  empty: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(248,244,236,0.85)',
    textAlign: 'center',
    marginTop: 48,
  },
  emptyHint: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(248,244,236,0.62)',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
  },
  exitText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: '#E8C872',
  },
  emptyActions: {
    marginTop: 16,
    gap: 4,
    alignItems: 'center',
  },
  exitBtn: {
    alignSelf: 'center',
    marginTop: 24,
    minHeight: 44,
    justifyContent: 'center',
  },
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  controlChip: {
    minHeight: 36,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.4)',
  },
  controlText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    color: '#E8C872',
  },
  progressLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(248,244,236,0.65)',
  },
  tapPlayBanner: {
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(232, 200, 114, 0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.35)',
  },
  tapPlayText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: '#E8C872',
    textAlign: 'center',
  },
  playViewer: {
    flex: 1,
    minHeight: 0,
  },
  viewerBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  viewerSheet: {
    maxHeight: '55%',
    backgroundColor: 'rgba(8, 10, 28, 0.98)',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.22)',
  },
  viewerTitle: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    color: '#F5F0FF',
    marginBottom: 12,
    textAlign: 'center',
  },
  viewerList: { maxHeight: 320 },
  viewerRow: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: '#FFF8F0',
    paddingVertical: 10,
  },
  viewerEmpty: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: 'rgba(235,228,248,0.65)',
    textAlign: 'center',
    paddingVertical: 16,
  },
});
