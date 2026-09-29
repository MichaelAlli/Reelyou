import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/BottomNav';
import { TodayFocusEntryForm } from '@/components/today-focus/TodayFocusEntryForm';
import { TodayFocusCopy } from '@/constants/todayFocusCopy';
import { Fonts, Spacing, TabBarHeight } from '@/constants/theme';

export function TodayFocusEditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabInset = TabBarHeight + Math.max(insets.bottom, 8);
  const horizontalPad = Math.max(Spacing.lg, insets.left, insets.right, 20);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0B1024', '#141B38', '#0E1428']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={[styles.content, { paddingBottom: tabInset, paddingHorizontal: horizontalPad }]}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>{TodayFocusCopy.back}</Text>
          </Pressable>
          <TodayFocusEntryForm
            showTitle
            onSaved={() => {
              if (router.canGoBack()) router.back();
              else router.replace('/(tabs)/home' as never);
            }}
          />
        </View>
      </SafeAreaView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070A' },
  safe: { flex: 1 },
  content: { flex: 1, paddingTop: Spacing.sm },
  back: { minHeight: 44, justifyContent: 'center' },
  backText: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: '#E8C872',
    fontWeight: '600',
  },
});
