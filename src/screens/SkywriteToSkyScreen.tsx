import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SkywriteToSkyTransition } from '@/components/my-sky/SkywriteToSkyTransition';
import { useOnboarding } from '@/onboarding';

export function SkywriteToSkyScreen() {
  const router = useRouter();
  const { skyArrivalHandoff, setSkyArrivalHandoff } = useOnboarding();

  useEffect(() => {
    if (!skyArrivalHandoff) {
      router.replace('/(tabs)/sky' as never);
    }
  }, [router, skyArrivalHandoff]);

  const handleComplete = useCallback(() => {
    if (skyArrivalHandoff) {
      setSkyArrivalHandoff({
        ...skyArrivalHandoff,
        skywriteStatus: 'settled',
      });
    }
    router.replace('/my-sky-arrival' as never);
  }, [router, setSkyArrivalHandoff, skyArrivalHandoff]);

  if (!skyArrivalHandoff) {
    return null;
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <SkywriteToSkyTransition onComplete={handleComplete} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#05070A',
  },
  safe: {
    flex: 1,
  },
});
