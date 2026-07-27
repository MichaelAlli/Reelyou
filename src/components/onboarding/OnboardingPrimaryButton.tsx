import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { OnboardingProfileLayout } from '@/constants/onboardingProfileLayout';
import { Fonts } from '@/constants/theme';

interface OnboardingPrimaryButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

function OnboardingPrimaryButtonComponent({
  label,
  onPress,
  disabled = false,
  loading = false,
  style,
}: OnboardingPrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={label}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}>
      <LinearGradient
        colors={[OnboardingProfileLayout.goldHighlight, OnboardingProfileLayout.goldAccent, OnboardingProfileLayout.goldShadow]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradient}>
        {loading ? (
          <ActivityIndicator color="#050818" />
        ) : (
          <>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.arrow}>→</Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

export const OnboardingPrimaryButton = memo(OnboardingPrimaryButtonComponent);

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
    borderRadius: 999,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.96,
  },
  disabled: {
    opacity: 0.45,
  },
  gradient: {
    minHeight: 52,
    borderRadius: 999,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#050818',
    textAlign: 'center',
  },
  arrow: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    fontWeight: '700',
    color: '#050818',
    position: 'absolute',
    right: 24,
  },
});
