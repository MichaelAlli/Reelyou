import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { BrandingAssets } from '@/constants/branding';
import { OnboardingProfileLayout } from '@/constants/onboardingProfileLayout';

interface OnboardingBrandHeaderProps {
  logoWidth: number;
}

/** Screen 2 brand lockup — same logo asset as Screen 1 with reference gold divider. */
function OnboardingBrandHeaderComponent({ logoWidth }: OnboardingBrandHeaderProps) {
  const logoHeight = logoWidth * OnboardingProfileLayout.logoAspect;

  return (
    <View style={styles.wrap}>
      <Image
        source={BrandingAssets.logoNightSignUp}
        style={{ width: logoWidth, height: logoHeight }}
        contentFit="contain"
        accessibilityLabel="REELYOU"
      />
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <View style={styles.dividerStar}>
          <SymbolView
            name={{ ios: 'sparkle', android: 'star', web: 'star' }}
            size={10}
            tintColor={OnboardingProfileLayout.goldAccent}
            weight="regular"
            style={{ width: 10, height: 10 }}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        </View>
        <View style={styles.dividerLine} />
      </View>
    </View>
  );
}

export const OnboardingBrandHeader = memo(OnboardingBrandHeaderComponent);

const layout = OnboardingProfileLayout;

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: layout.logoBottomGap,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '88%',
    marginTop: layout.logoBottomGap,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.55)',
  },
  dividerStar: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
