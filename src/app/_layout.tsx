import 'react-native-gesture-handler';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeModeDevControl } from '@/components/dev/ThemeModeDevControl';
import { ReelyouMotion } from '@/constants/animation';
import { MaxContentWidth } from '@/constants/theme';
import { getRouteBackground, isLockedDarkRoute, ThemeProvider, useTheme } from '@/theme';
import { LOCKED_CINEMATIC_BACKGROUND } from '@/theme/types';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RootLayoutContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutContent() {
  const pathname = usePathname();
  const { tokens } = useTheme();
  const isLockedRoute = isLockedDarkRoute(pathname);
  const frameBackground = getRouteBackground(pathname, tokens.appBackground);
  const statusBarStyle = isLockedRoute ? 'light' : tokens.statusBarStyle;

  return (
    <View style={[styles.appFrame, { backgroundColor: frameBackground }]}>
      <View style={styles.appContent}>
        <StatusBar style={statusBarStyle} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: isLockedRoute ? LOCKED_CINEMATIC_BACKGROUND : tokens.appBackground },
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
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="skywrite" options={{ presentation: 'modal' }} />
          <Stack.Screen name="starpath" />
          <Stack.Screen name="legacy" />
          <Stack.Screen name="orbit" />
          <Stack.Screen name="public-sky" />
          <Stack.Screen name="human-potential-map" />
        </Stack>
        {!isLockedRoute && __DEV__ ? <ThemeModeDevControl /> : null}
      </View>
    </View>
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
