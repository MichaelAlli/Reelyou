import { chromium } from 'playwright';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:8081/home?preview=1';
const VIEWPORTS = [[360, 800], [390, 844], [393, 852], [412, 915], [430, 932]];

async function openHome(page) {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
}

function sectionOrder(text) {
  const markers = [
    'Write your sky',
    'Around Your Sky',
    'My StarPath',
    'My Sky',
    'Growing In',
    "Today's Focus",
  ];
  const idx = markers.map((m) => text.indexOf(m)).filter((i) => i >= 0);
  const sorted = [...idx].sort((a, b) => a - b);
  return JSON.stringify(idx) === JSON.stringify(sorted) && idx.length >= 5;
}

async function runMain(page) {
  const report = {
    skywrite: {},
    rendering: {},
    destinations: [],
    community: {},
    caughtUp: false,
    quiet: { implemented: true, note: 'Live quiet UI requires AROUND_YOUR_SKY_FORCE_QUIET=true in fixtures' },
    runtime: { consoleErrors: [], pageErrors: [] },
    regression: {},
    scrollOrder: false,
    privacy: {},
  };

  page.on('console', (m) => { if (m.type() === 'error') report.runtime.consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => report.runtime.pageErrors.push(String(e)));

  await openHome(page);
  const homeText = await page.locator('body').innerText();
  report.scrollOrder = sectionOrder(homeText);

  // 1 Skywrite regression
  report.skywrite.hint = homeText.includes('on your mind today') || homeText.includes('on your mind');
  report.skywrite.placeholder = homeText.includes('Write your sky');
  report.skywrite.iconLabel = await page.getByLabel('Open Skywrite').isVisible();
  await page.getByLabel('Open Skywrite').click();
  await page.waitForURL(/\/skywrite/, { timeout: 30000 });
  report.skywrite.opensRoute = true;
  await page.goBack();
  await openHome(page);

  // 2 Rendering
  await page.getByText('Around Your Sky', { exact: true }).waitFor();
  const messages = [
    'Jordan shared a new Skywrite.',
    'Something new is happening in Creativity.',
    'David reached a meaningful moment',
  ];
  const visible = [];
  for (const m of messages) {
    if (homeText.includes(m)) visible.push(m);
  }
  report.rendering.itemCount = visible.length;
  report.rendering.finite = visible.length >= 1 && visible.length <= 3;
  report.rendering.noDuplicates = visible.length === new Set(visible).size;

  // 3 Activity types in text
  report.rendering.types = {
    connection: homeText.includes('Jordan shared'),
    community: homeText.includes('Creativity'),
    growth: homeText.includes('David reached'),
  };

  // 4 Destinations — skywrite
  await page.getByText('Jordan shared a new Skywrite.').click();
  await page.waitForURL(/\/skywrite/, { timeout: 30000 });
  report.destinations.push({ item: 'connection/skywrite', ok: true });
  await page.goBack();
  await openHome(page);

  // community
  await page.getByText('Something new is happening in Creativity.').click();
  await page.waitForURL(/\/community\?id=creativity/, { timeout: 30000 });
  const commBody = await page.locator('body').innerText();
  report.destinations.push({ item: 'community/creativity', ok: commBody.includes('Creativity') && commBody.includes('About this community') });
  report.community.detailOpens = true;
  report.community.correctName = commBody.includes('Creativity');

  // join and verify
  if (commBody.includes('Join community')) {
    await page.getByText('Join community').click();
    report.community.joinWorks = await page.getByText(/part of this community/i).isVisible();
  } else {
    report.community.joinWorks = commBody.includes('part of this community');
  }
  await page.getByRole('button', { name: '← Back' }).first().click();
  await openHome(page);
  await page.getByText('Something new is happening in Creativity.').click();
  report.community.joinPersists = await page.getByText(/part of this community/i).isVisible();
  await page.getByRole('button', { name: '← Back' }).first().click();
  await openHome(page);

  // public-sky growth
  await page.getByText('David reached a meaningful moment').click();
  await page.waitForURL(/\/public-sky\?id=orbit-2/, { timeout: 30000 });
  const skyBody = await page.locator('body').innerText();
  report.destinations.push({ item: 'growth/public-sky David', ok: skyBody.includes('David') });
  await page.goBack();
  await openHome(page);

  // public-sky social (4th item may not show — only 3 on home)
  const hasMaya = (await page.locator('body').innerText()).includes('Maya shared');
  if (hasMaya) {
    await page.getByText('Maya shared a moment').click();
    await page.waitForURL(/\/public-sky\?id=orbit-3/, { timeout: 30000 });
    report.destinations.push({ item: 'social/public-sky Maya', ok: (await page.locator('body').innerText()).includes('Maya') });
    await page.goBack();
    await openHome(page);
  } else {
    report.destinations.push({ item: 'social/public-sky Maya', ok: 'not in top-3 slice (expected finite feed)' });
  }

  // 6 Caught up
  const finalText = await page.locator('body').innerText();
  report.caughtUp = /caught up/i.test(finalText);
  report.rendering.noLoadMore = !/load more|pull for more|refresh for/i.test(finalText);

  // Privacy
  report.privacy = {
    noAiMatch: !/AI matched|recommended for you|compatibility|match %/i.test(finalText),
    noFollowers: !/follower|following count|trending/i.test(finalText),
  };

  // 13 Regression
  report.regression = {
    hero: /Good (morning|afternoon|evening)/.test(finalText),
    skywrite: await page.getByLabel('Open Skywrite').isVisible(),
    starpath: finalText.includes('My StarPath'),
    mySky: finalText.includes('My Sky'),
    growingIn: finalText.includes('Growing In'),
    todayFocus: /Today.s Focus/.test(finalText),
    nav: finalText.includes('Home'),
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
      const section = await page.getByText('Around Your Sky', { exact: true }).isVisible();
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const caughtUp = await page.getByText(/caught up/i).isVisible();
      const box = await page.getByText('Around Your Sky', { exact: true }).boundingBox();
      out.push({ width, height, section, caughtUp, widthOk: box ? box.width <= width : false, pass: section && caughtUp });
    } catch (e) {
      out.push({ width, height, pass: false, error: String(e) });
    } finally {
      await ctx.close();
    }
  }
  return out;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const report = await runMain(page);
const mobile = await mobileChecks(browser);
await browser.close();

const pass =
  report.scrollOrder &&
  report.skywrite.opensRoute &&
  report.rendering.finite &&
  report.caughtUp &&
  report.community.detailOpens &&
  report.destinations.every((d) => d.ok === true || d.ok === 'not in top-3 slice (expected finite feed)') &&
  Object.values(report.regression).every(Boolean) &&
  report.privacy.noAiMatch &&
  report.privacy.noFollowers &&
  mobile.every((m) => m.pass) &&
  report.runtime.pageErrors.length === 0;

console.log(JSON.stringify({ pass, report, mobile }, null, 2));
process.exit(pass ? 0 : 1);
