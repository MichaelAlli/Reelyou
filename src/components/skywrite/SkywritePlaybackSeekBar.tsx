import { memo, useCallback, useRef, useState } from 'react';
import {
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native';

import { Fonts } from '@/constants/theme';
import {
  formatSkywriteAudioDuration,
  formatSkywritePlaybackDurationLabel,
} from '@/skywrite/media/skywriteMediaPreviewUtils';
import { finiteMs } from '@/skywrite/media/skywritePlaybackTime';

interface SkywritePlaybackSeekBarProps {
  positionMs: number;
  durationMs: number;
  disabled?: boolean;
  onScrubStart: () => void;
  onScrub: (positionMs: number) => void;
  onScrubEnd: (positionMs: number) => void;
  accessibilityLabel?: string;
}

function clampSeek(positionMs: number, durationMs: number): number {
  if (durationMs <= 0) return 0;
  const pos = finiteMs(positionMs) ?? 0;
  return Math.max(0, Math.min(pos, durationMs));
}

function localXFromEvent(event: GestureResponderEvent): number {
  const ne = event.nativeEvent as { locationX?: number; offsetX?: number };
  if (Platform.OS === 'web' && typeof ne.offsetX === 'number' && Number.isFinite(ne.offsetX)) {
    return ne.offsetX;
  }
  return finiteMs(ne.locationX) ?? 0;
}

function SkywritePlaybackSeekBarComponent({
  positionMs,
  durationMs,
  disabled = false,
  onScrubStart,
  onScrub,
  onScrubEnd,
  accessibilityLabel = 'Playback position',
}: SkywritePlaybackSeekBarProps) {
  const trackWidthRef = useRef(0);
  const lastScrubMsRef = useRef(0);
  const [scrubMs, setScrubMs] = useState<number | null>(null);
  const displayMs = scrubMs ?? positionMs;
  const safeDuration = finiteMs(durationMs) ?? 0;
  const ready = safeDuration > 0 && !disabled;
  const ratioRaw = ready ? clampSeek(displayMs, safeDuration) / safeDuration : 0;
  const ratio = Number.isFinite(ratioRaw) ? Math.max(0, Math.min(1, ratioRaw)) : 0;

  const applyFromX = useCallback(
    (localX: number, commit: boolean) => {
      if (!ready) return;
      const width = trackWidthRef.current;
      if (width <= 0) return;
      const next = clampSeek((localX / width) * safeDuration, safeDuration);
      lastScrubMsRef.current = next;
      setScrubMs(next);
      onScrub(next);
      if (commit) {
        setScrubMs(null);
        onScrubEnd(next);
      }
    },
    [onScrub, onScrubEnd, ready, safeDuration],
  );

  const onTrackLayout = useCallback((event: LayoutChangeEvent) => {
    trackWidthRef.current = event.nativeEvent.layout.width;
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => ready,
      onMoveShouldSetPanResponder: () => ready,
      onPanResponderGrant: (event) => {
        onScrubStart();
        applyFromX(localXFromEvent(event), false);
      },
      onPanResponderMove: (event) => {
        applyFromX(localXFromEvent(event), false);
      },
      onPanResponderRelease: (event) => {
        applyFromX(localXFromEvent(event), true);
      },
      onPanResponderTerminate: () => {
        onScrubEnd(lastScrubMsRef.current);
        setScrubMs(null);
      },
    }),
  ).current;

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Text style={styles.timeRow} accessibilityElementsHidden importantForAccessibility="no">
        {formatSkywriteAudioDuration(displayMs)} /{' '}
        {formatSkywritePlaybackDurationLabel(safeDuration, ready)}
      </Text>
      <View
        style={[styles.trackOuter, !ready && styles.trackDisabled]}
        onLayout={onTrackLayout}
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: !ready }}
        accessibilityValue={{
          min: 0,
          max: Math.max(durationMs, 1),
          now: clampSeek(displayMs, durationMs),
        }}
        {...(ready ? panResponder.panHandlers : {})}>
        <Pressable
          disabled={!ready}
          style={styles.trackHit}
          onPress={(event) => {
            onScrubStart();
            applyFromX(localXFromEvent(event), true);
          }}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
            <View style={[styles.thumb, { left: `${ratio * 100}%` }]} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

export const SkywritePlaybackSeekBar = memo(SkywritePlaybackSeekBarComponent);

const styles = StyleSheet.create({
  wrap: { width: '100%', gap: 4, marginTop: 4 },
  timeRow: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(248,244,236,0.65)',
    textAlign: 'center',
  },
  trackOuter: { minHeight: 32, justifyContent: 'center' },
  trackDisabled: { opacity: 0.45 },
  trackHit: { paddingVertical: 8 },
  track: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(167, 139, 250, 0.22)',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(232, 200, 114, 0.88)',
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    top: -5,
    marginLeft: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E8C872',
    borderWidth: 1,
    borderColor: 'rgba(26, 16, 40, 0.35)',
  },
});
