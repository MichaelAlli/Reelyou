import { Image } from 'expo-image';
import { memo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { StarPathAssets } from '@/constants/starpathAssets';
import type { StarPathLayoutMetrics } from '@/starpath/starpathLayoutMetrics';

interface StarPathCinematicBackgroundProps {
  metrics: StarPathLayoutMetrics;
}

function StarPathCinematicBackgroundComponent({ metrics }: StarPathCinematicBackgroundProps) {
  const { worldWidth, contentBandHeight, paddingTop, paddingBottom } = metrics;
  const scenicHeight = contentBandHeight + paddingBottom;

  return (
    <View style={[styles.root, { width: metrics.worldWidth, height: metrics.worldHeight }]}>
      <Image
        source={StarPathAssets.cinematicMaster}
        style={[
          styles.image,
          {
            width: worldWidth,
            height: scenicHeight,
            top: paddingTop,
          },
        ]}
        contentFit="cover"
        contentPosition="top center"
        transition={0}
        cachePolicy="memory-disk"
        accessibilityElementsHidden
        importantForAccessibility="no"
      />

      <Svg
        width={metrics.worldWidth}
        height={metrics.worldHeight}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Defs>
          <LinearGradient id="spUiVeilTop" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#060818" stopOpacity={0.1} />
            <Stop offset="18%" stopColor="transparent" stopOpacity={0} />
          </LinearGradient>
          <LinearGradient id="spUiVeilBottom" x1="0%" y1="100%" x2="0%" y2="0%">
            <Stop offset="0%" stopColor="#030510" stopOpacity={0.22} />
            <Stop offset="26%" stopColor="transparent" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect
          x={0}
          y={paddingTop}
          width={worldWidth}
          height={contentBandHeight}
          fill="url(#spUiVeilTop)"
        />
        <Rect
          x={0}
          y={paddingTop}
          width={worldWidth}
          height={scenicHeight}
          fill="url(#spUiVeilBottom)"
        />
        {paddingBottom > 0 ? (
          <Rect
            x={0}
            y={paddingTop + scenicHeight - Math.min(120, paddingBottom * 0.35)}
            width={worldWidth}
            height={Math.min(120, paddingBottom * 0.35)}
            fill="url(#spUiVeilBottom)"
            opacity={0.65}
          />
        ) : null}
      </Svg>
    </View>
  );
}

export const StarPathCinematicBackground = memo(StarPathCinematicBackgroundComponent);

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
    backgroundColor: '#030510',
  },
  image: {
    position: 'absolute',
    left: 0,
    ...(Platform.OS === 'web'
      ? ({
          objectFit: 'cover',
          objectPosition: 'top center',
          imageRendering: '-webkit-optimize-contrast',
        } as object)
      : null),
  },
});
