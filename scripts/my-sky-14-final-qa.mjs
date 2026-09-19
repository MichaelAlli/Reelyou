import { chromium } from 'playwright';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:8090/home?preview=1';
const WIDTH = 393;
const HEIGHT = 852;

async function openMySky(page) {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(1200);
  await page.getByText(/View (Full )?My Sky →/).first().click();
  await page.waitForURL(/\/sky/, { timeout: 60000 });
  await page.waitForTimeout(1500);
}

async function dragSky(page, dx, dy) {
  const box = await page.locator('[data-testid="my-sky-viewport"]').boundingBox();
  const startX = box ? box.x + box.width / 2 : WIDTH / 2;
  const startY = box ? box.y + box.height / 2 : HEIGHT / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + dx, startY + dy, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(500);
}

async function run() {
  const report = { checks: {}, runtime: { consoleErrors: [], pageErrors: [] } };
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });

  page.on('console', (m) => {
    if (m.type() === 'error') report.runtime.consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => report.runtime.pageErrors.push(String(e)));

  try {
    await openMySky(page);

    const controlsBefore = await page.getByText('North Star').first().boundingBox();
    await dragSky(page, -80, 60);
    const controlsAfter = await page.getByText('North Star').first().boundingBox();
    report.checks.uiControlsFixed =
      controlsBefore &&
      controlsAfter &&
      Math.abs(controlsBefore.y - controlsAfter.y) < 4;

    report.checks.mySkyFoundation = (await page.getByText('My Sky').count()) > 0;

    await page.getByLabel('Find a Sky').click();
    await page.waitForTimeout(400);
    report.checks.searchWorks = (await page.getByPlaceholder('Search friends and connected skies').count()) > 0;
    await page.getByText('Close').click();
    await page.waitForTimeout(300);

    const exploreOn = page.getByRole('button', { name: /Explore is on/i });
    if ((await exploreOn.count()) === 0) {
      await page.getByRole('button', { name: /Explore is off/i }).click({ force: true });
      await page.waitForTimeout(400);
    }
    report.checks.exploreWorks = (await page.getByRole('button', { name: /Explore is/i }).count()) > 0;

    await page.getByLabel('Enter immersive full-sky mode').click();
    await page.waitForTimeout(600);
    await dragSky(page, 40, -30);
    report.checks.immersivePan = true;
    await page.getByLabel('Exit immersive mode and restore controls').click();
    await page.waitForTimeout(600);
    report.checks.immersiveRestore = (await page.getByText('North Star').count()) > 0;

    await page.getByLabel('Find a Sky').click();
    await page.getByPlaceholder('Search friends and connected skies').fill('Jordan');
    await page.waitForTimeout(400);
    const viewBtn = page.getByRole('button', { name: /View (Sky|Profile): Jordan/i });
    if ((await viewBtn.count()) > 0) await viewBtn.first().click();
    await page.waitForURL(/public-sky/, { timeout: 30000 });
    report.checks.publicSkyWorks = page.url().includes('orbit-jordan');
    await page.getByText('← My Sky').click();
    await page.waitForTimeout(1000);
    report.checks.backNavigation = page.url().includes('/sky');

    await page.getByLabel('Sky Visibility').click();
    await page.waitForTimeout(400);
    report.checks.privacyIntact = (await page.getByText('Default Visibility').count()) > 0;
    await page.getByText('Close').click();

    report.checks.noRuntimeErrors =
      report.runtime.consoleErrors.length === 0 && report.runtime.pageErrors.length === 0;

    const failed = Object.entries(report.checks).filter(([, v]) => !v);
    console.log(JSON.stringify({ pass: failed.length === 0, failed: failed.map(([k]) => k), report }, null, 2));
    process.exit(failed.length === 0 ? 0 : 1);
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
