import { useEffect, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AuthIcon } from '@/components/auth/AuthIcon';
import { SignUpDayLayout, signUpDayTextReadabilityShadow } from '@/constants/signUpDayLayout';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useAuthAppearance } from '@/hooks/use-auth-appearance';
import { useTheme, useThemedStyles } from '@/theme';

const CHECK_DURATION = 200;

interface AuthCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  error?: string;
  children: ReactNode;
}

export function AuthCheckbox({ checked, onToggle, error, children }: AuthCheckboxProps) {
  const { tokens } = useTheme();
  const isLight = useAuthAppearance();
  const day = SignUpDayLayout;
  const textLift = signUpDayTextReadabilityShadow();
  const checkProgress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    checkProgress.value = withTiming(checked ? 1 : 0, { duration: CHECK_DURATION });
  }, [checked, checkProgress]);

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkProgress.value,
    transform: [{ scale: 0.82 + checkProgress.value * 0.18 }],
  }));

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 11,
        paddingVertical: isLight ? 1 : 0,
      },
      box: {
        width: 20,
        height: 20,
        borderRadius: Radius.sm,
        borderWidth: 1.5,
        borderColor: error ? '#C24141' : isLight ? day.goldAccent : tokens.gold,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
        flexShrink: 0,
        backgroundColor: checked ? (isLight ? day.goldAccent : tokens.primaryAction) : 'transparent',
      },
      check: {
        color: isLight ? day.navyText : tokens.appBackground,
        fontSize: 11,
        fontWeight: '700',
        lineHeight: 12,
      },
      label: {
        flex: 1,
        fontFamily: Fonts.sans,
        fontSize: 13,
        lineHeight: 19,
        letterSpacing: 0.02,
        color: isLight ? day.legalTextColor : tokens.primaryText,
        paddingTop: 1,
        ...textLift,
        ...(Platform.OS === 'web'
          ? ({ WebkitFontSmoothing: 'antialiased' } as object)
          : null),
      },
      errorSlot: {
        minHeight: 16,
        marginTop: Spacing.two,
        paddingLeft: 30,
        justifyContent: 'center',
      },
      error: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        lineHeight: 16,
        color: '#C24141',
      },
    }),
  );

  return (
    <View>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        hitSlop={4}
        onPress={onToggle}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.88 }]}>
        <View style={styles.box}>
          {isLight ? (
            <Animated.View style={checkStyle}>
              <AuthIcon name="checkmark" size={12} color={day.navyText} />
            </Animated.View>
          ) : checked ? (
            <Text style={styles.check}>✓</Text>
          ) : null}
        </View>
        <Text style={styles.label}>{children}</Text>
      </Pressable>
      <View style={styles.errorSlot}>{error ? <Text style={styles.error}>{error}</Text> : null}</View>
    </View>
  );
}
