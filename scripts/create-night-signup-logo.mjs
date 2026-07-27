import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const src = path.join(
  process.cwd(),
  'src/assets/branding/Splash Screen Reelyou Logo Transparent.png',
);
const dest = path.join(
  process.cwd(),
  'src/assets/branding/reelyou-logo-night-signup-eel-white-TEMP.png',
);

/** Wordmark band — EEL letter slices (E, E, L) only; R-text and YOU untouched. */
const EEL_X0 = 500;
const EEL_X1 = 638;
const EEL_Y0 = 462;
const EEL_Y1 = 598;

const png = PNG.sync.read(fs.readFileSync(src));
const { width, height, data } = png;

let changed = 0;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (x < EEL_X0 || x >= EEL_X1 || y < EEL_Y0 || y >= EEL_Y1) {
      continue;
    }

    const i = (width * y + x) << 2;
    const a = data[i + 3];
    if (a < 12) {
      continue;
    }

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Map gold letter pixels to white while preserving anti-aliased edge softness.
    const brightness = Math.max(r, g, b) / 255;
    const white = Math.round(255 * Math.min(1, brightness * 1.02));

    if (Math.abs(r - white) > 2 || Math.abs(g - white) > 2 || Math.abs(b - white) > 2) {
      data[i] = white;
      data[i + 1] = white;
      data[i + 2] = white;
      changed++;
    }
  }
}

fs.writeFileSync(dest, PNG.sync.write(png));
console.log(`Wrote ${dest}`);
console.log(`Pixels recolored: ${changed}`);
console.log(`Dimensions: ${width}x${height}`);
