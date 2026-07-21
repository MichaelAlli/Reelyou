import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Platform, StyleSheet, useWindowDimensions, View, ViewStyle, type ImageStyle } from 'react-native';

import { BrandLogo } from '@/components/branding/BrandLogo';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { SecondaryButton } from '@/components/buttons/SecondaryButton';
import { BackgroundImage } from '@/components/layout/BackgroundImage';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { BodyText } from '@/components/typography/BodyText';
import { BrandingAssets } from '@/constants/branding';
import { WelcomeCopy } from '@/constants/welcome';
import { colors, spacing } from '@/theme';

/** Review mode: keeps Welcome screen static for local design review. */
const WELCOME_REVIEW_MODE = true;

/** reelyou-welcome-logo-white-tagline-cropped.png — alpha-bounds crop, 1116 × 594 RGBA PNG. */
const WELCOME_LOGO_ASPECT = 594 / 1116;
const WELCOME_LOGO_WIDTH_RATIO = 0.92;
const WELCOME_LOGO_MAX_WIDTH = 372;

/** Full-bleed cover sizing for Welcome — fills viewport without bottom letterboxing. */
function resolveWelcomeBackgroundImageStyle(): ImageStyle {
  if (Platform.OS === 'web') {
    return {
      height: '100%',
      width: '100%',
      objectFit: 'cover',
      objectPosition: 'center center',
    } as ImageStyle;
  }

  return {
    height: '100%',
    width: '100%',
  };
}

export function WelcomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isCompact = height < 900;
  const contentMaxWidth = Math.min(width - spacing.Spacing40, spacing.Spacing64 * 6);
  const logoWidth = Math.min(width * WELCOME_LOGO_WIDTH_RATIO, WELCOME_LOGO_MAX_WIDTH);
  const logoHeight = logoWidth * WELCOME_LOGO_ASPECT;
  const heroLift = Math.round(height * (isCompact ? 0.07 : 0.08));
  const welcomeBackgroundImageStyle = resolveWelcomeBackgroundImageStyle();

  return (
    <View style={[styles.root, Platform.OS === 'web' ? styles.rootWeb : null]}>
      <StatusBar style="light" />
      <BackgroundImage
        source={BrandingAssets.welcomeBackground}
        resizeMode="cover"
        style={styles.background}
        imageStyle={welcomeBackgroundImageStyle}>
        <ScreenContainer contentStyle={styles.container}>
          <View style={[styles.layout, { maxWidth: contentMaxWidth }]}>
            <View style={styles.heroRegion}>
              <View
                style={[
                  styles.heroBlock,
                  {
                    width,
                    marginHorizontal: -spacing.Spacing24,
                    transform: [{ translateY: -heroLift }],
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
                isCompact ? styles.actionsBlockCompact : styles.actionsBlockRegular,
              ]}>
              <PrimaryButton
                label={WelcomeCopy.primaryCta}
                onPress={() => router.push('/signup' as never)}
              />
              <SecondaryButton label={WelcomeCopy.signInCta} />
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
  rootWeb: {
    minHeight: '100vh',
    height: '100%',
  } as unknown as ViewStyle,
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
  heroRegion: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
  } satisfies ViewStyle,
  heroBlock: {
    alignItems: 'center',
  } satisfies ViewStyle,
  copyBlock: {
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.Spacing8,
    paddingHorizontal: spacing.Spacing8,
  } satisfies ViewStyle,
  bodyLine: {
    marginBottom: spacing.Spacing4,
  } satisfies ViewStyle,
  actionsBlock: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.Spacing12,
    marginTop: 'auto',
    zIndex: 1,
  } satisfies ViewStyle,
  actionsBlockRegular: {
    paddingBottom: spacing.Spacing24,
  } satisfies ViewStyle,
  actionsBlockCompact: {
    paddingBottom: spacing.Spacing20,
  } satisfies ViewStyle,
});
