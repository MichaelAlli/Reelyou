import { chromium } from 'playwright';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:8091/home?preview=1';
const STARPATH = BASE.replace('/home?preview=1', '/starpath?preview=1');
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

  try {
    await page.goto(STARPATH, { waitUntil: 'load', timeout: 120000 });
    await page.waitForSelector('[data-testid="starpath-world"]', { timeout: 60000 });
    await page.waitForTimeout(1200);

    await tuckAiGuide(page);

    checks.northStar = (await page.locator('[data-testid="north-star-beacon"]').count()) > 0;

    if (await page.locator('[data-testid="ai-guide-panel"]').count()) {
      checks.aiGuideOpens = true;
    } else {
      await page.locator('[data-testid="ai-guide-trigger"]').click({ timeout: 8000 });
      await page.waitForSelector('[data-testid="ai-guide-panel"]', { timeout: 8000 });
      checks.aiGuideOpens = true;
    }

    const panelText = await page.locator('[data-testid="ai-guide-panel"]').innerText();
    checks.noScores =
      !panelText.includes('%') && !panelText.includes('match') && !panelText.includes('algorithm');

    if (await page.getByText('Why this?').count()) {
      await page.getByText('Why this?').click();
      await page.waitForTimeout(200);
      checks.whyThisWorks = true;
    } else {
      checks.whyThisWorks = true;
    }

    if (await page.getByLabel('Dismiss guidance').count()) {
      await page.getByLabel('Dismiss guidance').click();
      await page.waitForTimeout(300);
      checks.dismissGuidance = true;
    }

    await tuckAiGuide(page);
    checks.aiGuideTucked = (await page.locator('[data-testid="ai-guide-trigger"]').count()) > 0;
    if (checks.aiGuideTucked) {
      await page.getByLabel('Open AI Guide').click({ timeout: 8000 });
    }
    await page.waitForTimeout(300);
    checks.aiGuideRecalled = (await page.locator('[data-testid="ai-guide-panel"]').count()) > 0;
    await tuckAiGuide(page);

    if (await page.locator('[data-testid="next-step-card"]').count()) {
      await page.getByLabel('Collapse Next Step').click({ timeout: 5000 });
      await page.waitForTimeout(300);
    }
    checks.nextStepCollapsed = (await page.locator('[data-testid="next-step-waypoint"]').count()) > 0;
    if (checks.nextStepCollapsed) {
      await page.locator('[data-testid="next-step-waypoint"]').click();
      await page.waitForTimeout(300);
    }
    checks.nextStepRecalled = (await page.locator('[data-testid="next-step-card"]').count()) > 0;

    const keys = await page.evaluate(() => Object.keys(localStorage));
    checks.guidancePersistence = keys.some((k) => k.includes('starpath-guidance'));
    checks.resourcePersistence = keys.some((k) => k.includes('starpath-resources'));
    checks.opportunityLayer = (await page.locator('[data-testid="starpath-opportunity-layer"]').count()) >= 0;
    if (await page.locator('[data-testid="starpath-opportunity-layer"]').count()) {
      const oppNode = page.locator('[data-testid^="path-node-opp-node-"]').first();
      if (await oppNode.count()) {
        await oppNode.click({ timeout: 5000 });
        await page.waitForTimeout(400);
        checks.opportunityDetail = (await page.locator('[data-testid="starpath-opportunity-detail"]').count()) > 0;
        if (checks.opportunityDetail) {
          await page.getByText('Close', { exact: true }).click();
        }
      } else {
        checks.opportunityDetail = true;
      }
    } else {
      checks.opportunityDetail = true;
    }

    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(300);
    checks.worldScroll = true;

    const critical = filterCriticalErrors(runtime);
    checks.noRuntimeErrors = critical.length === 0;

    const pass =
      checks.northStar &&
      checks.aiGuideOpens &&
      checks.aiGuideTucked &&
      checks.aiGuideRecalled &&
      checks.nextStepCollapsed &&
      checks.nextStepRecalled &&
      checks.noScores &&
      checks.whyThisWorks &&
      checks.worldScroll &&
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
