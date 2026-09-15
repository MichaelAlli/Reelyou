import { memo } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { BrandingAssets } from '@/constants/branding';
import { HomeLayout } from '@/constants/homeLayout';

/** Native aspect of reelyou-welcome-logo-white-tagline-cropped.png (1116 × 594 RGBA PNG). */
const TRANSPARENT_WORDMARK_ASPECT = 594 / 1116;

/** Fit approved transparent wordmark inside the header box — contain, no clip. */
function measureLogoSize(boxWidth: number, boxHeight: number): { width: number; height: number } {
  let width = boxWidth;
  let height = width * TRANSPARENT_WORDMARK_ASPECT;
  if (height > boxHeight) {
    height = boxHeight;
    width = height / TRANSPARENT_WORDMARK_ASPECT;
  }
  return { width, height };
}

function HomeHeaderLogoComponent() {
  const { width: logoWidth, height: logoHeight } = measureLogoSize(
    HomeLayout.logoWidth,
    HomeLayout.logoHeight,
  );

  return (
    <View style={styles.box}>
      <Image
        source={BrandingAssets.homeHeaderWordmark}
        style={{ width: logoWidth, height: logoHeight, backgroundColor: 'transparent' }}
        resizeMode="contain"
        accessibilityLabel="REELYOU"
      />
    </View>
  );
}

export const HomeHeaderLogo = memo(HomeHeaderLogoComponent);

const styles = StyleSheet.create({
  box: {
    width: HomeLayout.logoWidth,
    height: HomeLayout.logoHeight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
