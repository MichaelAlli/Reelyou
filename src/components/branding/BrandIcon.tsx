import { memo } from 'react';
import { Image, ImageStyle, useWindowDimensions } from 'react-native';

import { BrandingAssets, BrandIconSpec } from '@/constants/branding';

export interface BrandIconProps {
  /** Target width — height scales proportionally from the approved asset. */
  width?: number;
  style?: ImageStyle;
}

/**
 * Official REELYOU gold R icon.
 * Renders only src/assets/branding/reelyou-icon.png — never redraw the brand.
 */
function BrandIconComponent({ width, style }: BrandIconProps) {
  const { width: screenWidth } = useWindowDimensions();
  const iconWidth = width ?? Math.min(screenWidth * 0.28, BrandIconSpec.maxWidth);
  const iconHeight = iconWidth * (BrandIconSpec.height / BrandIconSpec.width);

  return (
    <Image
      source={BrandingAssets.icon}
      style={[{ width: iconWidth, height: iconHeight }, style]}
      resizeMode="contain"
      accessibilityLabel="REELYOU icon"
    />
  );
}

export const BrandIcon = memo(BrandIconComponent);

export default BrandIcon;
