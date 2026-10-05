import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeBackdrop } from '@/components/home/HomeBackdrop';
import { SkywriteCommentsPanel } from '@/components/skywrite/SkywriteCommentsPanel';
import { SkywriteImmersiveMomentView } from '@/components/skywrite/SkywriteImmersiveMomentView';
import { currentUser } from '@/data/mockData';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { resolveSkywriteViewerAccess } from '@/skywrite/access/resolveSkywriteViewerAccess';
import { SkywritePlayCopy } from '@/constants/skywritePlayCopy';
import { Fonts, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/onboarding';
import { useOverlayAudioPreviewScope } from '@/skywrite/media/useOverlayAudioPreviewScope';
import { resolveStepsForSkywrite } from '@/skywrite/play/skywritePlayLogic';
import { loadSkywritePlaySequence } from '@/skywrite/play/skywritePlayPersistence';
import type { SkywritePlayStep } from '@/skywrite/play/skywritePlayTypes';
import { isSharedSocialPersistenceEnabled } from '@/social/sharedSocialApi';
import { fetchSkywriteFromServer } from '@/social/sharedSkywriteApi';
import { cacheRemoteSkywrite } from '@/social/sharedSkywriteCache';
import { resolveSkywriteById } from '@/skywrite/resolveSkywriteById';
import { useSkywriteLibrary } from '@/skywrite/library/SkywriteLibraryProvider';

export function SkywriteImmersiveMomentScreen() {
  const router = useRouter();
  const { skywriteId, step } = useLocalSearchParams<{ skywriteId?: string; step?: string }>();
  const { skywrites } = useOnboarding();
  const { messages, skyFollowGraph } = useReelyouConnect();
  const { lifecycle: contentLifecycle } = useSkywriteLibrary();
  const audioPreview = useOverlayAudioPreviewScope(true);
  const [steps, setSteps] = useState<SkywritePlayStep[]>([]);
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [remoteRecord, setRemoteRecord] = useState<
    import('@/skywrite/types').SkywriteRecord | null
  >(null);
  const [playSessionId, setPlaySessionId] = useState(0);
  const [mediaStartNonce, setMediaStartNonce] = useState(0);
  const playSessionRef = useRef(0);
  const stopPlaybackRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    if (!skywriteId || !isSharedSocialPersistenceEnabled()) return;
    const local = resolveSkywriteById(skywrites, skywriteId, contentLifecycle);
    if (local) return;
    let mounted = true;
    void fetchSkywriteFromServer(skywriteId).then((fetched) => {
      if (!mounted || !fetched) return;
      cacheRemoteSkywrite(fetched);
      setRemoteRecord(fetched);
    });
    return () => {
      mounted = false;
    };
  }, [contentLifecycle, skywriteId, skywrites]);

  useEffect(() => {
    if (!skywriteId) {
      setSteps([]);
      setReady(true);
      return;
    }
    let mounted = true;
    void loadSkywritePlaySequence().then((config) => {
      if (!mounted) return;
      const resolved =
        resolveSkywriteById(skywrites, skywriteId, contentLifecycle) ??
        (remoteRecord?.id === skywriteId ? remoteRecord : null);
      if (resolved) {
        setSteps(resolveStepsForSkywrite(resolved, config.singleBySkywriteId[skywriteId]));
      } else {
        setSteps([]);
      }
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, [contentLifecycle, remoteRecord, skywriteId, skywrites]);

  useEffect(() => {
    const startIndex = Number(step);
    if (Number.isFinite(startIndex) && startIndex >= 0) {
      setIndex(Math.min(startIndex, Math.max(0, steps.length - 1)));
    }
  }, [step, steps.length]);

  const current = steps[index];
  const record = useMemo(() => {
    if (!current || !skywriteId) return undefined;
    return (
      resolveSkywriteById(skywrites, skywriteId, contentLifecycle) ??
      (remoteRecord?.id === skywriteId ? remoteRecord : undefined)
    );
  }, [contentLifecycle, current, remoteRecord, skywriteId, skywrites]);

  const previewId = current ? `immersive-${current.skywriteId}-${current.stepId}` : '';
  const audioPlaying = audioPreview.isPreviewPlaying(previewId);

  const bumpPlaySession = useCallback(() => {
    playSessionRef.current += 1;
    setPlaySessionId(playSessionRef.current);
  }, []);

  const haltOutgoingPlayback = useCallback(() => {
    stopPlaybackRef.current();
    void audioPreview.stopAll();
  }, [audioPreview]);

  const viewerCanView = useMemo(() => {
    if (!record) return false;
    return resolveSkywriteViewerAccess({
      viewerId: currentUser.id,
      authorId: record.authorId ?? currentUser.id,
      visibility: record.visibility,
      followGraph: skyFollowGraph,
      blockedUserIds: messages.blockedUserIds,
    });
  }, [messages.blockedUserIds, record, skyFollowGraph]);

  const handleExit = useCallback(() => {
    haltOutgoingPlayback();
    bumpPlaySession();
    void audioPreview.stopAll();
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/skywrite' as never);
  }, [audioPreview, bumpPlaySession, haltOutgoingPlayback, router]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleExit();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleExit]);

  useEffect(() => () => void audioPreview.stopAll(), [audioPreview]);

  const goNext = useCallback(() => {
    haltOutgoingPlayback();
    bumpPlaySession();
    setMediaStartNonce((n) => n + 1);
    setIndex((value) => Math.min(value + 1, steps.length - 1));
  }, [audioPreview, bumpPlaySession, haltOutgoingPlayback, steps.length]);

  const goPrevious = useCallback(() => {
    haltOutgoingPlayback();
    bumpPlaySession();
    setMediaStartNonce((n) => n + 1);
    setIndex((value) => Math.max(value - 1, 0));
  }, [audioPreview, bumpPlaySession, haltOutgoingPlayback]);

  if (!ready) {
    return (
      <View style={styles.root}>
        <HomeBackdrop />
        <SafeAreaView style={styles.safe}>
          <Text style={styles.loading}>…</Text>
        </SafeAreaView>
      </View>
    );
  }

  if (!record || !current || steps.length === 0) {
    return (
      <View style={styles.root}>
        <HomeBackdrop />
        <SafeAreaView style={styles.safe}>
          <Text style={styles.empty}>{SkywritePlayCopy.emptySequence}</Text>
        </SafeAreaView>
      </View>
    );
  }

  if (!viewerCanView) {
    return (
      <View style={styles.root}>
        <HomeBackdrop />
        <SafeAreaView style={styles.safe}>
          <Text style={styles.empty}>This Skywrite isn&apos;t available to you.</Text>
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
          onToggleAudio={(id, uri) => void audioPreview.togglePreview(id, uri)}
          onExit={handleExit}
          onPrevious={goPrevious}
          onNext={goNext}
          canPrevious={index > 0}
          canNext={index < steps.length - 1}
          onBeforeStepChange={haltOutgoingPlayback}
          onRegisterMediaStop={(stop) => {
            stopPlaybackRef.current = stop;
          }}
          layoutMode="viewport"
          showSkyReelExpiry={false}
          skyReelActiveUntilMs={null}
          mediaStartNonce={mediaStartNonce}
          playSessionId={playSessionId}
          narrationAutoplay
          autoPlayVideo
          commentsSlot={<SkywriteCommentsPanel skywrite={record} compact />}
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
  viewer: {
    flex: 1,
    minHeight: 0,
  },
});
