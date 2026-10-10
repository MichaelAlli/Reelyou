/**
 * Welcome Screen visual regression — screenshot compare vs locked baselines.
 *
 * Prereq: static web preview serving the app (e.g. `npm run web` or `npx serve dist`).
 *
 *   WELCOME_PREVIEW_URL=http://127.0.0.1:8090/welcome?qaPreview=1 npm run test:welcome-visual
 *   UPDATE_WELCOME_BASELINE=1 ...  # explicit baseline refresh only
 */
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASELINE_DIR = join(__dirname, '../test/visual-baselines/welcome');
const UPDATE = process.env.UPDATE_WELCOME_BASELINE === '1';
const URL = process.env.WELCOME_PREVIEW_URL ?? 'http://127.0.0.1:8090/welcome?qaPreview=1';
const MAX_DIFF_RATIO = 0.002;

const VIEWPORTS = [
  { id: 'iphone-14', width: 390, height: 844 },
  { id: 'iphone-14-pro-max', width: 430, height: 932 },
  { id: 'desktop', width: 1280, height: 800 },
];

function loadPng(path) {
  return PNG.sync.read(readFileSync(path));
}

function assertCtasVisible(metrics) {
  if (!metrics.primary?.visible || !metrics.signIn?.visible) {
    throw new Error(
      `CTAs not fully visible: primary=${JSON.stringify(metrics.primary)} signIn=${JSON.stringify(metrics.signIn)}`,
    );
  }
  if (metrics.signIn.bottom > metrics.vh + 2) {
    throw new Error(`SIGN IN below viewport: bottom=${metrics.signIn.bottom} vh=${metrics.vh}`);
  }
}

async function captureMetrics(page) {
  return page.evaluate(() => {
    const buttons = [...document.querySelectorAll('[role="button"]')];
    const find = (label) => {
      const el = buttons.find((b) => b.textContent?.includes(label));
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      return {
        top: r.top,
        bottom: r.bottom,
        visible: r.top >= 0 && r.bottom <= vh + 1,
      };
    };
    return {
      vh: window.innerHeight,
      vw: window.innerWidth,
      primary: find('START YOUR JOURNEY'),
      signIn: find('SIGN IN'),
    };
  });
}

async function runViewport(browser, viewport) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForSelector('[role="button"]', { timeout: 60000 });
  await page.waitForTimeout(1500);

  const metrics = await captureMetrics(page);
  assertCtasVisible(metrics);

  const shot = await page.screenshot({ type: 'png', fullPage: false });
  await page.close();

  const baselinePath = join(BASELINE_DIR, `${viewport.id}.png`);
  mkdirSync(BASELINE_DIR, { recursive: true });

  if (UPDATE || !existsSync(baselinePath)) {
    if (!UPDATE && !existsSync(baselinePath)) {
      writeFileSync(baselinePath, shot);
      return { id: viewport.id, pass: true, note: 'baseline created (first run)' };
    }
    writeFileSync(baselinePath, shot);
    return { id: viewport.id, pass: true, note: 'baseline updated' };
  }

  const img1 = loadPng(baselinePath);
  const img2 = PNG.sync.read(shot);
  if (img1.width !== img2.width || img1.height !== img2.height) {
    return {
      id: viewport.id,
      pass: false,
      error: `size mismatch baseline=${img1.width}x${img1.height} actual=${img2.width}x${img2.height}`,
    };
  }

  const diff = new PNG({ width: img1.width, height: img1.height });
  const diffPixels = pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, {
    threshold: 0.12,
    includeAA: true,
  });
  const ratio = diffPixels / (img1.width * img1.height);
  const pass = ratio <= MAX_DIFF_RATIO;
  return {
    id: viewport.id,
    pass,
    diffPixels,
    diffRatio: ratio,
    maxDiffRatio: MAX_DIFF_RATIO,
  };
}

const browser = await chromium.launch({ headless: true });
const results = [];

for (const vp of VIEWPORTS) {
  try {
    const result = await runViewport(browser, vp);
    results.push(result);
    console.log(
      `${result.pass ? 'PASS' : 'FAIL'} ${vp.id} (${vp.width}x${vp.height})${result.note ? ` — ${result.note}` : ''}${result.diffRatio != null ? ` diff=${(result.diffRatio * 100).toFixed(3)}%` : ''}${result.error ? ` — ${result.error}` : ''}`,
    );
  } catch (err) {
    results.push({ id: vp.id, pass: false, error: String(err) });
    console.log(`FAIL ${vp.id} — ${err.message ?? err}`);
  }
}

await browser.close();

const allPass = results.every((r) => r.pass);
process.exit(allPass ? 0 : 1);
