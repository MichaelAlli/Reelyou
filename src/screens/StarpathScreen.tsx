import { useRouter } from 'expo-router';
import { StatusBar, StyleSheet, View } from 'react-native';

import { BottomNav } from '@/components/BottomNav';
import { StarPathScene } from '@/components/starpath/StarPathScene';
import { useOnboarding } from '@/onboarding';
import { StarPathExperienceProvider } from '@/starpath/StarPathExperienceProvider';
import { getStarPathTheme } from '@/starpath/starpathTheme';

export function StarpathScreen() {
  const router = useRouter();
  const theme = getStarPathTheme('night');
  const { todayFocus } = useOnboarding();

  return (
    <View style={[styles.root, { backgroundColor: theme.canvasDeep }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <StarPathExperienceProvider todayFocusText={todayFocus.value}>
        <StarPathScene visualMode="night" onNextStepPress={() => router.push('/skywrite')} />
      </StarPathExperienceProvider>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
