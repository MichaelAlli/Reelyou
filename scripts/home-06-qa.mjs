import { chromium } from 'playwright';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:8081/home?preview=1';
const VIEWPORTS = [[360, 800], [390, 844], [393, 852], [412, 915], [430, 932]];

async function openHome(page) {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
}

async function runFunctional(page) {
  const report = {
    guidingLightVisible: false,
    oneLightMax: true,
    whyThisWorks: false,
    dismissWorks: false,
    peaceStateWorks: false,
    companionOpens: false,
    companionReturns: false,
    homeIntact: false,
    todayFocusIntact: false,
    regression: {},
    runtime: { consoleErrors: [], pageErrors: [] },
  };

  page.on('console', (m) => { if (m.type() === 'error') report.runtime.consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => report.runtime.pageErrors.push(String(e)));

  await openHome(page);
  const body1 = await page.locator('body').innerText();
  report.guidingLightVisible = body1.includes('Guiding Light');
  report.oneLightMax = (body1.match(/Keep building your confidence/g) ?? []).length <= 1;

  if (body1.includes('Keep building your confidence')) {
    await page.getByText('Why this?').click();
    await page.getByText('Close').waitFor({ timeout: 10000 });
    const modal = await page.locator('body').innerText();
    report.whyThisWorks = modal.includes('connects with');
    await page.getByText('Close').click();

    await page.getByText('Not now').click();
    await page.waitForTimeout(500);
    const body2 = await page.locator('body').innerText();
    report.dismissWorks = !body2.includes('Keep building your confidence');
    report.peaceStateWorks = body2.includes('Nothing needs your attention right now');
  } else {
    report.peaceStateWorks = body1.includes('Nothing needs your attention right now');
    report.dismissWorks = true;
  }

  await page.getByText('Companion').first().click();
  await page.waitForURL(/\/companion/, { timeout: 30000 });
  report.companionOpens = (await page.locator('body').innerText()).includes('Companion');
  await page.getByText('← Home').click();
  await page.waitForURL(/\/home/, { timeout: 30000 });
  report.companionReturns = true;

  const body3 = await page.locator('body').innerText();
  report.homeIntact = body3.includes('Guiding Light') && body3.includes('My StarPath');
  report.todayFocusIntact = body3.includes("Today's Focus") || body3.includes('Today\u2019s Focus');
  report.regression = {
    skywrite: body3.includes('Write your sky'),
    aroundYourSky: body3.includes('Around Your Sky'),
    starpath: body3.includes('My StarPath'),
    mySky: body3.includes('View Full Sky'),
    growingIn: body3.includes('Growing In'),
    todayFocus: report.todayFocusIntact,
  };

  return report;
}

async function mobileChecks(browser) {
  const results = [];
  for (const [width, height] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width, height } });
    const page = await ctx.newPage();
    try {
      await openHome(page);
      const text = await page.locator('body').innerText();
      results.push({
        width,
        height,
        pass: text.includes('Guiding Light') && text.includes('My StarPath'),
      });
    } catch {
      results.push({ width, height, pass: false });
    } finally {
      await ctx.close();
    }
  }
  return results;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const report = await runFunctional(page);
const mobile = await mobileChecks(browser);
await browser.close();

const pass =
  report.guidingLightVisible &&
  report.oneLightMax &&
  (report.whyThisWorks || report.peaceStateWorks) &&
  report.dismissWorks &&
  report.peaceStateWorks &&
  report.companionOpens &&
  report.companionReturns &&
  report.homeIntact &&
  Object.values(report.regression).every(Boolean) &&
  mobile.every((m) => m.pass) &&
  report.runtime.pageErrors.length === 0;

console.log(JSON.stringify({ pass, report, mobile }, null, 2));
process.exit(pass ? 0 : 1);
