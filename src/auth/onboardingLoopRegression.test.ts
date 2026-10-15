import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { EMPTY_ONBOARDING_STATE } from '@/onboarding/onboardingState';
import { resolvePostLoginRoute } from '@/auth/resolvePostLoginRoute';
import {
  persistedOnboardingCompleteFromFetches,
  resolveServerOnboardingCompleteForRouting,
} from '@/auth/resolveServerOnboardingComplete';
import { resolveOnboardingRoutingStatus } from '@/auth/resolveOnboardingRouting';

// TEST A/B: completed user (server true) → home
assert.equal(
  resolvePostLoginRoute(
    { isOnboardingComplete: false },
    true,
    { authReady: true, isAuthenticated: true, userSessionHydrated: true },
  ),
  '/(tabs)/home',
);

// TEST B: local complete even when auth session stale
assert.equal(
  resolvePostLoginRoute(
    { isOnboardingComplete: true },
    false,
    { authReady: true, isAuthenticated: true, userSessionHydrated: true },
  ),
  '/(tabs)/home',
);

// TEST D/E: unknown server status must not route to onboarding
assert.equal(
  resolveOnboardingRoutingStatus({
    authReady: true,
    isAuthenticated: true,
    userSessionHydrated: true,
    serverOnboardingComplete: null,
    localOnboardingComplete: false,
  }),
  'loading',
);
assert.equal(
  resolvePostLoginRoute(
    { isOnboardingComplete: false },
    null,
    { authReady: true, isAuthenticated: true, userSessionHydrated: true },
  ),
  null,
);

// TEST F: genuinely incomplete
assert.equal(
  resolvePostLoginRoute(
    { ...EMPTY_ONBOARDING_STATE, isOnboardingComplete: false },
    false,
    { authReady: true, isAuthenticated: true, userSessionHydrated: true },
  ),
  '/onboarding/profile',
);

// All steps done but Process never persisted isOnboardingComplete
assert.equal(
  resolvePostLoginRoute(
    {
      ...EMPTY_ONBOARDING_STATE,
      isOnboardingComplete: false,
      steps: {
        profile: 'completed',
        goals: 'completed',
        challenges: 'completed',
        screen4: 'completed',
        whereYouLive: 'completed',
        findFamiliarSkies: 'completed',
      },
    },
    false,
    { authReady: true, isAuthenticated: true, userSessionHydrated: true },
  ),
  '/(tabs)/home',
);

// Hydration: both fetches failed → unknown
assert.equal(
  persistedOnboardingCompleteFromFetches({
    serverProfileLoaded: false,
    remoteOnboardingLoaded: false,
  }),
  null,
);

assert.equal(
  resolveServerOnboardingCompleteForRouting(undefined, null),
  null,
);

// TEST G: QA fixture must not drive auth routing (sign-in skips redirect when qaPreview active)
const signInSource = readFileSync(join(process.cwd(), 'src/auth/useReelyouSignIn.ts'), 'utf8');
assert.match(signInSource, /!qaPreview\.active/, 'QA preview must not auto-redirect signed-in routing');
assert.match(signInSource, /persistedOnboardingComplete/, 'routing uses hydrated server completion');

const ownerProfileSource = readFileSync(
  join(process.cwd(), 'src/screens/OwnerProfileScreen.tsx'),
  'utf8',
);
assert.match(
  ownerProfileSource,
  /qaPreview\.active.*QA_OWNER_PROFILE_FIXTURE_ID/s,
  'dummy profile only under QA preview without session',
);
assert.match(ownerProfileSource, /resolveActiveUserId\(authUser\)/, 'real profile prefers auth user id');

const demoModeSource = readFileSync(join(process.cwd(), 'src/auth/demoMode.ts'), 'utf8');
assert.match(demoModeSource, /EXPO_PUBLIC_ENABLE_DEMO_MODE/, 'demo Michael requires explicit dev flag');

console.log('[onboardingLoopRegression.test] ok');
