import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SPLASH_LAYOUT } from '@/constants/splashScene';
import { SplashColors } from '@/constants/splashTheme';

/** Hides baked-in loading copy in splash-approved.png so the live footer label renders once. */
function SplashArtworkEmbeddedLoadingMaskComponent() {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const bandHeight = Math.max(40, Math.round(screenHeight * 0.045));
  const bottom = insets.bottom + screenHeight * (SPLASH_LAYOUT.loadingBottomRatio - 0.018);

  return (
    <LinearGradient
      pointerEvents="none"
      colors={[
        'rgba(2, 5, 18, 0)',
        'rgba(2, 5, 18, 0.72)',
        SplashColors.navyDeep,
      ]}
      locations={[0, 0.45, 1]}
      style={[styles.band, { height: bandHeight, bottom }]}
    />
  );
}

export const SplashArtworkEmbeddedLoadingMask = memo(SplashArtworkEmbeddedLoadingMaskComponent);

const styles = StyleSheet.create({
  band: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 5,
  },
});
