import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const splash = readFileSync(join(process.cwd(), 'src/screens/SplashScreen.tsx'), 'utf8');
assert.match(splash, /SplashArtworkEmbeddedLoadingMask/, 'masks artwork-embedded loading copy');
assert.match(splash, /SplashLoadingFooter/, 'keeps live loading footer');
assert.equal(
  (splash.match(/LOADING YOUR JOURNEY/g) ?? []).length,
  0,
  'SplashScreen does not duplicate loading string inline',
);

const footer = readFileSync(
  join(process.cwd(), 'src/components/splash/SplashLoadingFooter.tsx'),
  'utf8',
);
assert.equal(
  (footer.match(/LOADING YOUR JOURNEY/g) ?? []).length,
  1,
  'single loading label in footer component',
);

console.log('splashLoadingLabel.test.ts ok');
