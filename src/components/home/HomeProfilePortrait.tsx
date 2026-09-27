import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { StyleSheet, View, type ImageSourcePropType } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';

import { UserAvatarCircularImage } from '@/components/identity/UserAvatarCircularImage';

interface HomeProfilePortraitProps {
  size: number;
  /** When a real portrait asset exists, pass it here — ring/crop treatment stays the same. */
  source?: ImageSourcePropType;
  recyclingKey?: string | number;
}

/** Premium portrait placeholder — sunset silhouette until a real photo is wired in. */
function HomeProfilePortraitPlaceholder({ size }: { size: number }) {
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <LinearGradient
        colors={['#120A1E', '#3D2858', '#9A4828', '#D87840', '#F0A050']}
        locations={[0, 0.32, 0.58, 0.8, 1]}
        start={{ x: 0.15, y: 0.05 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Svg width={size} height={size} viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgGradient id="silGrad" x1="0.2" y1="0" x2="0.8" y2="1">
            <Stop offset="0%" stopColor="#0A0612" stopOpacity={0.94} />
            <Stop offset="100%" stopColor="#181028" stopOpacity={0.82} />
          </SvgGradient>
        </Defs>
        <Path
          d="M64 26 C58 19 48 18 42 23 C36 28 34 37 36 45 C32 50 28 58 26 70 L76 70 C74 55 69 44 64 36 C66 32 66 29 64 26 Z"
          fill="url(#silGrad)"
        />
        <Ellipse cx={46} cy={30} rx={7.5} ry={9.5} fill="#0A0612" opacity={0.96} />
        <Path d="M18 74 Q50 63 82 74 L82 100 L18 100 Z" fill="rgba(6,4,12,0.5)" />
      </Svg>
      <LinearGradient
        colors={['rgba(255,190,110,0.14)', 'transparent', 'rgba(0,0,0,0.32)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

function resolvePortraitUri(source: ImageSourcePropType): string | null {
  if (typeof source === 'object' && source !== null && 'uri' in source) {
    const uri = source.uri;
    return typeof uri === 'string' && uri.length > 0 ? uri : null;
  }
  return null;
}

function HomeProfilePortraitComponent({ size, source, recyclingKey }: HomeProfilePortraitProps) {
  const uri = source ? resolvePortraitUri(source) : null;
  if (uri) {
    return (
      <UserAvatarCircularImage
        uri={uri}
        size={size}
        recyclingKey={recyclingKey}
        accessibilityLabel="Your profile picture"
        fallback={<HomeProfilePortraitPlaceholder size={size} />}
      />
    );
  }

  if (source) {
    return <HomeProfilePortraitPlaceholder size={size} />;
  }

  return <HomeProfilePortraitPlaceholder size={size} />;
}

export const HomeProfilePortrait = memo(HomeProfilePortraitComponent);

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
});
