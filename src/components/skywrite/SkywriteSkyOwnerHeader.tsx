import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import type { SkyHeaderStyleId } from '@/profile/skyHeaderStyleTypes';
import { skyHeaderStylePresentation } from '@/profile/skyHeaderStylePresentation';

interface SkywriteSkyOwnerHeaderProps {
  displayName: string;
  headerStyleId?: SkyHeaderStyleId;
  onPressProfile: () => void;
  onPressIdentityStar?: () => void;
  reduceMotion?: boolean;
}

function SkywriteSkyOwnerHeaderComponent({
  displayName,
  headerStyleId = 'starlight',
  onPressProfile,
  onPressIdentityStar,
  reduceMotion = false,
}: SkywriteSkyOwnerHeaderProps) {
  const presentation = skyHeaderStylePresentation(headerStyleId, reduceMotion);
  const starPress = onPressIdentityStar ?? onPressProfile;

  return (
    <View style={styles.row} accessibilityRole="header">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${displayName}'s profile star`}
        onPress={starPress}
        hitSlop={8}
        style={({ pressed }) => [styles.starHit, pressed && styles.pressed]}>
        <Text style={[styles.star, presentation.textStyle]} accessibilityElementsHidden>
          ✦
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${displayName}'s profile`}
        onPress={onPressProfile}
        style={({ pressed }) => [styles.nameHit, pressed && styles.pressed]}>
        {presentation.showConstellation && !reduceMotion ? (
          <Text style={styles.constellation} accessibilityElementsHidden>
            ✧ · ✧
          </Text>
        ) : null}
        <Text style={[styles.name, presentation.textStyle]} numberOfLines={2} adjustsFontSizeToFit>
          {presentation.prefix}
          {displayName}
          {presentation.suffix}
        </Text>
      </Pressable>
    </View>
  );
}

export const SkywriteSkyOwnerHeader = memo(SkywriteSkyOwnerHeaderComponent);

const styles = StyleSheet.create({
  row: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    maxWidth: '100%',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  pressed: { opacity: 0.88 },
  starHit: {
    minWidth: 28,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: 'rgba(232, 200, 114, 0.72)',
  },
  nameHit: {
    flexShrink: 1,
    alignItems: 'center',
    maxWidth: '88%',
  },
  name: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  constellation: {
    fontFamily: Fonts.sans,
    fontSize: 8,
    letterSpacing: 3,
    color: 'rgba(232, 200, 114, 0.45)',
    marginBottom: 2,
  },
});
