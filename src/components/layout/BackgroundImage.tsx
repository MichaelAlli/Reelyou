import { ImageBackground, ImageSourcePropType, Platform, StyleSheet, ViewStyle } from 'react-native';
import { ReactNode } from 'react';

export interface BackgroundImageProps {
  source: ImageSourcePropType;
  children?: ReactNode;
  style?: ViewStyle;
}

/**
 * Full-bleed background image container.
 * Uses resizeMode="cover" — no side gutters on the artwork.
 */
export function BackgroundImage({ source, children, style }: BackgroundImageProps) {
  return (
    <ImageBackground source={source} resizeMode="cover" style={[styles.root, style]}>
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web'
      ? ({
          minHeight: '100vh',
        } as ViewStyle)
      : null),
  },
});
