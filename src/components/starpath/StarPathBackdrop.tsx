import { memo, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import {
  BEACON_PEAK_ANCHOR,
  buildStarField,
  scalePoint,
} from '@/starpath/starpathGeometry';
import type { StarPathThemeTokens } from '@/starpath/starpathTheme';

interface StarPathBackdropProps {
  width: number;
  height: number;
  theme: StarPathThemeTokens;
  scrollY: SharedValue<number>;
  reduceMotion?: boolean;
}

function StarPathBackdropComponent({
  width,
  height,
  theme,
  scrollY,
  reduceMotion = false,
}: StarPathBackdropProps) {
  const mistDrift = useSharedValue(0);
  const nebulaPulse = useSharedValue(0);
  const stars = useMemo(() => buildStarField(72), []);

  useEffect(() => {
    if (reduceMotion) return;
    mistDrift.value = withRepeat(
      withTiming(1, { duration: 22000, easing: Easing.linear }),
      -1,
      false,
    );
    nebulaPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 5000, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [mistDrift, nebulaPulse, reduceMotion]);

  const skyLayer = useAnimatedStyle(() => ({
    transform: [{ translateY: -scrollY.value * 0.04 }],
  }));

  const mountainLayer = useAnimatedStyle(() => ({
    transform: [{ translateY: -scrollY.value * 0.1 }],
  }));

  const mistLayer = useAnimatedStyle(() => ({
    opacity: 0.5 + mistDrift.value * 0.2,
    transform: [{ translateX: mistDrift.value * 24 - 12 }],
  }));

  const peak = scalePoint(BEACON_PEAK_ANCHOR, width, height);

  const beaconPeak = `
    M ${peak.x} ${peak.y - height * 0.06}
    L ${peak.x - width * 0.14} ${peak.y + height * 0.02}
    L ${peak.x - width * 0.06} ${peak.y + height * 0.04}
    L ${peak.x} ${peak.y + height * 0.055}
    L ${peak.x + width * 0.06} ${peak.y + height * 0.04}
    L ${peak.x + width * 0.14} ${peak.y + height * 0.02}
    Z
  `;

  const mountainFar = `
    M 0 ${height * 0.52}
    L ${width * 0.14} ${height * 0.44}
    L ${width * 0.28} ${height * 0.48}
    L ${width * 0.42} ${height * 0.4}
    L ${width * 0.56} ${height * 0.46}
    L ${width * 0.72} ${height * 0.42}
    L ${width * 0.86} ${height * 0.46}
    L ${width} ${height * 0.44}
    L ${width} ${height}
    L 0 ${height}
    Z
  `;

  const mountainMid = `
    M 0 ${height * 0.62}
    L ${width * 0.1} ${height * 0.56}
    L ${width * 0.24} ${height * 0.6}
    L ${width * 0.38} ${height * 0.54}
    L ${width * 0.52} ${height * 0.58}
    L ${width * 0.68} ${height * 0.54}
    L ${width * 0.84} ${height * 0.58}
    L ${width} ${height * 0.56}
    L ${width} ${height}
    L 0 ${height}
    Z
  `;

  const mountainNear = `
    M 0 ${height * 0.74}
    L ${width * 0.2} ${height * 0.68}
    L ${width * 0.4} ${height * 0.72}
    L ${width * 0.6} ${height * 0.66}
    L ${width * 0.8} ${height * 0.7}
    L ${width} ${height * 0.68}
    L ${width} ${height}
    L 0 ${height}
    Z
  `;

  const floatingIsle = `
    M ${width * 0.08} ${height * 0.38}
    Q ${width * 0.14} ${height * 0.34} ${width * 0.2} ${height * 0.38}
    Q ${width * 0.14} ${height * 0.42} ${width * 0.08} ${height * 0.38}
    Z
  `;

  return (
    <View style={[styles.root, { width, height }]}>
      <Animated.View style={[StyleSheet.absoluteFill, skyLayer]}>
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={theme.skyTop} />
              <Stop offset="45%" stopColor={theme.skyMid} />
              <Stop offset="100%" stopColor={theme.skyHorizon} />
            </LinearGradient>
            <RadialGradient id="nebulaTop" cx="50%" cy="18%" r="55%">
              <Stop offset="0%" stopColor={theme.nebulaViolet} stopOpacity={0.9} />
              <Stop offset="100%" stopColor={theme.nebulaIndigo} stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="horizonWarm" cx="50%" cy="85%" r="45%">
              <Stop offset="0%" stopColor={theme.horizonGlow} stopOpacity={0.85} />
              <Stop offset="100%" stopColor={theme.horizonGlow} stopOpacity={0} />
            </RadialGradient>
            <LinearGradient id="beaconColumn" x1="50%" y1="0%" x2="50%" y2="100%">
              <Stop offset="0%" stopColor={theme.beaconColumn} stopOpacity={0.9} />
              <Stop offset="100%" stopColor={theme.beaconColumn} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Rect width={width} height={height} fill="url(#skyGrad)" />
          <Rect width={width} height={height} fill="url(#nebulaTop)" />
          <Rect width={width} height={height} fill="url(#horizonWarm)" />
          <Rect
            x={peak.x - width * 0.12}
            y={0}
            width={width * 0.24}
            height={height * 0.45}
            fill="url(#beaconColumn)"
            opacity={0.85}
          />
        </Svg>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, skyLayer]} pointerEvents="none">
        <Svg width={width} height={height}>
          {stars.map((star, i) => (
            <Rect
              key={`star-${i}`}
              x={star.x * width}
              y={star.y * height}
              width={star.r}
              height={star.r}
              rx={star.r / 2}
              fill={theme.starField}
              opacity={star.o}
            />
          ))}
        </Svg>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, mountainLayer]} pointerEvents="none">
        <Svg width={width} height={height}>
          <Path d={mountainFar} fill={theme.mountainFar} opacity={0.9} />
          <Path d={mountainMid} fill={theme.mountainMid} />
          <Path d={beaconPeak} fill={theme.mountainMid} opacity={0.95} />
          <Path d={beaconPeak} fill={theme.peakHighlight} opacity={0.55} />
          <Path d={floatingIsle} fill={theme.mountainFar} opacity={0.55} />
          <Path d={mountainNear} fill={theme.mountainNear} />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.mistBand, mistLayer, { backgroundColor: theme.mist, top: height * 0.22 }]} />
      <Animated.View
        style={[styles.mistBand, mistLayer, { backgroundColor: theme.mistSoft, top: height * 0.48 }]}
      />

      <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="vignette" cx="50%" cy="45%" r="70%">
            <Stop offset="55%" stopColor="transparent" stopOpacity={0} />
            <Stop offset="100%" stopColor={theme.vignette} stopOpacity={1} />
          </RadialGradient>
        </Defs>
        <Rect width={width} height={height} fill="url(#vignette)" />
      </Svg>
    </View>
  );
}

export const StarPathBackdrop = memo(StarPathBackdropComponent);

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
    backgroundColor: '#020308',
  },
  mistBand: {
    position: 'absolute',
    left: -40,
    right: -40,
    height: 90,
    borderRadius: 45,
    opacity: 0.45,
  },
});
