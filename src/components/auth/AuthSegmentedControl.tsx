import { useEffect } from 'react';
import { LayoutChangeEvent, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AuthCopy } from '@/constants/auth';
import { SignUpDayLayout } from '@/constants/signUpDayLayout';
import { Fonts, Radius } from '@/constants/theme';
import { useAuthAppearance } from '@/hooks/use-auth-appearance';
import { useTheme, useThemedStyles } from '@/theme';

export type AuthTab = 'logIn' | 'signUp';

interface AuthSegmentedControlProps {
  selected: AuthTab;
  onLogInPress?: () => void;
  onSignUpPress?: () => void;
}

export function AuthSegmentedControl({
  selected,
  onLogInPress,
  onSignUpPress,
}: AuthSegmentedControlProps) {
  const isLight = useAuthAppearance();

  if (isLight) {
    return (
      <DaySegmentedControl selected={selected} onLogInPress={onLogInPress} onSignUpPress={onSignUpPress} />
    );
  }

  return (
    <NightSegmentedControl selected={selected} onLogInPress={onLogInPress} onSignUpPress={onSignUpPress} />
  );
}

function DaySegmentedControl({ selected, onLogInPress, onSignUpPress }: AuthSegmentedControlProps) {
  const day = SignUpDayLayout;
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const SEGMENT_DURATION = 300;

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      container: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: day.navyBorder,
        borderRadius: Radius.full,
        padding: 3,
        backgroundColor: '#FFFFFF',
        minHeight: 44,
        position: 'relative',
        ...(Platform.select({
          ios: {
            shadowColor: '#0A0F2E',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 2,
          },
          android: { elevation: 1 },
          web: { boxShadow: '0 1px 3px rgba(10, 15, 46, 0.06)' } as object,
          default: {},
        }) ?? {}),
      },
      segment: {
        flex: 1,
        borderRadius: Radius.full,
        paddingVertical: 9,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
      },
      label: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.1,
        color: day.navyText,
      },
      labelSelected: {
        color: day.navyText,
      },
      indicator: {
        position: 'absolute',
        top: 3,
        bottom: 3,
        borderRadius: Radius.full,
        overflow: 'hidden',
        ...(Platform.select({
          ios: {
            shadowColor: day.goldShadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.22,
            shadowRadius: 2,
          },
          android: { elevation: 1 },
          default: {},
        }) ?? {}),
      },
    }),
  );

  const indicatorStyle = useAnimatedStyle(() => ({
    left: indicatorX.value,
    width: indicatorWidth.value,
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    const segmentWidth = (width - 6) / 2;
    indicatorWidth.value = segmentWidth;
    indicatorX.value = withTiming(selected === 'signUp' ? segmentWidth + 3 : 3, {
      duration: SEGMENT_DURATION,
    });
  };

  useEffect(() => {
    if (indicatorWidth.value > 0) {
      indicatorX.value = withTiming(selected === 'signUp' ? indicatorWidth.value + 3 : 3, {
        duration: SEGMENT_DURATION,
      });
    }
  }, [selected, indicatorWidth, indicatorX]);

  return (
    <View style={styles.container} onLayout={handleLayout} accessibilityRole="tablist">
      <Animated.View pointerEvents="none" style={[styles.indicator, indicatorStyle]}>
        <LinearGradient
          colors={[day.goldHighlight, day.goldAccent, day.goldShadow]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: selected === 'logIn' }}
        onPress={onLogInPress}
        style={({ pressed }) => [styles.segment, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}>
        <Text style={[styles.label, selected === 'logIn' && styles.labelSelected]}>{AuthCopy.logInTab}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: selected === 'signUp' }}
        onPress={onSignUpPress}
        style={({ pressed }) => [styles.segment, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}>
        <Text style={[styles.label, selected === 'signUp' && styles.labelSelected]}>{AuthCopy.signUpTab}</Text>
      </Pressable>
    </View>
  );
}

function NightSegmentedControl({ selected, onLogInPress, onSignUpPress }: AuthSegmentedControlProps) {
  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      container: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: tokens.border,
        borderRadius: Radius.full,
        padding: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
      },
      segment: {
        flex: 1,
        borderRadius: Radius.full,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
      },
      segmentSelected: {
        backgroundColor: tokens.primaryAction,
      },
      label: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        fontWeight: '600',
      },
      labelSelected: {
        color: tokens.appBackground,
      },
      labelUnselected: {
        color: tokens.primaryText,
      },
    }),
  );

  return (
    <View style={styles.container} accessibilityRole="tablist">
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: selected === 'logIn' }}
        onPress={onLogInPress}
        style={[styles.segment, selected === 'logIn' && styles.segmentSelected]}>
        <Text style={[styles.label, selected === 'logIn' ? styles.labelSelected : styles.labelUnselected]}>
          {AuthCopy.logInTab}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: selected === 'signUp' }}
        onPress={onSignUpPress}
        style={[styles.segment, selected === 'signUp' && styles.segmentSelected]}>
        <Text style={[styles.label, selected === 'signUp' ? styles.labelSelected : styles.labelUnselected]}>
          {AuthCopy.signUpTab}
        </Text>
      </Pressable>
    </View>
  );
}
