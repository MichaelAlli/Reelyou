import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { MySkyAssets } from '@/constants/mySkyAssets';

interface MySkyBackdropProps {
  /** Slightly dim for readable overlays — arrival / tab chrome. */
  dim?: boolean;
}

/** Full-bleed My Sky reference background — nebula, horizon glow, depth. */
function MySkyBackdropComponent({ dim = false }: MySkyBackdropProps) {
  return (
    <View style={styles.root} pointerEvents="none" importantForAccessibility="no-hide-descendants">
      <Image
        source={MySkyAssets.background}
        style={styles.image}
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
    backgroundColor: '#05070A',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(4, 6, 18, 0.18)',
  },
});
