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
import { Platform, StyleSheet, View, ViewStyle, type ImageStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLayoutViewportSize } from '@/hooks/useLayoutViewportSize';

import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';

import { BrandLogo } from '@/components/branding/BrandLogo';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { SecondaryButton } from '@/components/buttons/SecondaryButton';
import { BackgroundImage } from '@/components/layout/BackgroundImage';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { BodyText } from '@/components/typography/BodyText';
import { BrandingAssets } from '@/constants/branding';
import { WelcomeCopy } from '@/constants/welcome';
import {
  authScrollBottomPadding,
  authWebRootFillStyle,
  authWelcomeWebViewportStyle,
} from '@/constants/authViewportLayout';
import {
  resolveWelcomeContentScale,
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
  const { width, layoutHeight, effectiveHeight, visualOffsetTop } = useLayoutViewportSize();
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

  const viewportHeight = effectiveHeight > 0 ? effectiveHeight : layoutHeight;
  const contentMaxWidth = Math.min(width - spacing.Spacing40, spacing.Spacing64 * 6);
  const logoWidth = resolveWelcomeLogoWidth(width, viewportHeight);
  const logoHeight = logoWidth * WELCOME_LOGO_ASPECT;
  const contentScale = resolveWelcomeContentScale(viewportHeight);
  const heroOpticalOffset = resolveWelcomeHeroOpticalOffset(viewportHeight);
  const actionsBottomPad = authScrollBottomPadding(
    insets.bottom,
    spacing.Spacing16,
    layoutHeight,
  );
  const scrollEnabled = welcomeNeedsScrollLayout(viewportHeight);
  const welcomeBackgroundImageStyle = resolveWelcomeBackgroundImageStyle(viewportHeight);
  const welcomeWebShell = authWelcomeWebViewportStyle({
    height: viewportHeight,
    offsetTop: visualOffsetTop,
    allowScroll: scrollEnabled,
  });

  return (
    <View style={[styles.root, welcomeWebShell, authWebRootFillStyle()]}>
      <StatusBar style="light" />
      <BackgroundImage
        source={BrandingAssets.welcomeBackground}
        resizeMode="cover"
        style={styles.background}
        imageStyle={welcomeBackgroundImageStyle}>
        <ScreenContainer
          scroll={scrollEnabled}
          edges={['top']}
          contentStyle={[
            styles.container,
            scrollEnabled && styles.containerScroll,
            !scrollEnabled && { maxHeight: viewportHeight },
          ]}>
          <View
            style={[
              styles.layout,
              scrollEnabled && [styles.layoutScroll, { minHeight: viewportHeight }],
              !scrollEnabled && { height: viewportHeight, maxHeight: viewportHeight },
              { maxWidth: contentMaxWidth },
            ]}>
            <View
              style={[
                styles.foregroundColumn,
                scrollEnabled && styles.foregroundColumnScroll,
              ]}>
              <View
                style={[
                  scrollEnabled ? styles.heroRegionScroll : styles.heroCenterRegion,
                  { paddingTop: insets.top + spacing.Spacing4 },
                ]}>
                <View
                  style={[
                    styles.heroBlock,
                    {
                      width,
                      marginTop: heroOpticalOffset,
                      transform: [{ scale: contentScale }],
                    },
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
    justifyContent: 'space-between',
    minHeight: 0,
  } satisfies ViewStyle,
  foregroundColumnScroll: {
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: 'flex-start',
  } satisfies ViewStyle,
  containerScroll: {
    flexGrow: 1,
    minHeight: '100%',
  } satisfies ViewStyle,
  layoutScroll: {
    minHeight: '100%',
  } satisfies ViewStyle,
  heroCenterRegion: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 1,
  } satisfies ViewStyle,
  heroRegionScroll: {
    width: '100%',
    alignItems: 'center',
    flexShrink: 0,
    flexGrow: 0,
    paddingBottom: spacing.Spacing12,
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
