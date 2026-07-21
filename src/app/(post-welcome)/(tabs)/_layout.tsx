import { StyleSheet, View } from 'react-native';
import { Slot } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/BottomNav';
import { TabBarHeight } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { tokens } = useTheme();
  const tabContentInset = TabBarHeight + Math.max(insets.bottom, 8);

  return (
    <View style={[styles.container, { backgroundColor: tokens.appBackground }]}>
      <View style={[styles.content, { paddingBottom: tabContentInset }]}>
        <Slot />
      </View>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
