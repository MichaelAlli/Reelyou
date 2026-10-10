import assert from 'node:assert/strict';

import { welcomeNeedsScrollLayout } from '@/constants/welcomeForegroundLayout';

const viewports = [
  { label: 'iPhone 14', width: 390, height: 844 },
  { label: 'iPhone 14 reduced', width: 390, height: 700 },
  { label: 'Safari short chrome', width: 390, height: 650 },
  { label: 'iPhone 14 Pro', width: 393, height: 852 },
  { label: 'iPhone 14 Pro Max', width: 430, height: 932 },
  { label: 'iPhone SE', width: 375, height: 667 },
];

for (const vp of viewports) {
  const scroll = welcomeNeedsScrollLayout(vp.height);
  if (vp.height >= 933) {
    assert.ok(!scroll, `${vp.label}: tall viewport may use fixed layout at ${vp.height}px`);
  } else {
    assert.ok(scroll, `${vp.label}: phone-class viewport uses scroll shell at ${vp.height}px`);
  }
}

console.log('welcomeWebLayoutAcceptance.test.ts ok');
