import assert from 'node:assert/strict';

import { shouldSplashAutoAdvance } from '@/screens/splashAutoAdvance';

assert.equal(
  shouldSplashAutoAdvance({ splashReviewMode: false, qaGalleryPreview: false }),
  true,
  'production splash auto-advances',
);
assert.equal(
  shouldSplashAutoAdvance({ splashReviewMode: false, qaGalleryPreview: true }),
  false,
  'QA gallery splash preview must not auto-advance',
);
assert.equal(
  shouldSplashAutoAdvance({ splashReviewMode: true, qaGalleryPreview: false }),
  false,
  'local review mode holds splash',
);

console.log('splashAutoAdvance.test.ts ok');
