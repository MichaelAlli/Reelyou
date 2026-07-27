import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { OnboardingProfileLayout } from '@/constants/onboardingProfileLayout';
import { Fonts } from '@/constants/theme';

interface OnboardingPurposeCalloutProps {
  message: string;
}

function OnboardingPurposeCalloutComponent({ message }: OnboardingPurposeCalloutProps) {
  return (
    <View accessibilityRole="text" style={styles.wrap}>
      <View style={styles.iconWrap}>
        <SymbolView
          name={{ ios: 'sparkle', android: 'auto_awesome', web: 'auto_awesome' }}
          size={14}
          tintColor={OnboardingProfileLayout.goldAccent}
          weight="regular"
          style={{ width: 14, height: 14 }}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

export const OnboardingPurposeCallout = memo(OnboardingPurposeCalloutComponent);

const layout = OnboardingProfileLayout;

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.55)',
    backgroundColor: layout.chipSurface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: layout.sectionGap,
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: layout.goldAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  message: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: layout.hintSize,
    lineHeight: 18,
    fontWeight: '400',
    color: layout.subtitleColor,
  },
});
