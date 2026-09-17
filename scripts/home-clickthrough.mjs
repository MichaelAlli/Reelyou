/**
 * Live click-through verification for Home CTAs — run against localhost:8090
 * Usage: node scripts/home-clickthrough.mjs
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:8090';
const HOME = `${BASE}/home?preview=1`;

const results = [];
const consoleErrors = [];

function log(name, status, detail) {
  results.push({ name, status, detail });
  console.log(`[${status}] ${name}: ${detail}`);
}

async function waitForApp(page) {
  await page.goto(HOME, { waitUntil: 'load', timeout: 120000 });
  await page.waitForTimeout(4000);
  await page.getByText('My StarPath', { exact: false }).first().waitFor({ state: 'visible', timeout: 45000 });
}

async function clickText(page, text, opts = {}) {
  const locator = page.getByText(text, { exact: opts.exact ?? false }).first();
  await locator.waitFor({ state: 'visible', timeout: 15000 });
  await locator.click({ timeout: 10000 });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(`PAGEERROR: ${err.message}`);
  });

  try {
    await waitForApp(page);
    log('Home load', 'PASS', page.url());

    // 1. View Path →
    const homeBeforeStarpath = await page.locator('text=My StarPath').isVisible();
    await clickText(page, 'View Path');
    await page.waitForTimeout(1500);
    const starpathUrl = page.url();
    const starpathContent = await page.locator('text=Starpath').first().isVisible().catch(() => false);
    const starpathOk = starpathUrl.includes('starpath') || starpathContent;
    log(
      'View Path →',
      starpathOk ? 'PASS' : 'FAIL',
      `url=${starpathUrl}, starpathVisible=${starpathContent}`,
    );

    const backBtn = page.getByText('← Back').first();
    if (await backBtn.isVisible().catch(() => false)) {
      await backBtn.click();
      await page.waitForTimeout(1500);
    } else {
      await page.goto(HOME, { waitUntil: 'load', timeout: 120000 });
await page.waitForTimeout(2000);
    }
    const homeAfterStarpath = await page.locator('text=My StarPath').isVisible();
    log(
      'View Path back',
      homeAfterStarpath ? 'PASS' : 'FAIL',
      `homeVisible=${homeAfterStarpath}, url=${page.url()}`,
    );

    await waitForApp(page);

    // 2. View Full Sky →
    await clickText(page, 'View Full Sky');
    await page.waitForTimeout(1500);
    const skyUrl = page.url();
    const skyContent =
      (await page.locator('text=Human Potential Map').isVisible().catch(() => false)) ||
      (await page.locator('text=Explore people and skies').isVisible().catch(() => false));
    const skyOk = skyUrl.includes('/sky') || skyContent;
    log('View Full Sky →', skyOk ? 'PASS' : 'FAIL', `url=${skyUrl}, skyContent=${skyContent}`);

    await page.goto(HOME, { waitUntil: 'load', timeout: 120000 });
await page.waitForTimeout(2000);
    await page.waitForSelector('text=My StarPath', { timeout: 30000 });

    // 3. Skywrite Home entry
    const skywriteEntry = page.getByLabel('Open Skywrite').first();
    if (await skywriteEntry.isVisible().catch(() => false)) {
      await skywriteEntry.click();
    } else {
      await clickText(page, 'Write your sky');
    }
    await page.waitForTimeout(1500);
    const swUrl = page.url();
    const swContent =
      (await page.locator('text=Skywrite').first().isVisible().catch(() => false)) ||
      (await page.locator('text=Release Skywrite').isVisible().catch(() => false));
    log('Skywrite card entry', swUrl.includes('skywrite') || swContent ? 'PASS' : 'FAIL', `url=${swUrl}`);

    if (await page.getByText('← Back').first().isVisible().catch(() => false)) {
      await page.getByText('← Back').first().click();
      await page.waitForTimeout(1000);
    } else {
      await page.goto(HOME, { waitUntil: 'load', timeout: 120000 });
await page.waitForTimeout(2000);
    }

    await waitForApp(page);

    // 4. Skywrite send button (paper plane area — same card)
    const card = page.getByLabel('Open Skywrite').first();
    await card.click();
    await page.waitForTimeout(1500);
    const sendTapOk = page.url().includes('skywrite');
    log('Skywrite send/circle tap', sendTapOk ? 'PASS' : 'FAIL', `url=${page.url()}`);
    await page.goto(HOME, { waitUntil: 'load', timeout: 120000 });
await page.waitForTimeout(2000);
    await waitForApp(page);

    // 5. Bottom navigation
    const navTests = [
      { label: 'My Sky', expect: (url) => url.includes('/sky') },
      { label: 'Starpath', expect: (url) => url.includes('starpath') },
      { label: 'Skywrite', expect: (url) => url.includes('skywrite') },
      { label: 'Me', expect: (url) => url.includes('profile') },
      { label: 'Home', expect: (url) => url.includes('/home') },
    ];

    for (const nav of navTests) {
      await page.goto(HOME, { waitUntil: 'load', timeout: 120000 });
await page.waitForTimeout(2000);
      await page.waitForSelector('text=My StarPath', { timeout: 30000 });
      const tab = page.getByText(nav.label, { exact: true }).last();
      await tab.click();
      await page.waitForTimeout(1500);
      const url = page.url();
      const ok = nav.expect(url);
      log(`Bottom nav — ${nav.label}`, ok ? 'PASS' : 'FAIL', `url=${url}`);
    }

    // Re-tap Home when already on Home (stack guard)
    await page.goto(HOME, { waitUntil: 'load', timeout: 120000 });
await page.waitForTimeout(2000);
    await page.waitForSelector('text=My StarPath', { timeout: 30000 });
    const homeTab = page.getByText('Home', { exact: true }).last();
    await homeTab.click();
    await page.waitForTimeout(800);
    await homeTab.click();
    await page.waitForTimeout(800);
    const homeIntact = await page.locator('text=Growing In').isVisible();
    log('Bottom nav — Home re-tap', homeIntact ? 'PASS' : 'FAIL', `url=${page.url()}`);

    // Visual sanity — key sections still on Home
    await page.goto(HOME, { waitUntil: 'load', timeout: 120000 });
await page.waitForTimeout(2000);
    const sections = ['My StarPath', 'My Sky', 'Growing In', "Today's Focus"];
    for (const s of sections) {
      const vis = await page.getByText(s, { exact: false }).first().isVisible().catch(() => false);
      log(`Home section visible — ${s}`, vis ? 'PASS' : 'FAIL', String(vis));
    }
  } catch (err) {
    log('RUNNER', 'FAIL', err.message);
  } finally {
    await browser.close();
  }

  console.log('\n=== CONSOLE ERRORS ===');
  if (consoleErrors.length === 0) {
    console.log('(none captured)');
  } else {
    [...new Set(consoleErrors)].forEach((e) => console.log(e));
  }

  console.log('\n=== SUMMARY ===');
  const failed = results.filter((r) => r.status === 'FAIL');
  console.log(`Total: ${results.length}, Passed: ${results.length - failed.length}, Failed: ${failed.length}`);
  if (failed.length) process.exitCode = 1;
}

main();
