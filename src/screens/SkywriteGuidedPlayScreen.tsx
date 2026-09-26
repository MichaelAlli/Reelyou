import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeBackdrop } from '@/components/home/HomeBackdrop';
import { SkywriteAudioWaveform } from '@/components/skywrite/SkywriteAudioWaveform';
import { SkywritePlayCopy } from '@/constants/skywritePlayCopy';
import { getSkywriteWriteInputStyle } from '@/constants/skywriteTextStyles';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/onboarding';
import { formatSkywriteAudioDuration } from '@/skywrite/media/skywriteMediaPreviewUtils';
import { useOverlayAudioPreviewScope } from '@/skywrite/media/useOverlayAudioPreviewScope';
import {
  defaultFocusedSkywriteIds,
  resolveFocusedSkyPlaySteps,
  resolveStepsForSkywrite,
} from '@/skywrite/play/skywritePlayLogic';
import { loadSkywritePlaySequence } from '@/skywrite/play/skywritePlayPersistence';
import type { SkywritePlayScope, SkywritePlayStep } from '@/skywrite/play/skywritePlayTypes';
import { resolveSkywriteById } from '@/skywrite/resolveSkywriteById';
import { useSkywriteLibrary } from '@/skywrite/library/SkywriteLibraryProvider';
export function SkywriteGuidedPlayScreen() {
  const router = useRouter();
  const { scope, id, start } = useLocalSearchParams<{
    scope?: SkywritePlayScope;
    id?: string;
    start?: string;
  }>();
  const playScope: SkywritePlayScope = scope === 'single' ? 'single' : 'focused';
  const { skywrites, mySkyView } = useOnboarding();
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
        if (record) {
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
  }, [contentLifecycle, id, mySkyView.stars, playScope, skywrites]);

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
  const audioUri = record?.media.audio?.uri ?? null;
  const audioPlaying = audioPreview.isPreviewPlaying(previewId);

  const handleExit = useCallback(() => {
    void audioPreview.stopAll();
    router.back();
  }, [audioPreview, router]);

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
        <View style={styles.topBar}>
          <Pressable onPress={handleExit} accessibilityLabel={SkywritePlayCopy.exitPlay}>
            <Text style={styles.exitText}>{SkywritePlayCopy.exitPlay}</Text>
          </Pressable>
          <Text style={styles.progress}>{SkywritePlayCopy.progress(index + 1, steps.length)}</Text>
        </View>

        <View style={styles.content}>
          {current.kind === 'text' ? (
            <Text style={[styles.bodyText, getSkywriteWriteInputStyle(record.textStyle)]}>
              {record.text.trim() || '…'}
            </Text>
          ) : null}

          {current.kind === 'photo' && record.media.photo?.uri ? (
            <Image
              source={{ uri: record.media.photo.uri }}
              style={styles.heroImage}
              contentFit="cover"
              accessibilityIgnoresInvertColors
            />
          ) : null}

          {current.kind === 'photo' && record.text.trim() ? (
            <Text style={styles.caption} numberOfLines={6}>
              {record.text.trim()}
            </Text>
          ) : null}

          {current.kind === 'audio' && audioUri ? (
            <View style={styles.audioBlock}>
              <Pressable
                style={styles.audioPlay}
                onPress={() => audioPreview.togglePreview(previewId, audioUri)}
                accessibilityLabel={audioPlaying ? 'Pause' : 'Play voice'}>
                <Text style={styles.audioPlayIcon}>{audioPlaying ? '❚❚' : '▶'}</Text>
              </Pressable>
              <SkywriteAudioWaveform active={audioPlaying} seed={record.id.length} barCount={18} />
              <Text style={styles.audioDuration}>
                {formatSkywriteAudioDuration(record.media.audio?.durationMs)}
              </Text>
              {record.text.trim() ? (
                <Text style={styles.caption}>{record.text.trim()}</Text>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.controls}>
          <Pressable
            disabled={index <= 0}
            onPress={goPrevious}
            style={[styles.navBtn, index <= 0 && styles.navDisabled]}>
            <Text style={styles.navText}>{SkywritePlayCopy.previous}</Text>
          </Pressable>
          <View style={styles.dots}>
            {steps.map((step, dotIndex) => (
              <View
                key={`${step.skywriteId}-${step.stepId}-${dotIndex}`}
                style={[styles.dot, dotIndex === index && styles.dotActive]}
              />
            ))}
          </View>
          <Pressable
            disabled={index >= steps.length - 1}
            onPress={goNext}
            style={[styles.navBtn, index >= steps.length - 1 && styles.navDisabled]}>
            <Text style={styles.navText}>{SkywritePlayCopy.next}</Text>
          </Pressable>
        </View>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  exitText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: '#E8C872',
  },
  progress: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(248,244,236,0.65)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  bodyText: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    lineHeight: 34,
    color: '#FFF8F0',
    textAlign: 'center',
  },
  heroImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    maxHeight: 420,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.35)',
  },
  caption: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(248,244,236,0.88)',
    textAlign: 'center',
  },
  audioBlock: {
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.28)',
    backgroundColor: 'rgba(8, 10, 28, 0.55)',
  },
  audioPlay: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232, 200, 114, 0.14)',
  },
  audioPlayIcon: {
    fontSize: 18,
    color: '#E8C872',
    fontWeight: '700',
  },
  audioDuration: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(248,244,236,0.65)',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
    gap: 8,
  },
  navBtn: {
    minHeight: 44,
    minWidth: 88,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  navDisabled: { opacity: 0.35 },
  navText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#E8C872',
  },
  dots: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(248,244,236,0.25)',
  },
  dotActive: {
    backgroundColor: '#E8C872',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  exitBtn: {
    alignSelf: 'center',
    marginTop: 24,
    minHeight: 44,
    justifyContent: 'center',
  },
});
