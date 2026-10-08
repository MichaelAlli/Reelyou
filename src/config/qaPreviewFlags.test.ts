import assert from 'node:assert/strict';

import {
  isQaPreviewFeatureEnabled,
  isQaPreviewGalleryAllowed,
} from './qaPreviewFlags';

const env = process.env;

function withEnv(overrides: Record<string, string | undefined>, fn: () => void) {
  const snapshot = { ...env };
  Object.assign(process.env, overrides);
  try {
    fn();
  } finally {
    for (const key of Object.keys(process.env)) {
      if (!(key in snapshot)) {
        delete process.env[key];
      }
    }
    Object.assign(process.env, snapshot);
  }
}

withEnv({ EXPO_PUBLIC_ENABLE_QA_PREVIEW: undefined }, () => {
  assert.equal(isQaPreviewFeatureEnabled(), false);
  assert.equal(isQaPreviewGalleryAllowed('test@example.com'), false);
});

withEnv(
  {
    EXPO_PUBLIC_ENABLE_QA_PREVIEW: '1',
    EXPO_PUBLIC_QA_PREVIEW_ALLOWLIST: 'qa@reelyou.com, Admin@Example.com ',
  },
  () => {
    assert.equal(isQaPreviewFeatureEnabled(), true);
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      assert.equal(isQaPreviewGalleryAllowed(null), true);
    } else {
      assert.equal(isQaPreviewGalleryAllowed('qa@reelyou.com'), true);
      assert.equal(isQaPreviewGalleryAllowed('admin@example.com'), true);
      assert.equal(isQaPreviewGalleryAllowed('other@example.com'), false);
      assert.equal(isQaPreviewGalleryAllowed(null), false);
    }
  },
);

console.log('qaPreviewFlags.test.ts ok');
