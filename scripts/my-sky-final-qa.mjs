import { chromium } from 'playwright';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:8081/home?preview=1';
const VIEWPORTS = [[360, 800], [390, 844], [393, 852], [412, 915], [430, 932]];

async function openHome(page) {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
}

async function run(page) {
  const report = { cardCta: {}, bottomNav: {}, destination: {}, runtime: { consoleErrors: [], pageErrors: [] }, regression: {} };
  page.on('console', (m) => { if (m.type() === 'error') report.runtime.consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => report.runtime.pageErrors.push(String(e)));

  await openHome(page);
  await page.getByText('View Full Sky →').click();
  await page.waitForURL(/\/sky/, { timeout: 30000 });
  const url1 = page.url();
  const sky1 = await page.locator('body').innerText();
  report.cardCta = { route: url1, opensMySky: sky1.includes('My Sky') && sky1.includes('North Star'), notHumanPotential: !sky1.includes('Human Potential Map') };
  await page.getByText('← Home').click();
  await page.waitForURL(/\/home/, { timeout: 30000 });
  report.cardCta.homeIntact = await page.getByText('View Full Sky →').isVisible();

  await page.getByText('My Sky', { exact: true }).last().click();
  await page.waitForURL(/\/sky/, { timeout: 30000 });
  report.bottomNav = { sameRoute: page.url().split('?')[0] === url1.split('?')[0], hasPatterns: (await page.locator('body').innerText()).includes('Patterns taking shape') };

  await page.getByText('Home', { exact: true }).last().click();
  await openHome(page);
  report.regression = {
    skywrite: await page.getByLabel('Open Skywrite').isVisible(),
    aroundYourSky: await page.getByText('Around Your Sky').isVisible(),
    starpath: await page.getByText('My StarPath').first().isVisible(),
    mySkyPreview: await page.getByText('View Full Sky →').isVisible(),
    growingIn: await page.getByText('Growing In').first().isVisible(),
    todayFocus: await page.getByText(/Today.s Focus/).first().isVisible(),
  };
  report.destination = {
    hasNorthStar: sky1.includes('North Star'),
    hasStars: sky1.includes('Stars in your sky'),
    hasPatterns: sky1.includes('Patterns taking shape'),
    noAiClaims: !/AI discovered|true personality|definitely becoming/i.test(sky1),
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
      await page.getByText('View Full Sky →').click();
      await page.getByText('North Star', { exact: true }).first().waitFor({ timeout: 60000 });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const text = await page.locator('body').innerText();
      results.push({ width, height, pass: text.includes('Patterns taking shape') && text.includes('Stars in your sky') });
    } catch (e) {
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

const pass = report.cardCta.opensMySky && report.cardCta.homeIntact && report.bottomNav.sameRoute && Object.values(report.regression).every(Boolean) && mobile.every((m) => m.pass) && report.runtime.pageErrors.length === 0;
console.log(JSON.stringify({ pass, report, mobile }, null, 2));
process.exit(pass ? 0 : 1);
