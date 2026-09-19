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

async function setExplore(page, enabled) {
  const onBtn = page.getByRole('button', { name: /Explore is on/i });
  const offBtn = page.getByRole('button', { name: /Explore is off/i });
  if (enabled && (await onBtn.count()) === 0) await offBtn.click({ force: true });
  if (!enabled && (await offBtn.count()) === 0) await onBtn.click({ force: true });
  await page.waitForTimeout(500);
}

async function openPrivacy(page) {
  await page.getByLabel('Sky Visibility').click();
  await page.getByText('Choose what others can see').waitFor({ timeout: 10000 });
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
    const ownerBody = await page.locator('body').innerText();
    report.checks.ownerFullSky =
      ownerBody.includes('North Star') &&
      ownerBody.includes('My Sky') &&
      !ownerBody.includes('Sky unavailable');

    report.checks.privacyControl = (await page.getByLabel('Sky Visibility').count()) > 0;

    await openPrivacy(page);
    report.checks.privacySheet =
      ownerBody.includes('Privacy') ||
      (await page.getByText('Sky Visibility').count()) > 0;
    report.checks.privacyLevels =
      (await page.getByLabel('Private visibility').count()) > 0 &&
      (await page.getByLabel('Connections visibility').count()) > 0 &&
      (await page.getByLabel('Public visibility').count()) > 0;

    await page.getByText('Close').click();
    await page.waitForTimeout(400);

    await setExplore(page, true);
    await page.getByLabel('Find a Sky').click();
    await page.waitForTimeout(400);
    const exploreBody = await page.locator('body').innerText();
    report.checks.privateSkyHiddenFromExplore = !exploreBody.includes('Aisha Thompson');
    await page.getByText('Close').click();
    await page.waitForTimeout(300);

    await page.getByLabel('Find a Sky').click();
    await page.getByPlaceholder('Search friends and connected skies').fill('Jordan');
    await page.waitForTimeout(400);
    const viewSky = page.getByRole('button', { name: /View Sky: Jordan|View Profile: Jordan/i });
    report.checks.connectedCanView = (await viewSky.count()) > 0;
    if ((await viewSky.count()) > 0) await viewSky.first().click();
    await page.waitForURL(/public-sky.*orbit-jordan|public-sky\?id=orbit-jordan/, {
      timeout: 30000,
    });

    const publicBody = await page.locator('body').innerText();
    report.checks.publicSkyOwner = /Jordan.*Sky/i.test(publicBody);
    report.checks.noPrivateLeak =
      !/Starting before I feel ready|Trusting the slower path|quiet morning/i.test(publicBody);
    report.checks.noGuidanceLeak =
      !publicBody.includes('Guiding Light') && !publicBody.toLowerCase().includes('starpath');

    await page.getByText('← My Sky').click();
    await page.waitForTimeout(1200);
    report.checks.backRestoresMySky = page.url().includes('/sky');

    await page.goto(`${BASE.replace('/home?preview=1', '')}/public-sky?id=orbit-5`, {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    await page.waitForTimeout(1000);
    const privateSkyBody = await page.locator('body').innerText();
    report.checks.privateOwnerBlocked =
      privateSkyBody.includes('Sky unavailable') || privateSkyBody.includes('unavailable');

    report.checks.mobileLayout =
      (await page.getByText('← My Sky').boundingBox()) !== null ||
      (await page.getByText('Sky unavailable').boundingBox()) !== null;

    report.checks.noRuntimeErrors =
      report.runtime.consoleErrors.length === 0 && report.runtime.pageErrors.length === 0;

    const failed = Object.entries(report.checks).filter(([, v]) => !v);
    console.log(JSON.stringify({ ...report, pass: failed.length === 0, failed: failed.map(([k]) => k) }, null, 2));
    process.exit(failed.length === 0 ? 0 : 1);
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
