import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { resolveSkywriteById } from '@/skywrite/resolveSkywriteById';
import { useSkywriteLibrary } from '@/skywrite/library/SkywriteLibraryProvider';

const STILL_DWELL_MS = 8500;

export function SkywriteGuidedPlayScreen() {
  const router = useRouter();
  const { scope, id, ownerId, start, autoplay } = useLocalSearchParams<{
    scope?: SkywritePlayScope;
    id?: string;
    ownerId?: string;
    start?: string;
    autoplay?: string;
  }>();
  const playScope: SkywritePlayScope =
    scope === 'single' ? 'single' : scope === 'owner' ? 'owner' : 'focused';
  const { skywrites, mySkyView, aroundYourSkyFeed } = useOnboarding();
  const { messages, skyFollowGraph } = useReelyouConnect();
  const { lifecycle: contentLifecycle } = useSkywriteLibrary();
  const { registry, ready: registryReady, repost } = usePlaySkySequenceRegistry();
  const audioPreview = useOverlayAudioPreviewScope(true);
  const [stepsLoaded, setStepsLoaded] = useState(false);
  const [steps, setSteps] = useState<SkywritePlayStep[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [needsTapToPlay, setNeedsTapToPlay] = useState(false);
  const startedRef = useRef(false);

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
            : resolveOrbitOwnerSkywrites(ownerId);
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
        const record = resolveSkywriteById(skywrites, id, contentLifecycle);
        const allowed =
          record &&
          resolveSkywriteViewerAccess({
            viewerId: currentUser.id,
            authorId: record.authorId,
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
  ]);

  useEffect(() => {
    const startIndex = Number(start);
    if (Number.isFinite(startIndex) && startIndex >= 0) {
      setIndex(Math.min(startIndex, Math.max(0, steps.length - 1)));
    }
  }, [start, steps.length]);

  const current = steps[index];
  const record = useMemo(
    () =>
      current
        ? resolveSkywriteById(skywrites, current.skywriteId, contentLifecycle)
        : undefined,
    [contentLifecycle, current, skywrites],
  );

  const previewId = current ? `guided-play-${current.skywriteId}-${current.stepId}` : '';
  const audioPlaying = audioPreview.isPreviewPlaying(previewId);
  const shouldAutoplayVideo =
    !paused &&
    !needsTapToPlay &&
    (autoplay === '1' || playScope === 'focused' || playScope === 'owner') &&
    current?.kind === 'video';

  const handleExit = useCallback(() => {
    void audioPreview.stopAll();
    router.back();
  }, [audioPreview, router]);

  const advance = useCallback(() => {
    void audioPreview.stopAll();
    setIndex((value) => Math.min(value + 1, steps.length - 1));
  }, [audioPreview, steps.length]);

  const goNext = useCallback(() => {
    void audioPreview.stopAll();
    setNeedsTapToPlay(false);
    setIndex((value) => Math.min(value + 1, steps.length - 1));
  }, [audioPreview, steps.length]);

  const goPrevious = useCallback(() => {
    void audioPreview.stopAll();
    setNeedsTapToPlay(false);
    setIndex((value) => Math.max(value - 1, 0));
  }, [audioPreview]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleExit();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleExit]);

  useEffect(() => {
    startedRef.current = false;
    setNeedsTapToPlay(false);
  }, [index, current?.stepId]);

  useEffect(() => {
    if (Platform.OS !== 'web' || autoplay !== '1' || paused) return;
    if (steps.length === 0) return;
    setNeedsTapToPlay(true);
  }, [autoplay, paused, steps.length]);

  useEffect(() => {
    if (!current || paused || needsTapToPlay) return;
    if (current.kind === 'text' || current.kind === 'photo') {
      const timer = setTimeout(() => advance(), STILL_DWELL_MS);
      return () => clearTimeout(timer);
    }
    if (current.kind === 'audio' && record?.media.audio?.uri && !audioPlaying) {
      void audioPreview.togglePreview(previewId, record.media.audio.uri);
    }
    return undefined;
  }, [
    advance,
    audioPlaying,
    audioPreview,
    current,
    needsTapToPlay,
    paused,
    previewId,
    record?.media.audio?.uri,
  ]);

  useEffect(() => {
    if (!audioPlaying || paused || !current || current.kind !== 'audio') return;
    const duration = record?.media.audio?.durationMs ?? 0;
    if (duration <= 0) return;
    const timer = setTimeout(() => advance(), duration + 400);
    return () => clearTimeout(timer);
  }, [advance, audioPlaying, current, paused, record?.media.audio?.durationMs]);

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

  return (
    <View style={styles.root}>
      <HomeBackdrop />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.controlBar}>
          <Pressable onPress={() => setPaused((value) => !value)} style={styles.controlChip}>
            <Text style={styles.controlText}>{paused ? SkywritePlayCopy.resume : SkywritePlayCopy.pause}</Text>
          </Pressable>
          <Text style={styles.progressLabel}>
            {SkywritePlayCopy.progress(index + 1, steps.length)}
          </Text>
        </View>

        {needsTapToPlay ? (
          <Pressable
            style={styles.tapPlayBanner}
            onPress={() => {
              setNeedsTapToPlay(false);
              startedRef.current = true;
            }}>
            <Text style={styles.tapPlayText}>{SkywritePlayCopy.tapToPlaySky}</Text>
          </Pressable>
        ) : null}

        <SkywriteImmersiveMomentView
          record={record}
          stepKind={current.kind}
          stepIndex={index}
          stepCount={steps.length}
          previewId={previewId}
          audioPlaying={audioPlaying}
          onToggleAudio={(pid, uri) => void audioPreview.togglePreview(pid, uri)}
          onExit={handleExit}
          onPrevious={goPrevious}
          onNext={goNext}
          canPrevious={index > 0}
          canNext={index < steps.length - 1}
          onBeforeStepChange={() => void audioPreview.stopAll()}
          autoPlayVideo={shouldAutoplayVideo}
          sequencePaused={paused}
          layoutMode="viewport"
          onVideoFinished={() => {
            if (!paused) advance();
          }}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: Spacing.lg },
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
});
