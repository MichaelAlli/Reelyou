/**
 * REELYOU Daytime Sign Up Screen v1.0 — DESIGN LOCKED
 * Rollback tag: "Daytime Sign Up v1.0 Design Lock"
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

import { SignUpAppearanceDevPreview } from '@/components/dev/SignUpAppearanceDevPreview';
import {
  AuthCelestialBackground,
  AuthCheckbox,
  AuthDivider,
  AuthPrimaryButton,
  AuthSegmentedControl,
  AuthSocialButton,
  AuthTextField,
  SignUpDayBrandHeader,
} from '@/components/auth';
import { AuthCopy } from '@/constants/auth';
import { SignUpDayLayout, resolveSignUpDayLogoWidth, resolveSignUpDayTopInset, signUpDayFontRender, signUpDayTextReadabilityShadow, signUpDayWebViewportStyle } from '@/constants/signUpDayLayout';
import { Fonts } from '@/constants/theme';
import { mapAuthErrorToMessage } from '@/auth/authErrorMessages';
import { recordLegalConsent } from '@/auth/legalConsentPersistence';
import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { LEGAL_DOCUMENT_VERSION } from '@/constants/legalDocuments';
import { isThirdPartyOAuthSignInEnabled } from '@/config/betaReleaseFlags';
import { useSignUpForm } from '@/hooks/use-sign-up-form';
import { isSignUpFormValid } from '@/utils/signUpValidation';
import { useThemedStyles } from '@/theme';

export function SignUpDayScreen() {
  const router = useRouter();
  const auth = useReelyouAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  const styles = useScreenStyles();
  const day = SignUpDayLayout;
  const dayLogoWidth = resolveSignUpDayLogoWidth(viewportWidth);

  const foregroundOpacity = useSharedValue(0);
  const foregroundTranslateY = useSharedValue(12);
  const [reduceMotion, setReduceMotion] = useState(false);

  const {
    values,
    errors,
    showPassword,
    showConfirmPassword,
    updateField,
    markTouched,
    markAllTouched,
    toggleTermsAccepted,
    setShowPassword,
    setShowConfirmPassword,
  } = useSignUpForm();
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

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

  const canSubmitAccount = isSignUpFormValid(values) && !isSubmittingAuth;

  const openTerms = useCallback(() => {
    router.push('/legal/terms-of-service' as never);
  }, [router]);

  const openPrivacy = useCallback(() => {
    router.push('/legal/privacy-policy' as never);
  }, [router]);

  const handleSubmit = useCallback(async () => {
    markAllTouched();

    if (!isSignUpFormValid(values)) {
      return;
    }

    if (auth.configured) {
      setAuthError(null);
      setIsSubmittingAuth(true);
      const consentAcceptedAt = Date.now();
      const result = await auth.register({
        email: values.email.trim(),
        password: values.password,
        fullName: values.fullName.trim(),
        phone: values.phone.trim() || undefined,
        termsAccepted: values.termsAccepted,
        termsVersion: LEGAL_DOCUMENT_VERSION,
        privacyVersion: LEGAL_DOCUMENT_VERSION,
        consentAcceptedAt,
      });
      setIsSubmittingAuth(false);
      if (!result.ok) {
        setAuthError(mapAuthErrorToMessage(result.error));
        return;
      }
      if (values.termsAccepted) {
        await recordLegalConsent(true, LEGAL_DOCUMENT_VERSION);
      }
      router.replace('/onboarding/profile' as never);
      return;
    }

    setIsSubmittingAuth(true);
    setTimeout(() => {
      setIsSubmittingAuth(false);
    }, 1200);
  }, [auth, markAllTouched, router, values]);

  const goToLogIn = useCallback(() => {
    router.replace('/login' as never);
  }, [router]);

  const topPadding = resolveSignUpDayTopInset(viewportHeight, insets.top);

  const content = (
    <View style={[styles.content, { paddingTop: topPadding }]}>
      <SignUpDayBrandHeader width={dayLogoWidth} style={styles.logo} />

      <View style={styles.segmentedBlock}>
        <AuthSegmentedControl selected="signUp" onLogInPress={goToLogIn} />
      </View>

      <View style={styles.headingBlock}>
        <Text style={styles.title}>{AuthCopy.signUpTitle}</Text>
        <Text style={styles.subtitle}>{AuthCopy.signUpSubtitle}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.fieldsBlock}>
          <AuthTextField
            icon="person"
            value={values.fullName}
            onChangeText={(text) => updateField('fullName', text)}
            onBlur={() => markTouched('fullName')}
            placeholder={AuthCopy.fullNamePlaceholder}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
            error={errors.fullName}
          />

          <AuthTextField
            icon="envelope"
            value={values.email}
            onChangeText={(text) => updateField('email', text)}
            onBlur={() => markTouched('email')}
            placeholder={AuthCopy.emailPlaceholder}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            error={errors.email}
          />

          <AuthTextField
            icon="phone"
            value={values.phone}
            onChangeText={(text) => updateField('phone', text)}
            onBlur={() => markTouched('phone')}
            placeholder={AuthCopy.phonePlaceholder}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            returnKeyType="next"
            error={errors.phone}
          />

          <AuthTextField
            icon="lock"
            value={values.password}
            onChangeText={(text) => updateField('password', text)}
            onBlur={() => markTouched('password')}
            placeholder={AuthCopy.passwordPlaceholder}
            autoCapitalize="none"
            autoComplete="password-new"
            textContentType="newPassword"
            returnKeyType="next"
            showSecureToggle
            secureVisible={showPassword}
            onToggleSecure={() => setShowPassword((visible) => !visible)}
            error={errors.password}
          />

          <AuthTextField
            icon="lock"
            value={values.confirmPassword}
            onChangeText={(text) => updateField('confirmPassword', text)}
            onBlur={() => markTouched('confirmPassword')}
            placeholder={AuthCopy.confirmPasswordPlaceholder}
            autoCapitalize="none"
            autoComplete="password-new"
            textContentType="newPassword"
            returnKeyType="done"
            showSecureToggle
            secureVisible={showConfirmPassword}
            onToggleSecure={() => setShowConfirmPassword((visible) => !visible)}
            error={errors.confirmPassword}
          />
        </View>

        <View style={styles.termsBlock}>
          <AuthCheckbox
            checked={values.termsAccepted}
            onToggle={toggleTermsAccepted}
            error={errors.termsAccepted}
            labelPrefix={AuthCopy.termsPrefix}
            termsLabel={AuthCopy.termsOfService}
            onTermsPress={openTerms}
            labelMiddle={AuthCopy.termsMiddle}
            privacyLabel={AuthCopy.privacyPolicy}
            onPrivacyPress={openPrivacy}
            linkStyle={styles.link}
          />
        </View>

        <View style={styles.ctaBlock}>
          <AuthPrimaryButton
            label={AuthCopy.createAccount}
            onPress={() => void handleSubmit()}
            disabled={!canSubmitAccount}
            loading={isSubmittingAuth}
          />
        </View>

        <View style={styles.socialBlock}>
          {isThirdPartyOAuthSignInEnabled() ? (
            <>
              <AuthDivider label={AuthCopy.socialDivider} />
              <View style={styles.socialRow}>
                <AuthSocialButton provider="google" />
                <AuthSocialButton provider="apple" />
                <AuthSocialButton provider="facebook" />
              </View>
            </>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Log in to your existing account"
            onPress={goToLogIn}
            style={styles.footer}>
            <Text style={styles.footerText}>
              {AuthCopy.footerPrefix}
              <Text style={styles.footerLink}>{AuthCopy.footerLink}</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <AuthCelestialBackground style={signUpDayWebViewportStyle()}>
      <SignUpAppearanceDevPreview />
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
    </AuthCelestialBackground>
  );
}

function useScreenStyles() {
  const day = SignUpDayLayout;
  const textLift = signUpDayTextReadabilityShadow();
  const fontRender = signUpDayFontRender();

  return useThemedStyles((tokens) =>
    StyleSheet.create({
      safe: {
        flex: 1,
      },
      flex: {
        flex: 1,
      },
      scrollContent: {
        flexGrow: 1,
        paddingBottom: 0,
      },
      content: {
        width: '100%',
        paddingHorizontal: day.horizontalPadding,
      },
      logo: {
        marginBottom: day.logoBottomGap,
      },
      segmentedBlock: {
        marginBottom: day.segmentBottomGap,
      },
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
      form: {
        gap: 0,
      },
      fieldsBlock: {
        gap: day.fieldGap,
      },
      termsBlock: {
        marginTop: day.termsTopGap,
      },
      ctaBlock: {
        marginTop: day.ctaTopGap,
      },
      socialBlock: {
        marginTop: day.socialTopGap,
        gap: day.socialBlockGap,
      },
      link: {
        color: day.goldAccent,
        fontWeight: '600',
      },
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
