import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const filePath =
  process.argv[2] ||
  'C:/Users/micha/Downloads/Splash Screen Logo White letters Transparent.png';

const buf = fs.readFileSync(filePath);
const ext = path.extname(filePath).toLowerCase();
const baseName = path.basename(filePath);

function detectFormat(buffer) {
  if (buffer.length >= 8 && buffer.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'PNG';
  }
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xd8) return 'JPEG';
  if (buffer.length >= 12 && buffer.slice(0, 4).toString('ascii') === 'RIFF' && buffer.slice(8, 12).toString('ascii') === 'WEBP') {
    return 'WebP';
  }
  return 'Unknown';
}

const format = detectFormat(buf);
const signatureHex = buf.slice(0, 16).toString('hex').toUpperCase();

let mime = 'application/octet-stream';
if (format === 'PNG') mime = 'image/png';
else if (format === 'JPEG') mime = 'image/jpeg';
else if (format === 'WebP') mime = 'image/webp';

const report = {
  originalFilename: baseName,
  fileExtension: ext,
  actualFormat: format,
  mimeType: mime,
  pngSignatureValid: format === 'PNG',
  fileSizeBytes: buf.length,
  signatureHex,
};

if (format !== 'PNG') {
  console.log(JSON.stringify({ ...report, classification: 'C. NOT ACTUALLY A PNG' }, null, 2));
  process.exit(0);
}

const png = PNG.sync.read(buf);
const { width, height, data, colorType, bitDepth } = png;

let minAlpha = 255;
let maxAlpha = 0;
let alpha0 = 0;
let alphaPartial = 0;
let alphaFull = 0;
let opaqueBlack = 0;
let opaqueWhite = 0;
let opaqueGray = 0;
let checkerboardLike = 0;

const isCheckerboard = (r, g, b) =>
  (r === 204 && g === 204 && b === 204) ||
  (r === 255 && g === 255 && b === 255) ||
  (r === 192 && g === 192 && b === 192);

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (width * y + x) << 2;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    minAlpha = Math.min(minAlpha, a);
    maxAlpha = Math.max(maxAlpha, a);
    if (a === 0) alpha0++;
    else if (a < 255) alphaPartial++;
    else alphaFull++;
    if (a === 255 && r < 8 && g < 8 && b < 8) opaqueBlack++;
    if (a === 255 && r > 247 && g > 247 && b > 247) opaqueWhite++;
    if (a === 255 && Math.abs(r - g) < 6 && Math.abs(g - b) < 6 && r > 40 && r < 220) opaqueGray++;
    if (a === 255 && isCheckerboard(r, g, b)) checkerboardLike++;
  }
}

const total = width * height;
const sample = (x, y) => {
  const i = (width * y + x) << 2;
  return [data[i], data[i + 1], data[i + 2], data[i + 3]];
};

const corners = {
  topLeft: sample(0, 0),
  topRight: sample(width - 1, 0),
  bottomLeft: sample(0, height - 1),
  bottomRight: sample(width - 1, height - 1),
};

const edgeSamples = [];
for (let x = 0; x < width; x += Math.max(1, Math.floor(width / 8))) {
  edgeSamples.push({ pos: `top-${x}`, rgba: sample(x, 0) });
  edgeSamples.push({ pos: `bottom-${x}`, rgba: sample(x, height - 1) });
}
for (let y = 0; y < height; y += Math.max(1, Math.floor(height / 8))) {
  edgeSamples.push({ pos: `left-${y}`, rgba: sample(0, y) });
  edgeSamples.push({ pos: `right-${y}`, rgba: sample(width - 1, y) });
}

// Content bounds (non-transparent pixels)
let minX = width, minY = height, maxX = 0, maxY = 0;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const a = data[((width * y + x) << 2) + 3];
    if (a > 12) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
}

const padTop = minY;
const padBottom = height - 1 - maxY;
const padLeft = minX;
const padRight = width - 1 - maxX;
const croppedRisk = minX <= 2 || minY <= 2 || maxX >= width - 3 || maxY >= height - 3;

// Edge halo scan near content bounds
let whiteFringe = 0;
let blackFringe = 0;
let grayFringe = 0;
for (let y = Math.max(0, minY - 3); y <= Math.min(height - 1, maxY + 3); y++) {
  for (let x = Math.max(0, minX - 3); x <= Math.min(width - 1, maxX + 3); x++) {
    const i = (width * y + x) << 2;
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a === 0 || a === 255) {
      if (a > 0 && r > 240 && g > 240 && b > 240) whiteFringe++;
      if (a === 255 && r < 20 && g < 20 && b < 20) blackFringe++;
      if (a > 0 && a < 255 && Math.abs(r - g) < 10 && Math.abs(g - b) < 10) grayFringe++;
    }
  }
}

const transparentPct = (alpha0 / total) * 100;
const partialPct = (alphaPartial / total) * 100;
const opaquePct = (alphaFull / total) * 100;
const blackPct = (opaqueBlack / total) * 100;
const whitePct = (opaqueWhite / total) * 100;
const checkerPct = (checkerboardLike / total) * 100;

const colorMode =
  colorType === 6 ? 'RGBA' : colorType === 2 ? 'RGB' : colorType === 3 ? 'Indexed' : `Type ${colorType}`;

const hasTrueAlpha = colorType === 6 && minAlpha < 255 && transparentPct > 5;
const bakedBlackBox = corners.topLeft[3] === 255 && corners.topLeft.every((v, idx) => idx === 3 || v < 8) &&
  opaqueBlack > total * 0.3;
const bakedCheckerboard = checkerPct > 1;
const bakedSolidBackground = !hasTrueAlpha || bakedBlackBox || blackPct > 40 || whitePct > 40;

let classification = 'A. TRUE TRANSPARENT PNG — SAFE TO USE';
if (format !== 'PNG') classification = 'C. NOT ACTUALLY A PNG';
else if (!hasTrueAlpha || bakedSolidBackground) classification = bakedCheckerboard ? 'B. PNG FILE, BUT NOT TRULY TRANSPARENT' : 'B. PNG FILE, BUT NOT TRULY TRANSPARENT';
else if (croppedRisk || whiteFringe > 500 || blackFringe > 500) classification = 'D. TRANSPARENT PNG, BUT QUALITY OR CROPPING ISSUES REQUIRE REVIEW';

const retinaSuitable = width >= 512 && height >= 512 && transparentPct > 20;

console.log(
  JSON.stringify(
    {
      ...report,
      width,
      height,
      aspectRatio: +(width / height).toFixed(4),
      colorMode,
      pngColorType: colorType,
      bitDepth,
      alphaChannelPresent: colorType === 6,
      minAlpha,
      maxAlpha,
      transparentPixelPct: +transparentPct.toFixed(2),
      partialTransparentPixelPct: +partialPct.toFixed(2),
      fullyOpaquePixelPct: +opaquePct.toFixed(2),
      cornerRGBA: corners,
      edgeSamples: edgeSamples.slice(0, 16),
      opaqueBlackPct: +blackPct.toFixed(2),
      opaqueWhitePct: +whitePct.toFixed(2),
      checkerboardBakedPct: +checkerPct.toFixed(2),
      contentBounds: { minX, minY, maxX, maxY },
      transparentPadding: { padTop, padRight, padBottom, padLeft },
      croppedRisk,
      edgeQuality: { whiteFringe, blackFringe, grayFringe },
      retinaSuitable,
      checkerboardBackgroundDetected: bakedCheckerboard,
      solidBackgroundDetected: bakedSolidBackground,
      classification,
      safeToSaveAndUse: classification === 'A. TRUE TRANSPARENT PNG — SAFE TO USE',
    },
    null,
    2,
  ),
);
