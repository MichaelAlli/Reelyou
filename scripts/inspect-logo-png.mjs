import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const candidates = [
  'C:/Users/micha/.cursor/projects/c-Users-micha-OneDrive-Desktop-REELYOU/assets/c__Users_micha_AppData_Roaming_Cursor_User_workspaceStorage_a4cb8db0f47553862b62d487c127ddee_images_Splash_Screen_Logo_White_letters_Transparent-0a8bd222-2c3c-43d6-9e56-a93b4a758253.png',
  path.join(process.cwd(), 'src/assets/branding/reelyou-logo-night-signup-eel-white-TEMP.png'),
  path.join(process.cwd(), 'src/assets/branding/Splash Screen Reelyou Logo Transparent.png'),
];

function inspect(file) {
  if (!fs.existsSync(file)) {
    console.log(`MISSING: ${file}`);
    return;
  }

  const buf = fs.readFileSync(file);
  const sig = buf.slice(0, 8).toString('hex');
  const isPng = sig.startsWith('89504e470d0a1a0a');
  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8;

  console.log(`\nFILE: ${file}`);
  console.log(`  bytes: ${buf.length}`);
  console.log(`  signature: ${sig}`);
  console.log(`  valid PNG: ${isPng}`);
  console.log(`  JPEG disguised: ${isJpeg}`);

  if (!isPng) return;

  const png = PNG.sync.read(buf);
  const { width, height, data } = png;
  console.log(`  dimensions: ${width}x${height}`);
  console.log(`  colorType: ${png.colorType} (6=RGBA)`);

  const corners = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ];

  let transparentCorners = 0;
  let opaqueBlackCorners = 0;
  for (const [x, y] of corners) {
    const i = (width * y + x) << 2;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    console.log(`  corner (${x},${y}): rgba(${r},${g},${b},${a})`);
    if (a < 250) transparentCorners++;
    if (a === 255 && r < 10 && g < 10 && b < 10) opaqueBlackCorners++;
  }

  let alpha0 = 0;
  let alphaPartial = 0;
  let alphaFull = 0;
  let blackOpaque = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (width * y + x) << 2;
      const a = data[i + 3];
      if (a === 0) alpha0++;
      else if (a < 255) alphaPartial++;
      else alphaFull++;
      if (a === 255 && data[i] < 8 && data[i + 1] < 8 && data[i + 2] < 8) blackOpaque++;
    }
  }

  const total = width * height;
  console.log(`  alpha=0: ${((alpha0 / total) * 100).toFixed(1)}%`);
  console.log(`  alpha partial: ${((alphaPartial / total) * 100).toFixed(1)}%`);
  console.log(`  alpha=255: ${((alphaFull / total) * 100).toFixed(1)}%`);
  console.log(`  opaque black pixels: ${((blackOpaque / total) * 100).toFixed(1)}%`);
  console.log(`  transparent corners: ${transparentCorners}/4`);
  console.log(`  opaque black corners: ${opaqueBlackCorners}/4`);
  console.log(`  true alpha channel: ${png.colorType === 6}`);
  console.log(`  genuine transparency: ${transparentCorners >= 3 && alpha0 > total * 0.3}`);
  console.log(`  baked black box risk: ${opaqueBlackCorners >= 3 || blackOpaque > total * 0.5}`);
}

for (const file of candidates) inspect(file);
