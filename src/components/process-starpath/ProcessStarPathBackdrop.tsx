import { Image } from 'expo-image';
import { memo, useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ProcessPalette } from '@/components/process-starpath/processStarPathSpec';
import { ReelyouEasing, ReelyouMotion } from '@/constants/animation';
import { ProcessAssets } from '@/constants/processAssets';

function ProcessStarPathBackdropComponent() {
  const fade = useSharedValue(0);

  useEffect(() => {
    fade.value = withTiming(1, {
      duration: ReelyouMotion.fadeIn + 400,
      easing: ReelyouEasing.out,
    });
  }, [fade]);

  const wrap = useAnimatedStyle(() => ({ opacity: fade.value }));

  return (
    <View style={styles.root}>
      <Animated.View style={[StyleSheet.absoluteFill, wrap]}>
        <Image
          source={ProcessAssets.background}
          style={styles.image}
          contentFit="cover"
          contentPosition="center"
          transition={0}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      </Animated.View>
    </View>
  );
}

export const ProcessStarPathBackdrop = memo(ProcessStarPathBackdropComponent);

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFill, backgroundColor: ProcessPalette.canvasDeep, overflow: 'hidden' },
  image: {
    ...StyleSheet.absoluteFill,
    ...(Platform.OS === 'web' ? ({ minHeight: '100vh' } as object) : null),
  },
});
