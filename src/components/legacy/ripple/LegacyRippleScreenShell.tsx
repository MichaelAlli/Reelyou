import { ImageBackground } from 'expo-image';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/BottomNav';
import { RippleInfoSheet } from '@/components/legacy/ripple/RippleInfoSheet';
import { RippleTopHeader } from '@/components/legacy/ripple/RippleTopHeader';
import { RippleLakeBackground } from '@/constants/rippleAssets';
import { TabBarHeight, Spacing } from '@/constants/theme';

interface LegacyRippleScreenShellProps {
  children: ReactNode;
  onBack: () => void;
  scroll?: boolean;
}

export function LegacyRippleScreenShell({ children, onBack, scroll = true }: LegacyRippleScreenShellProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navInset = TabBarHeight + Math.max(insets.bottom, Spacing.sm);
  const [infoOpen, setInfoOpen] = useState(false);

  const body = (
    <View style={[styles.content, { paddingBottom: navInset, width: Math.min(width, 393) }]}>
      <RippleTopHeader onBack={onBack} onOpenInfo={() => setInfoOpen(true)} />
      {children}
    </View>
  );

  return (
    <View style={styles.root}>
      <ImageBackground source={RippleLakeBackground} style={StyleSheet.absoluteFill} contentFit="cover" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {scroll ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}>
            {body}
          </ScrollView>
        ) : (
          body
        )}
      </SafeAreaView>
      <BottomNav />
      <RippleInfoSheet visible={infoOpen} onClose={() => setInfoOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#8CB4D4' },
  safe: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  content: {
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    flex: 1,
  },
});
