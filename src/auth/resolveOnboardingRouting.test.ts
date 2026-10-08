import assert from 'node:assert/strict';

import {
  resolveOnboardingRoutingStatus,
  routeForOnboardingRoutingStatus,
} from '@/auth/resolveOnboardingRouting';

function run() {
  assert.equal(
    resolveOnboardingRoutingStatus({
      authReady: false,
      isAuthenticated: true,
      userSessionHydrated: true,
      serverOnboardingComplete: true,
      localOnboardingComplete: false,
    }),
    'loading',
  );

  assert.equal(
    resolveOnboardingRoutingStatus({
      authReady: true,
      isAuthenticated: true,
      userSessionHydrated: false,
      serverOnboardingComplete: true,
      localOnboardingComplete: false,
    }),
    'loading',
  );

  assert.equal(
    resolveOnboardingRoutingStatus({
      authReady: true,
      isAuthenticated: true,
      userSessionHydrated: true,
      serverOnboardingComplete: true,
      localOnboardingComplete: false,
    }),
    'complete',
  );

  assert.equal(routeForOnboardingRoutingStatus('loading'), null);
  assert.equal(routeForOnboardingRoutingStatus('incomplete'), '/onboarding/profile');
  assert.equal(routeForOnboardingRoutingStatus('complete'), '/(tabs)/home');

  console.log('resolveOnboardingRouting.test.ts ok');
}

run();
