import assert from 'node:assert/strict';

import {
  resolveWelcomeForegroundTop,
  welcomeForegroundFitsViewport,
} from '@/constants/welcomeForegroundLayout';

const viewports = [
  { label: '390x844', height: 844 },
  { label: '393x852', height: 852 },
  { label: '430x932', height: 932 },
  { label: '375x667', height: 667 },
];

for (const { label, height } of viewports) {
  const top = resolveWelcomeForegroundTop({ height, topInset: 47 });
  assert.ok(top > 47, `${label}: foreground clears top inset`);
  assert.ok(
    welcomeForegroundFitsViewport(height),
    `${label}: hero + actions fit in viewport`,
  );
}

assert.ok(
  resolveWelcomeForegroundTop({ height: 844, topInset: 0 }) >
    resolveWelcomeForegroundTop({ height: 667, topInset: 0 }) * 0.9,
  'taller screens allow proportionally similar placement',
);

console.log('welcomeForegroundLayout.test.ts ok');
