import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BottomNav } from '@/components/BottomNav';
import { resolveEmergingConstellationById } from '@/emergingConstellations/emergingConstellationFixtures';

/** Legacy route — community conversation lives on the main destination + post threads. */
export function EmergingConstellationChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const constellation = useMemo(() => resolveEmergingConstellationById(id ?? null), [id]);

  useEffect(() => {
    if (!constellation) return;
    router.replace(`/emerging-constellation?id=${encodeURIComponent(constellation.id)}` as never);
  }, [constellation, router]);

  return (
    <View style={styles.root}>
      <Text style={styles.unavailable}>Opening community...</Text>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070A' },
  unavailable: { textAlign: 'center', marginTop: 80, color: '#FFF8F0' },
});
