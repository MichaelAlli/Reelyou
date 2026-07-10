import { memo, useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ReelyouEasing } from '@/constants/animation';
import { SPLASH_CLOUD_LAYERS, type CloudLayerSpec } from '@/constants/splashScene';
import { SplashColors } from '@/constants/splashTheme';

const VolumetricCloud = memo(function VolumetricCloud(spec: CloudLayerSpec) {
  const { width, height } = useWindowDimensions();
  const driftX = useSharedValue<number>(0);
  const driftY = useSharedValue<number>(0);
  const breathe = useSharedValue<number>(spec.opacity);

  useEffect(() => {
    const half = spec.duration / 2;

    driftX.value = withDelay(
      spec.delay,
      withRepeat(
        withSequence(
          withTiming(spec.driftX, { duration: half, easing: ReelyouEasing.inOut }),
          withTiming(-spec.driftX * 0.45, { duration: half, easing: ReelyouEasing.inOut }),
        ),
        -1,
        true,
      ),
    );

    driftY.value = withDelay(
      spec.delay,
      withRepeat(
        withSequence(
          withTiming(spec.driftY, { duration: half, easing: ReelyouEasing.inOut }),
          withTiming(spec.driftY * 0.35, { duration: half, easing: ReelyouEasing.inOut }),
        ),
        -1,
        true,
      ),
    );

    breathe.value = withDelay(
      spec.delay,
      withRepeat(
        withSequence(
          withTiming(spec.opacity * 1.06, { duration: half, easing: ReelyouEasing.inOut }),
          withTiming(spec.opacity * 0.94, { duration: half, easing: ReelyouEasing.inOut }),
        ),
        -1,
        true,
      ),
    );
  }, [breathe, driftX, driftY, spec.delay, spec.driftX, spec.driftY, spec.duration, spec.opacity]);

  const groupStyle = useAnimatedStyle(() => ({
    opacity: breathe.value,
    transform: [{ translateX: driftX.value }, { translateY: driftY.value }],
  }));

  const baseW = spec.width * width;
  const baseH = spec.height * height;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.group,
        groupStyle,
        {
          left: spec.left * width,
          top: spec.top * height,
          width: baseW,
          height: baseH,
        },
      ]}>
      {spec.puffs.map((p, i) => {
        const puffW = baseW * 0.36 * p.scale;
        const puffH = baseH * 0.92 * p.scale;
        const left = p.ox * baseW;
        const top = p.oy * baseH;

        return (
          <View key={`${spec.id}-p${i}`} style={[styles.puffWrap, { left, top, width: puffW, height: puffH }]}>
            <View style={[styles.puffShadow, { width: puffW * 1.02, height: puffH * 0.88 }]} />
            <View style={[styles.puffBody, { width: puffW * 0.96, height: puffH * 0.72 }]} />
            <View style={[styles.puffHighlight, { width: puffW * 0.7, height: puffH * 0.28 }]} />
            <View style={[styles.puffRim, { width: puffW * 0.9, height: puffH * 0.32 }]} />
            <View
              style={[
                styles.puffGlint,
                { width: puffW * 0.42, height: puffH * 0.1, bottom: puffH * 0.24 },
              ]}
            />
          </View>
        );
      })}
    </Animated.View>
  );
});

function SplashCloudLayersComponent() {
  return (
    <View pointerEvents="none" style={styles.wrap}>
      {SPLASH_CLOUD_LAYERS.map((layer) => (
        <VolumetricCloud key={layer.id} {...layer} />
      ))}
    </View>
  );
}

export const SplashCloudLayers = memo(SplashCloudLayersComponent);

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFill,
    zIndex: 3,
  },
  group: {
    position: 'absolute',
  },
  puffWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  puffShadow: {
    position: 'absolute',
    bottom: 0,
    borderRadius: 999,
    backgroundColor: 'rgba(10, 12, 30, 0.72)',
  },
  puffBody: {
    position: 'absolute',
    bottom: '10%',
    borderRadius: 999,
    backgroundColor: 'rgba(22, 26, 54, 0.78)',
  },
  puffHighlight: {
    position: 'absolute',
    bottom: '18%',
    borderRadius: 999,
    backgroundColor: 'rgba(75, 62, 95, 0.28)',
  },
  puffRim: {
    position: 'absolute',
    bottom: 0,
    borderRadius: 999,
    backgroundColor: SplashColors.cloudRim,
    shadowColor: '#FFB040',
    shadowOpacity: 0.75,
    shadowRadius: 18,
  },
  puffGlint: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 205, 120, 0.16)',
  },
});
