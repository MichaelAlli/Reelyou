import { LinearGradient } from 'expo-linear-gradient';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { SkywriteAudioMixBottomSheet } from '@/components/skywrite/SkywriteAudioMixBottomSheet';
import {
  SkywriteFramedVideoLayer,
  SkywriteFramingToolbar,
  type SkywriteFramedVideoLayerRef,
} from '@/components/skywrite/SkywriteFramedVideoLayer';
import { Fonts } from '@/constants/theme';
import { buildSkywritePreviewRecord, createEmptySkywriteDraft } from '@/skywrite/draft';
import { skywriteVideoAspectRatio } from '@/skywrite/media/skywriteVideoLayout';
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
  const framingRef = useRef<SkywriteFramedVideoLayerRef>(null);

  const previewRecord = useMemo(() => {
    const draft = { ...createEmptySkywriteDraft(), media };
    return buildSkywritePreviewRecord(draft, 'compose-preview', []);
  }, [media]);

  const videoPlayback = useSkywriteImmersiveVideoPlayback(previewRecord, true, media);
  const { handleVideoLoad, videoRef, naturalSize } = videoPlayback;

  const aspectRatio = useMemo(() => {
    if (naturalSize?.width && naturalSize.height) {
      return naturalSize.width / naturalSize.height;
    }
    return skywriteVideoAspectRatio(video.width, video.height);
  }, [naturalSize, video.height, video.width]);

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

  const patchVideo = (patch: Partial<SkywriteVideoMedia>) => {
    if (!media.video) return;
    onMediaChange({ ...media, video: { ...media.video, ...patch } });
  };

  const hasMix = Boolean(media.video?.uri) || Boolean(media.audio?.uri);

  return (
    <View style={[styles.wrap, { height: stageHeight, marginHorizontal: -edgeBleed, width: screenWidth }]}>
      <SkywriteFramedVideoLayer
        ref={framingRef}
        video={video}
        aspectRatio={aspectRatio}
        editable
        onVideoPatch={patchVideo}
        videoRef={videoRef}
        isPlaying={videoPlayback.isPlaying}
        onPauseForAdjust={async () => {
          if (videoPlayback.isPlaying) await videoPlayback.togglePlayPause();
        }}
        onResumeAfterAdjust={async (wasPlaying) => {
          if (wasPlaying) await videoPlayback.togglePlayPause();
        }}
        onLoad={onLoad}
        onPlaybackStatusUpdate={videoPlayback.onPlaybackStatusUpdate}
      />

      <LinearGradient
        colors={['rgba(5, 5, 8, 0.72)', 'transparent']}
        style={styles.topGradient}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(5, 5, 8, 0.88)']}
        style={styles.bottomGradient}
        pointerEvents="box-none">
        <SkywriteFramingToolbar
          video={video}
          editable
          onVideoPatch={patchVideo}
          onRequestAdjust={() => framingRef.current?.beginAdjust()}
        />
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
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 72,
    zIndex: 2,
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 120,
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 12,
    zIndex: 2,
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
