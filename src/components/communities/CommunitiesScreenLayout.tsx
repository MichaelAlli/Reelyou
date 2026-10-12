import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeBackdrop } from '@/components/home/HomeBackdrop';
import { HomePalette } from '@/constants/homeLayout';
import { MaxContentWidth, Spacing } from '@/constants/theme';

interface CommunitiesScreenLayoutProps {
  children: ReactNode;
}

/** Communities beta flow — same cinematic Home backdrop as Growing In (commit 36ebecd). */
export function CommunitiesScreenLayout({ children }: CommunitiesScreenLayoutProps) {
  return (
    <View style={styles.root}>
      <HomeBackdrop />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.content}>{children}</View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: HomePalette.navyDeep,
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
});
