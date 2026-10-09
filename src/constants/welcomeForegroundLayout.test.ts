import assert from 'node:assert/strict';

import {
  resolveWelcomeActionsReserve,
  resolveWelcomeHeroOpticalOffset,
  resolveWelcomeLogoWidth,
  welcomeForegroundFitsViewport,
} from '@/constants/welcomeForegroundLayout';

const viewports = [
  { label: '390x844', width: 390, height: 844 },
  { label: '430x932', width: 430, height: 932 },
  { label: '393x852', width: 393, height: 852 },
];

for (const { label, width, height } of viewports) {
  assert.ok(welcomeForegroundFitsViewport(height), `${label}: hero + actions fit in viewport`);
  assert.ok(
    resolveWelcomeHeroOpticalOffset(height) > 0,
    `${label}: optical offset nudges hero into ring`,
  );
  assert.ok(
    resolveWelcomeActionsReserve(height) >= 172,
    `${label}: reserves space for CTAs`,
  );
  assert.ok(resolveWelcomeLogoWidth(width, height) <= 302, `${label}: logo scale unchanged`);
}

console.log('welcomeForegroundLayout.test.ts ok');
