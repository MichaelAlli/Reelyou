import { chromium } from 'playwright';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:8081/home?preview=1';
const VIEWPORTS = [[360, 800], [390, 844], [393, 852], [412, 915], [430, 932]];

async function openHome(page) {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
}

async function run(page) {
  const report = {
    sections: {},
    bottomNav: {},
    modal: {},
    regression: {},
    runtime: { consoleErrors: [], pageErrors: [] },
  };
  page.on('console', (m) => { if (m.type() === 'error') report.runtime.consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => report.runtime.pageErrors.push(String(e)));

  await openHome(page);
  const body = await page.locator('body').innerText();
  report.sections = {
    header: body.includes('Good') || body.includes('morning') || body.includes('afternoon') || body.includes('evening'),
    skywrite: body.includes('Write your sky'),
    aroundYourSky: body.includes('Around Your Sky'),
    starpath: body.includes('My StarPath'),
    mySky: body.includes('View Full Sky'),
    growingIn: body.includes('Growing In'),
    todayFocus: body.includes("Today\u2019s Focus") || body.includes("Today's Focus"),
    guidingLight: body.includes('Guiding Light'),
  };
  report.bottomNav = {
    order: ['Home', 'My Sky', 'Starpath', 'Skywrite', 'Me'].every((l) => body.includes(l)),
  };
  report.regression = { ...report.sections, bottomNav: report.bottomNav.order };

  if (body.includes('Why this?')) {
    await page.getByText('Why this?').click();
    await page.getByText('Close').waitFor({ timeout: 10000 });
    report.modal.opens = true;
    await page.getByText('Close').click();
    report.modal.closes = true;
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);
  const scrolled = await page.locator('body').innerText();
  report.scrollReachBottom = scrolled.includes('Today') && scrolled.includes('Home');

  return report;
}

async function mobileChecks(browser) {
  const results = [];
  for (const [width, height] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width, height } });
    const page = await ctx.newPage();
    try {
      await openHome(page);
      await page.getByText('Guiding Light').waitFor({ timeout: 60000 });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const text = await page.locator('body').innerText();
      results.push({
        width,
        height,
        pass: text.includes('My StarPath') && text.includes('Home') && text.includes('Growing In'),
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
const report = await run(page);
const mobile = await mobileChecks(browser);
await browser.close();

const pass =
  Object.values(report.regression).every(Boolean) &&
  report.scrollReachBottom &&
  mobile.every((m) => m.pass) &&
  report.runtime.pageErrors.length === 0;

console.log(JSON.stringify({ pass, report, mobile }, null, 2));
process.exit(pass ? 0 : 1);
