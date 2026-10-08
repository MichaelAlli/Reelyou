import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { reelyouDisplayNameTypography } from '@/constants/displayNameTypography';
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
    <View style={styles.outer} accessibilityRole="header">
      <View style={styles.centerCluster}>
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
          <Text
            style={[styles.name, presentation.textStyle]}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.82}>
            {presentation.prefix}
            {displayName}
            {presentation.suffix}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export const SkywriteSkyOwnerHeader = memo(SkywriteSkyOwnerHeaderComponent);

const STAR_GAP = 7;

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 2,
  },
  centerCluster: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    flexShrink: 1,
    maxWidth: '94%',
    columnGap: STAR_GAP,
    gap: STAR_GAP,
  },
  pressed: { opacity: 0.88 },
  starHit: {
    flexGrow: 0,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  star: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(232, 200, 114, 0.72)',
  },
  nameHit: {
    flexGrow: 0,
    flexShrink: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  name: {
    ...reelyouDisplayNameTypography,
    fontSize: 18,
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
