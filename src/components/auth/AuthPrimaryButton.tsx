import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AuthIcon } from '@/components/auth/AuthIcon';
import { SignUpDayLayout } from '@/constants/signUpDayLayout';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useAuthAppearance } from '@/hooks/use-auth-appearance';
import { useThemedStyles } from '@/theme';

const PRESS_DURATION = 175;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AuthPrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function AuthPrimaryButton({ label, onPress, disabled = false, loading = false }: AuthPrimaryButtonProps) {
  const isLight = useAuthAppearance();
  const day = SignUpDayLayout;
  const pressScale = useSharedValue(1);

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      pressable: {
        borderRadius: Radius.full,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: isLight ? 'rgba(8, 16, 42, 0.48)' : tokens.gold,
        opacity: disabled || loading ? 0.52 : 1,
        ...(isLight
          ? Platform.select({
              ios: {
                shadowColor: day.goldShadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
              },
              android: { elevation: 2 },
              web: { boxShadow: '0 2px 5px rgba(184, 148, 31, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.34)' } as object,
              default: {},
            })
          : null),
      },
      inner: {
        minHeight: isLight ? day.buttonMinHeight : 52,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      },
      labelWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 18,
      },
      label: {
        fontFamily: Fonts.sans,
        fontSize: 12.5,
        fontWeight: '600',
        letterSpacing: 1.45,
        textAlign: 'center',
        color: isLight ? day.navyText : tokens.appBackground,
        ...(Platform.OS === 'web'
          ? ({
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
            } as object)
          : null),
      },
      arrowWrap: {
        position: 'absolute',
        right: 20,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        width: day.fieldIconSlot,
      },
      nightGradient: {
        minHeight: 52,
        paddingHorizontal: Spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      nightLabel: {
        flex: 1,
        fontFamily: Fonts.sans,
        fontSize: 12.5,
        fontWeight: '700',
        letterSpacing: 1.8,
        textAlign: 'center',
        color: tokens.appBackground,
      },
      arrowNight: {
        fontSize: 17,
        fontWeight: '700',
        color: tokens.appBackground,
        marginLeft: Spacing.sm,
      },
    }),
  );

  const animatedPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const labelColor = isLight ? day.navyText : '#050818';
  const dayGradient = ['#F6DC92', '#F0D078', '#DDB945', '#A67C00'] as const;
  const dayGradientLocations = [0, 0.14, 0.5, 1] as const;

  const handlePressIn = () => {
    if (disabled || loading || !isLight) {
      return;
    }
    pressScale.value = withTiming(0.98, { duration: PRESS_DURATION });
  };

  const handlePressOut = () => {
    if (!isLight) {
      return;
    }
    pressScale.value = withTiming(1, { duration: PRESS_DURATION });
  };

  if (isLight) {
    return (
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
        disabled={disabled || loading}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.pressable, animatedPressStyle]}>
        <LinearGradient
          colors={[...dayGradient]}
          locations={[...dayGradientLocations]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.inner}>
          {loading ? (
            <View style={styles.labelWrap}>
              <ActivityIndicator color={labelColor} />
            </View>
          ) : (
            <>
              <View style={styles.labelWrap}>
                <Text style={styles.label}>{label}</Text>
              </View>
              <View style={styles.arrowWrap}>
                <AuthIcon name="arrowRight" size={15} color={day.navyText} />
              </View>
            </>
          )}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  const gradientColors = ['#F5D76E', '#D4AF37', '#B8941F'] as const;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && !disabled && { opacity: 0.88 }]}>
      <LinearGradient colors={[...gradientColors]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.nightGradient}>
        {loading ? (
          <ActivityIndicator color={labelColor} style={{ flex: 1 }} />
        ) : (
          <>
            <Text style={styles.nightLabel}>{label}</Text>
            <Text style={styles.arrowNight}>→</Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}
