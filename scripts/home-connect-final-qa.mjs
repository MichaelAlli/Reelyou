import { chromium } from 'playwright';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:8091/home?preview=1';
const WIDTH = 393;
const HEIGHT = 852;

async function run() {
  const checks = {};
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
  const runtime = { errors: [] };
  page.on('pageerror', (e) => runtime.errors.push(String(e)));

  try {
    await page.goto(BASE, { waitUntil: 'load', timeout: 120000 });
    await page.waitForTimeout(900);

    await page.locator('[data-testid="home-menu-trigger"]').click({ timeout: 8000 });
    await page.waitForSelector('[data-testid="home-global-menu"]', { timeout: 8000 });
    checks.menuOpens = true;
    await page.getByText('Close', { exact: true }).click();

    await page.locator('[data-testid="home-signal-trigger"]').click({ timeout: 8000 });
    await page.waitForSelector('[data-testid="home-signal-center"]', { timeout: 8000 });
    checks.signalCenterOpens = true;
    await page.getByText('Done', { exact: true }).click();

    await page.locator('[data-testid="home-menu-trigger"]').click();
    await page.getByText('Messages', { exact: true }).click();
    await page.waitForURL(/\/messages/, { timeout: 15000 });
    checks.messagesRoute = true;

    await page.getByText('New', { exact: true }).click();
    await page.waitForURL(/\/messages\/new/, { timeout: 10000 });
    checks.newMessage = true;

    await page.goBack();
    const requestsLink = page.getByText('Message Requests', { exact: true });
    if (await requestsLink.count()) {
      await requestsLink.click();
      await page.waitForURL(/\/messages\/requests/, { timeout: 10000 });
      checks.messageRequests = true;
      await page.goBack();
    }

    await page.goBack();
    checks.backToHome = /\/home/.test(page.url());

    await page.locator('[data-testid="home-menu-trigger"]').click();
    await page.getByText('Settings', { exact: true }).click();
    await page.waitForURL(/\/settings/, { timeout: 10000 });
    checks.settingsRoute = true;

    const keys = await page.evaluate(() => Object.keys(localStorage));
    checks.preferencesKey = keys.some((k) => k.includes('user-preferences'));
    checks.messagesKey = keys.some((k) => k.includes('messages'));

    checks.noRuntimeErrors = runtime.errors.length === 0;
    const pass =
      checks.menuOpens &&
      checks.signalCenterOpens &&
      checks.messagesRoute &&
      checks.settingsRoute &&
      checks.noRuntimeErrors;

    console.log(JSON.stringify({ pass, checks }, null, 2));
    process.exitCode = pass ? 0 : 1;
  } finally {
    await browser.close();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
