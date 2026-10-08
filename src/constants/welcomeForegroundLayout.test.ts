import assert from 'node:assert/strict';

import {
  resolveWelcomeForegroundTop,
  resolveWelcomeLogoWidth,
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

assert.ok(resolveWelcomeLogoWidth(390, 844) <= 302, '844-class logo stays within reference scale');
assert.ok(resolveWelcomeLogoWidth(390, 667) <= 278, '667-class logo scales down');

console.log('welcomeForegroundLayout.test.ts ok');
