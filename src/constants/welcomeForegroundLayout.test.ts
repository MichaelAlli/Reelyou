import assert from 'node:assert/strict';

import {
  resolveWelcomeActionsReserve,
  resolveWelcomeContentScale,
  resolveWelcomeEffectiveViewportHeight,
  resolveWelcomeLogoWidth,
  welcomeActionsFitInEffectiveViewport,
  welcomeForegroundFitsViewport,
  welcomeNeedsScrollLayout,
} from '@/constants/welcomeForegroundLayout';

const iPhone14 = { width: 390, height: 844 };

assert.ok(
  welcomeActionsFitInEffectiveViewport(iPhone14.height),
  'iPhone 14 class fits both CTAs in effective viewport (with chrome reserve)',
);
assert.ok(
  !welcomeNeedsScrollLayout(iPhone14.height),
  'iPhone 14 class uses non-scroll layout when foreground fits',
);
if (typeof document !== 'undefined') {
  assert.ok(
    resolveWelcomeEffectiveViewportHeight(iPhone14.height) < iPhone14.height,
    'web chrome reserve reduces effective height',
  );
}
assert.ok(
  resolveWelcomeContentScale(iPhone14.height) <= 1,
  'content scale never enlarges approved design',
);
assert.ok(resolveWelcomeLogoWidth(iPhone14.width, iPhone14.height) > 0);

for (const height of [844, 852, 932, 667]) {
  const reserve = resolveWelcomeActionsReserve(height);
  assert.ok(reserve >= 176, `${height}: reserves CTA band`);
}

console.log('welcomeForegroundLayout.test.ts ok');
