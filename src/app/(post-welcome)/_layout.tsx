import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ReelyouMotion } from '@/constants/animation';
import { ThemeProvider, useTheme } from '@/theme';

/**
 * Post-Welcome navigation tree — the only place ThemeProvider is mounted.
 * Splash and Welcome live outside this group and never receive theme tokens.
 *
 * Routes are file-discovered under `(post-welcome)/`; do not register
 * short names here or Expo Router warns against the root `(post-welcome)` child.
 */
function PostWelcomeStack() {
  const { tokens } = useTheme();

  return (
    <>
      <StatusBar style={tokens.statusBarStyle} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: tokens.appBackground },
          animation: 'fade',
          animationDuration: ReelyouMotion.screenTransition,
        }}>
        <Stack.Screen name="skywrite" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function PostWelcomeLayout() {
  return (
    <ThemeProvider>
      <PostWelcomeStack />
    </ThemeProvider>
  );
}
