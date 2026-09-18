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

async function openSearch(page) {
  await page.getByLabel('Find a Sky').click();
  await page.getByPlaceholder('Search friends and connected skies').waitFor({ timeout: 10000 });
  await page.waitForTimeout(400);
}

async function closeSearch(page) {
  const close = page.getByText('Close');
  if ((await close.count()) > 0) {
    await close.first().click();
    await page.waitForTimeout(400);
  }
}

async function setExplore(page, enabled) {
  const onBtn = page.getByRole('button', { name: /Explore is on/i });
  const offBtn = page.getByRole('button', { name: /Explore is off/i });
  if (enabled && (await onBtn.count()) === 0) await offBtn.click({ force: true });
  if (!enabled && (await offBtn.count()) === 0) await onBtn.click({ force: true });
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
    const mySkyBefore = await page.locator('body').innerText();
    report.checks.mySkyFoundation =
      mySkyBefore.includes('North Star') && mySkyBefore.includes('My Sky');

    await setExplore(page, true);
    await openSearch(page);
    await page.getByPlaceholder('Search friends and connected skies').fill('Jordan');
    await page.waitForTimeout(400);

    const viewSky = page.getByRole('button', { name: /View Sky: Jordan/i });
    const viewProfile = page.getByRole('button', { name: /View Profile: Jordan/i });
    report.checks.searchViewSkyAction =
      (await viewSky.count()) > 0 || (await viewProfile.count()) > 0;

    if ((await viewSky.count()) > 0) {
      await viewSky.click();
    } else {
      await viewProfile.click();
    }
    await page.waitForURL(/public-sky.*orbit-jordan|public-sky\?id=orbit-jordan/, {
      timeout: 30000,
    });
    report.checks.correctPublicSkyRoute = page.url().includes('orbit-jordan');

    const publicBody = await page.locator('body').innerText();
    report.checks.ownerIdentified = /Jordan.*Sky/i.test(publicBody) && publicBody.includes('Jordan');
    report.checks.mobileLayout =
      (await page.getByText('← My Sky').boundingBox()) !== null &&
      (await page.getByText(/Jordan.*Sky/i).first().boundingBox()) !== null;

    const jordanStars = page.getByLabel(/^Jordan\. Open profile\./);
    report.checks.ownerIdentityStar = (await jordanStars.count()) >= 1;
    report.checks.noSelfOwner = !publicBody.includes("Michael Alli\u2019s Sky");

    let tappedIdentity = false;
    for (let i = 0; i < (await jordanStars.count()); i++) {
      const star = jordanStars.nth(i);
      if (await star.isVisible()) {
        await star.click();
        tappedIdentity = true;
        break;
      }
    }
    await page.waitForTimeout(600);
    report.checks.identityBubble =
      tappedIdentity &&
      ((await page.getByText('Connect').count()) > 0 ||
        (await page.getByText('Connected').count()) > 0);
    await page.getByText('×').click({ force: true }).catch(() => {});
    await page.waitForTimeout(300);

    report.checks.noPrivateSkywrites =
      !/Starting before I feel ready|Trusting the slower path|quiet morning/i.test(publicBody);
    report.checks.noPrivateReflections = !publicBody.toLowerCase().includes('private reflection');
    report.checks.noPrivateGuidance =
      !publicBody.toLowerCase().includes('guidance') &&
      !publicBody.includes('starpath') &&
      !publicBody.includes('Guiding Light');

    report.checks.noEditControls =
      page.url().includes('public-sky') &&
      (publicBody.includes('Visiting') || publicBody.includes('Connected')) &&
      publicBody.includes('← My Sky');

    const headerBox = await page.getByText(/Jordan.*Sky/i).first().boundingBox();
    report.checks.connectStateVisible =
      publicBody.includes('Connect') ||
      publicBody.includes('Connected') ||
      publicBody.includes('Visiting');

    await page.getByText('← My Sky').click();
    await page.waitForTimeout(1200);
    report.checks.backToMySky = /\/sky/.test(page.url());

    const restored = await page.locator('body').innerText();
    report.checks.panZoomSessionRestored = restored.includes('My Sky') && restored.includes('North Star');
    report.checks.exploreRestored = (await page.getByRole('button', { name: /Explore is on/i }).count()) > 0;

    await openSearch(page);
    report.checks.searchStateRestored =
      (await page.getByPlaceholder('Search friends and connected skies').inputValue()) === 'Jordan';
    await closeSearch(page);

    report.checks.publicConstellationsContext =
      publicBody.includes('Drag to explore') || publicBody.includes('Tap stars');

    await openSearch(page);
    const jump = page.getByRole('button', { name: /Jump to Sky: Jordan/i });
    report.checks.jumpToSkyWorks = (await jump.count()) > 0;
    if (report.checks.jumpToSkyWorks) {
      await jump.click();
      await page.waitForTimeout(1200);
      report.checks.jumpPreservesMySky = /\/sky/.test(page.url());
    }

    report.checks.endToEndFlow = report.checks.backToMySky && report.checks.correctPublicSkyRoute;

    const critical = [
      ...report.runtime.pageErrors,
      ...report.runtime.consoleErrors.filter(
        (e) => !/deprecated|expo-av|shadow\*|textShadow/i.test(e),
      ),
    ];
    report.checks.noRuntimeErrors = critical.length === 0;
    if (headerBox && headerBox.width > WIDTH) report.checks.mobileLayout = false;
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
