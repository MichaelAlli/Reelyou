import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeBackdrop } from '@/components/home/HomeBackdrop';
import { SkywriteImmersiveMomentView } from '@/components/skywrite/SkywriteImmersiveMomentView';
import { SkywritePlayCopy } from '@/constants/skywritePlayCopy';
import { Fonts, Spacing } from '@/constants/theme';
import { currentUser } from '@/data/mockData';
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
import { buildPublicSkyView, resolvePublicSkyConnectionStatus } from '@/mySky/buildPublicSkyView';
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
  formatSkyReelHourLabel,
  isSkyReelAppearanceActive,
  resolveSkyReelActiveUntilMs,
  resolveSkyReelAppearancePublishedAtMs,
  resolveSkyReelDisplayHour,
} from '@/skywrite/play/skyReelExpiry';
import {
  findFirstEligibleStepIndex,
  findNextEligibleStepIndexAfter,
  resolveMidPlaybackExpiryTransition,
} from '@/skywrite/play/skywriteGuidedPlayExpiry';
import {
  resolveStorySegmentCount,
  resolveStorySegmentIndex,
} from '@/skywrite/play/skywriteStorySegments';
import { stepUsesAttachedVoiceover } from '@/skywrite/voiceoverStepUtils';

const STILL_DWELL_MS = 8500;
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
  const { skywrites, mySkyView, aroundYourSkyFeed } = useOnboarding();
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
  const [sequenceComplete, setSequenceComplete] = useState(false);
  const [recordHydration, setRecordHydration] = useState<'idle' | 'loading' | 'failed'>('idle');
  const [recordFetchNonce, setRecordFetchNonce] = useState(0);
  const initialPlayIndexResolvedRef = useRef(false);
  const appearanceActivePrevRef = useRef<boolean | null>(null);
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
          ownerId === currentUser.id
            ? skywrites
            : [...resolveOrbitOwnerSkywrites(ownerId), ...getCachedAuthorSkywrites(ownerId)];
        setSteps(
          resolveOwnerPlaySkySteps({
            ownerId,
            connectionStatus,
            ownerSkywrites: ownerPosts,
            registry,
            nowMs: Date.now(),
            retainExpiredInSequence: true,
          }),
        );
      } else if (playScope === 'single' && id) {
        const record =
          resolveSkywriteById(skywrites, id, contentLifecycle) ??
          (remoteSingleRecord?.id === id ? remoteSingleRecord : null);
        const allowed =
          record &&
          resolveSkywriteViewerAccess({
            viewerId: currentUser.id,
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
            { playSkyRegistry: registry, retainExpiredInSequence: true },
          ),
        );
      }
      setStepsLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, [
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
    skywrites,
    remoteSingleRecord,
    remoteFetchTick,
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
      if (value >= steps.length - 1) {
        setSequenceComplete(true);
        return value;
      }
      return value + 1;
    });
  }, [audioPreview, bumpPlaySession, haltOutgoingPlayback, steps.length]);

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
      const next = Math.min(value + 1, steps.length - 1);
      if (next >= steps.length - 1 && value === steps.length - 1) {
        setSequenceComplete(true);
      }
      return next;
    });
  }, [audioPreview, bumpPlaySession, haltOutgoingPlayback, steps.length]);

  const goPrevious = useCallback(() => {
    firstPostLeftRef.current = resetFirstPostLeftTapState();
    manualNavUntilRef.current = Date.now() + MANUAL_NAV_AUTO_ADVANCE_BLOCK_MS;
    autoAdvancePulseRef.current = Date.now();
    haltOutgoingPlayback();
    bumpPlaySession();
    setNeedsTapToPlay(false);
    setMediaStartNonce((n) => n + 1);
    setIndex((value) => Math.max(value - 1, 0));
  }, [audioPreview, bumpPlaySession, haltOutgoingPlayback]);

  const dismissTapToPlay = useCallback(() => {
    setNeedsTapToPlay(false);
  }, []);

  const handleTapToStartSkyreel = useCallback(() => {
    setPaused(false);
    setUserStartedPlayback(true);
    startedRef.current = true;
    setManualPlayNonce((n) => n + 1);
    setMediaStartNonce((n) => n + 1);
    autoAdvancePulseRef.current = Date.now();
    if (current?.kind === 'audio' && record?.media.audio?.uri) {
      void audioPreview.togglePreview(previewId, record.media.audio.uri, {
        onStarted: dismissTapToPlay,
        onFinished: () => {
          if (paused || needsTapToPlay) return;
          if (Date.now() - autoAdvancePulseRef.current < 500) return;
          autoAdvancePulseRef.current = Date.now();
          advance();
        },
      });
    }
  }, [
    advance,
    audioPreview,
    current?.kind,
    dismissTapToPlay,
    needsTapToPlay,
    paused,
    previewId,
    record?.media.audio?.uri,
  ]);

  useEffect(() => {
    if (index !== 0) {
      firstPostLeftRef.current = resetFirstPostLeftTapState();
    }
  }, [index]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') setPaused(true);
      if (state === 'active') setHourLabelTick((t) => t + 1);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setHourLabelTick((t) => t + 1), 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!stepsLoaded || !registryReady || playScope === 'single') return;
    if (initialPlayIndexResolvedRef.current) return;
    initialPlayIndexResolvedRef.current = true;
    const startIndex = Number(start);
    if (Number.isFinite(startIndex) && startIndex >= 0) return;
    const firstEligible = findFirstEligibleStepIndex(steps, registry, Date.now());
    if (firstEligible != null) {
      setIndex(firstEligible);
    }
  }, [playScope, registry, registryReady, start, steps, stepsLoaded]);

  const skyReelActiveUntilMs = useMemo(() => {
    if (!record) return null;
    return resolveSkyReelActiveUntilMs(record.id, registry, record.createdAt);
  }, [record, registry]);

  const skyReelAppearancePublishedAtMs = useMemo(() => {
    if (!record) return null;
    return resolveSkyReelAppearancePublishedAtMs(record.id, registry, {
      createdAt: record.createdAt,
    });
  }, [record, registry]);

  const skyReelHourLabel = useMemo(() => {
    if (playScope === 'single') return null;
    const hour = resolveSkyReelDisplayHour(
      skyReelAppearancePublishedAtMs,
      skyReelActiveUntilMs,
      Date.now(),
    );
    return formatSkyReelHourLabel(hour);
  }, [playScope, skyReelActiveUntilMs, skyReelAppearancePublishedAtMs, hourLabelTick]);

  const skyReelAppearanceActive =
    playScope === 'single' ||
    skyReelActiveUntilMs == null ||
    isSkyReelAppearanceActive(skyReelActiveUntilMs);

  const hasNextEligibleSkyReel = useMemo(() => {
    if (playScope === 'single') return index < steps.length - 1;
    return findNextEligibleStepIndexAfter(steps, index, registry, Date.now()) != null;
  }, [index, playScope, registry, steps]);

  useEffect(() => {
    appearanceActivePrevRef.current = null;
  }, [current?.skywriteId, index]);

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

  const skipExpiredAppearance = useCallback(() => {
    const nextEligible = findNextEligibleStepIndexAfter(steps, index, registry, Date.now());
    applyExpiryTransition(nextEligible ?? 'exit');
  }, [applyExpiryTransition, index, registry, steps]);

  useEffect(() => {
    if (playScope === 'single' || !current?.skywriteId) return;
    const until = resolveSkyReelActiveUntilMs(current.skywriteId, registry);
    const nowActive = until == null || isSkyReelAppearanceActive(until, Date.now());
    const transition = resolveMidPlaybackExpiryTransition(
      steps,
      index,
      registry,
      appearanceActivePrevRef.current,
      nowActive,
      Date.now(),
    );
    appearanceActivePrevRef.current = nowActive;
    if (transition.kind === 'jump') {
      applyExpiryTransition(transition.toIndex);
    } else if (transition.kind === 'exit') {
      applyExpiryTransition('exit');
    }
  }, [
    applyExpiryTransition,
    current?.skywriteId,
    hourLabelTick,
    index,
    playScope,
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
    if (playScope !== 'single' && current?.skywriteId) {
      const until = resolveSkyReelActiveUntilMs(current.skywriteId, registry);
      if (until != null && !isSkyReelAppearanceActive(until)) {
        skipExpiredAppearance();
        return;
      }
    }
    goNext();
  }, [current?.skywriteId, goNext, playScope, registry, skipExpiredAppearance]);

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
    if (!current || paused || needsTapToPlay || !skyReelAppearanceActive) return;
    if (attachedVoiceoverStep && (current.kind === 'text' || current.kind === 'photo')) {
      return;
    }
    if (current.kind === 'text' || current.kind === 'photo') {
      const timer = setTimeout(() => {
        tryAutoAdvance();
      }, STILL_DWELL_MS);
      return () => clearTimeout(timer);
    }
    if (current.kind === 'audio' && record?.media.audio?.uri && !audioPlaying) {
      void audioPreview.togglePreview(previewId, record.media.audio.uri, {
        onStarted: dismissTapToPlay,
        onFinished: () => {
          tryAutoAdvance();
        },
      });
    }
    return undefined;
  }, [
    attachedVoiceoverStep,
    audioPlaying,
    audioPreview,
    current,
    dismissTapToPlay,
    needsTapToPlay,
    paused,
    previewId,
    record?.media.audio?.uri,
    skyReelAppearanceActive,
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
      (playScope === 'owner' && ownerId === currentUser.id);
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
          record={record}
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
          skyReelActiveUntilMs={playScope === 'single' ? null : skyReelActiveUntilMs}
          showSkyReelExpiry={playScope !== 'single'}
          skyReelHourLabel={skyReelHourLabel}
          skyReelAppearanceExpired={playScope !== 'single' && !skyReelAppearanceActive}
          onSkipExpiredAppearance={skipExpiredAppearance}
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
          narrationAutoplay={!paused && !needsTapToPlay && skyReelAppearanceActive}
          narrationPaused={paused}
          onNarrationFinished={() => {
            tryAutoAdvance();
          }}
          onVideoFinished={() => {
            tryAutoAdvance();
          }}
        />
      </SafeAreaView>
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
});
