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
  isSkyReelAppearanceActive,
  resolveSkyReelActiveUntilMs,
} from '@/skywrite/play/skyReelExpiry';
import { stepUsesAttachedVoiceover } from '@/skywrite/voiceoverStepUtils';

const STILL_DWELL_MS = 8500;

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
  const [userStartedPlayback, setUserStartedPlayback] = useState(false);
  const startedRef = useRef(false);
  const skippedStepIdsRef = useRef<Set<string>>(new Set());
  const autoAdvancePulseRef = useRef(0);
  const firstPostLeftRef = useRef<FirstPostLeftTapState>(resetFirstPostLeftTapState());
  const [expiryClockTick, setExpiryClockTick] = useState(0);
  const [sequenceComplete, setSequenceComplete] = useState(false);

  useEffect(() => {
    persistSkyreelReturnFromParam(returnTo);
  }, [returnTo]);

  useEffect(() => {
    if (!isSharedSocialPersistenceEnabled() || playScope !== 'owner' || !ownerId) return;
    if (ownerId === currentUser.id) return;
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
            { playSkyRegistry: registry },
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
    if (!stepsLoaded || !current || record) return;
    if (skippedStepIdsRef.current.has(current.stepId)) return;
    skippedStepIdsRef.current.add(current.stepId);
    void audioPreview.stopAll();
    if (index < steps.length - 1) {
      setIndex((value) => Math.min(value + 1, steps.length - 1));
    }
  }, [audioPreview, current, index, record, steps.length, stepsLoaded]);

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

  const handleExit = useCallback(() => {
    bumpPlaySession();
    void audioPreview.stopAll();
    setPaused(true);
    setNeedsTapToPlay(false);
    exitSkyreel(router, returnTo);
  }, [audioPreview, bumpPlaySession, returnTo, router]);

  const advance = useCallback(() => {
    bumpPlaySession();
    void audioPreview.stopAll();
    setMediaStartNonce((n) => n + 1);
    setIndex((value) => {
      if (value >= steps.length - 1) {
        setSequenceComplete(true);
        return value;
      }
      return value + 1;
    });
  }, [audioPreview, bumpPlaySession, steps.length]);

  const restartCurrentStep = useCallback(() => {
    bumpPlaySession();
    void audioPreview.stopAll();
    setMediaStartNonce((n) => n + 1);
  }, [audioPreview, bumpPlaySession]);

  const goNext = useCallback(() => {
    firstPostLeftRef.current = resetFirstPostLeftTapState();
    bumpPlaySession();
    void audioPreview.stopAll();
    setNeedsTapToPlay(false);
    setMediaStartNonce((n) => n + 1);
    setIndex((value) => {
      const next = Math.min(value + 1, steps.length - 1);
      if (next >= steps.length - 1 && value === steps.length - 1) {
        setSequenceComplete(true);
      }
      return next;
    });
  }, [audioPreview, bumpPlaySession, steps.length]);

  const goPrevious = useCallback(() => {
    firstPostLeftRef.current = resetFirstPostLeftTapState();
    bumpPlaySession();
    void audioPreview.stopAll();
    setNeedsTapToPlay(false);
    setMediaStartNonce((n) => n + 1);
    setIndex((value) => Math.max(value - 1, 0));
  }, [audioPreview, bumpPlaySession]);

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
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleExit();
      if (event.key === 'ArrowLeft') handleEdgePrevious();
      if (event.key === 'ArrowRight') handleEdgeNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleEdgeNext, handleEdgePrevious, handleExit]);

  useEffect(() => {
    if (index !== 0) {
      firstPostLeftRef.current = resetFirstPostLeftTapState();
    }
  }, [index]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') setPaused(true);
      if (state === 'active') setExpiryClockTick((t) => t + 1);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setExpiryClockTick((t) => t + 1), 30_000);
    return () => clearInterval(timer);
  }, []);

  const skyReelActiveUntilMs = useMemo(() => {
    if (!record) return null;
    return resolveSkyReelActiveUntilMs(record.id, registry, record.createdAt);
  }, [record, registry]);

  void expiryClockTick;

  useEffect(() => {
    if (playScope === 'single') return;
    if (!record || skyReelActiveUntilMs == null) return;
    if (!isSkyReelAppearanceActive(skyReelActiveUntilMs)) {
      if (index < steps.length - 1) {
        advance();
      } else {
        setSequenceComplete(true);
      }
    }
  }, [advance, expiryClockTick, index, playScope, record, skyReelActiveUntilMs, steps.length]);

  const attachedVoiceoverStep =
    record && current ? stepUsesAttachedVoiceover(record, current.kind) : false;

  useEffect(() => {
    if (!current || paused || needsTapToPlay) return;
    if (attachedVoiceoverStep && (current.kind === 'text' || current.kind === 'photo')) {
      return;
    }
    if (current.kind === 'text' || current.kind === 'photo') {
      const timer = setTimeout(() => {
        autoAdvancePulseRef.current = Date.now();
        advance();
      }, STILL_DWELL_MS);
      return () => clearTimeout(timer);
    }
    if (current.kind === 'audio' && record?.media.audio?.uri && !audioPlaying) {
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
    return undefined;
  }, [
    advance,
    attachedVoiceoverStep,
    audioPlaying,
    audioPreview,
    current,
    dismissTapToPlay,
    needsTapToPlay,
    paused,
    previewId,
    record?.media.audio?.uri,
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

  if (steps.length === 0 || !current || !record) {
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
          previewId={previewId}
          audioPlaying={audioPlaying}
          onToggleAudio={(pid, uri) => void audioPreview.togglePreview(pid, uri)}
          onExit={handleExit}
          onPrevious={handleEdgePrevious}
          onNext={handleEdgeNext}
          canPrevious
          canNext={index < steps.length - 1}
          skyReelActiveUntilMs={skyReelActiveUntilMs}
          onMediaPlaybackStarted={dismissTapToPlay}
          onBeforeStepChange={() => void audioPreview.stopAll()}
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
            const sessionAtFinish = playSessionRef.current;
            if (paused || needsTapToPlay) return;
            if (Date.now() - autoAdvancePulseRef.current < 500) return;
            if (sessionAtFinish !== playSessionRef.current) return;
            autoAdvancePulseRef.current = Date.now();
            advance();
          }}
          onVideoFinished={() => {
            if (paused || needsTapToPlay) return;
            if (Date.now() - autoAdvancePulseRef.current < 500) return;
            autoAdvancePulseRef.current = Date.now();
            advance();
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
