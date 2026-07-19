import {
  ImageBackground,
  ImageResizeMode,
  ImageSourcePropType,
  ImageStyle,
  Platform,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { ReactNode } from 'react';

export interface BackgroundImageProps {
  source: ImageSourcePropType;
  children?: ReactNode;
  style?: ViewStyle;
  /** Styles applied to the inner image — use for vertical focal correction on contain layouts. */
  imageStyle?: ImageStyle;
  /** Defaults to cover for full-bleed screens. Welcome uses contain to preserve star arc. */
  resizeMode?: ImageResizeMode;
}

/**
 * Full-bleed background image container.
 * Uses resizeMode="cover" by default — no side gutters on the artwork.
 */
export function BackgroundImage({
  source,
  children,
  style,
  imageStyle,
  resizeMode = 'cover',
}: BackgroundImageProps) {
  return (
    <ImageBackground
      source={source}
      resizeMode={resizeMode}
      style={[styles.root, style]}
      imageStyle={imageStyle}>
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? ({
          minHeight: '100vh',
        } as unknown as ViewStyle)
      : null),
  },
});
