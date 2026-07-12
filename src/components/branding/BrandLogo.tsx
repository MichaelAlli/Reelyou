import { memo } from 'react';
import { Image, ImageStyle, useWindowDimensions } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  BrandBackgroundTone,
  BrandIconSpec,
  BrandLogoSpec,
  BrandTheme,
  BrandVariant,
  resolveBrandLogoAsset,
  resolveBrandTheme,
} from '@/constants/branding';

export interface BrandLogoProps {
  /** Target width — height scales proportionally from the approved asset. */
  width?: number;
  style?: ImageStyle;
  /** Screen background tone. `auto` follows the system color scheme. */
  theme?: BrandTheme;
  /** Logo presentation: standard UI, marketing lockup, or R icon. */
  variant?: BrandVariant;
  /** @deprecated Use `theme="dark"` for dark backgrounds. */
  backgroundTone?: BrandBackgroundTone;
  /** @deprecated Use `variant="marketing"`. */
  includeTagline?: boolean;
}

function resolveBrandLogoProps({
  theme = 'auto',
  variant = 'standard',
  backgroundTone,
  includeTagline,
}: Pick<BrandLogoProps, 'theme' | 'variant' | 'backgroundTone' | 'includeTagline'>): {
  resolvedTheme: BrandTheme;
  resolvedVariant: BrandVariant;
} {
  const resolvedVariant =
    variant !== 'standard' || includeTagline === undefined
      ? variant
      : includeTagline
        ? 'marketing'
        : 'standard';

  const resolvedTheme: BrandTheme =
    backgroundTone !== undefined
      ? backgroundTone
      : theme;

  return { resolvedTheme, resolvedVariant };
}

/**
 * Official REELYOU logo lockup.
 * Renders only approved transparent PNG assets — never redraw the brand.
 */
function BrandLogoComponent({
  width,
  style,
  theme = 'auto',
  variant = 'standard',
  backgroundTone,
  includeTagline,
}: BrandLogoProps) {
  const colorScheme = useColorScheme();
  const { width: screenWidth } = useWindowDimensions();
  const { resolvedTheme, resolvedVariant } = resolveBrandLogoProps({
    theme,
    variant,
    backgroundTone,
    includeTagline,
  });
  const backgroundTheme = resolveBrandTheme(resolvedTheme, colorScheme);
  const source = resolveBrandLogoAsset(backgroundTheme, resolvedVariant);
  const spec = resolvedVariant === 'icon' ? BrandIconSpec : BrandLogoSpec;
  const logoWidth =
    width ??
    Math.min(
      screenWidth * (resolvedVariant === 'icon' ? 0.28 : 0.82),
      spec.maxWidth,
    );
  const logoHeight = logoWidth * (spec.height / spec.width);

  return (
    <Image
      source={source}
      style={[{ width: logoWidth, height: logoHeight }, style]}
      resizeMode="contain"
      accessibilityLabel={resolvedVariant === 'icon' ? 'REELYOU icon' : 'REELYOU'}
    />
  );
}

export const BrandLogo = memo(BrandLogoComponent);

export default BrandLogo;
