import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { ReelyouMotion } from '@/constants/animation';
import { ONBOARDING_SHARED_BACKGROUND } from '@/constants/onboardingAssets';
import { ReelyouConnectProvider } from '@/connect/ReelyouConnectProvider';
import { OnboardingProvider } from '@/onboarding';
import { SkyAreaPreferencesProvider } from '@/skyAreas/SkyAreaPreferencesProvider';
import { SkywriteBeaconProvider } from '@/skywrite/beacon/SkywriteBeaconProvider';
import { SkywriteLibraryProvider } from '@/skywrite/library/SkywriteLibraryProvider';
import { HumanPotentialMetricsProvider } from '@/humanPotential/HumanPotentialMetricsProvider';
import { EmergingConstellationsProvider } from '@/emergingConstellations/EmergingConstellationsProvider';
import { LegacyProvider } from '@/legacy/LegacyProvider';
import { SavedThreadsProvider } from '@/skywrite/savedThreads/SavedThreadsProvider';
import { TodayFocusRecommendationsProvider } from '@/todayFocus/recommendations/TodayFocusRecommendationsProvider';
import { SkywriteThreadProvider } from '@/skywrite/threads/SkywriteThreadProvider';
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
        <Stack.Screen
          name="skywrite"
          options={
            Platform.OS === 'web'
              ? { presentation: 'card', animation: 'fade' }
              : { presentation: 'modal' }
          }
        />
        <Stack.Screen
          name="skywrite/compose"
          options={
            Platform.OS === 'web'
              ? { presentation: 'card', animation: 'fade' }
              : { presentation: 'modal' }
          }
        />
        <Stack.Screen
          name="skywrite/[id]"
          options={
            Platform.OS === 'web'
              ? { presentation: 'card', animation: 'fade' }
              : { presentation: 'modal' }
          }
        />
        <Stack.Screen
          name="skywrite/saved/[savedThreadId]"
          options={
            Platform.OS === 'web'
              ? { presentation: 'card', animation: 'fade' }
              : { presentation: 'modal' }
          }
        />
        <Stack.Screen name="my-sky-star/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="skywrite-to-sky" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="my-sky-arrival" options={{ animation: 'fade' }} />
        <Stack.Screen name="today-focus-edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="today-focus-reflection" options={{ presentation: 'modal' }} />
        <Stack.Screen name="today-focus" options={{ animation: 'fade' }} />
        <Stack.Screen name="visitor-skywritings" options={{ animation: 'fade' }} />
        <Stack.Screen name="growth-area/[id]" options={{ animation: 'fade' }} />
        <Stack.Screen name="emerging-constellation" options={{ animation: 'fade' }} />
        <Stack.Screen name="companion" options={{ presentation: 'modal' }} />
        <Stack.Screen name="process" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="visitor-profile" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="legacy/reel-you"
          options={{ animation: 'fade', presentation: 'fullScreenModal' }}
        />
      </Stack>
    </>
  );
}

export default function PostWelcomeLayout() {
  return (
    <ThemeProvider>
      <OnboardingProvider>
        <SkyAreaPreferencesProvider>
          <SkywriteLibraryProvider>
            <SkywriteBeaconProvider>
              <SkywriteThreadProvider>
                <ReelyouConnectProvider>
                  <SavedThreadsProvider>
                    <TodayFocusRecommendationsProvider>
                      <HumanPotentialMetricsProvider>
                        <LegacyProvider>
                          <EmergingConstellationsProvider>
                            <PostWelcomeStack />
                          </EmergingConstellationsProvider>
                        </LegacyProvider>
                      </HumanPotentialMetricsProvider>
                    </TodayFocusRecommendationsProvider>
                  </SavedThreadsProvider>
                </ReelyouConnectProvider>
              </SkywriteThreadProvider>
            </SkywriteBeaconProvider>
          </SkywriteLibraryProvider>
        </SkyAreaPreferencesProvider>
      </OnboardingProvider>
    </ThemeProvider>
  );
}
