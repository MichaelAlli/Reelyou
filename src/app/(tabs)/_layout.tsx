import { Slot } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BottomNav } from '@/components/BottomNav';
import { CosmicTheme } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <View style={styles.container}>
      <Slot />
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CosmicTheme.background,
  },
});
