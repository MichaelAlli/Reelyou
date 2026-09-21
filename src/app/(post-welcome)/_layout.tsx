import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { ReelyouMotion } from '@/constants/animation';
import { ONBOARDING_SHARED_BACKGROUND } from '@/constants/onboardingAssets';
import { ReelyouConnectProvider } from '@/connect/ReelyouConnectProvider';
import { OnboardingProvider } from '@/onboarding';
import { ThemeProvider, useTheme } from '@/theme';
import { Asset } from 'expo-asset';

/**
 * Post-Welcome navigation tree — the only place ThemeProvider is mounted.
 * Splash and Welcome live outside this group and never receive theme tokens.
 *
 * Routes are file-discovered under `(post-welcome)/`; do not register
 * short names here or Expo Router warns against the root `(post-welcome)` child.
 */
function PostWelcomeStack() {
  const { tokens } = useTheme();

  useEffect(() => {
    void Asset.fromModule(ONBOARDING_SHARED_BACKGROUND).downloadAsync();
  }, []);

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
        <Stack.Screen name="skywrite/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="my-sky-star/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="skywrite-to-sky" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="my-sky-arrival" options={{ animation: 'fade' }} />
        <Stack.Screen name="today-focus-edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="today-focus-reflection" options={{ presentation: 'modal' }} />
        <Stack.Screen name="companion" options={{ presentation: 'modal' }} />
        <Stack.Screen name="process" options={{ animation: 'fade', gestureEnabled: false }} />
      </Stack>
    </>
  );
}

export default function PostWelcomeLayout() {
  return (
    <ThemeProvider>
      <OnboardingProvider>
        <ReelyouConnectProvider>
          <PostWelcomeStack />
        </ReelyouConnectProvider>
      </OnboardingProvider>
    </ThemeProvider>
  );
}
