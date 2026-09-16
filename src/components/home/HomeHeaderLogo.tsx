import { memo, useMemo } from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';

import { BrandingAssets } from '@/constants/branding';
import { HomeLayout, measureHomeContentWidth } from '@/constants/homeLayout';

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
  const { width: screenWidth } = useWindowDimensions();

  const { boxWidth, boxHeight, logoWidth, logoHeight } = useMemo(() => {
    const slot = HomeLayout.iconCircleSm;
    const availableLogoWidth = Math.max(
      120,
      measureHomeContentWidth(screenWidth) - slot * 2 - 20,
    );
    const width = Math.min(HomeLayout.logoWidth, availableLogoWidth);
    const height = HomeLayout.logoHeight;
    const sized = measureLogoSize(width, height);
    return {
      boxWidth: width,
      boxHeight: height,
      logoWidth: sized.width,
      logoHeight: sized.height,
    };
  }, [screenWidth]);

  return (
    <View style={[styles.box, { width: boxWidth, height: boxHeight }]}>
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
