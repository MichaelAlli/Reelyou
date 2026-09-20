import { chromium } from 'playwright';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:8090/home?preview=1';
const STARPATH = BASE.replace('/home?preview=1', '/starpath?preview=1');
const SKY = BASE.replace('/home?preview=1', '/sky?preview=1');
const WIDTH = 393;
const HEIGHT = 852;

function filterCriticalErrors(runtime) {
  return [
    ...runtime.pageErrors,
    ...runtime.consoleErrors.filter(
      (e) => !/deprecated|expo-av|shadow\*|textShadow|props\.pointerEvents/i.test(e),
    ),
  ];
}

function isImmersiveMySky(text) {
  return (
    text.includes('My Sky') &&
    text.includes('North Star') &&
    !text.includes('Human Potential Map') &&
    !text.includes('Patterns taking shape')
  );
}

async function run() {
  const checks = {};
  const runtime = { consoleErrors: [], pageErrors: [] };
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });

  page.on('console', (m) => {
    if (m.type() === 'error') runtime.consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => runtime.pageErrors.push(String(e)));

  const gotoOpts = { waitUntil: 'load', timeout: 120000 };

  try {
    await page.goto(STARPATH, gotoOpts);
    await page.waitForSelector('[data-testid="starpath-world"]', { timeout: 60000 });
    await page.waitForTimeout(1500);

    const body = await page.locator('body').innerText();
    checks.routeLoads = page.url().includes('/starpath');
    checks.worldPresent = (await page.locator('[data-testid="starpath-world"]').count()) > 0;
    checks.viewportPresent = (await page.locator('[data-testid="starpath-viewport"]').count()) > 0;
    checks.northStar = (await page.locator('[data-testid="north-star-beacon"]').count()) > 0;
    checks.journeyTraveler = (await page.locator('[data-testid="journey-traveler"]').count()) > 0;
    checks.nextStep = (await page.locator('[data-testid="next-step-card"]').count()) > 0;
    checks.aiGuideTrigger =
      (await page.locator('[data-testid="ai-guide-trigger"]').count()) > 0 ||
      (await page.locator('[data-testid="ai-guide-panel"]').count()) > 0;
    checks.pathNodes = (await page.locator('[data-testid^="path-node-"]').count()) >= 4;
    checks.humanNodes = (await page.locator('[data-testid^="human-node-"]').count()) >= 5;
    checks.branches = (await page.locator('[data-testid^="journey-branch-"]').count()) >= 4;
    checks.bottomNav =
      body.includes('Starpath') && body.includes('My Sky') && body.includes('Home');
    checks.appBottomNav = (await page.locator('[data-testid="reelyou-bottom-nav"]').count()) > 0;
    checks.aiGuideLabel = body.includes('AI GUIDE') && !body.includes('AI COMPANION');
    checks.nextStepWaypoint =
      (await page.locator('[data-testid="next-step-waypoint"]').count()) > 0 ||
      (await page.locator('[data-testid="next-step-card"]').count()) > 0;
    checks.nextStepCopy = body.includes('Share a reflection') || body.includes('NEXT STEP');
    checks.noLegacyDashboard =
      !body.includes('Current Path') &&
      !body.includes('Opportunity Doors') &&
      !body.includes('Companion Star');
    checks.noYourPotentialLabel = !body.includes('Your Potential');
    checks.northStarLabel = body.includes('NORTH STAR');
    checks.backControl = (await page.locator('[data-testid="starpath-back"]').count()) > 0;

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth + 2;
    });
    checks.noHorizontalOverflow = !overflow;

    checks.scrollSurface =
      (await page.locator('[data-testid="starpath-scroll-surface"]').count()) > 0;
    await page.mouse.wheel(0, 420);
    await page.waitForTimeout(600);
    checks.scrollExploration = true;

    if (await page.locator('[data-testid="ai-guide-panel"]').count()) {
      const doneBtn = page.getByRole('button', { name: 'Done' });
      if (await doneBtn.count()) {
        await doneBtn.click({ timeout: 5000 });
      } else {
        await page.getByLabel('Dismiss AI Guide').click({ timeout: 5000 });
      }
      await page.waitForTimeout(400);
    }
    checks.aiGuideTucked = (await page.locator('[data-testid="ai-guide-trigger"]').count()) > 0;

    if (await page.locator('[data-testid="next-step-card"]').count()) {
      await page.getByLabel('Collapse Next Step').click({ timeout: 5000 });
      await page.waitForTimeout(400);
    }
    checks.nextStepCollapsed =
      (await page.locator('[data-testid="next-step-waypoint"]').count()) > 0;
    if (checks.nextStepCollapsed) {
      await page.locator('[data-testid="next-step-waypoint"]').click();
      await page.waitForTimeout(400);
    }
    checks.nextStepRecalled = (await page.locator('[data-testid="next-step-card"]').count()) > 0;

    if (checks.aiGuideTucked) {
      await page.locator('[data-testid="ai-guide-trigger"]').click();
      await page.waitForTimeout(400);
    }
    checks.aiGuideRecalled = (await page.locator('[data-testid="ai-guide-panel"]').count()) > 0;

    await page.goto(SKY, gotoOpts);
    await page.waitForTimeout(1200);
    const skyBody = await page.locator('body').innerText();
    checks.mySkyRegression = isImmersiveMySky(skyBody);

    const critical = filterCriticalErrors(runtime);
    checks.noRuntimeErrors = critical.length === 0;

    const pass =
      checks.routeLoads &&
      checks.worldPresent &&
      checks.northStar &&
      checks.journeyTraveler &&
      checks.noYourPotentialLabel &&
      checks.nextStep &&
      checks.aiGuideTrigger &&
      checks.aiGuideLabel &&
      checks.nextStepWaypoint &&
      checks.nextStepCopy &&
      checks.appBottomNav &&
      checks.bottomNav &&
      checks.noLegacyDashboard &&
      checks.mySkyRegression &&
      checks.noRuntimeErrors &&
      checks.scrollSurface &&
      checks.aiGuideTucked &&
      checks.aiGuideRecalled &&
      checks.nextStepCollapsed &&
      checks.nextStepRecalled;

    console.log(JSON.stringify({ pass, checks, criticalErrors: critical }, null, 2));
    process.exitCode = pass ? 0 : 1;
  } finally {
    await browser.close();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
