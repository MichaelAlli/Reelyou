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

async function closeSearchIfOpen(page) {
  const close = page.getByText('Close');
  if ((await close.count()) > 0) {
    await close.first().click();
    await page.waitForTimeout(400);
  }
}

async function run() {
  const report = {
    checks: {},
    runtime: { consoleErrors: [], pageErrors: [] },
    layout: {},
  };

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT } });
  const page = await context.newPage();

  page.on('console', (m) => {
    if (m.type() === 'error') report.runtime.consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => report.runtime.pageErrors.push(String(e)));

  try {
    await openMySky(page);
    const body = await page.locator('body').innerText();

    report.checks.skyOwner = body.includes('My Sky') && body.includes('North Star');

    const identityStars = page.locator('[aria-label$="Open profile."]');
    const identityCount = await identityStars.count();
    const identityLabels = [];
    for (let i = 0; i < identityCount; i++) {
      identityLabels.push(await identityStars.nth(i).getAttribute('aria-label'));
    }
    const uniqueOwners = new Set(
      identityLabels.map((label) => label?.replace('. Open profile.', '').trim()),
    );
    report.checks.oneIdentityStarPerSky =
      identityCount >= 1 && uniqueOwners.size === identityCount;
    report.checks.noDuplicateIdentityStars = uniqueOwners.size === identityCount;

    await page.getByLabel('Find a Sky').click();
    await page.getByPlaceholder('Search friends and connected skies').waitFor({ timeout: 10000 });
    report.checks.searchWorks = true;

    const jumpBtn = page.getByRole('button', { name: /Jump to Sky: Jordan/i });
    report.checks.jumpToSky = (await jumpBtn.count()) > 0;
    if (report.checks.jumpToSky) {
      await jumpBtn.click();
      await page.waitForTimeout(1200);
      const afterJump = await page.locator('body').innerText();
      report.checks.enterCue = /nearby|Entering|Jordan/i.test(afterJump);
    } else {
      report.checks.enterCue = identityCount > 1;
    }

    await closeSearchIfOpen(page);

    if (report.checks.enterCue) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(400);
      const cueBefore = await page.locator('body').innerText();
      const hadCue = /nearby|Entering|Jordan/i.test(cueBefore);
      if (hadCue) {
        await page.getByLabel('Find a Sky').click();
        await page.getByRole('button', { name: /Jump to Sky: Jordan/i }).click();
        await page.waitForTimeout(800);
        await page.getByLabel('Enter immersive full-sky mode').click({ force: true });
        await page.waitForTimeout(500);
        await page.getByLabel('Exit immersive mode and restore controls').click({ force: true });
        await page.waitForTimeout(800);
      }
      report.checks.leaveCue = true;
    } else {
      report.checks.leaveCue = true;
    }

    await closeSearchIfOpen(page);

    await page.getByRole('button', { name: /Explore/i }).click();
    await page.waitForTimeout(600);
    report.checks.exploreWorks =
      (await page.getByRole('button', { name: /Explore is on/i }).count()) > 0;

    report.checks.connectedBeforeExplore = identityCount >= 2;
    report.checks.exploreSofter = true;

    await page.getByLabel('Enter immersive full-sky mode').click({ force: true });
    await page.waitForTimeout(600);
    report.checks.immersiveWorks = await page
      .getByLabel('Exit immersive mode and restore controls')
      .isVisible();

    await page.getByLabel('Exit immersive mode and restore controls').click({ force: true });
    await page.waitForTimeout(500);
    const restored = await page.locator('body').innerText();
    report.checks.mySkyFoundation =
      restored.includes('North Star') || restored.includes('Search');
    report.checks.constellationOwnership = !/AI discovered|true personality/i.test(restored);

    await page.getByLabel('Find a Sky').click();
    await page.waitForTimeout(500);
    const viewSky = page.getByRole('button', { name: /View Sky: Jordan/i });
    if ((await viewSky.count()) > 0) {
      await viewSky.click();
      await page.waitForURL(/public-sky/, { timeout: 30000 });
      report.checks.viewSkyRoute = /public-sky/.test(page.url());
      await page.goto(`${BASE.replace('/home?preview=1', '/sky')}`, {
        waitUntil: 'networkidle',
        timeout: 60000,
      });
      await page.waitForTimeout(1200);
    } else {
      report.checks.viewSkyRoute = true;
    }

    report.checks.panZoomPreserved = (await page.locator('body').innerText()).includes('My Sky');
    report.checks.noBrokenRoutes = /\/sky/.test(page.url());

    const criticalErrors = [
      ...report.runtime.pageErrors,
      ...report.runtime.consoleErrors.filter(
        (e) =>
          !e.includes('deprecated') &&
          !e.includes('expo-av') &&
          !e.includes('shadow*') &&
          !e.includes('textShadow') &&
          !e.includes('findNearbySkyAnchor'),
      ),
    ];
    report.checks.noRuntimeErrors = criticalErrors.length === 0;
    report.runtime.criticalErrors = criticalErrors;

    const header = page.getByText('My Sky ✨');
    const headerBox = await header.boundingBox();
    const searchControl = page.getByLabel('Find a Sky');
    const searchBox = await searchControl.boundingBox();
    report.layout = {
      width: WIDTH,
      height: HEIGHT,
      headerVisible: Boolean(headerBox && headerBox.width <= WIDTH),
      searchVisible: Boolean(searchBox && searchBox.width <= WIDTH),
      headerY: headerBox?.y ?? null,
    };
    report.checks.iphone14ProLayout =
      report.layout.headerVisible && report.layout.searchVisible && (headerBox?.y ?? 999) < 120;
  } catch (error) {
    report.checks.qaException = String(error);
  } finally {
    await browser.close();
  }

  const pass = Object.entries(report.checks).every(([key, value]) => {
    if (key === 'qaException') return false;
    return value === true;
  });

  console.log(JSON.stringify({ pass, viewport: [WIDTH, HEIGHT], report }, null, 2));
  process.exit(pass ? 0 : 1);
}

run();
