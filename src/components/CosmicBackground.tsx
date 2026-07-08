import { ReactNode, useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View, ViewStyle } from 'react-native';

import { CosmicTheme } from '@/constants/theme';
import { constellationStars as stars } from '@/data/mockData';

interface CosmicBackgroundProps {
  children: ReactNode;
  style?: ViewStyle;
  showStars?: boolean;
}

export function CosmicBackground({ children, style, showStars = true }: CosmicBackgroundProps) {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 3000, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const { width, height } = Dimensions.get('window');

  return (
    <View style={[styles.container, style]}>
      <View style={styles.auroraTop} />
      <View style={styles.auroraBottom} />
      {showStars &&
        stars.map((star) => (
          <Animated.View
            key={star.id}
            style={[
              styles.star,
              {
                left: star.x * width,
                top: star.y * height * 0.6,
                width: star.size,
                height: star.size,
                opacity: pulse.interpolate({
                  inputRange: [0.4, 1],
                  outputRange: [star.opacity * 0.5, star.opacity],
                }),
              },
            ]}
          />
        ))}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CosmicTheme.background,
  },
  auroraTop: {
    position: 'absolute',
    top: -100,
    left: -50,
    right: -50,
    height: 300,
    backgroundColor: CosmicTheme.purpleGlow,
    borderRadius: 200,
    opacity: 0.6,
  },
  auroraBottom: {
    position: 'absolute',
    bottom: -80,
    left: 50,
    right: 50,
    height: 200,
    backgroundColor: CosmicTheme.goldMuted,
    borderRadius: 150,
    opacity: 0.15,
  },
  star: {
    position: 'absolute',
    backgroundColor: CosmicTheme.star,
    borderRadius: 999,
  },
});
