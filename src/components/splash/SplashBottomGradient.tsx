import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

/** Soft bottom fade so loading text remains legible without a solid bar. */
function SplashBottomGradientComponent() {
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <View style={[styles.layer, styles.layer4]} />
      <View style={[styles.layer, styles.layer3]} />
      <View style={[styles.layer, styles.layer2]} />
      <View style={[styles.layer, styles.layer1]} />
    </View>
  );
}

export const SplashBottomGradient = memo(SplashBottomGradientComponent);

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 160,
    zIndex: 1,
  },
  layer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  layer1: {
    height: 48,
    backgroundColor: 'rgba(2, 5, 18, 0.38)',
  },
  layer2: {
    height: 88,
    backgroundColor: 'rgba(2, 5, 18, 0.18)',
  },
  layer3: {
    height: 120,
    backgroundColor: 'rgba(2, 5, 18, 0.08)',
  },
  layer4: {
    height: 160,
    backgroundColor: 'rgba(2, 5, 18, 0.02)',
  },
});
