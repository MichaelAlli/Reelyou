import type { ReactNode } from 'react';

import { ReelyouConnectProvider } from '@/connect/ReelyouConnectProvider';
import { UserAvatarProvider } from '@/identity/UserAvatarProvider';
import { EmergingConstellationsProvider } from '@/emergingConstellations/EmergingConstellationsProvider';
import { HumanPotentialMetricsProvider } from '@/humanPotential/HumanPotentialMetricsProvider';
import { LegacyProvider } from '@/legacy/LegacyProvider';
import { OnboardingProvider } from '@/onboarding';
import { SkyAreaPreferencesProvider } from '@/skyAreas/SkyAreaPreferencesProvider';
import { SkywriteBeaconProvider } from '@/skywrite/beacon/SkywriteBeaconProvider';
import { SkywriteLibraryProvider } from '@/skywrite/library/SkywriteLibraryProvider';
import { SavedThreadsProvider } from '@/skywrite/savedThreads/SavedThreadsProvider';
import { SkywriteCommentProvider } from '@/skywrite/comments/SkywriteCommentProvider';
import { SkywriteThreadProvider } from '@/skywrite/threads/SkywriteThreadProvider';
import { TodayFocusRecommendationsProvider } from '@/todayFocus/recommendations/TodayFocusRecommendationsProvider';
import { ThemeProvider } from '@/theme';

/**
 * Canonical post-welcome provider stack — order follows hook dependencies only.
 *
 * ReelyouConnect → Onboarding, SkywriteBeacon, SkywriteThreads
 * EmergingConstellations → ReelyouConnect
 * TodayFocusRecommendations → Onboarding, SavedThreads, SkywriteThreads, HumanPotentialMetrics, ReelyouConnect, SkywriteLibrary
 * Legacy → HumanPotentialMetrics, SkywriteThreads, SavedThreads, Onboarding, SkywriteLibrary, ReelyouConnect
 */
export function PostWelcomeProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <OnboardingProvider>
        <UserAvatarProvider>
        <SkyAreaPreferencesProvider>
          <SkywriteLibraryProvider>
            <SkywriteBeaconProvider>
              <SkywriteThreadProvider>
                <ReelyouConnectProvider>
                  <SkywriteCommentProvider>
                    <EmergingConstellationsProvider>
                      <SavedThreadsProvider>
                        <HumanPotentialMetricsProvider>
                          <TodayFocusRecommendationsProvider>
                            <LegacyProvider>{children}</LegacyProvider>
                          </TodayFocusRecommendationsProvider>
                        </HumanPotentialMetricsProvider>
                      </SavedThreadsProvider>
                    </EmergingConstellationsProvider>
                  </SkywriteCommentProvider>
                </ReelyouConnectProvider>
              </SkywriteThreadProvider>
            </SkywriteBeaconProvider>
          </SkywriteLibraryProvider>
        </SkyAreaPreferencesProvider>
        </UserAvatarProvider>
      </OnboardingProvider>
    </ThemeProvider>
  );
}
