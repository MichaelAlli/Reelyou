import { Redirect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenPreviewLauncher } from '@/components/dev/ScreenPreviewLauncher';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { isScreenPreviewEnabled } from '@/constants/devFlags';
import { Fonts } from '@/constants/theme';
import { spacing } from '@/theme';

/**
 * DEV-ONLY Screen Preview — open manually at /dev-screen-preview.
 * Never linked from production UX. Does not change production navigation flow.
 */
export default function DevScreenPreviewScreen() {
  if (!isScreenPreviewEnabled()) {
    return <Redirect href={'/' as never} />;
  }

  return (
    <ScreenContainer scroll contentStyle={styles.container}>
      <Text style={styles.badge}>DEV · SCREEN PREVIEW</Text>
      <Text style={styles.title}>Screen Preview</Text>
      <Text style={styles.note}>
        Development only — tap a screen to preview it. Production still starts at Splash. Disable
        with DEV_SCREEN_PREVIEW_ENABLED or DEV_SCREEN_PREVIEW_STARTUP in devFlags.ts.
      </Text>
      <View style={styles.panel}>
        <ScreenPreviewLauncher />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.Spacing24,
    paddingBottom: spacing.Spacing32,
    gap: spacing.Spacing16,
    backgroundColor: '#050818',
  },
  badge: {
    alignSelf: 'center',
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: '#D4AF37',
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 22,
    fontWeight: '700',
    color: '#F8F9FC',
    textAlign: 'center',
  },
  note: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(248, 249, 252, 0.62)',
    textAlign: 'center',
  },
  panel: {
    width: '100%',
    marginTop: spacing.Spacing8,
  },
});
