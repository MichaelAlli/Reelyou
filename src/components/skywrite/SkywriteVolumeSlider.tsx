import { memo, useCallback, useRef } from 'react';
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';

import { Fonts } from '@/constants/theme';
import { clampVolume } from '@/skywrite/media/skywriteOriginalVideoVolume';

interface SkywriteVolumeSliderProps {
  label: string;
  value: number;
  onChange: (next: number) => void;
  accessibilityHint?: string;
}

function SkywriteVolumeSliderComponent({
  label,
  value,
  onChange,
  accessibilityHint,
}: SkywriteVolumeSliderProps) {
  const trackWidthRef = useRef(0);
  const percent = Math.round(clampVolume(value) * 100);

  const applyFromX = useCallback(
    (localX: number) => {
      const width = trackWidthRef.current;
      if (width <= 0) return;
      const ratio = clampVolume(localX / width);
      onChange(Math.round(ratio * 20) / 20);
    },
    [onChange],
  );

  const onTrackLayout = useCallback((event: LayoutChangeEvent) => {
    trackWidthRef.current = event.nativeEvent.layout.width;
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        applyFromX(event.nativeEvent.locationX);
      },
      onPanResponderMove: (event) => {
        applyFromX(event.nativeEvent.locationX);
      },
    }),
  ).current;

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.percent}>{percent}%</Text>
      </View>
      <View
        style={styles.trackOuter}
        onLayout={onTrackLayout}
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        accessibilityValue={{ text: `${percent} percent` }}
        {...panResponder.panHandlers}>
        <Pressable
          style={styles.trackHit}
          onPress={(event) => applyFromX(event.nativeEvent.locationX)}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${percent}%` }]} />
            <View style={[styles.thumb, { left: `${percent}%` }]} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

export const SkywriteVolumeSlider = memo(SkywriteVolumeSliderComponent);

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(235, 228, 248, 0.82)',
  },
  percent: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(235, 228, 248, 0.65)',
    minWidth: 36,
    textAlign: 'right',
  },
  trackOuter: { minHeight: 36, justifyContent: 'center' },
  trackHit: { paddingVertical: 10 },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    overflow: 'visible',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(232, 200, 114, 0.85)',
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    top: -5,
    marginLeft: -7,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E8C872',
    borderWidth: 1,
    borderColor: 'rgba(26, 16, 40, 0.35)',
  },
});
