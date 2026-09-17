import { chromium } from 'playwright';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:8081/home?preview=1';
const VIEWPORTS = [[360, 800], [390, 844], [393, 852], [412, 915], [430, 932]];

async function openHome(page) {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
}

async function run(page) {
  const report = { steps: [], runtime: { consoleErrors: [], pageErrors: [] }, reg: {} };
  page.on('console', (m) => { if (m.type() === 'error') report.runtime.consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => report.runtime.pageErrors.push(String(e)));

  await openHome(page);

  // B-C card CTA
  await page.getByText('View Full Sky →').click();
  await page.waitForURL(/\/sky/, { timeout: 30000 });
  const skyText = await page.locator('body').innerText();
  report.steps.push(['C my sky opens from card', skyText.includes('My Sky') && skyText.includes('North Star')]);

  // D north star section
  report.steps.push(['D north star section', skyText.includes('North Star')]);

  // E stars
  report.steps.push(['E stars section', skyText.includes('Stars in your sky')]);

  // F constellations
  report.steps.push(['F patterns', skyText.includes('Patterns taking shape')]);

  // G home link
  await page.getByText('← Home').click();
  await page.waitForURL(/\/home/, { timeout: 30000 });
  report.steps.push(['G home link', await page.getByText('View Full Sky →').isVisible()]);

  // I bottom nav my sky
  await page.getByText('My Sky', { exact: true }).last().click();
  await page.waitForURL(/\/sky/, { timeout: 30000 });
  report.steps.push(['I bottom nav my sky', (await page.locator('body').innerText()).includes('My Sky')]);

  // K return home via nav
  await page.getByText('Home', { exact: true }).last().click();
  await page.waitForURL(/\/home/, { timeout: 30000 });
  report.steps.push(['K home intact', await page.getByText('Around Your Sky').isVisible()]);

  // star tap skywrite
  await page.getByText('View Full Sky →').click();
  await page.locator('[aria-label="Starting before I feel ready"]').click();
  await page.waitForURL(/\/skywrite/, { timeout: 30000 });
  report.steps.push(['star skywrite tap', true]);
  await page.goBack();
  await page.waitForURL(/\/sky/, { timeout: 30000 });

  report.reg = {
    skywrite: (await page.goto(BASE, { waitUntil: 'networkidle' }).then(() => page.getByLabel('Open Skywrite').isVisible())),
    aroundYourSky: (await page.getByText('Around Your Sky').isVisible()),
    starpath: (await page.getByText('My StarPath').first().isVisible()),
    growingIn: (await page.getByText('Growing In').first().isVisible()),
  };

  return report;
}

async function mobileChecks(browser) {
  const out = [];
  for (const [width, height] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width, height } });
    const page = await ctx.newPage();
    try {
      await openHome(page);
      await page.getByText('View Full Sky →').click();
      await page.getByText('North Star').waitFor({ timeout: 60000 });
      const box = await page.getByText('My Sky', { exact: true }).first().boundingBox();
      out.push({ width, pass: Boolean(box && box.width <= width) });
    } catch {
      out.push({ width, pass: false });
    } finally {
      await ctx.close();
    }
  }
  return out;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const report = await run(page);
const mobile = await mobileChecks(browser);
await browser.close();

const pass =
  report.steps.every(([, ok]) => ok) &&
  Object.values(report.reg).every(Boolean) &&
  mobile.every((m) => m.pass) &&
  report.runtime.pageErrors.length === 0;

console.log(JSON.stringify({ pass, report, mobile }, null, 2));
process.exit(pass ? 0 : 1);
