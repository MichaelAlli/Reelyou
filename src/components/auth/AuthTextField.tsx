import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AuthIcon } from '@/components/auth/AuthIcon';
import { SignUpDayLayout } from '@/constants/signUpDayLayout';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useAuthAppearance } from '@/hooks/use-auth-appearance';
import { useTheme, useThemedStyles } from '@/theme';

const FOCUS_DURATION = 200;

interface AuthTextFieldProps extends TextInputProps {
  icon: 'person' | 'envelope' | 'phone' | 'lock';
  error?: string;
  onToggleSecure?: () => void;
  secureVisible?: boolean;
  showSecureToggle?: boolean;
  accessibilityLabel?: string;
}

export function AuthTextField({
  icon,
  error,
  onToggleSecure,
  secureVisible,
  showSecureToggle = false,
  accessibilityLabel,
  style,
  placeholder,
  onFocus,
  onBlur,
  ...inputProps
}: AuthTextFieldProps) {
  const { tokens } = useTheme();
  const isLight = useAuthAppearance();
  const day = SignUpDayLayout;
  const [focused, setFocused] = useState(false);
  const focusProgress = useSharedValue(0);

  const styles = useThemedStyles((themeTokens) =>
    StyleSheet.create({
      fieldWrap: {
        gap: 3,
      },
      inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: error
          ? '#C24141'
          : isLight
            ? day.navyBorder
            : themeTokens.border,
        borderRadius: isLight ? day.fieldRadius : Radius.lg,
        backgroundColor: isLight ? day.fieldSurface : themeTokens.inputBackground,
        paddingHorizontal: isLight ? day.fieldHorizontalPadding : 16,
        minHeight: isLight ? day.fieldMinHeight : 50,
        gap: 8,
        ...(isLight
          ? Platform.select({
              ios: {
                shadowColor: '#0A0F2E',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.02,
                shadowRadius: 4,
              },
              android: { elevation: 1 },
              web: {
                boxShadow: '0 1px 4px rgba(8, 16, 42, 0.03)',
              } as object,
              default: {},
            })
          : null),
      },
      inputRowFocused: {
        backgroundColor: isLight ? day.fieldFocusSurface : themeTokens.inputBackground,
        ...(isLight
          ? Platform.select({
              ios: {
                shadowColor: day.goldAccent,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.14,
                shadowRadius: 5,
              },
              android: { elevation: 2 },
              web: {
                boxShadow: '0 0 0 1px rgba(221, 185, 69, 0.2), 0 1px 4px rgba(8, 16, 42, 0.05)',
                transition: 'box-shadow 200ms ease, border-color 200ms ease, background-color 200ms ease',
              } as object,
              default: {},
            })
          : null),
      },
      input: {
        flex: 1,
        fontFamily: Fonts.sans,
        fontSize: 15,
        fontWeight: '400',
        color: isLight ? day.navyText : themeTokens.inputText,
        paddingVertical: 0,
        minHeight: 20,
        textAlignVertical: 'center',
        backgroundColor: 'transparent',
        ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
        ...(Platform.OS === 'web'
          ? ({
              outlineStyle: 'none',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
            } as object)
          : null),
      },
      iconSlot: {
        width: day.fieldIconSlot,
        height: day.fieldIconSlot,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      },
      toggle: {
        width: day.fieldIconSlot,
        height: day.fieldIconSlot,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        flexShrink: 0,
      },
      errorSlot: {
        minHeight: 16,
        justifyContent: 'center',
      },
      error: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        lineHeight: 16,
        color: '#C24141',
        paddingHorizontal: Spacing.one,
      },
    }),
  );

  const animatedBorderStyle = useAnimatedStyle(() => {
    if (!isLight || error) {
      return {};
    }

    return {
      borderColor: interpolateColor(
        focusProgress.value,
        [0, 1],
        [day.navyBorder, day.goldAccent],
      ),
    };
  }, [error, isLight]);

  const handleFocus: TextInputProps['onFocus'] = (event) => {
    setFocused(true);
    if (isLight) {
      focusProgress.value = withTiming(1, { duration: FOCUS_DURATION });
    }
    onFocus?.(event);
  };

  const handleBlur: TextInputProps['onBlur'] = (event) => {
    setFocused(false);
    if (isLight) {
      focusProgress.value = withTiming(0, { duration: FOCUS_DURATION });
    }
    onBlur?.(event);
  };

  useEffect(() => {
    if (error && isLight) {
      focusProgress.value = withTiming(0, { duration: FOCUS_DURATION });
      setFocused(false);
    }
  }, [error, focusProgress, isLight]);

  const inputRow = (
    <>
      <View style={styles.iconSlot}>
        <AuthIcon name={icon} />
      </View>
      <TextInput
        {...inputProps}
        accessibilityLabel={accessibilityLabel ?? (typeof placeholder === 'string' ? placeholder : undefined)}
        placeholder={placeholder}
        style={[styles.input, style]}
        placeholderTextColor={isLight ? day.placeholderColor : tokens.placeholderText}
        secureTextEntry={showSecureToggle ? !secureVisible : inputProps.secureTextEntry}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {showSecureToggle ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={secureVisible ? 'Hide password' : 'Show password'}
          hitSlop={8}
          android_ripple={{ color: 'rgba(221, 185, 69, 0.12)' }}
          onPress={onToggleSecure}
          style={({ pressed }) => [styles.toggle, pressed && { opacity: 0.72 }]}>
          <AuthIcon name={secureVisible ? 'eye' : 'eyeSlash'} />
        </Pressable>
      ) : null}
    </>
  );

  return (
    <View style={styles.fieldWrap}>
      {isLight ? (
        <Animated.View
          style={[
            styles.inputRow,
            focused && !error && styles.inputRowFocused,
            animatedBorderStyle,
          ]}>
          {inputRow}
        </Animated.View>
      ) : (
        <View style={styles.inputRow}>{inputRow}</View>
      )}
      <View style={styles.errorSlot}>{error ? <Text style={styles.error}>{error}</Text> : null}</View>
    </View>
  );
}
