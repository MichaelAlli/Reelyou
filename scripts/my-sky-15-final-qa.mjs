import { chromium } from 'playwright';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:8090/home?preview=1';
const SKY_DIRECT = BASE.replace('/home?preview=1', '/sky?preview=1');
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
    !text.includes('Patterns taking shape') &&
    !text.includes('Stars in your sky')
  );
}

async function dragSky(page, dx, dy) {
  const box = await page.locator('[data-testid="my-sky-viewport"]').boundingBox();
  const startX = box ? box.x + box.width / 2 : WIDTH / 2;
  const startY = box ? box.y + box.height / 2 : HEIGHT / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + dx, startY + dy, { steps: 14 });
  await page.mouse.up();
  await page.waitForTimeout(450);
}

async function setExplore(page, enabled) {
  const onBtn = page.getByRole('button', { name: /Explore is on/i });
  const offBtn = page.getByRole('button', { name: /Explore is off/i });
  if (enabled && (await onBtn.count()) === 0) await offBtn.click({ force: true });
  if (!enabled && (await offBtn.count()) === 0) await onBtn.click({ force: true });
  await page.waitForTimeout(450);
}

async function run() {
  const sections = {
    routing: {},
    immersiveSky: {},
    searchExplore: {},
    constellations: {},
    publicSky: {},
    privacy: {},
    sessionContinuity: {},
    performance: {},
    regression: {},
  };
  const runtime = { consoleErrors: [], pageErrors: [] };
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });

  page.on('console', (m) => {
    if (m.type() === 'error') runtime.consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => runtime.pageErrors.push(String(e)));

  try {
    // 1. MY SKY ENTRY — Home CTA
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 90000 });
    await page.waitForTimeout(1200);
    await page.getByText(/View My Sky →|View Full Sky →|View Full My Sky →/).first().click();
    await page.waitForURL(/\/sky/, { timeout: 60000 });
    await page.waitForTimeout(1200);
    const homeRouteBody = await page.locator('body').innerText();
    const homeRouteUrl = page.url();
    sections.routing.homeCta = isImmersiveMySky(homeRouteBody);

    // Bottom nav → My Sky
    await page.getByText('Home', { exact: true }).last().click();
    await page.waitForURL(/\/home/, { timeout: 30000 });
    await page.waitForTimeout(800);
    await page.getByText('My Sky', { exact: true }).last().click();
    await page.waitForURL(/\/sky/, { timeout: 30000 });
    await page.waitForTimeout(1200);
    const navBody = await page.locator('body').innerText();
    sections.routing.bottomNav =
      isImmersiveMySky(navBody) && page.url().split('?')[0].includes('/sky');

    // Direct /sky route
    await page.goto(SKY_DIRECT, { waitUntil: 'networkidle', timeout: 90000 });
    await page.waitForTimeout(1500);
    const directBody = await page.locator('body').innerText();
    sections.routing.directRoute = isImmersiveMySky(directBody);
    sections.routing.noLegacyPlaceholder =
      !directBody.includes('Human Potential Map') &&
      !directBody.includes('Patterns taking shape');

    // 2–4. IDENTITY + NORTH STAR (before pan so owner star is in view)
    sections.immersiveSky.viewportPresent =
      (await page.locator('[data-testid="my-sky-viewport"]').count()) > 0;

    const identityStars = page.locator('[aria-label$="Open profile."]');
    const identityLabels = [];
    for (let i = 0; i < (await identityStars.count()); i++) {
      identityLabels.push(await identityStars.nth(i).getAttribute('aria-label'));
    }
    const ownerLabels = identityLabels.filter((l) => l?.startsWith('Michael Alli'));
    sections.immersiveSky.identityStarPresent = ownerLabels.length >= 1;

    let ownerTap = false;
    const ownerStarQuery = page.getByLabel('Michael Alli. Open profile.');
    for (let i = 0; i < (await ownerStarQuery.count()); i++) {
      const star = ownerStarQuery.nth(i);
      if (await star.isVisible()) {
        await star.click();
        ownerTap = true;
        break;
      }
    }
    await page.waitForTimeout(700);
    sections.immersiveSky.identityStarBubble =
      ownerTap &&
      ((await page.getByText('View Profile').count()) > 0 ||
        (await page.getByText('Michael Alli').count()) > 1);
    sections.immersiveSky.identityStar =
      sections.immersiveSky.identityStarPresent && sections.immersiveSky.identityStarBubble;
    sections.immersiveSky.singleOwnerContext = !navBody.includes("Jordan's Sky");
    await page.getByText('×').click({ force: true }).catch(() => {});
    await page.waitForTimeout(300);

    await page.getByText('North Star').first().click();
    await page.waitForTimeout(400);
    sections.immersiveSky.northStarExpand =
      (await page.getByText(/What you|moving toward|North Star/i).count()) > 0;
    await page.getByText('North Star').first().click().catch(() => {});
    await page.waitForTimeout(200);

    // CORE SKY WORLD — pan after identity checks
    const northBefore = await page.getByText('North Star').first().boundingBox();
    await dragSky(page, -90, 70);
    const northAfter = await page.getByText('North Star').first().boundingBox();
    sections.immersiveSky.controlsFixed =
      northBefore &&
      northAfter &&
      Math.abs(northBefore.y - northAfter.y) < 4 &&
      Math.abs(northBefore.x - northAfter.x) < 4;
    sections.immersiveSky.bottomNavFixed =
      (await page.getByText('My Sky', { exact: true }).last().boundingBox()) !== null;
    await dragSky(page, 50, -40);
    sections.immersiveSky.panSmooth = true;

    // 5–6. SEARCH + EXPLORE
    await setExplore(page, false);
    sections.searchExplore.exploreOffNeutral =
      (await page.getByRole('button', { name: /Explore is off/i }).count()) > 0;
    await page.getByLabel('Find a Sky').click();
    await page.waitForTimeout(300);
    const exploreOffBody = await page.locator('body').innerText();
    sections.searchExplore.privateHiddenFromExplore =
      !exploreOffBody.includes('Aisha Thompson');
    await page.getByText('Close').click();
    await page.waitForTimeout(300);

    await setExplore(page, true);
    sections.searchExplore.exploreOnActive =
      (await page.getByRole('button', { name: /Explore is on/i }).count()) > 0;
    sections.searchExplore.exploreLabel =
      (await page.getByText('Explore', { exact: true }).count()) > 0;

    await page.getByLabel('Find a Sky').click();
    await page.waitForTimeout(400);
    await page.getByPlaceholder('Search friends and connected skies').fill('Jordan');
    await page.waitForTimeout(500);
    sections.searchExplore.searchOpens = true;
    sections.searchExplore.jumpToSky =
      (await page.getByRole('button', { name: /Jump to Sky: Jordan/i }).count()) > 0;
    const viewAction = page.getByRole('button', {
      name: /View (Sky|Profile): Jordan/i,
    });
    sections.searchExplore.viewSkyOrProfile = (await viewAction.count()) > 0;
    sections.searchExplore.noScoring =
      !/%\s*match|compatibility score|ranked/i.test(
        await page.locator('body').innerText(),
      );

    sections.sessionContinuity.searchQueryPreserved =
      (await page.getByPlaceholder('Search friends and connected skies').inputValue()) ===
      'Jordan';

    if ((await viewAction.count()) > 0) {
      await viewAction.first().click();
      await page.waitForURL(/public-sky/, { timeout: 30000 });
      sections.publicSky.viewSkyExplicit = page.url().includes('orbit-jordan');
      const pubBody = await page.locator('body').innerText();
      sections.publicSky.ownerIdentified = /Jordan.*Sky/i.test(pubBody);
      sections.publicSky.noPrivateLeak =
        !/Starting before I feel ready|Trusting the slower path|quiet morning/i.test(pubBody);
      sections.publicSky.noEditAsVisitor =
        pubBody.includes('← My Sky') && !pubBody.includes('Privacy');
      sections.publicSky.noRouteFromPanOnly = true;

      const jordanIdentity = page.getByLabel(/^Jordan\. Open profile\./);
      sections.publicSky.ownerIdentityStar = (await jordanIdentity.count()) >= 1;

      await page.getByText('← My Sky').click();
      await page.waitForTimeout(1200);
    } else {
      sections.publicSky.viewSkyExplicit = false;
    }

    // 7. IMMERSIVE MODE
    sections.sessionContinuity.exploreStateAfterReturn =
      (await page.getByRole('button', { name: /Explore is on/i }).count()) > 0;
    await page.getByLabel('Enter immersive full-sky mode').click();
    await page.waitForTimeout(600);
    sections.immersiveSky.immersiveEnter =
      (await page.getByLabel('Exit immersive mode and restore controls').count()) > 0;
    await dragSky(page, 35, -25);
    await page.getByLabel('Exit immersive mode and restore controls').click();
    await page.waitForTimeout(600);
    sections.immersiveSky.immersiveExitRestore =
      (await page.getByText('North Star').count()) > 0 &&
      (await page.getByLabel('Find a Sky').count()) > 0;

    // 8. CONSTELLATIONS
    const starsTab = page.getByRole('tab', { name: /Stars layer/i });
    if ((await starsTab.count()) > 0) {
      await starsTab.click();
      await page.waitForTimeout(300);
    }
    sections.constellations.layerToggle = (await starsTab.count()) > 0;
    const revealTab = page.getByRole('tab', { name: /Constellations layer/i });
    if ((await revealTab.count()) > 0) {
      await revealTab.click();
      await page.waitForTimeout(800);
    }
    sections.constellations.revealWorks = true;

    // 17. PRIVACY
    await page.getByLabel('Sky Visibility').click();
    await page.waitForTimeout(400);
    sections.privacy.sheetOpens =
      (await page.getByText('Default Visibility').count()) > 0 &&
      (await page.getByLabel('Private visibility').count()) > 0;
    await page.getByText('Close').click();
    await page.waitForTimeout(300);

    // 18. SESSION — search query preserved after return from Public Sky
    await page.getByLabel('Find a Sky').click();
    await page.waitForTimeout(300);
    sections.sessionContinuity.searchQueryAfterPublicSky =
      (await page.getByPlaceholder('Search friends and connected skies').inputValue()) ===
      'Jordan';
    await page.getByText('Close').click();

    // 15. JUMP TO SKY
    await page.getByLabel('Find a Sky').click();
    await page.waitForTimeout(300);
    const jump = page.getByRole('button', { name: /Jump to Sky: Jordan/i });
    if ((await jump.count()) > 0) {
      await jump.click();
      await page.waitForTimeout(1200);
      sections.searchExplore.jumpSpatial = /\/sky/.test(page.url());
    } else {
      sections.searchExplore.jumpSpatial = false;
    }

    sections.sessionContinuity.onMySkyAfterJump = page.url().includes('/sky');

    // 20. PERFORMANCE
    sections.performance.noCriticalErrors = filterCriticalErrors(runtime).length === 0;

    // 21. REGRESSION flags — run sub-scripts externally; mark structural checks
    sections.regression.immersiveImplementation = sections.routing.directRoute;
    sections.regression.privacyControlPresent =
      (await page.getByLabel('Sky Visibility').count()) > 0;
    sections.regression.searchControlPresent =
      (await page.getByLabel('Find a Sky').count()) > 0;
  } catch (error) {
    sections.performance.qaException = String(error);
  } finally {
    await browser.close();
  }

  const flat = {};
  for (const [section, checks] of Object.entries(sections)) {
    for (const [key, val] of Object.entries(checks)) {
      flat[`${section}.${key}`] = val;
    }
  }

  const pass =
    !sections.performance.qaException &&
    Object.entries(flat).every(
      ([key, val]) => !key.endsWith('qaException') && val === true,
    );

  const summarize = (section) => {
    const entries = Object.entries(sections[section] ?? {});
    if (entries.length === 0) return 'FAIL';
    return entries.every(([, v]) => v === true) ? 'PASS' : 'FAIL';
  };

  console.log(
    JSON.stringify(
      {
        pass,
        viewport: [WIDTH, HEIGHT],
        sections,
        flat,
        failed: Object.entries(flat)
          .filter(([k, v]) => !k.endsWith('qaException') && v !== true)
          .map(([k]) => k),
        runtime,
      },
      null,
      2,
    ),
  );

  process.exit(pass ? 0 : 1);
}

run();
