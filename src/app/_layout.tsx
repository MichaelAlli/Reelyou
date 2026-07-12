import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ReelyouMotion } from '@/constants/animation';
import { CosmicTheme } from '@/constants/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: CosmicTheme.background },
          animation: 'fade',
          animationDuration: ReelyouMotion.screenTransition,
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="skywrite" options={{ presentation: 'modal' }} />
        <Stack.Screen name="starpath" />
        <Stack.Screen name="legacy" />
        <Stack.Screen name="orbit" />
        <Stack.Screen name="public-sky" />
        <Stack.Screen name="human-potential-map" />
      </Stack>
    </>
  );
}
