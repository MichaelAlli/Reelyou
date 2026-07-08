import { memo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { SPLASH_MOUNTAIN_PEAKS } from '@/constants/splashScene';

function SplashMountainsComponent() {
  const { width, height } = useWindowDimensions();
  const bandHeight = height * 0.24;

  return (
    <View pointerEvents="none" style={[styles.wrap, { height: bandHeight }]}>
      {SPLASH_MOUNTAIN_PEAKS.map((peak) => (
        <View
          key={peak.id}
          style={[
            styles.peak,
            {
              left: peak.left * width,
              width: peak.width * width,
              height: peak.height * bandHeight,
              backgroundColor: peak.color,
            },
          ]}
        />
      ))}
      <View style={[styles.valleyGlow, { height: bandHeight * 0.35 }]} />
      <View style={[styles.mist, { height: bandHeight * 0.2 }]} />
    </View>
  );
}

export const SplashMountains = memo(SplashMountainsComponent);

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  peak: {
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  valleyGlow: {
    position: 'absolute',
    bottom: 0,
    left: '30%',
    right: '30%',
    backgroundColor: 'rgba(255, 140, 50, 0.08)',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  mist: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(20, 26, 52, 0.4)',
  },
});
