import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
  resolveFocusedSkyPlaySteps,
  resolveStepsForSkywrite,
} from '@/skywrite/play/skywritePlayLogic';
import { loadSkywritePlaySequence } from '@/skywrite/play/skywritePlayPersistence';
import type { SkywritePlayScope, SkywritePlayStep } from '@/skywrite/play/skywritePlayTypes';
import { resolveSkywriteById } from '@/skywrite/resolveSkywriteById';
import { useSkywriteLibrary } from '@/skywrite/library/SkywriteLibraryProvider';

export function SkywriteGuidedPlayScreen() {
  const router = useRouter();
  const { scope, id, start, autoplay } = useLocalSearchParams<{
    scope?: SkywritePlayScope;
    id?: string;
    start?: string;
    autoplay?: string;
  }>();
  const playScope: SkywritePlayScope = scope === 'single' ? 'single' : 'focused';
  const { skywrites, mySkyView } = useOnboarding();
  const { messages, skyFollowGraph } = useReelyouConnect();
  const { lifecycle: contentLifecycle } = useSkywriteLibrary();
  const audioPreview = useOverlayAudioPreviewScope(true);
  const [sequenceReady, setSequenceReady] = useState(false);
  const [steps, setSteps] = useState<SkywritePlayStep[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    void loadSkywritePlaySequence().then((config) => {
      if (!mounted) return;
      if (playScope === 'single' && id) {
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
          ),
        );
      }
      setSequenceReady(true);
    });
    return () => {
      mounted = false;
    };
  }, [
    contentLifecycle,
    id,
    messages.blockedUserIds,
    mySkyView.stars,
    playScope,
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
  const autoPlayVideo = autoplay === '1' && current?.kind === 'video';

  const handleExit = useCallback(() => {
    void audioPreview.stopAll();
    router.back();
  }, [audioPreview, router]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleExit();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleExit]);

  const goNext = useCallback(() => {
    void audioPreview.stopAll();
    setIndex((value) => Math.min(value + 1, steps.length - 1));
  }, [audioPreview, steps.length]);

  const goPrevious = useCallback(() => {
    void audioPreview.stopAll();
    setIndex((value) => Math.max(value - 1, 0));
  }, [audioPreview]);

  if (!sequenceReady) {
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
      <HomeBackdrop />
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
          onPrevious={goPrevious}
          onNext={goNext}
          canPrevious={index > 0}
          canNext={index < steps.length - 1}
          onBeforeStepChange={() => void audioPreview.stopAll()}
          autoPlayVideo={autoPlayVideo}
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
  exitText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: '#E8C872',
  },
  exitBtn: {
    alignSelf: 'center',
    marginTop: 24,
    minHeight: 44,
    justifyContent: 'center',
  },
});
