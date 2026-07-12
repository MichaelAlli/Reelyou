import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, useWindowDimensions, View, ViewStyle } from 'react-native';

import { BrandLogo } from '@/components/branding/BrandLogo';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { SecondaryButton } from '@/components/buttons/SecondaryButton';
import { BackgroundImage } from '@/components/layout/BackgroundImage';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { BodyText } from '@/components/typography/BodyText';
import { BrandingAssets, BrandLogoSpec } from '@/constants/branding';
import { WelcomeCopy } from '@/constants/welcome';
import { colors, spacing } from '@/theme';

/** Review mode: keeps Welcome screen static for local design review. */
const WELCOME_REVIEW_MODE = true;

export function WelcomeScreen() {
  const { width, height } = useWindowDimensions();
  const isCompact = height < 900;
  const contentMaxWidth = Math.min(width - spacing.Spacing40, spacing.Spacing64 * 6);
  const logoWidth = Math.min(width * 0.82, BrandLogoSpec.maxWidth);

  return (
    <View style={[styles.root, Platform.OS === 'web' ? styles.rootWeb : null]}>
      <StatusBar style="light" />
      <BackgroundImage source={BrandingAssets.welcomeBackground}>
        <ScreenContainer contentStyle={styles.container}>
          <View style={[styles.layout, { maxWidth: contentMaxWidth }]}>
            <View
              style={[
                styles.brandBlock,
                isCompact ? styles.brandBlockCompact : styles.brandBlockRegular,
              ]}>
              <BrandLogo width={logoWidth} backgroundTone="dark" includeTagline />
            </View>

            <View style={styles.copyBlock}>
              {WelcomeCopy.bodyLines.map((line) => (
                <BodyText key={line} style={styles.bodyLine}>
                  {line}
                </BodyText>
              ))}
            </View>

            <View style={styles.sunriseGap} />

            <View
              style={[
                styles.actionsBlock,
                isCompact ? styles.actionsBlockCompact : styles.actionsBlockRegular,
              ]}>
              <PrimaryButton label={WelcomeCopy.primaryCta} />
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
    minHeight: '100%',
  } satisfies ViewStyle,
  container: {
    alignItems: 'center',
  } satisfies ViewStyle,
  layout: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  } satisfies ViewStyle,
  brandBlock: {
    width: '100%',
    alignItems: 'center',
  } satisfies ViewStyle,
  brandBlockRegular: {
    paddingTop: spacing.Spacing32,
  } satisfies ViewStyle,
  brandBlockCompact: {
    paddingTop: spacing.Spacing20,
  } satisfies ViewStyle,
  copyBlock: {
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.Spacing24,
    paddingHorizontal: spacing.Spacing8,
  } satisfies ViewStyle,
  bodyLine: {
    marginBottom: spacing.Spacing4,
  } satisfies ViewStyle,
  sunriseGap: {
    flex: 1,
    minHeight: spacing.Spacing32,
    width: '100%',
  } satisfies ViewStyle,
  actionsBlock: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.Spacing12,
  } satisfies ViewStyle,
  actionsBlockRegular: {
    paddingBottom: spacing.Spacing24,
  } satisfies ViewStyle,
  actionsBlockCompact: {
    paddingBottom: spacing.Spacing20,
  } satisfies ViewStyle,
});
