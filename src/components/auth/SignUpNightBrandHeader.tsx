import { Image } from 'expo-image';
import { StyleSheet, type ImageStyle } from 'react-native';

import { BrandDayLogoSpec, BrandingAssets } from '@/constants/branding';

/** Splash Screen logo is square — 1254×1254 RGBA PNG. */
const LOGO_ASPECT = BrandDayLogoSpec.height / BrandDayLogoSpec.width;

interface SignUpNightBrandHeaderProps {
  width?: number;
  style?: ImageStyle;
}

/**
 * REELYOU Nighttime Sign Up v1.0 — DESIGN LOCKED
 * Approved transparent RGBA PNG logo (R gold, REEL white, YOU gold).
 * Asset: src/assets/branding/reelyou-logo-night-signup.png
 */
export function SignUpNightBrandHeader({ width, style }: SignUpNightBrandHeaderProps) {
  const logoWidth = width ?? 0;
  const logoHeight = logoWidth * LOGO_ASPECT;

  return (
    <Image
      source={BrandingAssets.logoNightSignUp}
      accessibilityLabel="REELYOU — Share. Grow. Contribute. Become."
      accessibilityRole="image"
      allowDownscaling={false}
      cachePolicy="memory-disk"
      contentFit="contain"
      priority="high"
      transition={0}
      style={[
        styles.logo,
        logoWidth > 0 && {
          width: logoWidth,
          height: logoHeight,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
});
