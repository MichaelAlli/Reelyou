import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { WELCOME_DESIGN_LOCK } from '@/constants/welcomeDesignLock';
import { WelcomeCopy } from '@/constants/welcome';

const root = process.cwd();
const welcomePath = join(root, 'src/screens/WelcomeScreen.tsx');
const welcomeCopyPath = join(root, 'src/constants/welcome.ts');
const welcome = readFileSync(welcomePath, 'utf8');
const welcomeCopyFile = readFileSync(welcomeCopyPath, 'utf8');
const branding = readFileSync(join(root, 'src/constants/branding.ts'), 'utf8');
const welcomeLayout = readFileSync(join(root, 'src/constants/welcomeForegroundLayout.ts'), 'utf8');

assert.equal(WELCOME_DESIGN_LOCK.status, 'LOCKED');

assert.match(welcome, /DESIGN LOCKED/, 'WelcomeScreen documents design lock');
assert.doesNotMatch(welcome, /useThemedStyles|useTheme\(/, 'Welcome must not use global theme hooks');
assert.doesNotMatch(welcome, /authWelcomeWebViewportStyle|useLayoutViewportSize/, 'No experimental viewport shell');
assert.match(welcome, /heroCenterRegion/, 'Approved hero-center composition');
assert.match(welcome, /webAllowVerticalScroll/, 'Safari scroll escape hatch preserved');
assert.match(welcome, /WelcomeCopy\.primaryCta/, 'Primary CTA wired from locked copy');
assert.match(welcome, /WelcomeCopy\.signInCta/, 'Sign In wired from locked copy');
assert.match(welcomeCopyFile, /START YOUR JOURNEY/, 'Primary CTA copy locked');
assert.match(welcomeCopyFile, /SIGN IN/, 'Sign In copy locked');
assert.match(welcome, /BrandingAssets\.welcomeLogoWhiteTaglineCropped/, 'Approved Welcome logo asset');
assert.match(welcome, /BrandingAssets\.welcomeBackground/, 'Approved Welcome background');
assert.match(branding, /welcomeLogoWhiteTaglineCropped/, 'Branding registry includes Welcome logo');

assert.match(welcomeLayout, /resolveWelcomeHeroOpticalOffset/, 'Constellation-ring optical offset preserved');

for (const viewport of ['iphone-14', 'iphone-14-pro-max', 'desktop']) {
  const baseline = join(root, WELCOME_DESIGN_LOCK.visualBaselineDir, `${viewport}.png`);
  assert.ok(existsSync(baseline), `Visual baseline missing: ${baseline}`);
}

console.log('welcomeDesignLock.test.ts ok');
