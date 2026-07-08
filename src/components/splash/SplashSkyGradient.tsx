import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { SplashColors } from '@/constants/splashTheme';

function SplashSkyGradientComponent() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.base} />
      <View style={styles.indigoTop} />
      <View style={styles.indigoMid} />
      <View style={styles.horizonWarmth} />
      <View style={styles.horizonGlow} />
      <View style={styles.vignetteTop} />
      <View style={styles.vignetteSides} />
    </View>
  );
}

export const SplashSkyGradient = memo(SplashSkyGradientComponent);

const styles = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFill,
    backgroundColor: SplashColors.navyDeep,
  },
  indigoTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(13, 18, 36, 0.9)',
  },
  indigoMid: {
    position: 'absolute',
    top: '15%',
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(22, 27, 51, 0.45)',
  },
  horizonWarmth: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '42%',
    backgroundColor: 'rgba(255, 100, 30, 0.07)',
  },
  horizonGlow: {
    position: 'absolute',
    bottom: 0,
    left: '8%',
    right: '8%',
    height: '24%',
    backgroundColor: 'rgba(255, 150, 60, 0.1)',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  vignetteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '16%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  vignetteSides: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 40,
  },
});
