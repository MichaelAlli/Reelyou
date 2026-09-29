import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

  useEffect(() => {
    if (!skywriteId) {
      setSteps([]);
      setReady(true);
      return;
    }
    let mounted = true;
    void loadSkywritePlaySequence().then((config) => {
      if (!mounted) return;
      const record = resolveSkywriteById(skywrites, skywriteId, contentLifecycle);
      if (record) {
        setSteps(resolveStepsForSkywrite(record, config.singleBySkywriteId[skywriteId]));
      } else {
        setSteps([]);
      }
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, [contentLifecycle, skywriteId, skywrites]);

  useEffect(() => {
    const startIndex = Number(step);
    if (Number.isFinite(startIndex) && startIndex >= 0) {
      setIndex(Math.min(startIndex, Math.max(0, steps.length - 1)));
    }
  }, [step, steps.length]);

  const current = steps[index];
  const record = useMemo(
    () =>
      current && skywriteId
        ? resolveSkywriteById(skywrites, skywriteId, contentLifecycle)
        : undefined,
    [contentLifecycle, current, skywriteId, skywrites],
  );

  const previewId = current ? `immersive-${current.skywriteId}-${current.stepId}` : '';
  const audioPlaying = audioPreview.isPreviewPlaying(previewId);

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
      <HomeBackdrop />
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
          onBeforeStepChange={() => void audioPreview.stopAll()}
          layoutMode="viewport"
          commentsSlot={<SkywriteCommentsPanel skywrite={record} compact />}
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
});
