import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  OnboardingBackButton,
  OnboardingPrimaryButton,
  OnboardingScreenShell,
} from '@/components/onboarding';
import { FindFamiliarSkiesCopy } from '@/constants/findFamiliarSkiesCopy';
import { Fonts } from '@/constants/theme';
import { FindYourPeoplePanel } from '@/friendDiscovery/components/FindYourPeoplePanel';
import { useFriendDiscovery } from '@/friendDiscovery/FriendDiscoveryProvider';
import { useOnboarding } from '@/onboarding';

export function OnboardingFindFamiliarSkiesScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromSettings = from === 'settings';
  const { markStep } = useOnboarding();
  const { markFindYourPeopleSeen } = useFriendDiscovery();

  const finish = useCallback(
    (status: 'completed' | 'skipped') => {
      markFindYourPeopleSeen();
      if (!fromSettings) {
        markStep('findFamiliarSkies', status);
      }
      if (fromSettings) {
        router.back();
        return;
      }
      router.replace('/process' as never);
    },
    [fromSettings, markFindYourPeopleSeen, markStep, router],
  );

  return (
    <OnboardingScreenShell
      leadingAccessory={
        fromSettings ? (
          <OnboardingBackButton onPress={() => router.back()} />
        ) : (
          <OnboardingBackButton
            onPress={() => router.replace('/onboarding/where-you-live' as never)}
          />
        )
      }>
      <View style={styles.block}>
        <Text style={styles.title}>{FindFamiliarSkiesCopy.title}</Text>
        <Text style={styles.subtitle}>{FindFamiliarSkiesCopy.subtitle}</Text>

        <FindYourPeoplePanel showDiscoverability showDisconnect={fromSettings} />

        {!fromSettings ? (
          <>
            <OnboardingPrimaryButton
              label={FindFamiliarSkiesCopy.continue}
              onPress={() => finish('completed')}
            />
            <Pressable onPress={() => finish('skipped')} style={styles.skip}>
              <Text style={styles.skipText}>{FindFamiliarSkiesCopy.skip}</Text>
            </Pressable>
          </>
        ) : null}
      </View>
    </OnboardingScreenShell>
  );
}

const styles = StyleSheet.create({
  block: { gap: 14, paddingBottom: 24 },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    color: '#FFF8F0',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(248,244,236,0.78)',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  skip: { alignItems: 'center', paddingVertical: 8 },
  skipText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: 'rgba(235, 228, 248, 0.65)',
  },
});
