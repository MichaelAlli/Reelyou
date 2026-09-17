import { chromium } from 'playwright';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:8081/home?preview=1';
const VIEWPORTS = [[360, 800], [390, 844], [393, 852], [412, 915], [430, 932]];

async function openHome(page) {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
}

async function clearDismiss(page) {
  await page.evaluate(() => localStorage.removeItem('@reellyou/guiding-light-dismiss'));
}

async function runFunctional(page) {
  const report = {
    guidingLight: {},
    whyThis: {},
    dismissal: {},
    peaceState: {},
    todayFocus: {},
    companion: {},
    regression: {},
    runtime: { consoleErrors: [], pageErrors: [], reactWarnings: [] },
  };

  page.on('console', (m) => {
    const t = m.text();
    if (m.type() === 'error') report.runtime.consoleErrors.push(t);
    if (/Warning:|React/i.test(t)) report.runtime.reactWarnings.push(t);
  });
  page.on('pageerror', (e) => report.runtime.pageErrors.push(String(e)));

  // Fresh dismiss state for full flow
  await openHome(page);
  await clearDismiss(page);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const body0 = await page.locator('body').innerText();
  const titleMatches = body0.match(/Keep building your confidence/g) ?? [];
  report.guidingLight = {
    renders: body0.includes('Guiding Light'),
    oneMax: titleMatches.length <= 1,
    hasTitle: body0.includes('Keep building your confidence'),
    hasSupporting: body0.includes('You\u2019ve been returning to this theme lately.') || body0.includes("You've been returning to this theme lately."),
    noCarousel: !body0.includes('Recommendation') && titleMatches.length <= 1,
    noAiClaims: !/AI detected|We know|You need to|inferred by AI/i.test(body0),
  };

  // Why this?
  if (report.guidingLight.hasTitle) {
    await page.getByText('Why this?').click();
    await page.getByText('Close').waitFor({ timeout: 10000 });
    const modalText = await page.locator('body').innerText();
    report.whyThis = {
      opens: modalText.includes('Why this?') && modalText.includes('connects with'),
      userVisibleOnly: !/chain-of-thought|confidence score|personality|diagnos|inferred trait|hidden/i.test(modalText),
      noSensitive: !/compatibility|mental health|emotional profile/i.test(modalText),
      closes: false,
    };
    await page.getByText('Close').click();
    await page.waitForTimeout(400);
    const afterClose = await page.locator('body').innerText();
    report.whyThis.closes = afterClose.includes('Guiding Light') && !afterClose.includes('Close');
  }

  // Dismissal
  if (report.guidingLight.hasTitle) {
    await page.getByText('Not now').click();
    await page.waitForTimeout(600);
    const afterDismiss = await page.locator('body').innerText();
    report.dismissal = {
      hidesLight: !afterDismiss.includes('Keep building your confidence'),
      noGuilt: !/Are you sure|miss out|warning|lose/i.test(afterDismiss),
      noConfirm: !afterDismiss.includes('Are you sure'),
      persistsAfterReload: false,
    };
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const afterReload = await page.locator('body').innerText();
    report.dismissal.persistsAfterReload = !afterReload.includes('Keep building your confidence');
    report.peaceState = {
      showsPeace: afterReload.includes('Nothing needs your attention right now'),
      noFakeRec: !afterReload.includes('Keep building') && !afterReload.includes('You should'),
      stillUseful: afterReload.includes('My StarPath') && afterReload.includes('Today'),
      noBrokenSpace: afterReload.includes('Guiding Light'),
    };
  }

  // Companion
  await openHome(page);
  const companionLinks = await page.getByText('Companion').count();
  report.companion = {
    entryVisible: companionLinks >= 1,
    nonDominant: companionLinks <= 2,
    noAutoOpen: !(await page.url()).includes('/companion'),
  };
  await page.getByText('Companion').first().click();
  await page.waitForURL(/\/companion/, { timeout: 30000 });
  const companionBody = await page.locator('body').innerText();
  report.companion.opens = companionBody.includes('Companion');
  report.companion.noLongAnalysis = !/chain-of-thought|diagnosis|compatibility score/i.test(companionBody);
  report.companion.notFullChat = !companionBody.includes('Send message') && !companionBody.includes('Type a message');
  await page.getByText('\u2190 Home').click();
  await page.waitForURL(/\/home/, { timeout: 30000 });
  report.companion.returnsHome = (await page.url()).includes('/home');

  // Today Focus priority - open edit, verify focus section intact
  const homeBody = await page.locator('body').innerText();
  report.todayFocus = {
    sectionIntact: homeBody.includes("Today\u2019s Focus") || homeBody.includes("Today's Focus"),
    notOverwritten: homeBody.includes('Today'),
    guidingLightSeparate: homeBody.includes('Guiding Light'),
  };

  // Regression locked sections
  report.regression = {
    skywrite: homeBody.includes('Write your sky') || homeBody.includes('Skywrite'),
    aroundYourSky: homeBody.includes('Around Your Sky'),
    starpath: homeBody.includes('My StarPath'),
    mySky: homeBody.includes('View Full Sky'),
    growingIn: homeBody.includes('Growing In'),
    todayFocus: report.todayFocus.sectionIntact,
    bottomNav: homeBody.includes('Home') && homeBody.includes('My Sky'),
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
      await page.getByText('Guiding Light').waitFor({ timeout: 60000 });
      const whyVisible = await page.getByText('Why this?').isVisible().catch(() => false);
      if (whyVisible) {
        await page.getByText('Why this?').click();
        await page.getByText('Close').waitFor({ timeout: 10000 });
      }
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const text = await page.locator('body').innerText();
      results.push({
        width,
        height,
        pass: text.includes('Guiding Light') && text.includes('My StarPath') && text.includes('Home'),
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
  report.guidingLight.oneMax &&
  report.guidingLight.noAiClaims &&
  report.whyThis.opens &&
  report.whyThis.userVisibleOnly &&
  report.whyThis.closes &&
  report.dismissal.hidesLight &&
  report.dismissal.persistsAfterReload &&
  report.peaceState.showsPeace &&
  report.companion.opens &&
  report.companion.returnsHome &&
  Object.values(report.regression).every(Boolean) &&
  mobile.every((m) => m.pass) &&
  report.runtime.pageErrors.length === 0;

console.log(JSON.stringify({ pass, report, mobile }, null, 2));
process.exit(pass ? 0 : 1);
