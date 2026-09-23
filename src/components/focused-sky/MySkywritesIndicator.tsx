import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MySkywritesCopy } from '@/constants/mySkywritesCopy';
import { Fonts, Radius } from '@/constants/theme';

interface MySkywritesIndicatorProps {
  onPress: () => void;
}

function MySkywritesIndicatorComponent({ onPress }: MySkywritesIndicatorProps) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={MySkywritesCopy.indicatorA11y}
        onPress={onPress}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.icon}>☰</Text>
        <Text style={styles.starMark}>✦</Text>
      </Pressable>
    </View>
  );
}

export const MySkywritesIndicator = memo(MySkywritesIndicatorComponent);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.32)',
    backgroundColor: 'rgba(8, 10, 24, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.88 },
  icon: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: 'rgba(235, 228, 248, 0.82)',
    marginTop: -2,
  },
  starMark: {
    position: 'absolute',
    bottom: 7,
    right: 9,
    fontSize: 8,
    color: 'rgba(232, 200, 114, 0.75)',
  },
});
