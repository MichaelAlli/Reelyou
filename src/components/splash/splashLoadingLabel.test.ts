import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const splash = readFileSync(join(process.cwd(), 'src/screens/SplashScreen.tsx'), 'utf8');
assert.match(
  splash,
  /SPLASH_APPROVED_ARTWORK_INCLUDES_LOADING_LABEL/,
  'splash uses artwork loading label flag',
);
assert.match(splash, /showLabel=\{!SPLASH_APPROVED_ARTWORK_INCLUDES_LOADING_LABEL\}/);
assert.doesNotMatch(splash, /SplashArtworkEmbeddedLoadingMask/, 'no gradient mask overlay');

const assets = readFileSync(join(process.cwd(), 'src/constants/splashAssets.ts'), 'utf8');
assert.match(assets, /SPLASH_APPROVED_ARTWORK_INCLUDES_LOADING_LABEL = true/);

const footer = readFileSync(
  join(process.cwd(), 'src/components/splash/SplashLoadingFooter.tsx'),
  'utf8',
);
assert.equal(
  (footer.match(/LOADING YOUR JOURNEY/g) ?? []).length,
  1,
  'loading copy defined once in footer (hidden when artwork includes label)',
);

console.log('splashLoadingLabel.test.ts ok');
