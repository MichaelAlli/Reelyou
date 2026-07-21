import { ReactNode, useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View, type ImageStyle, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { BackgroundImage } from '@/components/layout/BackgroundImage';
import { AuthTempAssets } from '@/constants/authAssets';
import { useAuthAppearance } from '@/hooks/use-auth-appearance';

interface AuthCelestialBackgroundProps {
  children: ReactNode;
  style?: ViewStyle;
}

const NIGHT_SKY = ['#030615', '#050818', '#0A1230', '#101848'] as const;

const DAY_LANDSCAPE_IMAGE_STYLE: ImageStyle =
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

export function AuthCelestialBackground({ children, style }: AuthCelestialBackgroundProps) {
  const isLight = useAuthAppearance();

  if (isLight) {
    return (
      <BackgroundImage
        source={AuthTempAssets.signupDayLandscape}
        resizeMode="cover"
        style={StyleSheet.flatten([styles.root, style])}
        imageStyle={DAY_LANDSCAPE_IMAGE_STYLE}>
        <DayAliveOverlay />
        {children}
      </BackgroundImage>
    );
  }

  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={[...NIGHT_SKY]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      <NightAtmosphere />
      {children}
    </View>
  );
}

/** Subtle sunrise luminosity — daytime Sign Up only. */
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

function NightAtmosphere() {
  return (
    <>
      {NIGHT_STARS.map((star) => (
        <View
          key={star.id}
          style={[
            styles.star,
            {
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}
      <View style={[styles.cloud, styles.nightCloudLeft]} />
      <View style={[styles.cloud, styles.nightCloudRight]} />
      <LinearGradient
        colors={['rgba(212,175,55,0)', 'rgba(212,175,55,0.22)', 'rgba(245,215,110,0.38)']}
        style={styles.nightHorizonGlow}
      />
      <View style={styles.nightMountainSilhouette} />
    </>
  );
}

const NIGHT_STARS = [
  { id: 's1', top: 8, left: 12, size: 2, opacity: 0.9 },
  { id: 's2', top: 14, left: 28, size: 1.5, opacity: 0.7 },
  { id: 's3', top: 10, left: 52, size: 2, opacity: 0.85 },
  { id: 's4', top: 18, left: 68, size: 1.5, opacity: 0.65 },
  { id: 's5', top: 12, left: 84, size: 2, opacity: 0.8 },
  { id: 's6', top: 22, left: 40, size: 1.5, opacity: 0.55 },
] as const;

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
  cloud: {
    position: 'absolute',
    borderRadius: 999,
  },
  nightHorizonGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '38%',
  },
  nightCloudLeft: {
    bottom: '16%',
    left: '-18%',
    width: '62%',
    height: 110,
    backgroundColor: 'rgba(8,12,36,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.18)',
  },
  nightCloudRight: {
    bottom: '12%',
    right: '-20%',
    width: '58%',
    height: 96,
    backgroundColor: 'rgba(8,12,36,0.68)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.18)',
  },
  nightMountainSilhouette: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '14%',
    backgroundColor: 'rgba(2,4,14,0.92)',
  },
  star: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
});
