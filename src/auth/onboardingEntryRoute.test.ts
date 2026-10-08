import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { LEGACY_ONBOARDING_INTRO_MARKERS } from '@/auth/legacyOnboardingIntroCopy';
import { resolvePostLoginRoute } from '@/auth/resolvePostLoginRoute';
import {
  APPROVED_ONBOARDING_ENTRY_ROUTE,
  routeForOnboardingRoutingStatus,
} from '@/auth/resolveOnboardingRouting';

const here = dirname(fileURLToPath(import.meta.url));
const onboardingIndexRouteSource = readFileSync(
  join(here, '../app/(post-welcome)/onboarding/index.tsx'),
  'utf8',
);

assert.equal(routeForOnboardingRoutingStatus('incomplete'), APPROVED_ONBOARDING_ENTRY_ROUTE);
assert.equal(routeForOnboardingRoutingStatus('complete'), '/(tabs)/home');

assert.equal(
  resolvePostLoginRoute(
    { isOnboardingComplete: true },
    false,
    { authReady: true, isAuthenticated: true, userSessionHydrated: true },
  ),
  '/(tabs)/home',
);

assert.equal(
  resolvePostLoginRoute(
    { isOnboardingComplete: false },
    false,
    { authReady: true, isAuthenticated: true, userSessionHydrated: true },
  ),
  APPROVED_ONBOARDING_ENTRY_ROUTE,
);

assert.equal(
  resolvePostLoginRoute(
    { isOnboardingComplete: false },
    true,
    { authReady: true, isAuthenticated: true, userSessionHydrated: true },
  ),
  '/(tabs)/home',
);

for (const marker of LEGACY_ONBOARDING_INTRO_MARKERS) {
  assert.ok(
    !onboardingIndexRouteSource.includes(marker),
    `legacy marker must not appear in onboarding index route: ${marker}`,
  );
}

assert.ok(
  onboardingIndexRouteSource.includes('Redirect'),
  'onboarding index must redirect rather than render legacy UI',
);

console.log('onboardingEntryRoute.test.ts ok');
