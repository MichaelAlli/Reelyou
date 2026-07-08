import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CosmicBackground } from '@/components/CosmicBackground';
import { MaxContentWidth, Spacing, TabBarHeight } from '@/constants/theme';

interface ScreenLayoutProps {
  children: ReactNode;
  scroll?: boolean;
  showTabBar?: boolean;
  style?: ViewStyle;
}

export function ScreenLayout({
  children,
  scroll = true,
  showTabBar = false,
  style,
}: ScreenLayoutProps) {
  const content = (
    <View style={[styles.content, showTabBar && styles.withTabBar, style]}>{children}</View>
  );

  return (
    <CosmicBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
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
  withTabBar: {
    paddingBottom: TabBarHeight + Spacing.lg,
  },
});
