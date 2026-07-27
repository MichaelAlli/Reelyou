import { ImageSourcePropType } from 'react-native';

/**
 * Approved REELYOU brand assets — single source of truth.
 * Do not redraw, approximate, or substitute.
 */
export const BrandingAssets = {
  logoLightNoTagline: require('../assets/branding/reelyou-logo-light-no-tagline.png'),
  logoDarkNoTagline: require('../assets/branding/reelyou-logo-dark-no-tagline.png'),
  logoLightWithTagline: require('../assets/branding/reelyou-logo-light-with-tagline.png'),
  logoDarkWithTagline: require('../assets/branding/reelyou-logo-dark-with-tagline.png'),
  /** Approved transparent Welcome logo — white tagline, RGBA PNG. */
  welcomeLogoWhiteTagline: require('../assets/branding/reelyou-welcome-logo-white-tagline.png'),
  /** Welcome logo cropped to alpha bounds — removes excess transparent canvas padding. */
  welcomeLogoWhiteTaglineCropped: require('../assets/branding/reelyou-welcome-logo-white-tagline-cropped.png'),
  /** Approved transparent daytime Sign Up logo — gold lockup with tagline, RGBA PNG. */
  logoDayWithTagline: require('../assets/branding/reelyou-logo-day-with-tagline.png'),
  /** Approved transparent Splash Screen logo — RGBA PNG, true alpha (same artwork as Splash). */
  splashLogoTransparent: require('../assets/branding/Splash Screen Reelyou Logo Transparent.png'),
  /** Approved transparent Night Sign Up logo — RGBA PNG, true alpha. DESIGN LOCKED v1.0 */
  logoNightSignUp: require('../assets/branding/reelyou-logo-night-signup.png'),
  icon: require('../assets/branding/reelyou-icon.png'),
  welcomeBackground: require('../assets/backgrounds/welcome-background.jpg'),
  welcomeMaster: require('../assets/references/welcome-screen-master.jpg'),
} as const;

/** Screen background tone — dark backgrounds use light logos. */
export type BrandTheme = 'light' | 'dark' | 'auto';

/** Logo presentation — standard UI, marketing lockup, or R icon only. */
export type BrandVariant = 'standard' | 'marketing' | 'icon';

/** @deprecated Use BrandTheme */
export type BrandBackgroundTone = 'light' | 'dark';

export const BrandLogoSpec = {
  width: 1024,
  height: 682,
  maxWidth: 340,
} as const;

export const BrandIconSpec = {
  width: 1024,
  height: 1024,
  maxWidth: 120,
} as const;

/** Native dimensions of logoDayWithTagline — verified RGBA PNG. */
export const BrandDayLogoSpec = {
  width: 1254,
  height: 1254,
} as const;

export function resolveBrandTheme(
  theme: BrandTheme,
  colorScheme: 'light' | 'dark' | null | undefined,
): 'light' | 'dark' {
  if (theme !== 'auto') {
    return theme;
  }

  return colorScheme === 'light' ? 'light' : 'dark';
}

export function resolveBrandLogoAsset(
  theme: 'light' | 'dark',
  variant: BrandVariant,
): ImageSourcePropType {
  if (variant === 'icon') {
    return BrandingAssets.icon;
  }

  const withTagline = variant === 'marketing';

  if (theme === 'dark') {
    return withTagline
      ? BrandingAssets.logoLightWithTagline
      : BrandingAssets.logoLightNoTagline;
  }

  return withTagline
    ? BrandingAssets.logoDarkWithTagline
    : BrandingAssets.logoDarkNoTagline;
}
