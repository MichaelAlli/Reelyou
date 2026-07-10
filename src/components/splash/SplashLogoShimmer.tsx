import { memo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { ReelyouMotionValues } from '@/constants/animation';
import { SPLASH_LAYOUT } from '@/constants/splashScene';
import { SplashColors } from '@/constants/splashTheme';

const LOGO_ICON_Y = SPLASH_LAYOUT.brandCenterY - 0.048;
const LOGO_W_RATIO = 0.13;

/** Static edge accents — clean metallic gold edge glow only. */
const LOGO_EDGE_GLOW = [
  { ox: 0.1, oy: 0.14 },
  { ox: 0.86, oy: 0.36 },
] as const;

function SplashLogoShimmerComponent() {
  const { width, height } = useWindowDimensions();
  const logoW = width * LOGO_W_RATIO;
  const logoH = logoW * (0.105 / LOGO_W_RATIO);
  const left = width / 2 - logoW / 2;
  const top = height * LOGO_ICON_Y - logoH / 2;

  return (
    <View pointerEvents="none" style={[styles.clip, { left, top, width: logoW, height: logoH }]}>
      {LOGO_EDGE_GLOW.map((point, index) => (
        <View
          key={`logo-glow-${index}`}
          style={[
            styles.edgeGlow,
            {
              left: point.ox * logoW - 1,
              top: point.oy * logoH - 1,
              opacity: ReelyouMotionValues.glowOpacityMin,
            },
          ]}
        />
      ))}
    </View>
  );
}

export const SplashLogoShimmer = memo(SplashLogoShimmerComponent);

const styles = StyleSheet.create({
  clip: {
    position: 'absolute',
    zIndex: 4,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  edgeGlow: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 215, 140, 0.22)',
    shadowColor: SplashColors.goldMetallic,
    shadowOpacity: 0.18,
    shadowRadius: 1.5,
  },
});
