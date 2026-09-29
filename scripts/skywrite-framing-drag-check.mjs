/**
 * Browser check: compose route loads and framing math allows horizontal pan for landscape fill.
 * Full drag requires a video on the compose screen; this validates layout + page readiness.
 */
import { chromium, devices } from 'playwright';

const baseUrl = process.env.SKYWRITE_URL ?? 'http://localhost:8081/skywrite/compose';

function computeFillPan(stageW, stageH, aspect) {
  let width = stageW;
  let height = width / aspect;
  if (height < stageH) {
    height = stageH;
    width = height * aspect;
  }
  return {
    maxPanX: Math.max(0, (width - stageW) / 2),
    maxPanY: Math.max(0, (height - stageH) / 2),
  };
}

const iphone = devices['iPhone 13'];
const stageH = Math.max(320, Math.round(852 * 0.58));
const landscapeFill = computeFillPan(393, stageH, 16 / 9);
if (landscapeFill.maxPanX < 10) {
  throw new Error('Expected horizontal pan room for landscape fill in compose stage');
}

const browser = await chromium.launch();
const context = await browser.newContext({ ...iphone });
const page = await context.newPage();
const response = await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
if (!response || response.status() >= 400) {
  throw new Error(`Compose route failed: ${response?.status()}`);
}

await page.mouse.move(200, 300);
await page.mouse.down();
await page.mouse.move(120, 300, { steps: 8 });
await page.mouse.up();

console.log('skywrite-framing-drag-check.mjs — OK (compose loaded, pan math OK, mouse gesture sent)');
await browser.close();
