import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { CelestialSkyAtmosphere } from '@/constants/celestialTokens';
import { MySkyAssets } from '@/constants/mySkyAssets';

interface MySkyBackdropProps {
  /** Slightly dim for readable overlays — arrival / tab chrome. */
  dim?: boolean;
  /** Overscale inside world space — reduces edge reveal while panning. */
  fillScale?: number;
}

/** Full-bleed My Sky reference background — nebula, horizon glow, depth. */
function MySkyBackdropComponent({ dim = false, fillScale = 1 }: MySkyBackdropProps) {
  return (
    <View style={styles.root} pointerEvents="none" importantForAccessibility="no-hide-descendants">
      <Image
        source={MySkyAssets.background}
        style={[
          styles.image,
          fillScale > 1 ? { transform: [{ scale: fillScale }] } : null,
        ]}
        contentFit="cover"
        contentPosition="bottom center"
        accessibilityIgnoresInvertColors
      />
      {dim ? <View style={styles.dim} /> : null}
    </View>
  );
}

export const MySkyBackdrop = memo(MySkyBackdropComponent);

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: CelestialSkyAtmosphere.base,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: CelestialSkyAtmosphere.dimOverlay,
  },
});
