import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { HomeAssets } from '@/constants/homeAssets';

interface HomeBackdropProps {
  reduceMotion?: boolean;
}

/** Full-bleed approved Home background — cover fit, no zoom, no stretch. */
function HomeBackdropComponent(_props: HomeBackdropProps) {
  return (
    <View style={styles.root} pointerEvents="none">
      <Image
        source={HomeAssets.background}
        style={styles.image}
        contentFit="cover"
        contentPosition="center"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

export const HomeBackdrop = memo(HomeBackdropComponent);

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#05070A',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
