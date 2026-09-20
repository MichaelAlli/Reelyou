import { memo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

interface StarPathDepthOverlayProps {
  width: number;
  height: number;
}

function StarPathDepthOverlayComponent({ width, height }: StarPathDepthOverlayProps) {
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <RadialGradient id="spDepthVignette" cx="50%" cy="36%" r="80%">
          <Stop offset="58%" stopColor="transparent" stopOpacity={0} />
          <Stop offset="100%" stopColor="#020308" stopOpacity={0.4} />
        </RadialGradient>
        <RadialGradient id="spPathCorridor" cx="50%" cy="46%" r="40%">
          <Stop offset="0%" stopColor="#FFE8A8" stopOpacity={0.07} />
          <Stop offset="100%" stopColor="transparent" stopOpacity={0} />
        </RadialGradient>
        <LinearGradient id="spForegroundDark" x1="0%" y1="100%" x2="0%" y2="58%">
          <Stop offset="0%" stopColor="#020308" stopOpacity={0.42} />
          <Stop offset="50%" stopColor="transparent" stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Rect width={width} height={height} fill="url(#spDepthVignette)" />
      <Rect width={width} height={height} fill="url(#spPathCorridor)" />
      <Rect width={width} height={height} fill="url(#spForegroundDark)" />
    </Svg>
  );
}

export const StarPathDepthOverlay = memo(StarPathDepthOverlayComponent);
