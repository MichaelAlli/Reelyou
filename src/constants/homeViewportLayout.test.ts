import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { HomeLayout, measureHomeContentWidth } from '@/constants/homeLayout';

const root = process.cwd();
const topNavSource = readFileSync(
  join(root, 'src/components/home/HomeTopNav.tsx'),
  'utf8',
);

const slot = HomeLayout.iconCircleSm;
assert.ok(slot < 44, 'Home nav slot must stay smaller than 44pt touch target (hitSlop expands taps)');

assert.doesNotMatch(
  topNavSource,
  /iconBtn:[\s\S]*minWidth:\s*44/,
  'HomeTopNav iconBtn must not force 44px min width inside 38px slots (causes horizontal overflow)',
);

const content390 = measureHomeContentWidth(390);
assert.equal(content390, 350, '390px screen uses 20px horizontal padding');

console.log('homeViewportLayout.test.ts ok');
