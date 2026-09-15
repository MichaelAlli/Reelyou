import { StyleSheet, View } from 'react-native';
import { Slot } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/BottomNav';
import { TabBarHeight } from '@/constants/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const tabContentInset = TabBarHeight + Math.max(insets.bottom, 8);

  return (
    <View style={styles.container}>
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
    // Match Home backdrop — paddingBottom inset otherwise exposes appBackground as a light band above nav.
    backgroundColor: '#05070A',
  },
  content: {
    flex: 1,
  },
});
