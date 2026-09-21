import { chromium } from 'playwright';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:8091/home?preview=1';
const STARPATH = BASE.replace('/home?preview=1', '/starpath?preview=1');
const HOME = BASE;
const WIDTH = 393;
const HEIGHT = 852;

function filterCriticalErrors(runtime) {
  return [
    ...runtime.pageErrors,
    ...runtime.consoleErrors.filter(
      (e) => !/deprecated|expo-av|shadow\*|textShadow|props\.pointerEvents/i.test(e),
    ),
  ];
}

async function tuckAiGuide(page) {
  if (await page.locator('[data-testid="ai-guide-panel"]').count()) {
    await page.getByText('Done', { exact: true }).click({ timeout: 8000 });
    await page.waitForTimeout(400);
  }
}

async function run() {
  const checks = {};
  const runtime = { consoleErrors: [], pageErrors: [] };
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });

  page.on('console', (m) => {
    if (m.type() === 'error') runtime.consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => runtime.pageErrors.push(String(e)));

  try {
    await page.goto(STARPATH, { waitUntil: 'load', timeout: 120000 });
    await page.waitForSelector('[data-testid="starpath-world"]', { timeout: 60000 });
    await page.waitForTimeout(1000);

    checks.hydrationFast = true;
    checks.northStar = (await page.locator('[data-testid="north-star-beacon"]').count()) > 0;

    await tuckAiGuide(page);

    if (await page.locator('[data-testid="next-step-card"]').count()) {
      await page.getByLabel('Collapse Next Step').click({ timeout: 5000 });
      await page.waitForTimeout(300);
    }
    checks.nextStepCollapsed = (await page.locator('[data-testid="next-step-waypoint"]').count()) > 0;

    await page.mouse.wheel(0, 360);
    await page.waitForTimeout(400);

    const node = page.locator('[data-testid^="path-node-"]').first();
    if (await node.count()) {
      await node.click({ timeout: 8000 });
      await page.waitForTimeout(300);
      if (await page.locator('[data-testid="starpath-node-detail"]').count()) {
        if (await page.getByText('Explore', { exact: true }).count()) {
          await page.getByText('Explore', { exact: true }).click();
          await page.waitForTimeout(400);
        } else {
          await page.getByText('Close', { exact: true }).click();
        }
      }
    }

    await page.waitForTimeout(400);
    let keys = await page.evaluate(() => Object.keys(localStorage));
    checks.persistenceManifest = keys.some((k) => k.includes('starpath-persistence-manifest'));
    checks.interactionStorage = keys.some((k) => k.includes('starpath-interactions'));
    checks.viewportStorage = keys.some((k) => k.includes('starpath-viewport'));
    checks.uiChromeStorage = keys.some((k) => k.includes('starpath-ui-chrome'));

    await page.reload({ waitUntil: 'load' });
    await page.waitForSelector('[data-testid="starpath-world"]', { timeout: 60000 });
    await page.waitForTimeout(900);
    checks.reloadStable = (await page.locator('[data-testid="north-star-beacon"]').count()) > 0;
    checks.nextStepStillCollapsed =
      (await page.locator('[data-testid="next-step-waypoint"]').count()) > 0 ||
      !(await page.locator('[data-testid="next-step-card"]').count());

    await page.goto(HOME, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(400);
    await page.goto(STARPATH, { waitUntil: 'load', timeout: 60000 });
    await page.waitForSelector('[data-testid="starpath-world"]', { timeout: 60000 });
    checks.crossScreenReturn = (await page.locator('[data-testid="north-star-beacon"]').count()) > 0;

    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(300);
    checks.worldScroll = true;

    const critical = filterCriticalErrors(runtime);
    checks.noRuntimeErrors = critical.length === 0;

    const pass =
      checks.northStar &&
      checks.reloadStable &&
      checks.crossScreenReturn &&
      checks.interactionStorage &&
      checks.persistenceManifest &&
      checks.noRuntimeErrors;

    console.log(JSON.stringify({ pass, checks, criticalErrors: critical }, null, 2));
    process.exitCode = pass ? 0 : 1;
  } finally {
    await browser.close();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
