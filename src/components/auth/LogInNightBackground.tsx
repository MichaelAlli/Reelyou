import { ReactNode } from 'react';
import { Platform, StyleSheet, type ImageStyle, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { BackgroundImage } from '@/components/layout/BackgroundImage';
import { LogInAssets } from '@/constants/logInAssets';
import { signUpNightWebViewportStyle } from '@/constants/signUpNightLayout';

interface LogInNightBackgroundProps {
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

/** Nighttime Sign In full-screen background — separate from locked Sign Up background assets. */
export function LogInNightBackground({ children, style }: LogInNightBackgroundProps) {
  return (
    <BackgroundImage
      source={LogInAssets.loginNightBackground}
      resizeMode="cover"
      style={StyleSheet.flatten([styles.root, style])}
      imageStyle={LANDSCAPE_IMAGE_STYLE}>
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(5,8,24,0)', 'rgba(5,8,24,0.08)', 'rgba(5,8,24,0.18)']}
        locations={[0, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </BackgroundImage>
  );
}

export function logInNightWebViewportStyle(): ViewStyle | undefined {
  return signUpNightWebViewportStyle();
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
});
