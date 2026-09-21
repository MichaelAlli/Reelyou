import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { useOnboarding } from '@/onboarding';

/** Legacy route — always forward to canonical Focused Skywrite Sky arrival overlay. */
export function SkywriteToSkyScreen() {
  const router = useRouter();
  const { skyArrivalHandoff } = useOnboarding();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    if (skyArrivalHandoff?.skywriteStatus === 'animating') {
      router.replace('/skywrite' as never);
      return;
    }
    router.replace('/skywrite' as never);
  }, [router, skyArrivalHandoff?.skywriteStatus]);

  return <View style={styles.root} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#05070A',
  },
});
