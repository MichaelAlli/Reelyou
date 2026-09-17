import { chromium } from 'playwright';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:8081/home?preview=1';
const VIEWPORTS = [[360, 800], [390, 844], [393, 852], [412, 915], [430, 932]];

async function openHome(page) {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
}

async function run(page) {
  const report = { steps: [], runtime: { consoleErrors: [], pageErrors: [] }, reg: {}, mobile: [] };
  page.on('console', (m) => { if (m.type() === 'error') report.runtime.consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => report.runtime.pageErrors.push(String(e)));

  await openHome(page);

  // B Skywrite
  await page.getByLabel('Open Skywrite').click();
  await page.waitForURL(/\/skywrite/, { timeout: 30000 });
  report.steps.push(['B skywrite opens', true]);
  await page.goBack();
  await openHome(page);

  // C-D Around Your Sky
  await page.getByText('Around Your Sky', { exact: true }).waitFor();
  const body = await page.locator('body').innerText();
  const itemCount = ['Jordan shared', 'Creativity', 'Alex reached', 'Maya shared'].filter((t) => body.includes(t)).length;
  report.steps.push(['D finite items 1-3', itemCount >= 1 && itemCount <= 3]);
  report.steps.push(['G caught up', body.includes('You') && body.includes('caught up')]);

  // E tap community item
  await page.getByText('Something new is happening in Creativity.').click();
  await page.getByText('About this community').waitFor();
  report.steps.push(['E community tap', true]);
  await page.getByRole('button', { name: '← Back' }).first().click();
  await openHome(page);

  // person tap
  await page.getByText('Jordan shared a new Skywrite.').click();
  await page.getByText('Skywrite', { exact: true }).first().waitFor();
  report.steps.push(['E skywrite tap', true]);
  await page.goBack();
  await openHome(page);

  // regression locked sections
  report.reg = {
    starpath: await page.getByText('My StarPath').first().isVisible(),
    mySky: await page.getByText('My Sky').first().isVisible(),
    growingIn: await page.getByText('Growing In', { exact: true }).first().isVisible(),
    todayFocus: await page.getByText(/Today.s Focus/).first().isVisible(),
    skywrite: await page.getByLabel('Open Skywrite').isVisible(),
    nav: await page.getByText('Home').first().isVisible(),
  };

  return report;
}

async function mobile(browser) {
  const out = [];
  for (const [width, height] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width, height } });
    const page = await ctx.newPage();
    try {
      await openHome(page);
      const visible = await page.getByText('Around Your Sky', { exact: true }).isVisible();
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const caughtUp = await page.getByText(/caught up/i).isVisible();
      out.push({ width, pass: visible && caughtUp });
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
report.mobile = await mobile(browser);
await browser.close();

const pass =
  report.steps.every(([, ok]) => ok) &&
  Object.values(report.reg).every(Boolean) &&
  report.mobile.every((m) => m.pass) &&
  report.runtime.pageErrors.length === 0;

console.log(JSON.stringify({ pass, report }, null, 2));
process.exit(pass ? 0 : 1);
