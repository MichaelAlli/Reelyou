import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandLogo } from '@/components/branding/BrandLogo';
import { BrandingAssets } from '@/constants/branding';

/**
 * Light Ripple screens — verified RGBA day lockup (dark-no-tagline asset is not PNG in repo).
 * True transparent background; no chrome box behind wordmark.
 */
function RippleHeaderLogoComponent() {
  return (
    <View style={styles.wrap}>
      <BrandLogo
        theme="light"
        width={108}
        source={BrandingAssets.logoDayWithTagline}
        style={styles.logo}
      />
    </View>
  );
}

export const RippleHeaderLogo = memo(RippleHeaderLogoComponent);

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    backgroundColor: 'transparent',
  },
});
