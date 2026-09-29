import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts, Radius } from '@/constants/theme';
import type { SkyHeaderStyleId } from '@/profile/skyHeaderStyleTypes';
import { skyHeaderStylePresentation } from '@/profile/skyHeaderStylePresentation';

interface SkywriteSkyOwnerHeaderProps {
  displayName: string;
  headerStyleId?: SkyHeaderStyleId;
  onPressProfile: () => void;
  reduceMotion?: boolean;
}

function SkywriteSkyOwnerHeaderComponent({
  displayName,
  headerStyleId = 'starlight',
  onPressProfile,
  reduceMotion = false,
}: SkywriteSkyOwnerHeaderProps) {
  const presentation = skyHeaderStylePresentation(headerStyleId, reduceMotion);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${displayName}'s profile`}
      onPress={onPressProfile}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      <View style={[styles.badge, presentation.containerStyle]}>
        {presentation.showConstellation ? (
          <Text style={styles.constellation} accessibilityElementsHidden>
            ✦ · ✧ · ✦
          </Text>
        ) : null}
        <Text style={[styles.name, presentation.textStyle]} numberOfLines={2}>
          {presentation.prefix}
          {displayName}
          {presentation.suffix}
        </Text>
      </View>
    </Pressable>
  );
}

export const SkywriteSkyOwnerHeader = memo(SkywriteSkyOwnerHeaderComponent);

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    maxWidth: '100%',
    marginBottom: 8,
  },
  pressed: { opacity: 0.92 },
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  name: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  constellation: {
    fontFamily: Fonts.sans,
    fontSize: 9,
    letterSpacing: 2,
    color: 'rgba(232, 200, 114, 0.55)',
    marginBottom: 2,
  },
});
