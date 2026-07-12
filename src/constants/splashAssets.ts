import { BrandingAssets } from '@/constants/branding';

/**
 * Approved REELYOU splash artwork — locked beta baseline (production).
 * Do not replace or visually alter without explicit user approval.
 * Used as full-screen background (cover).
 */
export const SplashAssets = {
  approved: require('@/assets/images/splash-approved.png'),
  celestialReference: require('@/assets/images/splash-celestial-background.png'),
  brandReference: BrandingAssets.logoLightWithTagline,
} as const;
