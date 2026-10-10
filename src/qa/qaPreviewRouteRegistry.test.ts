import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import { QA_PREVIEW_TARGETS } from '@/qa/qaPreviewRoutes';

const ids = new Set<string>();
for (const target of QA_PREVIEW_TARGETS) {
  assert.ok(!ids.has(target.id), `duplicate QA id: ${target.id}`);
  ids.add(target.id);
  assert.ok(target.href.startsWith('/'), `href must be absolute: ${target.id}`);
  assert.ok(!target.href.includes('/onboarding/index'), `avoid generic onboarding index: ${target.id}`);
}

const onboardingDir = join(process.cwd(), 'src/app/(post-welcome)/onboarding');
const onboardingFiles = readdirSync(onboardingDir)
  .filter((name) => name.endsWith('.tsx') && name !== '_layout.tsx' && name !== 'index.tsx')
  .map((name) => `/onboarding/${name.replace(/\.tsx$/, '')}`);

/** App routes that redirect to a different QA preview target. */
const ONBOARDING_QA_HREF_ALIASES: Record<string, string> = {
  '/onboarding/starpath': '/process',
};

const onboardingTargets = QA_PREVIEW_TARGETS.filter((t) => t.section === 'onboarding');
for (const route of onboardingFiles) {
  const expectedHref = ONBOARDING_QA_HREF_ALIASES[route] ?? route;
  const match = onboardingTargets.find((t) => t.href.split('?')[0] === expectedHref);
  assert.ok(match, `QA catalog missing onboarding route: ${route} → ${expectedHref}`);
}

const whereYouLive = QA_PREVIEW_TARGETS.find((t) => t.id === 'onboarding-where-you-live');
assert.equal(whereYouLive?.href, '/onboarding/where-you-live');

const splash = QA_PREVIEW_TARGETS.find((t) => t.id === 'splash');
assert.equal(splash?.href, '/qa/preview/splash');

const starpathIntro = QA_PREVIEW_TARGETS.find((t) => t.id === 'onboarding-starpath');
assert.equal(starpathIntro?.href, '/process');

console.log('qaPreviewRouteRegistry.test.ts ok');
