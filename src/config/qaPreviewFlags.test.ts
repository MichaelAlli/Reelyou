import assert from 'node:assert/strict';

import {
  isQaPreviewGalleryAllowed,
  isQaPreviewQueryActive,
  isQaPreviewSessionAllowed,
} from './qaPreviewFlags';

assert.equal(isQaPreviewGalleryAllowed(null), true);
assert.equal(isQaPreviewGalleryAllowed('any@example.com'), true);
assert.equal(isQaPreviewSessionAllowed(null), true);
assert.equal(isQaPreviewQueryActive('1'), true);
assert.equal(isQaPreviewQueryActive(undefined), false);
assert.equal(isQaPreviewQueryActive('0'), false);

console.log('qaPreviewFlags.test.ts ok');
