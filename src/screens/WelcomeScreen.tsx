/**
 * REELYOU Welcome Screen v1.0 — DESIGN LOCKED
 *
 * Status: DESIGN APPROVED | PRODUCTION READY | DESIGN LOCKED
 * Git rollback tag: "Welcome v1.0 Design Lock"
 *
 * Visual design is frozen. Only functional, accessibility, responsive,
 * keyboard, safe-area, validation, performance, and integration changes allowed.
 */
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View, ViewStyle, type ImageStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';

import { BrandLogo } from '@/components/branding/BrandLogo';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { SecondaryButton } from '@/components/buttons/SecondaryButton';
import { BackgroundImage } from '@/components/layout/BackgroundImage';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { BodyText } from '@/components/typography/BodyText';
import { BrandingAssets } from '@/constants/branding';
import { WelcomeCopy } from '@/constants/welcome';
import { authWebRootFillStyle } from '@/constants/authViewportLayout';
import {
  resolveWelcomeHeroOpticalOffset,
  resolveWelcomeLogoWidth,
  welcomeNeedsScrollLayout,
} from '@/constants/welcomeForegroundLayout';
import { isQaPreviewQueryActive } from '@/config/qaPreviewFlags';
import { colors, spacing } from '@/theme';

/** reelyou-welcome-logo-white-tagline-cropped.png — alpha-bounds crop, 1116 × 594 RGBA PNG. */
const WELCOME_LOGO_ASPECT = 594 / 1116;

/** Full-bleed cover sizing for Welcome — fills viewport without bottom letterboxing. */
function resolveWelcomeBackgroundImageStyle(viewportHeight: number): ImageStyle {
  const objectPosition =
    viewportHeight < 700 ? 'center 44%' : viewportHeight < 933 ? 'center 46%' : 'center center';

  if (Platform.OS === 'web') {
    return {
      height: '100%',
      width: '100%',
      objectFit: 'cover',
      objectPosition,
    } as ImageStyle;
  }

  return {
    height: '100%',
    width: '100%',
  };
}

export function WelcomeScreen() {
  const router = useRouter();
  const auth = useReelyouAuth();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ qaPreview?: string }>();
  const qaPreviewActive = isQaPreviewQueryActive(
    typeof params.qaPreview === 'string' ? params.qaPreview : undefined,
  );

  useEffect(() => {
    if (qaPreviewActive) return;
    if (!auth.configured || !auth.ready) return;
    if (auth.isAuthenticated) {
      router.replace('/(tabs)/home' as never);
    }
  }, [auth.configured, auth.isAuthenticated, auth.ready, qaPreviewActive, router]);

  const contentMaxWidth = Math.min(width - spacing.Spacing40, spacing.Spacing64 * 6);
  const logoWidth = resolveWelcomeLogoWidth(width, height);
  const logoHeight = logoWidth * WELCOME_LOGO_ASPECT;
  const heroOpticalOffset = resolveWelcomeHeroOpticalOffset(height);
  const actionsBottomPad = Math.max(
    spacing.Spacing16,
    insets.bottom + (Platform.OS === 'web' ? 22 : 14),
  );
  const scrollEnabled = welcomeNeedsScrollLayout(height);
  const welcomeBackgroundImageStyle = resolveWelcomeBackgroundImageStyle(height);

  return (
    <View style={[styles.root, authWebRootFillStyle()]}>
      <StatusBar style="light" />
      <BackgroundImage
        source={BrandingAssets.welcomeBackground}
        resizeMode="cover"
        style={styles.background}
        imageStyle={welcomeBackgroundImageStyle}>
        <ScreenContainer scroll={scrollEnabled} contentStyle={styles.container}>
          <View style={[styles.layout, { maxWidth: contentMaxWidth }]}>
            <View style={styles.foregroundColumn}>
              <View
                style={[
                  styles.heroCenterRegion,
                  { paddingTop: insets.top + spacing.Spacing4 },
                ]}>
                <View
                  style={[
                    styles.heroBlock,
                    { width, marginTop: heroOpticalOffset },
                  ]}>
                  <BrandLogo
                    width={logoWidth}
                    source={BrandingAssets.welcomeLogoWhiteTaglineCropped}
                    theme="dark"
                    variant="marketing"
                    style={{
                      alignSelf: 'center',
                      backgroundColor: 'transparent',
                      height: logoHeight,
                      maxWidth: '100%',
                    }}
                  />

                  <View style={styles.copyBlock}>
                    {WelcomeCopy.bodyLines.map((line) => (
                      <BodyText key={line} style={styles.bodyLine}>
                        {line}
                      </BodyText>
                    ))}
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.actionsBlock,
                  { paddingBottom: actionsBottomPad },
                ]}>
                <PrimaryButton
                  label={WelcomeCopy.primaryCta}
                  onPress={() => router.push('/signup' as never)}
                />
                <SecondaryButton
                  label={WelcomeCopy.signInCta}
                  onPress={() => router.push('/login' as never)}
                />
              </View>
            </View>
          </View>
        </ScreenContainer>
      </BackgroundImage>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: colors.BackgroundPrimary,
  } satisfies ViewStyle,
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  } satisfies ViewStyle,
  container: {
    alignItems: 'center',
  } satisfies ViewStyle,
  layout: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  } satisfies ViewStyle,
  foregroundColumn: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  } satisfies ViewStyle,
  heroCenterRegion: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  } satisfies ViewStyle,
  heroBlock: {
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: spacing.Spacing8,
  } satisfies ViewStyle,
  copyBlock: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    marginTop: spacing.Spacing12,
    paddingHorizontal: spacing.Spacing8,
  } satisfies ViewStyle,
  bodyLine: {
    marginBottom: spacing.Spacing4,
  } satisfies ViewStyle,
  actionsBlock: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.Spacing12,
    flexShrink: 0,
    zIndex: 1,
  } satisfies ViewStyle,
});
