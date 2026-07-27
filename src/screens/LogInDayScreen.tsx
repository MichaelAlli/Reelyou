/**
 * REELYOU Daytime Sign In Screen v1.0 — DESIGN LOCKED
 *
 * Status: DESIGN APPROVED | PRODUCTION READY | DESIGN LOCKED
 * Git rollback tag: "Daytime Sign In v1.0 Design Lock"
 *
 * Visual design is frozen. Only functional, accessibility, responsive,
 * keyboard, safe-area, validation, performance, and integration changes allowed.
 */
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AuthCheckbox,
  AuthDivider,
  AuthPrimaryButton,
  AuthSegmentedControl,
  AuthSocialButton,
  AuthTextField,
  LogInDayBackground,
  logInDayWebViewportStyle,
  SignUpDayBrandHeader,
} from '@/components/auth';
import { AuthCopy } from '@/constants/auth';
import {
  LogInDayLayout,
  logInDayFontRender,
  logInDayTextReadabilityShadow,
  resolveLogInDayLogoWidth,
  resolveLogInDayTopInset,
} from '@/constants/logInDayLayout';
import { Fonts } from '@/constants/theme';
import { useLogInForm } from '@/hooks/use-log-in-form';
import { AuthAppearanceProvider } from '@/hooks/use-auth-appearance';
import { useThemedStyles } from '@/theme';

export function LogInDayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  const styles = useScreenStyles();
  const day = LogInDayLayout;
  const dayLogoWidth = resolveLogInDayLogoWidth(viewportWidth);

  const foregroundOpacity = useSharedValue(0);
  const foregroundTranslateY = useSharedValue(12);
  const [reduceMotion, setReduceMotion] = useState(false);

  const {
    values,
    errors,
    canSubmit,
    showPassword,
    isSubmitting,
    updateField,
    markTouched,
    handleSubmit,
    setShowPassword,
  } = useLogInForm();

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) {
        setReduceMotion(enabled);
      }
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      foregroundOpacity.value = 1;
      foregroundTranslateY.value = 0;
      return;
    }
    foregroundOpacity.value = withTiming(1, { duration: 500 });
    foregroundTranslateY.value = withTiming(0, { duration: 500 });
  }, [foregroundOpacity, foregroundTranslateY, reduceMotion]);

  const foregroundStyle = useAnimatedStyle(() => ({
    opacity: foregroundOpacity.value,
    transform: [{ translateY: foregroundTranslateY.value }],
  }));

  const goToSignUp = useCallback(() => {
    router.replace('/signup' as never);
  }, [router]);

  const handleForgotPassword = useCallback(() => {
    if (__DEV__) {
      console.info('[REELYOU] Forgot Password — reset flow not yet implemented.');
    }
  }, []);

  const topPadding = resolveLogInDayTopInset(viewportHeight, insets.top);

  const content = (
    <View style={[styles.content, { paddingTop: topPadding }]}>
      <SignUpDayBrandHeader width={dayLogoWidth} style={styles.logo} />

      <View style={styles.segmentedBlock}>
        <AuthSegmentedControl selected="logIn" onSignUpPress={goToSignUp} />
      </View>

      <View style={styles.headingBlock}>
        <Text style={styles.title}>{AuthCopy.logInTitle}</Text>
        <Text style={styles.subtitle}>{AuthCopy.logInSubtitle}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.fieldsBlock}>
          <AuthTextField
            icon="person"
            value={values.email}
            onChangeText={(text) => updateField('email', text)}
            onBlur={() => {
              updateField('email', values.email.trim());
              markTouched('email');
            }}
            placeholder={AuthCopy.emailPlaceholder}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            error={errors.email}
          />
          <AuthTextField
            icon="lock"
            value={values.password}
            onChangeText={(text) => updateField('password', text)}
            onBlur={() => markTouched('password')}
            placeholder={AuthCopy.passwordPlaceholder}
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            returnKeyType="done"
            showSecureToggle
            secureVisible={showPassword}
            onToggleSecure={() => setShowPassword((visible) => !visible)}
            error={errors.password}
          />
        </View>

        <View style={styles.rememberBlock}>
          <AuthCheckbox
            checked={values.rememberMe}
            onToggle={() => updateField('rememberMe', !values.rememberMe)}>
            {AuthCopy.rememberMe}
          </AuthCheckbox>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Forgot password"
          onPress={handleForgotPassword}
          style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>{AuthCopy.forgotPassword}</Text>
        </Pressable>

        <View style={styles.ctaBlock}>
          <AuthPrimaryButton
            label={AuthCopy.logInButton}
            onPress={handleSubmit}
            disabled={!canSubmit}
            loading={isSubmitting}
          />
        </View>

        <View style={styles.socialBlock}>
          <AuthDivider label={AuthCopy.socialDividerLogIn} />

          <View style={styles.socialRow}>
            <AuthSocialButton provider="google" />
            <AuthSocialButton provider="apple" />
            <AuthSocialButton provider="facebook" />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create a new account"
            onPress={goToSignUp}
            style={styles.footer}>
            <Text style={styles.footerText}>
              {AuthCopy.logInFooterPrefix}
              <Text style={styles.footerLink}>{AuthCopy.logInFooterLink}</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <AuthAppearanceProvider isLight>
      <LogInDayBackground style={logInDayWebViewportStyle()}>
        <StatusBar style="dark" />
        <SafeAreaView style={styles.safe} edges={['bottom']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
            style={styles.flex}>
            <ScrollView
              automaticallyAdjustKeyboardInsets
              contentContainerStyle={[
                styles.scrollContent,
                {
                  minHeight: viewportHeight - insets.bottom,
                  paddingBottom: insets.bottom + day.scrollBottomPadding,
                },
              ]}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <Animated.View style={foregroundStyle}>{content}</Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LogInDayBackground>
    </AuthAppearanceProvider>
  );
}

function useScreenStyles() {
  const day = LogInDayLayout;
  const textLift = logInDayTextReadabilityShadow();
  const fontRender = logInDayFontRender();

  return useThemedStyles(() =>
    StyleSheet.create({
      safe: { flex: 1 },
      flex: { flex: 1 },
      scrollContent: { flexGrow: 1, paddingBottom: 0 },
      content: {
        width: '100%',
        paddingHorizontal: day.horizontalPadding,
      },
      logo: { marginBottom: day.logoBottomGap },
      segmentedBlock: { marginBottom: day.segmentBottomGap },
      headingBlock: {
        gap: day.headingBlockGap,
        alignItems: 'center',
        marginBottom: day.headingBottomGap,
      },
      title: {
        fontFamily: Fonts.sans,
        fontSize: day.titleSize,
        fontWeight: '600',
        letterSpacing: 0.02,
        lineHeight: 26,
        color: day.navyText,
        textAlign: 'center',
        ...textLift,
        ...fontRender,
      },
      subtitle: {
        fontFamily: Fonts.sans,
        fontSize: day.subtitleSize,
        lineHeight: 22,
        fontWeight: '400',
        letterSpacing: 0.05,
        color: day.subtitleColor,
        textAlign: 'center',
        paddingHorizontal: 8,
        ...textLift,
        ...fontRender,
      },
      form: { gap: 0 },
      fieldsBlock: { gap: day.fieldGap },
      rememberBlock: { marginTop: day.rememberMeTopGap },
      forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: day.forgotPasswordTopGap,
        paddingVertical: 4,
      },
      forgotPasswordText: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '600',
        color: day.goldAccent,
        ...textLift,
        ...fontRender,
      },
      ctaBlock: { marginTop: day.ctaTopGap },
      socialBlock: { marginTop: day.socialTopGap, gap: day.socialBlockGap },
      socialRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: day.socialGap,
      },
      footer: {
        alignItems: 'center',
        marginTop: day.footerTopGap,
        paddingBottom: 6,
      },
      footerText: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        lineHeight: 20,
        fontWeight: '500',
        color: day.navyText,
        textAlign: 'center',
        ...textLift,
        ...fontRender,
      },
      footerLink: {
        color: day.goldAccent,
        fontWeight: '700',
      },
    }),
  );
}
