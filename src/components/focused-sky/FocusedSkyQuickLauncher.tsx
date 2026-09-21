import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts, Radius } from '@/constants/theme';

interface FocusedSkyQuickLauncherProps {
  onPress: () => void;
}

function FocusedSkyQuickLauncherComponent({ onPress }: FocusedSkyQuickLauncherProps) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Write your sky"
        onPress={onPress}
        style={({ pressed }) => [styles.glass, pressed && styles.pressed]}>
        <Text style={styles.placeholder}>Write your sky…</Text>
      </Pressable>
    </View>
  );
}

export const FocusedSkyQuickLauncher = memo(FocusedSkyQuickLauncherComponent);

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  glass: {
    width: '100%',
    maxWidth: 340,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.32)',
    backgroundColor: 'rgba(8, 10, 22, 0.28)',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  pressed: {
    opacity: 0.88,
  },
  placeholder: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: 'rgba(245, 240, 255, 0.82)',
    textAlign: 'center',
  },
});
