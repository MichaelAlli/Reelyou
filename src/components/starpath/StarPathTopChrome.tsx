import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeHeaderLogo } from '@/components/home/HomeHeaderLogo';
import {
  StarPathSpacing,
  StarPathTypography,
  starpathGlassControl,
} from '@/components/starpath/starpathGlass';
import { Fonts } from '@/constants/theme';

function StarPathTopChromeComponent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, 8);

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={[styles.logoAxis, { top: topPad }]} pointerEvents="none">
        <HomeHeaderLogo />
      </View>

      <View style={styles.controlsRow}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={({ pressed }) => [
            starpathGlassControl.base,
            pressed && starpathGlassControl.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          testID="starpath-back"
        >
          <Text style={styles.backGlyph}>←</Text>
        </Pressable>

        <View style={styles.rightCluster}>
          <Pressable
            hitSlop={8}
            style={({ pressed }) => [
              starpathGlassControl.base,
              pressed && starpathGlassControl.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Community"
            testID="starpath-community-control"
          >
            <Text style={styles.iconGlyph}>⚭</Text>
          </Pressable>
          <Pressable
            hitSlop={8}
            style={({ pressed }) => [
              starpathGlassControl.base,
              pressed && starpathGlassControl.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Favorites"
            testID="starpath-favorite-control"
          >
            <Text style={styles.iconGlyph}>★</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export const StarPathTopChrome = memo(StarPathTopChromeComponent);
export const StarPathBrandHeader = StarPathTopChrome;

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    paddingBottom: StarPathSpacing.headerBottom,
  },
  logoAxis: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 0,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: StarPathSpacing.screenEdgeWide,
    zIndex: 1,
  },
  rightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: StarPathSpacing.controlGap,
  },
  backGlyph: {
    fontFamily: Fonts.sans,
    fontSize: 20,
    lineHeight: 22,
    color: StarPathTypography.warmSoft,
    marginTop: -1,
  },
  iconGlyph: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 18,
    color: StarPathTypography.warmSoft,
    fontWeight: '600',
  },
});
