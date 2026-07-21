import { Image } from 'expo-image';
import { Platform, StyleSheet, View, type ImageStyle } from 'react-native';

import { BrandDayLogoSpec, BrandingAssets } from '@/constants/branding';
import { SignUpDayLayout, signUpDayLogoReadabilityStyle } from '@/constants/signUpDayLayout';

const LOGO_ASPECT = BrandDayLogoSpec.height / BrandDayLogoSpec.width;

interface SignUpDayBrandHeaderProps {
  width?: number;
  style?: ImageStyle;
}

/**
 * Daytime Sign Up branding — permanent transparent gold lockup with tagline (RGBA PNG).
 * Renders alpha directly over the scenic background (no baked rectangle).
 */
export function SignUpDayBrandHeader({ width = SignUpDayLayout.logoWidthMax, style }: SignUpDayBrandHeaderProps) {
  const logoHeight = width * LOGO_ASPECT;
  const logoLift = signUpDayLogoReadabilityStyle();

  return (
    <View style={styles.wrap}>
      {Platform.OS === 'android' ? (
        <View pointerEvents="none" style={[styles.taglineContrast, { width }]} />
      ) : null}
      <Image
        source={BrandingAssets.logoDayWithTagline}
        accessibilityLabel="REELYOU — Share. Grow. Contribute. Become."
        accessibilityRole="image"
        allowDownscaling={false}
        cachePolicy="memory-disk"
        contentFit="contain"
        priority="high"
        transition={0}
        style={[
          styles.logo,
          logoLift,
          {
            width,
            height: logoHeight,
          },
          style,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  logo: {
    backgroundColor: 'transparent',
  },
  taglineContrast: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '32%',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 999,
  },
});
