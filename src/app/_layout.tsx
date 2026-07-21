import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ReelyouMotion } from '@/constants/animation';
import { MaxContentWidth } from '@/constants/theme';
import { LOCKED_CINEMATIC_BACKGROUND } from '@/theme/types';

/**
 * Root shell — Splash and Welcome only.
 * ThemeProvider is mounted inside `(post-welcome)/_layout.tsx`.
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <View style={[styles.appFrame, { backgroundColor: LOCKED_CINEMATIC_BACKGROUND }]}>
          <View style={styles.appContent}>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: LOCKED_CINEMATIC_BACKGROUND },
                animation: 'fade',
                animationDuration: ReelyouMotion.screenTransition,
              }}>
              <Stack.Screen
                name="index"
                options={{ contentStyle: { backgroundColor: LOCKED_CINEMATIC_BACKGROUND } }}
              />
              <Stack.Screen
                name="welcome"
                options={{ contentStyle: { backgroundColor: LOCKED_CINEMATIC_BACKGROUND } }}
              />
              <Stack.Screen name="(post-welcome)" options={{ headerShown: false }} />
            </Stack>
          </View>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  appFrame: {
    flex: 1,
    ...(Platform.OS === 'web' ? { alignItems: 'center' as const } : null),
  },
  appContent: {
    flex: 1,
    width: '100%',
    ...(Platform.OS === 'web' ? { maxWidth: MaxContentWidth } : null),
  },
});
