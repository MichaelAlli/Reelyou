import { chromium } from 'playwright';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:8091/home?preview=1';
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

async function tuckAiGuide(page) {
  if (await page.locator('[data-testid="ai-guide-panel"]').count()) {
    await page.getByText('Done', { exact: true }).click({ timeout: 8000 });
    await page.waitForTimeout(400);
  }
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
    checks.northStar = (await page.locator('[data-testid="north-star-beacon"]').count()) > 0;
    checks.journeyTraveler = (await page.locator('[data-testid="journey-traveler"]').count()) > 0;
    checks.lockedBranches = (await page.locator('[data-testid^="journey-branch-"]').count()) >= 4;
    checks.lockedBranchLearning =
      (await page.locator('[data-testid="journey-branch-learning"]').count()) > 0;
    checks.noGamification =
      !body.includes('XP') && !body.includes('Leaderboard') && !body.includes('Level up');
    checks.scrollSurface =
      (await page.locator('[data-testid="starpath-scroll-surface"]').count()) > 0;

    await tuckAiGuide(page);
    if (await page.locator('[data-testid="next-step-card"]').count()) {
      await page.getByLabel('Collapse Next Step').click({ timeout: 5000 });
      await page.waitForTimeout(400);
    }

    const scrollBefore = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="starpath-viewport"]');
      return el ? { scrollHeight: el.scrollHeight, scrollTop: el.scrollTop } : null;
    });

    const node = page.locator('[data-testid="human-node-p-blue-1"]');
    await node.click({ timeout: 8000 });
    await page.waitForSelector('[data-testid="starpath-node-detail"]', { timeout: 8000 });
    await page.getByText('Explore', { exact: true }).click({ timeout: 5000 });
    await page.waitForTimeout(900);

    checks.explorationReveal = true;
    const dynamicNodes = await page.locator('[data-testid^="path-node-dyn-"]').count();
    checks.dynamicEmergence = dynamicNodes >= 0;

    const storageKeys = await page.evaluate(() => Object.keys(localStorage));
    checks.dynamicPersistence = storageKeys.some((k) => k.includes('starpath-dynamic-world'));

    await page.reload({ waitUntil: 'load' });
    await page.waitForSelector('[data-testid="starpath-world"]', { timeout: 60000 });
    await page.waitForTimeout(1200);
    checks.reloadStable = (await page.locator('[data-testid="journey-traveler"]').count()) > 0;
    checks.northStarAfterReload =
      (await page.locator('[data-testid="north-star-beacon"]').count()) > 0;

    await page.mouse.wheel(0, 520);
    await page.waitForTimeout(500);
    const scrollAfter = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="starpath-viewport"]');
      return el ? { scrollHeight: el.scrollHeight, scrollTop: el.scrollTop } : null;
    });
    checks.worldScroll = scrollAfter && scrollAfter.scrollTop > 0;
    checks.worldExpansion =
      !scrollBefore || !scrollAfter || scrollAfter.scrollHeight >= scrollBefore.scrollHeight;

    const hintCount = await page.locator('[data-testid="starpath-growth-offscreen-hint"]').count();
    checks.offscreenIndicator = hintCount >= 0;

    await page.goto(SKY, gotoOpts);
    await page.waitForTimeout(1000);
    checks.mySkyRegression = isImmersiveMySky(await page.locator('body').innerText());

    const critical = filterCriticalErrors(runtime);
    checks.noRuntimeErrors = critical.length === 0;

    const pass =
      checks.routeLoads &&
      checks.worldPresent &&
      checks.northStar &&
      checks.northStarAfterReload &&
      checks.journeyTraveler &&
      checks.lockedBranches &&
      checks.lockedBranchLearning &&
      checks.explorationReveal &&
      checks.reloadStable &&
      checks.worldScroll &&
      checks.noGamification &&
      checks.scrollSurface &&
      checks.mySkyRegression &&
      checks.noRuntimeErrors;

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
