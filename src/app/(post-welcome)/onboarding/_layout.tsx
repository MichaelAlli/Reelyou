import { Asset } from 'expo-asset';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { ReelyouMotion } from '@/constants/animation';
import { ONBOARDING_SHARED_BACKGROUND } from '@/constants/onboardingAssets';
import { OnboardingProvider } from '@/onboarding';

export default function OnboardingLayout() {
  useEffect(() => {
    void Asset.fromModule(ONBOARDING_SHARED_BACKGROUND).downloadAsync();
  }, []);

  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: ReelyouMotion.screenTransition,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
    </OnboardingProvider>
  );
}
