import assert from 'node:assert/strict';

import {
  buildMySkyPreviewHref,
  expectedMySkyExploreEnabledForTarget,
  QA_SKY_LANDING_QUERY,
} from '@/qa/qaPreviewLandingParams';
import { QA_PREVIEW_TARGETS, withQaPreviewHref } from '@/qa/qaPreviewRoutes';
import { resolveMySkyExploreLandingFromParams } from '@/mySky/mySkyTabLanding';

for (const target of QA_PREVIEW_TARGETS) {
  const expectedExplore = expectedMySkyExploreEnabledForTarget(target.id);
  if (expectedExplore === true) {
    assert.match(
      target.href,
      new RegExp(`${QA_SKY_LANDING_QUERY}=explore`),
      `${target.id} must declare Explore landing in catalog href`,
    );
  }
  if (expectedExplore === false) {
    assert.match(target.href, /personal=1/, `${target.id} must declare personal landing`);
  }
}

const exploreHref = withQaPreviewHref(buildMySkyPreviewHref('explore'));
assert.match(exploreHref, /qaPreview=1/);
assert.match(exploreHref, /qaSkyLanding=explore/);

assert.equal(
  resolveMySkyExploreLandingFromParams({ qaSkyLanding: 'explore' }, { qaPreviewActive: true }),
  'explore',
);
assert.equal(
  resolveMySkyExploreLandingFromParams({ personal: '1' }, { qaPreviewActive: true }),
  'personal',
);

const mySky = QA_PREVIEW_TARGETS.find((t) => t.id === 'my-sky');
assert.ok(mySky);
assert.notEqual(mySky!.href, '/sky', 'My Sky QA must not use bare /sky (stale session state)');

console.log('[qaGalleryLandingRegression.test] ok');
