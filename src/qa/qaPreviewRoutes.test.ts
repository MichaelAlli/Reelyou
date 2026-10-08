import assert from 'node:assert/strict';

import { LEGACY_ONBOARDING_INTRO_MARKERS } from '@/auth/legacyOnboardingIntroCopy';
import { QA_PREVIEW_TARGETS, withQaPreviewHref } from './qaPreviewRoutes';

assert.ok(QA_PREVIEW_TARGETS.some((t) => t.href.includes('where-you-live')));
assert.ok(QA_PREVIEW_TARGETS.some((t) => t.id === 'sign-in'));

const splash = QA_PREVIEW_TARGETS.find((t) => t.id === 'splash');
assert.ok(splash, 'splash target exists');
assert.equal(splash!.href, '/qa/preview/splash', 'splash uses isolated preview route, not /');
assert.notEqual(splash!.href, '/', 'root / auto-advances away from splash');
assert.equal(withQaPreviewHref('/login'), '/login?qaPreview=1');
assert.equal(withQaPreviewHref('/home?preview=1'), '/home?preview=1&qaPreview=1');

for (const marker of LEGACY_ONBOARDING_INTRO_MARKERS) {
  const inCatalog = QA_PREVIEW_TARGETS.some(
    (t) => t.label.includes(marker) || t.description.includes(marker),
  );
  assert.equal(inCatalog, false, `legacy marker must not be in QA catalog: ${marker}`);
}

console.log('qaPreviewRoutes.test.ts ok');
