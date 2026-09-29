import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { SkywriteAudioMixBottomSheet } from '@/components/skywrite/SkywriteAudioMixBottomSheet';
import { Fonts } from '@/constants/theme';
import { buildSkywritePreviewRecord, createEmptySkywriteDraft } from '@/skywrite/draft';
import { skywriteVideoElementStyle } from '@/skywrite/media/skywriteVideoLayout';
import { useSkywriteImmersiveVideoPlayback } from '@/skywrite/media/useSkywriteImmersiveVideoPlayback';
import { formatSkywriteAudioDuration } from '@/skywrite/media/skywriteMediaPreviewUtils';
import type { SkywriteMedia, SkywriteVideoMedia } from '@/skywrite/types';

interface SkywriteComposeImmersiveVideoStageProps {
  video: SkywriteVideoMedia;
  media: SkywriteMedia;
  onMediaChange: (media: SkywriteMedia) => void;
  onReplace: () => void;
  onRemove: () => void;
  edgeBleed: number;
  onDimensionsResolved?: (width: number, height: number) => void;
}

function SkywriteComposeImmersiveVideoStageComponent({
  video,
  media,
  onMediaChange,
  onReplace,
  onRemove,
  edgeBleed,
  onDimensionsResolved,
}: SkywriteComposeImmersiveVideoStageProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const stageHeight = Math.max(320, Math.round(screenHeight * 0.58));
  const [mixOpen, setMixOpen] = useState(false);

  const previewRecord = useMemo(() => {
    const draft = { ...createEmptySkywriteDraft(), media };
    return buildSkywritePreviewRecord(draft, 'compose-preview', []);
  }, [media]);

  const videoPlayback = useSkywriteImmersiveVideoPlayback(previewRecord, true, media);
  const { handleVideoLoad, videoRef } = videoPlayback;

  const onLoad = useCallback(
    (status: { isLoaded?: boolean; naturalSize?: { width: number; height: number } }) => {
      handleVideoLoad(status as never);
      if (!status.isLoaded) return;
      const w = status.naturalSize?.width;
      const h = status.naturalSize?.height;
      if (w != null && h != null && h > 0) {
        onDimensionsResolved?.(w, h);
      }
    },
    [handleVideoLoad, onDimensionsResolved],
  );

  const hasMix = Boolean(media.video?.uri) || Boolean(media.audio?.uri);

  return (
    <View style={[styles.wrap, { height: stageHeight, marginHorizontal: -edgeBleed, width: screenWidth }]}>
      <View style={styles.stage}>
        <Video
          ref={videoRef}
          style={skywriteVideoElementStyle()}
          source={{ uri: video.uri }}
          useNativeControls={false}
          resizeMode={ResizeMode.CONTAIN}
          isLooping={false}
          isMuted={false}
          shouldPlay={false}
          onLoad={onLoad}
          onPlaybackStatusUpdate={videoPlayback.onPlaybackStatusUpdate}
        />
      </View>

      <LinearGradient
        colors={['rgba(5, 5, 8, 0.72)', 'transparent']}
        style={styles.topGradient}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(5, 5, 8, 0.88)']}
        style={styles.bottomGradient}
        pointerEvents="box-none">
        <View style={styles.bottomRow}>
          <Pressable
            style={styles.playChip}
            onPress={() => void videoPlayback.togglePlayPause()}
            accessibilityLabel={videoPlayback.isPlaying ? 'Pause video' : 'Play video'}>
            <Text style={styles.playIcon}>{videoPlayback.isPlaying ? '❚❚' : '▶'}</Text>
          </Pressable>
          <Text style={styles.time}>
            {formatSkywriteAudioDuration(videoPlayback.positionMs)} /{' '}
            {formatSkywriteAudioDuration(videoPlayback.durationMs || video.durationMs)}
          </Text>
          {hasMix ? (
            <Pressable
              style={styles.chip}
              onPress={() => setMixOpen(true)}
              accessibilityLabel="Open audio mix">
              <Text style={styles.chipText}>Audio mix</Text>
            </Pressable>
          ) : null}
          <Pressable style={styles.chip} onPress={onReplace} accessibilityLabel="Replace video">
            <Text style={styles.chipText}>Replace</Text>
          </Pressable>
          <Pressable style={styles.chip} onPress={onRemove} accessibilityLabel="Remove video">
            <Text style={styles.chipTextDanger}>Remove</Text>
          </Pressable>
        </View>
      </LinearGradient>

      <SkywriteAudioMixBottomSheet
        visible={mixOpen}
        media={media}
        onChange={onMediaChange}
        onClose={() => setMixOpen(false)}
      />
    </View>
  );
}

export const SkywriteComposeImmersiveVideoStage = memo(SkywriteComposeImmersiveVideoStageComponent);

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    backgroundColor: '#050508',
    overflow: 'hidden',
    marginBottom: 12,
  },
  stage: {
    ...StyleSheet.absoluteFill,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 72,
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 96,
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  playChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232, 200, 114, 0.16)',
  },
  playIcon: {
    color: '#E8C872',
    fontSize: 16,
    fontWeight: '700',
  },
  time: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(248, 244, 236, 0.78)',
    flexShrink: 1,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(8, 10, 28, 0.65)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.35)',
  },
  chipText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: '#E8C872',
  },
  chipTextDanger: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(248, 180, 180, 0.95)',
  },
});
