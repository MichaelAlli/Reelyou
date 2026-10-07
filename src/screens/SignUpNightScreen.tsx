/**
 * REELYOU Nighttime Sign Up Screen v1.0 — DESIGN LOCKED
 *
 * Status: DESIGN APPROVED | PRODUCTION READY | DESIGN LOCKED
 * Rollback tag: "Nighttime Sign Up v1.0 Design Lock"
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
  AuthCelestialBackground,
  AuthCheckbox,
  AuthDivider,
  AuthPrimaryButton,
  AuthSegmentedControl,
  AuthSocialButton,
  AuthTextField,
  SignUpNightBrandHeader,
} from '@/components/auth';
import { SignUpAppearanceDevPreview } from '@/components/dev/SignUpAppearanceDevPreview';
import { mapAuthErrorToMessage } from '@/auth/authErrorMessages';
import { recordLegalConsent } from '@/auth/legalConsentPersistence';
import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { LEGAL_DOCUMENT_VERSION } from '@/constants/legalDocuments';
import { isThirdPartyOAuthSignInEnabled } from '@/config/betaReleaseFlags';
import { AuthCopy } from '@/constants/auth';
import {
  SignUpNightLayout,
  resolveSignUpNightLogoWidth,
  resolveSignUpNightTopInset,
  signUpNightWebViewportStyle,
} from '@/constants/signUpNightLayout';
import { Fonts } from '@/constants/theme';
import { useSignUpForm } from '@/hooks/use-sign-up-form';
import { isSignUpFormValid } from '@/utils/signUpValidation';
import { useThemedStyles } from '@/theme';

export function SignUpNightScreen() {
  const router = useRouter();
  const auth = useReelyouAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const insets = useSafeAreaInsets();
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  const styles = useScreenStyles();
  const night = SignUpNightLayout;
  const nightLogoWidth = resolveSignUpNightLogoWidth(viewportWidth, viewportHeight);

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
    toggleTermsAccepted,
    markAllTouched,
    setShowPassword,
    setShowConfirmPassword,
  } = useSignUpForm();

  const canSubmitAccount = isSignUpFormValid(values) && !isSubmittingAuth;

  const handleSubmit = useCallback(async () => {
    markAllTouched();
    if (!isSignUpFormValid(values)) return;

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

    setAuthError(mapAuthErrorToMessage('auth_not_configured'));
  }, [auth, markAllTouched, router, values]);

  const openTerms = useCallback(() => {
    router.push('/legal/terms-of-service' as never);
  }, [router]);

  const openPrivacy = useCallback(() => {
    router.push('/legal/privacy-policy' as never);
  }, [router]);

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

  const goToLogIn = useCallback(() => {
    router.replace('/login' as never);
  }, [router]);

  const topPadding = resolveSignUpNightTopInset(viewportHeight, insets.top);

  const content = (
    <View style={[styles.content, { paddingTop: topPadding }]}>
      <SignUpNightBrandHeader width={nightLogoWidth} style={styles.logo} />

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

        {authError ? <Text style={styles.authError}>{authError}</Text> : null}
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
    <AuthCelestialBackground style={signUpNightWebViewportStyle()}>
      <SignUpAppearanceDevPreview />
      <StatusBar style="light" />
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
                paddingBottom: insets.bottom + night.scrollBottomPadding,
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
  const night = SignUpNightLayout;

  return useThemedStyles((tokens) =>
    StyleSheet.create({
      safe: { flex: 1 },
      flex: { flex: 1 },
      scrollContent: { flexGrow: 1, paddingBottom: 0 },
      content: {
        width: '100%',
        paddingHorizontal: night.horizontalPadding,
      },
      logo: { marginBottom: night.logoBottomGap },
      segmentedBlock: { marginBottom: night.segmentBottomGap },
      headingBlock: {
        gap: night.headingBlockGap,
        alignItems: 'center',
        marginBottom: night.headingBottomGap,
      },
      title: {
        fontFamily: Fonts.sans,
        fontSize: night.titleSize,
        fontWeight: '600',
        letterSpacing: 0.02,
        lineHeight: 28,
        color: tokens.primaryText,
        textAlign: 'center',
      },
      subtitle: {
        fontFamily: Fonts.sans,
        fontSize: night.subtitleSize,
        lineHeight: 21,
        fontWeight: '400',
        letterSpacing: 0.05,
        color: tokens.secondaryText,
        textAlign: 'center',
        paddingHorizontal: 8,
      },
      form: { gap: 0 },
      fieldsBlock: { gap: night.fieldGap },
      termsBlock: { marginTop: night.termsTopGap },
      authError: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        lineHeight: 18,
        color: '#ffb4b4',
        textAlign: 'center',
        marginTop: 8,
      },
      ctaBlock: { marginTop: night.ctaTopGap },
      socialBlock: { marginTop: night.socialTopGap, gap: night.socialBlockGap },
      link: { color: night.goldAccent, fontWeight: '600' },
      socialRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: night.socialGap,
      },
      footer: {
        alignItems: 'center',
        marginTop: night.footerTopGap,
        paddingBottom: 6,
      },
      footerText: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        lineHeight: 20,
        fontWeight: '500',
        color: tokens.primaryText,
        textAlign: 'center',
      },
      footerLink: {
        color: night.goldAccent,
        fontWeight: '700',
      },
    }),
  );
}
