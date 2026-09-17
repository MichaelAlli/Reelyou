import { chromium } from 'playwright';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:8081/home?preview=1';
const VIEWPORTS = [[360, 800], [390, 844], [393, 852], [412, 915], [430, 932]];

const GROWING_IN = [
  { id: 'entrepreneurship', name: 'Entrepreneurship', desc: 'Building ideas, courage, and momentum' },
  { id: 'personal-growth', name: 'Personal Growth', desc: 'Conversations and experiences that support' },
  { id: 'creativity', name: 'Creativity', desc: 'A place for ideas, expression, experimentation' },
  { id: 'purpose-seekers', name: 'Purpose Seekers', desc: 'People exploring meaning, direction, contribution' },
];

const EXPLORE = ['Career Growth', 'Wellness', 'Leadership', 'Travel & Culture'];
const BANNED = [/follower/i, /match\s*%/i, /compatibility/i, /AI matched/i, /ranking/i, /like count/i];

async function homeReg(page) {
  return {
    hero: await page.getByText(/Good (morning|afternoon|evening)/).first().isVisible(),
    starpath: await page.getByText('My StarPath').first().isVisible(),
    mySky: await page.getByText('My Sky').first().isVisible(),
    growingIn: await page.getByText('Growing In', { exact: true }).first().isVisible(),
    todayFocus: await page.getByText("Today's Focus").first().isVisible(),
    nav: await page.getByText('Home').first().isVisible(),
  };
}

async function openHome(page) {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.getByText('Growing In', { exact: true }).first().waitFor({ timeout: 60000 });
  await page.waitForTimeout(1200);
}

async function runMainFlow(page) {
  const report = {
    seeAll: {},
    pills: [],
    communitiesScreen: {},
    details: [],
    joinLeave: [],
    persistence: {},
    privacy: {},
    runtime: { consoleErrors: [], pageErrors: [] },
    regression: {},
  };

  page.on('console', (msg) => {
    if (msg.type() === 'error') report.runtime.consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => report.runtime.pageErrors.push(String(err)));

  // 1. See All
  await openHome(page);
  report.regression.beforeSeeAll = await homeReg(page);
  await page.getByText('See All →').click();
  await page.getByText('Communities', { exact: true }).waitFor({ timeout: 60000 });
  report.seeAll.opens = true;
  await page.getByRole('button', { name: '← Back' }).first().click();
  await page.getByText('Growing In', { exact: true }).first().waitFor({ timeout: 60000 });
  report.seeAll.backToHome = await page.getByText('See All →').isVisible();
  report.regression.afterSeeAll = await homeReg(page);

  // 2. Home pills
  for (const c of GROWING_IN) {
    await openHome(page);
    await page.getByText(c.name, { exact: true }).last().click();
    await page.getByText('About this community').waitFor({ timeout: 30000 });
    const body = await page.locator('body').innerText();
    const ok = body.includes(c.name) && body.includes(c.desc.slice(0, 30));
    report.pills.push({ name: c.name, id: c.id, correctDetail: ok, backWorks: false });
    await page.getByRole('button', { name: '← Back' }).first().click();
    await page.getByText('Growing In', { exact: true }).first().waitFor({ timeout: 30000 });
    report.pills[report.pills.length - 1].backWorks = await page.getByText('See All →').isVisible();
  }

  // 3. Communities screen
  await openHome(page);
  await page.getByText('See All →').click();
  await page.getByText('Communities', { exact: true }).waitFor({ timeout: 60000 });
  const listText = await page.locator('body').innerText();
  report.communitiesScreen.growingInSection = listText.includes('Growing In');
  report.communitiesScreen.exploreSection = listText.includes('Explore');
  report.communitiesScreen.exploreItems = EXPLORE.every((n) => listText.includes(n));
  report.communitiesScreen.finiteEnd = listText.includes('More communities may appear');
  report.communitiesScreen.noBannedTerms = !BANNED.some((re) => re.test(listText));
  report.communitiesScreen.scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);

  // 4. Detail for all four primary
  for (const c of GROWING_IN) {
    await page.getByRole('button', { name: new RegExp(`^${c.name}\\.`) }).click();
    await page.getByText('About this community').waitFor({ timeout: 30000 });
    const body = await page.locator('body').innerText();
    report.details.push({
      id: c.id,
      hasName: body.includes(c.name),
      hasAbout: body.includes('About this community'),
      hasMoments: body.includes('From this community'),
      hasJoin: body.includes('Join community') || body.includes('Leave community'),
    });
    await page.getByRole('button', { name: '← Back' }).first().click();
    await page.getByText('Communities', { exact: true }).waitFor({ timeout: 30000 });
  }

  // 5. Join / leave — Entrepreneurship
  await page.getByRole('button', { name: /Entrepreneurship\. Building ideas/i }).click();
  await page.getByText('Join community').click();
  report.joinLeave.push({ step: 'entrepreneurship joined', ok: await page.getByText(/You.re part of this community\./).isVisible() });
  await page.getByRole('button', { name: '← Back' }).first().click();
  await page.getByRole('button', { name: /Entrepreneurship\. Building ideas/i }).click();
  report.joinLeave.push({ step: 'entrepreneurship persists', ok: await page.getByText(/You.re part of this community\./).isVisible() });
  await page.getByText('Leave community').click();
  report.joinLeave.push({ step: 'entrepreneurship leave', ok: await page.getByText('Join community').isVisible() });

  // Personal Growth join/leave basic
  await page.getByRole('button', { name: '← Back' }).first().click();
  await page.getByRole('button', { name: /Personal Growth\. Conversations/i }).click();
  await page.getByText('Join community').click();
  report.joinLeave.push({ step: 'personal-growth joined', ok: await page.getByText(/You.re part of this community\./).isVisible() });
  await page.getByText('Leave community').click();
  report.joinLeave.push({ step: 'personal-growth leave', ok: await page.getByText('Join community').isVisible() });

  // 6. Persistence via reload + AsyncStorage
  await page.getByText('Join community').click();
  await page.reload({ waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  report.persistence.reloadJoined = await page.getByText(/You.re part of this community\./).isVisible();
  const storage = await page.evaluate(async () => {
    try {
      return localStorage.getItem('@reellyou/communities');
    } catch {
      return null;
    }
  });
  report.persistence.asyncStorageKey = storage;
  report.persistence.hasJoinedInStorage = storage ? storage.includes('personal-growth') : false;

  // Tab switch simulation (navigate home then back to detail)
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1000);
  await page.getByText('Personal Growth', { exact: true }).last().click();
  report.persistence.afterNavAway = await page.getByText(/You.re part of this community\./).isVisible();

  // 9. Privacy on detail
  const detailText = await page.locator('body').innerText();
  report.privacy.noBannedTerms = !BANNED.some((re) => re.test(detailText));

  report.regression.final = await homeReg(page);

  return report;
}

async function mobileChecks(browser) {
  const results = [];
  for (const [width, height] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width, height } });
    const page = await ctx.newPage();
    try {
      await openHome(page);
      await page.getByText('See All →').click();
      await page.getByText('Communities', { exact: true }).waitFor({ timeout: 60000 });
      const scrollOk = (await page.evaluate(() => document.documentElement.scrollHeight)) > height;
      const cardVisible = await page.getByRole('button', { name: /Entrepreneurship\. Building ideas/i }).isVisible();
      results.push({ width, height, scrollOk, cardVisible, pass: scrollOk && cardVisible });
    } catch (e) {
      results.push({ width, height, pass: false, error: String(e) });
    } finally {
      await ctx.close();
    }
  }
  return results;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const report = await runMainFlow(page);
const mobile = await mobileChecks(browser);
await browser.close();

const pass =
  report.seeAll.opens &&
  report.seeAll.backToHome &&
  report.pills.every((p) => p.correctDetail && p.backWorks) &&
  report.communitiesScreen.growingInSection &&
  report.communitiesScreen.exploreSection &&
  report.communitiesScreen.finiteEnd &&
  report.communitiesScreen.noBannedTerms &&
  report.details.every((d) => d.hasName && d.hasAbout && d.hasJoin) &&
  report.joinLeave.every((j) => j.ok) &&
  report.persistence.reloadJoined &&
  report.persistence.afterNavAway &&
  report.privacy.noBannedTerms &&
  Object.values(report.regression.beforeSeeAll).every(Boolean) &&
  Object.values(report.regression.afterSeeAll).every(Boolean) &&
  Object.values(report.regression.final).every(Boolean) &&
  mobile.every((m) => m.pass) &&
  report.runtime.pageErrors.length === 0;

console.log(JSON.stringify({ pass, report, mobile }, null, 2));
process.exit(pass ? 0 : 1);
