import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { AuthSocialMark } from '@/components/auth/AuthSocialMark';
import { AuthSocialLabels, type AuthSocialProvider } from '@/constants/auth';
import { SignUpDayLayout } from '@/constants/signUpDayLayout';
import { SignUpNightLayout } from '@/constants/signUpNightLayout';
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
  const night = SignUpNightLayout;

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      button: {
        width: night.socialSize,
        height: night.socialSize,
        borderRadius: night.socialSize / 2,
        borderWidth: night.socialBorderWidth,
        borderColor: tokens.border,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        alignItems: 'center',
        justifyContent: 'center',
        ...(Platform.select({
          ios: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
          },
          android: { elevation: 1 },
          web: { boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)' } as object,
          default: {},
        }) ?? {}),
      },
      markWrap: {
        width: night.fieldIconSlot,
        height: night.fieldIconSlot,
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
