import { Stack } from 'expo-router';

import { ReelyouMotion } from '@/constants/animation';
import { OnboardingProvider } from '@/onboarding';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: ReelyouMotion.screenTransition,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    />
  );
}
