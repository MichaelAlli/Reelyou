import { ResizeMode, Video } from 'expo-av';
import { memo, useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { Radius } from '@/constants/theme';
import {
  measureContainedVideoFrame,
  skywriteVideoAspectRatio,
  skywriteVideoElementStyle,
} from '@/skywrite/media/skywriteVideoLayout';
import type { SkywriteVideoMedia } from '@/skywrite/types';

interface SkywriteComposerVideoPreviewProps {
  video: SkywriteVideoMedia;
  onDimensionsResolved?: (width: number, height: number) => void;
  /** Max width of the preview stage (defaults to nearly full write card). */
  maxPreviewWidth?: number;
}

function SkywriteComposerVideoPreviewComponent({
  video,
  onDimensionsResolved,
  maxPreviewWidth,
}: SkywriteComposerVideoPreviewProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const previewMaxWidth = maxPreviewWidth ?? Math.min(screenWidth - 48, 420);
  const previewMaxHeight = Math.min(screenHeight * 0.52, 520);
  const [naturalAspect, setNaturalAspect] = useState(() =>
    skywriteVideoAspectRatio(video.width, video.height),
  );
  const [expanded, setExpanded] = useState(false);

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

  const expandedFrame = useMemo(
    () =>
      measureContainedVideoFrame(
        aspectRatio,
        screenWidth - 24,
        screenHeight - 120,
      ),
    [aspectRatio, screenHeight, screenWidth],
  );

  return (
    <>
      <View style={[styles.shell, { width: frame.width, height: frame.height }]}>
        <Video
          style={skywriteVideoElementStyle()}
          source={{ uri: video.uri }}
          useNativeControls={false}
          resizeMode={ResizeMode.CONTAIN}
          isLooping={false}
          isMuted
          shouldPlay={false}
          onLoad={handleLoad}
        />
        <Pressable
          style={styles.expandBtn}
          accessibilityLabel="Expand video preview"
          onPress={() => setExpanded(true)}>
          <Text style={styles.expandBtnText}>⛶</Text>
        </Pressable>
      </View>
      <Modal visible={expanded} animationType="fade" onRequestClose={() => setExpanded(false)}>
        <View style={styles.expandedRoot}>
          <Pressable style={styles.expandedClose} onPress={() => setExpanded(false)}>
            <Text style={styles.expandedCloseText}>Close</Text>
          </Pressable>
          <View style={[styles.shell, { width: expandedFrame.width, height: expandedFrame.height }]}>
            <Video
              style={skywriteVideoElementStyle()}
              source={{ uri: video.uri }}
              useNativeControls={false}
              resizeMode={ResizeMode.CONTAIN}
              isLooping={false}
              isMuted
              shouldPlay={false}
            />
          </View>
        </View>
      </Modal>
    </>
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
  expandBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 10, 28, 0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.35)',
  },
  expandBtnText: {
    color: '#E8C872',
    fontSize: 15,
    fontWeight: '700',
  },
  expandedRoot: {
    flex: 1,
    backgroundColor: '#050508',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  expandedClose: {
    position: 'absolute',
    top: 48,
    right: 16,
    zIndex: 2,
    minHeight: 44,
    justifyContent: 'center',
  },
  expandedCloseText: {
    color: '#E8C872',
    fontSize: 14,
    fontWeight: '600',
  },
});
