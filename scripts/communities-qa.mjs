import { chromium } from 'playwright';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:8081/home?preview=1';
const VIEWPORTS = [
  [360, 800],
  [390, 844],
  [393, 852],
  [412, 915],
  [430, 932],
];

async function runFlow(page) {
  const steps = [];
  const errors = [];

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.getByText('Growing In', { exact: true }).waitFor({ timeout: 60000 });
  await page.waitForTimeout(1500);

  // A-B-C: See All opens Communities
  await page.getByText('See All →').click();
  await page.getByText('Communities', { exact: true }).waitFor({ timeout: 60000 });
  steps.push(['C communities opens', true]);

  // D-E: Entrepreneurship detail
  await page
    .getByRole('button', { name: /Entrepreneurship\. Building ideas/i })
    .click();
  await page.getByText('About this community').waitFor();
  steps.push(['E entrepreneurship detail', true]);

  // F-G: Join
  await page.getByText('Join community').click();
  await page.getByText(/You.re part of this community\./).waitFor();
  steps.push(['G join', true]);

  // H-I: Back and return, joined persists
  await page.getByRole('button', { name: '← Back' }).first().click();
  await page.getByText('Communities', { exact: true }).waitFor();
  await page
    .getByRole('button', { name: /Entrepreneurship\. Building ideas/i })
    .click();
  const joinedVisible = await page.getByText(/You.re part of this community\./).isVisible();
  steps.push(['I joined persists', joinedVisible]);

  // J-K: Leave
  await page.getByText('Leave community').click();
  const joinBack = await page.getByText('Join community').isVisible();
  steps.push(['K leave updates', joinBack]);

  // L: Other growing-in communities
  await page.getByRole('button', { name: '← Back' }).first().click();
  for (const name of ['Personal Growth', 'Creativity', 'Purpose Seekers']) {
    await page.getByRole('button', { name: new RegExp(`^${name}\\.`) }).click();
    await page.getByText('About this community').waitFor();
    await page.getByRole('button', { name: '← Back' }).first().click();
  }
  steps.push(['L other communities route', true]);

  // M-N: Home pills
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.getByText('Entrepreneurship').first().click();
  await page.getByText('About this community').waitFor();
  steps.push(['M home pill opens detail', true]);

  await page.getByRole('button', { name: '← Back' }).first().click();
  await page.getByText('Growing In', { exact: true }).waitFor();
  steps.push(['N back navigation', true]);

  // Storage persistence reload
  await page.getByText('Entrepreneurship').first().click();
  await page.getByText('Join community').click();
  await page.reload({ waitUntil: 'networkidle' });
  const reloadJoined = await page.getByText(/You.re part of this community\./).isVisible();
  steps.push(['reload persistence', reloadJoined]);

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);

  // Locked home sections still present
  const reg = {
    hero: await page.getByText(/Good (morning|afternoon|evening)/).first().isVisible(),
    skywrite: await page.getByText("What's on your mind today?").first().isVisible(),
    starpath: await page.getByText('My StarPath').first().isVisible(),
    mySky: await page.getByText('My Sky').first().isVisible(),
    growingIn: await page.getByText('Growing In', { exact: true }).first().isVisible(),
    nav: await page.getByText('Home').first().isVisible(),
  };

  return { steps, errors, reg };
}

async function mobileChecks(browser) {
  const results = [];
  for (const [width, height] of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    try {
      await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(1500);
      await page.getByText('See All →').click();
      await page.getByText('Communities', { exact: true }).waitFor({ timeout: 60000 });
      const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      results.push([width, scrollHeight > height * 0.5]);
    } catch {
      results.push([width, false]);
    } finally {
      await context.close();
    }
  }
  return results;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const report = await runFlow(page);
const mobile = await mobileChecks(browser);
await browser.close();

const pass =
  report.steps.every(([, ok]) => ok) &&
  mobile.every(([, ok]) => ok) &&
  Object.values(report.reg).every(Boolean);

console.log(JSON.stringify({ pass, report, mobile }, null, 2));
process.exit(pass ? 0 : 1);
