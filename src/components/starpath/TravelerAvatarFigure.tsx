import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { getAvatarPreset } from '@/identity/avatarPresets';
import type { UserAvatarIdentity } from '@/identity/userAvatarTypes';

interface TravelerAvatarFigureProps {
  identity: UserAvatarIdentity;
  size?: number;
}

function TravelerAvatarFigureComponent({ identity, size = 84 }: TravelerAvatarFigureProps) {
  const h = Math.round(size * (112 / 84));
  const w = size;

  if (identity.avatarSourceType === 'profilePhoto' && identity.profilePhotoUri) {
    return (
      <View style={[styles.clip, { width: w, height: h, borderRadius: w / 2 }]}>
        <Image source={{ uri: identity.profilePhotoUri }} style={styles.photo} contentFit="cover" />
      </View>
    );
  }

  if (identity.avatarSourceType === 'presetAvatar' && identity.avatarAssetId) {
    const preset = getAvatarPreset(identity.avatarAssetId);
    if (preset) {
      return (
        <Svg width={w} height={h} viewBox="0 0 72 96">
          <Defs>
            <LinearGradient id="presetBody" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={preset.gradientTop} />
              <Stop offset="100%" stopColor={preset.gradientBottom} />
            </LinearGradient>
          </Defs>
          <Path
            d="M 36 6 C 43 6 48 13 48 20 C 48 27 45 31 41 33 L 45 39 C 49 46 51 54 49 62 L 47 80 C 46 86 43 90 36 90 C 29 90 26 86 25 80 L 23 62 C 21 54 23 46 27 39 L 31 33 C 27 31 24 27 24 20 C 24 13 29 6 36 6 Z"
            fill="url(#presetBody)"
            stroke={preset.accent}
            strokeWidth={0.6}
            opacity={0.95}
          />
          <Circle cx={36} cy={22} r={4} fill={preset.accent} opacity={0.85} />
        </Svg>
      );
    }
  }

  if (identity.avatarSourceType === 'customAvatar' && identity.customAvatarConfig) {
    const c = identity.customAvatarConfig;
    return (
      <Svg width={w} height={h} viewBox="0 0 72 96">
        <Path
          d="M 36 6 C 43 6 48 13 48 20 C 48 27 45 31 41 33 L 45 39 C 49 46 51 54 49 62 L 47 80 C 46 86 43 90 36 90 C 29 90 26 86 25 80 L 23 62 C 21 54 23 46 27 39 L 31 33 C 27 31 24 27 24 20 C 24 13 29 6 36 6 Z"
          fill={c.clothingColor}
        />
        <Circle cx={36} cy={20} r={11} fill={c.skinTone} />
        <Path
          d="M 26 18 Q 36 8 46 18 Q 40 12 36 12 Q 32 12 26 18"
          fill={c.hairColor}
          opacity={0.9}
        />
        {c.accessory === 'star-pin' ? (
          <Circle cx={42} cy={38} r={2.5} fill="#FFE8A8" />
        ) : null}
      </Svg>
    );
  }

  return (
    <Svg width={w} height={h} viewBox="0 0 72 96">
      <Defs>
        <LinearGradient id="figureRim" x1="50%" y1="22%" x2="50%" y2="100%">
          <Stop offset="0%" stopColor="rgba(255, 220, 160, 0.5)" />
          <Stop offset="55%" stopColor="rgba(40, 36, 52, 0.96)" />
          <Stop offset="100%" stopColor="rgba(12, 14, 28, 0.98)" />
        </LinearGradient>
      </Defs>
      <Path
        d="M 36 6 C 43 6 48 13 48 20 C 48 27 45 31 41 33 L 45 39 C 49 46 51 54 49 62 L 47 80 C 46 86 43 90 36 90 C 29 90 26 86 25 80 L 23 62 C 21 54 23 46 27 39 L 31 33 C 27 31 24 27 24 20 C 24 13 29 6 36 6 Z"
        fill="url(#figureRim)"
        stroke="rgba(255, 220, 160, 0.22)"
        strokeWidth={0.6}
      />
    </Svg>
  );
}

export const TravelerAvatarFigure = memo(TravelerAvatarFigureComponent);

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(232, 200, 114, 0.45)',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
});
