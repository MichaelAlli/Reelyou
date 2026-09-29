import { ResizeMode, Video } from 'expo-av';
import { memo, useCallback, useMemo, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { Radius } from '@/constants/theme';
import {
  measureContainedVideoFrame,
  skywriteVideoAspectRatio,
} from '@/skywrite/media/skywriteVideoLayout';
import type { SkywriteVideoMedia } from '@/skywrite/types';

interface SkywriteComposerVideoPreviewProps {
  video: SkywriteVideoMedia;
  onDimensionsResolved?: (width: number, height: number) => void;
}

function SkywriteComposerVideoPreviewComponent({
  video,
  onDimensionsResolved,
}: SkywriteComposerVideoPreviewProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const previewMaxWidth = Math.min(screenWidth - 80, 360);
  const previewMaxHeight = Math.min(screenHeight * 0.38, 420);
  const [naturalAspect, setNaturalAspect] = useState(() =>
    skywriteVideoAspectRatio(video.width, video.height),
  );

  const aspectRatio = useMemo(
    () => skywriteVideoAspectRatio(video.width, video.height) || naturalAspect,
    [naturalAspect, video.height, video.width],
  );

  const frame = useMemo(
    () => measureContainedVideoFrame(aspectRatio, previewMaxWidth, previewMaxHeight),
    [aspectRatio, previewMaxHeight, previewMaxWidth],
  );

  const handleLoad = useCallback(
    (status: { isLoaded?: boolean; naturalSize?: { width: number; height: number } }) => {
      if (!status.isLoaded) return;
      const w = status.naturalSize?.width;
      const h = status.naturalSize?.height;
      if (w != null && h != null && h > 0) {
        setNaturalAspect(w / h);
        onDimensionsResolved?.(w, h);
      }
    },
    [onDimensionsResolved],
  );

  return (
    <View style={[styles.shell, { width: frame.width, height: frame.height }]}>
      <Video
        style={StyleSheet.absoluteFillObject}
        source={{ uri: video.uri }}
        useNativeControls={false}
        resizeMode={ResizeMode.CONTAIN}
        isLooping={false}
        isMuted
        shouldPlay={false}
        onLoad={handleLoad}
      />
    </View>
  );
}

export const SkywriteComposerVideoPreview = memo(SkywriteComposerVideoPreviewComponent);

const styles = StyleSheet.create({
  shell: {
    alignSelf: 'center',
    backgroundColor: '#050508',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.24)',
  },
});
