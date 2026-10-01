import assert from 'node:assert/strict';

import { withSkyreelReturnTo } from '@/skywrite/play/skyreelNavigation';

const path = withSkyreelReturnTo('/skywrite/play?scope=focused&autoplay=1', '/my-sky');
assert.ok(path.includes('returnTo='), 'includes returnTo query');
assert.ok(path.includes(encodeURIComponent('/my-sky')), 'encodes return href');

console.log('skyreelNavigation.test.ts — OK');
