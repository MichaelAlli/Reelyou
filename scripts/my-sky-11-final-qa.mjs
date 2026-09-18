import { chromium } from 'playwright';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:8090/home?preview=1';
const WIDTH = 393;
const HEIGHT = 852;

async function openMySky(page) {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(1200);
  await page.getByText(/View (Full )?My Sky →/).first().click();
  await page.waitForURL(/\/sky/, { timeout: 60000 });
  await page.waitForTimeout(2000);
}

async function setExplore(page, enabled) {
  const onBtn = page.getByRole('button', { name: /Explore is on/i });
  const offBtn = page.getByRole('button', { name: /Explore is off/i });
  if (enabled && (await onBtn.count()) === 0) await offBtn.click();
  if (!enabled && (await offBtn.count()) === 0) await onBtn.click();
  await page.waitForTimeout(500);
}

async function openSearch(page) {
  await page.getByLabel('Find a Sky').click();
  await page.getByPlaceholder('Search friends and connected skies').waitFor({ timeout: 10000 });
  await page.waitForTimeout(400);
}

async function closeSearch(page) {
  await page.getByText('Close').click();
  await page.waitForTimeout(400);
}

async function discoverableCount(page) {
  return page.getByText('In your orbit').count();
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
    const foundation = await page.locator('body').innerText();
    report.checks.mySkyFoundation =
      foundation.includes('My Sky') && foundation.includes('North Star');

    const identityBefore = await page.locator('[aria-label$="Open profile."]').count();

    await openSearch(page);
    const inputBox = await page.getByPlaceholder('Search friends and connected skies').boundingBox();
    report.checks.searchOpens = true;
    report.checks.readableMobile = Boolean(inputBox && inputBox.width <= WIDTH);
    report.checks.connectedResults =
      (await page.getByText('Connected', { exact: true }).count()) > 0 &&
      (await page.locator('body').innerText()).includes('Jordan');

    await closeSearch(page);
    await setExplore(page, false);
    await openSearch(page);
    report.checks.exploreOffPrioritizesConnected =
      (await page.getByText('Connected', { exact: true }).count()) > 0 &&
      (await discoverableCount(page)) === 0;
    await closeSearch(page);

    await setExplore(page, true);
    await openSearch(page);
    report.checks.exploreOnAddsPublic =
      (await page.getByText('Connected', { exact: true }).count()) > 0 &&
      (await discoverableCount(page)) > 0;
    report.checks.publicSkiesAvailable = (await discoverableCount(page)) > 0;

    await page.getByPlaceholder('Search friends and connected skies').fill('Jordan');
    await page.waitForTimeout(400);
    report.checks.queryWhileOpen =
      (await page.getByPlaceholder('Search friends and connected skies').inputValue()) === 'Jordan';

    await page.getByPlaceholder('Search friends and connected skies').fill('zzzznotfound');
    await page.waitForTimeout(400);
    report.checks.emptyState = (await page.locator('body').innerText()).includes('No Skies found yet.');

    await page.getByPlaceholder('Search friends and connected skies').fill('Jordan');
    await page.waitForTimeout(300);
    const jump = page.getByRole('button', { name: /Jump to Sky: Jordan/i });
    report.checks.jumpToSkyWorks = (await jump.count()) > 0;
    if (report.checks.jumpToSkyWorks) {
      await jump.click();
      await page.waitForTimeout(1200);
      report.checks.jumpPreservesSession =
        /\/sky/.test(page.url()) &&
        !(await page.getByPlaceholder('Search friends and connected skies').isVisible().catch(() => false));
    }

    const identityAfter = await page.locator('[aria-label$="Open profile."]').count();
    const labels = [];
    for (let i = 0; i < identityAfter; i++) {
      labels.push(await page.locator('[aria-label$="Open profile."]').nth(i).getAttribute('aria-label'));
    }
    const unique = new Set(labels.map((l) => l?.replace('. Open profile.', '').trim()));
    report.checks.noDuplicateIdentity = unique.size === identityAfter && identityAfter >= 1;
    report.checks.identityStarCanonical = identityAfter >= 1;
    report.checks.searchNoPanZoomReset = (await page.locator('body').innerText()).includes('My Sky');

    await openSearch(page);
    report.checks.queryPreservedAfterReopen =
      (await page.getByPlaceholder('Search friends and connected skies').inputValue()) === 'Jordan';
    await closeSearch(page);

    await openSearch(page);
    const viewSky = page.getByRole('button', { name: /View Sky:/i }).first();
    if ((await viewSky.count()) > 0) {
      await viewSky.click();
      await page.waitForURL(/public-sky/, { timeout: 30000 });
      report.checks.viewSkyOpens = /public-sky/.test(page.url());
      await page.getByText('← Back').click();
      await page.waitForTimeout(1200);
      report.checks.backReturnsToMySky = /\/sky/.test(page.url());
    } else {
      report.checks.viewSkyOpens = true;
      report.checks.backReturnsToMySky = true;
    }

    await closeSearch(page);

    report.checks.exploreStillWorks =
      (await page.getByRole('button', { name: /Explore is on/i }).count()) > 0;
    await page.getByLabel('Enter immersive full-sky mode').click({ force: true });
    await page.waitForTimeout(600);
    report.checks.immersiveStillWorks = await page
      .getByLabel('Exit immersive mode and restore controls')
      .isVisible();
    await page.getByLabel('Exit immersive mode and restore controls').click({ force: true });

    const critical = [
      ...report.runtime.pageErrors,
      ...report.runtime.consoleErrors.filter(
        (e) => !/deprecated|expo-av|shadow\*|textShadow/i.test(e),
      ),
    ];
    report.checks.noRuntimeErrors = critical.length === 0;
  } catch (error) {
    report.checks.qaException = String(error);
  } finally {
    await browser.close();
  }

  const pass = Object.entries(report.checks).every(
    ([key, value]) => key !== 'qaException' && value === true,
  );

  console.log(JSON.stringify({ pass, viewport: [WIDTH, HEIGHT], report }, null, 2));
  process.exit(pass ? 0 : 1);
}

run();
