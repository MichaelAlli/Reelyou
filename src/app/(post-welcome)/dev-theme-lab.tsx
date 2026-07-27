import { Redirect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ThemeModeDevControl } from '@/components/dev/ThemeModeDevControl';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { spacing } from '@/theme';

/**
 * Internal development-only theme QA route.
 * Open manually at /dev-theme-lab while __DEV__ is true — never linked in production UX.
 */
export default function DevThemeLabScreen() {
  if (!__DEV__) {
    return <Redirect href={'/home' as never} />;
  }

  return (
    <ScreenContainer contentStyle={styles.container}>
      <Text style={styles.note}>Internal theme QA — not part of the production user flow.</Text>
      <View style={styles.panel}>
        <ThemeModeDevControl embedded />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.Spacing24,
    gap: spacing.Spacing16,
  },
  note: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  panel: {
    width: '100%',
  },
});
