import { ReactNode, useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, type ImageStyle, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { BackgroundImage } from '@/components/layout/BackgroundImage';
import { LogInAssets } from '@/constants/logInAssets';
import { signUpDayWebViewportStyle } from '@/constants/signUpDayLayout';

interface LogInDayBackgroundProps {
  children: ReactNode;
  style?: ViewStyle;
}

const LANDSCAPE_IMAGE_STYLE: ImageStyle =
  Platform.OS === 'web'
    ? ({
        height: '100%',
        width: '100%',
        objectFit: 'cover',
        objectPosition: 'center center',
      } as ImageStyle)
    : {
        height: '100%',
        width: '100%',
      };

/** Daytime Sign In full-screen background — separate from locked Sign Up background assets. */
export function LogInDayBackground({ children, style }: LogInDayBackgroundProps) {
  return (
    <BackgroundImage
      source={LogInAssets.loginDayBackground}
      resizeMode="cover"
      style={StyleSheet.flatten([styles.root, style])}
      imageStyle={LANDSCAPE_IMAGE_STYLE}>
      <DayAliveOverlay />
      {children}
    </BackgroundImage>
  );
}

export function logInDayWebViewportStyle(): ViewStyle | undefined {
  return signUpDayWebViewportStyle();
}

function DayAliveOverlay() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 7000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 7000, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const shimmerOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.03, 0.07],
  });

  return (
    <>
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,236,190,0.12)', 'rgba(255,220,150,0.22)']}
        locations={[0.45, 0.72, 1]}
        style={styles.daySunriseGlow}
        pointerEvents="none"
      />
      <Animated.View style={[styles.dayShimmer, { opacity: shimmerOpacity }]} pointerEvents="none">
        <LinearGradient
          colors={['rgba(255,248,220,0)', 'rgba(255,230,160,0.35)', 'rgba(255,248,220,0)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    ...(Platform.OS === 'web'
      ? ({
          minHeight: '100vh',
        } as unknown as ViewStyle)
      : null),
  },
  daySunriseGlow: {
    ...StyleSheet.absoluteFill,
  },
  dayShimmer: {
    position: 'absolute',
    top: '38%',
    left: 0,
    right: 0,
    height: '28%',
  },
});
