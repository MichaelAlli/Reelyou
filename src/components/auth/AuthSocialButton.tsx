import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthSocialMark } from '@/components/auth/AuthSocialMark';
import { AuthSocialLabels, type AuthSocialProvider } from '@/constants/auth';
import { SignUpDayLayout } from '@/constants/signUpDayLayout';
import { Fonts } from '@/constants/theme';
import { useAuthAppearance } from '@/hooks/use-auth-appearance';
import { useTheme, useThemedStyles } from '@/theme';

interface AuthSocialButtonProps {
  provider: AuthSocialProvider;
  onPress?: () => void;
}

export function AuthSocialButton({ provider, onPress }: AuthSocialButtonProps) {
  const isLight = useAuthAppearance();

  if (isLight) {
    return <DayAuthSocialButton provider={provider} onPress={onPress} />;
  }

  return <NightAuthSocialButton provider={provider} onPress={onPress} />;
}

function DayAuthSocialButton({ provider, onPress }: AuthSocialButtonProps) {
  const day = SignUpDayLayout;

  const styles = useThemedStyles(() =>
    StyleSheet.create({
      button: {
        width: day.socialSize,
        height: day.socialSize,
        borderRadius: day.socialSize / 2,
        borderWidth: day.socialBorderWidth,
        borderColor: 'rgba(8, 16, 42, 0.11)',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        ...(Platform.select({
          ios: {
            shadowColor: '#0A0F2E',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.035,
            shadowRadius: 3,
          },
          android: { elevation: 1 },
          web: { boxShadow: '0 1px 3px rgba(8, 16, 42, 0.04)' } as object,
          default: {},
        }) ?? {}),
      },
      markWrap: {
        width: day.fieldIconSlot,
        height: day.fieldIconSlot,
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Sign up with ${AuthSocialLabels[provider]}`}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.88, transform: [{ scale: 0.96 }] }]}>
      <View style={styles.markWrap}>
        <AuthSocialMark provider={provider} />
      </View>
    </Pressable>
  );
}

function NightAuthSocialButton({ provider, onPress }: AuthSocialButtonProps) {
  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      button: {
        width: 50,
        height: 50,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: tokens.border,
        backgroundColor: tokens.surface,
        alignItems: 'center',
        justifyContent: 'center',
      },
      google: {
        fontFamily: Fonts.sans,
        fontSize: 20,
        fontWeight: '700',
        color: '#4285F4',
      },
      apple: {
        fontFamily: Fonts.sans,
        fontSize: 22,
        color: tokens.primaryText,
      },
      facebook: {
        fontFamily: Fonts.sans,
        fontSize: 22,
        fontWeight: '700',
        color: '#1877F2',
      },
    }),
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Sign up with ${AuthSocialLabels[provider]}`}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] }]}>
      {provider === 'google' ? <Text style={styles.google}>G</Text> : null}
      {provider === 'apple' ? <Text style={styles.apple}></Text> : null}
      {provider === 'facebook' ? <Text style={styles.facebook}>f</Text> : null}
    </Pressable>
  );
}
