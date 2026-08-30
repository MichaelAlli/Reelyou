import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { BrandDayLogoSpec, BrandingAssets } from '@/constants/branding';

interface ProcessStarPathBrandProps {
  logoWidth: number;
}

function ProcessStarPathBrandComponent({ logoWidth }: ProcessStarPathBrandProps) {
  const logoHeight = logoWidth * (BrandDayLogoSpec.height / BrandDayLogoSpec.width);

  return (
    <View style={styles.wrap}>
      <Image
        source={BrandingAssets.logoNightSignUp}
        style={{ width: logoWidth, height: logoHeight }}
        contentFit="contain"
        allowDownscaling={false}
        cachePolicy="memory-disk"
        transition={0}
        accessibilityLabel="REELYOU"
        accessibilityRole="image"
      />
      <View style={styles.rule}>
        <LinearGradient
          colors={['transparent', 'rgba(232, 200, 114, 0.58)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.ruleLine}
        />
        <View style={styles.ruleStar} />
        <LinearGradient
          colors={['transparent', 'rgba(232, 200, 114, 0.58)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.ruleLine}
        />
      </View>
    </View>
  );
}

export const ProcessStarPathBrand = memo(ProcessStarPathBrandComponent);

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 14 },
  rule: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '64%', maxWidth: 228 },
  ruleLine: { flex: 1, height: StyleSheet.hairlineWidth },
  ruleStar: {
    width: 5,
    height: 5,
    borderRadius: 1,
    backgroundColor: '#E8C872',
    transform: [{ rotate: '45deg' }],
  },
});
