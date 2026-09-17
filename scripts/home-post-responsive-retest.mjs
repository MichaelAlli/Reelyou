/**
 * HOME post-responsive functional retest — layout + interaction smoke.
 * Usage: node scripts/home-post-responsive-retest.mjs
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:8090';
const HOME = `${BASE}/home?preview=1`;

const VIEWPORTS = [
  { name: 'iPhone 13', width: 390, height: 844 },
  { name: 'iPhone 14 Pro', width: 393, height: 852 },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
  { name: 'Android small', width: 360, height: 800 },
  { name: 'Android large', width: 412, height: 915 },
];

const SECTION_MARKERS = [
  'Michael',
  'Write your sky...',
  'My StarPath',
  'My Sky',
  'Growing In',
  'Today\u2019s Focus',
];

function log(status, msg) {
  console.log(`[${status}] ${msg}`);
}

async function collectConsoleErrors(page) {
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

async function auditLayout(page, vp) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.goto(HOME, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    const scrollEl = [...document.querySelectorAll('div')].find((el) => {
      const s = getComputedStyle(el);
      return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 20;
    });
    if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
  });
  await page.waitForTimeout(400);

  return page.evaluate(
    ({ markers, vpWidth }) => {
      const issues = [];
      const root = document.querySelector('#root');
      const rootW = root?.getBoundingClientRect().width ?? 0;
      if (Math.abs(rootW - vpWidth) > 3) {
        issues.push(`root width ${rootW.toFixed(0)} != viewport ${vpWidth}`);
      }

      const rootEl = document.querySelector('#root');
      const wholeScreenScaled = rootEl
        ? [...rootEl.querySelectorAll('*')].filter((el) => {
            const r = el.getBoundingClientRect();
            if (r.width < vpWidth * 0.9 || r.height < window.innerHeight * 0.9) return false;
            const t = getComputedStyle(el).transform;
            if (!t || t === 'none') return false;
            const m = t.match(/matrix\(([^)]+)\)/);
            if (!m) return /scale\((?!1\)|1,)/.test(t);
            const parts = m[1].split(',').map((v) => parseFloat(v.trim()));
            const scaleX = parts[0];
            const scaleY = parts[3];
            return Math.abs(scaleX - 1) > 0.02 || Math.abs(scaleY - 1) > 0.02;
          })
        : [];
      if (wholeScreenScaled.length > 0) issues.push(`whole-screen scale detected: ${wholeScreenScaled.length}`);

      const scrollEl = [...document.querySelectorAll('div')].find((el) => {
        const s = getComputedStyle(el);
        return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 20;
      });
      const canScroll = !!scrollEl && scrollEl.scrollHeight > scrollEl.clientHeight + 8;
      if (!canScroll) issues.push('vertical scroll not available');

      const bodyText = document.body.innerText;
      const hasGreeting = /Good (morning|afternoon|evening),/.test(bodyText);
      if (!hasGreeting) issues.push('missing greeting');
      const missing = markers.filter((m) => !bodyText.includes(m));
      if (missing.length) issues.push(`missing sections: ${missing.join(', ')}`);

      const illegibleText = [...document.querySelectorAll('*')].filter((el) => {
        if (el.children.length > 0) return false;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        const t = el.textContent?.trim() ?? '';
        const isNavLabel = ['Home', 'My Sky', 'Starpath', 'Skywrite', 'Me'].includes(t);
        return t.length > 2 && fs > 0 && fs < 8 && !isNavLabel;
      });
      if (illegibleText.length > 0) issues.push(`illegible text nodes: ${illegibleText.length}`);

      const cards = [...document.querySelectorAll('div')].filter((el) => {
        const r = el.getBoundingClientRect();
        const br = parseFloat(getComputedStyle(el).borderRadius);
        return r.width > vpWidth * 0.55 && r.height > 50 && br >= 14;
      });
      const clippedCards = cards.filter((el) => {
        const r = el.getBoundingClientRect();
        return r.left < -2 || r.right > vpWidth + 2;
      });
      if (clippedCards.length > 0) issues.push(`clipped cards: ${clippedCards.length}`);

      const focusAction = [...document.querySelectorAll('*')].find(
        (el) => el.textContent?.trim() === 'Answer your reflection prompt \u2192',
      );
      const focusRect = focusAction?.getBoundingClientRect();
      const navHome = [...document.querySelectorAll('*')].filter((el) => el.textContent?.trim() === 'Home');
      let navTop = window.innerHeight;
      for (const el of navHome) {
        const r = el.getBoundingClientRect();
        if (r.top > window.innerHeight * 0.75) navTop = Math.min(navTop, r.top);
      }
      const focusBottom = focusRect?.bottom ?? 0;
      const focusVisible = focusRect && focusRect.top >= 0 && focusBottom <= navTop - 4;
      if (!focusVisible) {
        issues.push(`Today's Focus action not fully above nav (focusBottom=${focusBottom.toFixed(0)}, navTop=${navTop.toFixed(0)})`);
      }

      return {
        issues,
        rootW,
        canScroll,
        scrollHeight: scrollEl?.scrollHeight ?? 0,
        clientHeight: scrollEl?.clientHeight ?? 0,
      };
    },
    { markers: SECTION_MARKERS, vpWidth: vp.width },
  );
}

async function clickText(page, text, opts = {}) {
  const locator = page.getByText(text, { exact: opts.exact ?? true }).first();
  await locator.waitFor({ state: 'visible', timeout: 15000 });
  await locator.click({ timeout: 10000 });
}

async function runInteractions(page) {
  const results = [];
  const errors = [];

  const step = async (name, fn) => {
    try {
      await fn();
      results.push({ name, pass: true });
      log('PASS', name);
    } catch (err) {
      results.push({ name, pass: false, error: err.message });
      log('FAIL', `${name}: ${err.message}`);
    }
  };

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(HOME, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(2000);

  await step('View Path →', async () => {
    await clickText(page, 'View Path →', { exact: false });
    await page.waitForTimeout(1200);
    if (!page.url().includes('/starpath')) throw new Error(`url=${page.url()}`);
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    if (!page.url().includes('/home')) throw new Error(`back url=${page.url()}`);
  });

  await step('View Full Sky →', async () => {
    await clickText(page, 'View Full Sky →', { exact: false });
    await page.waitForTimeout(1200);
    if (!page.url().includes('/sky')) throw new Error(`url=${page.url()}`);
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
  });

  await step('Skywrite card entry', async () => {
    await page.goto(HOME, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const card = page.getByText('Write your sky...', { exact: false }).first();
    await card.click({ timeout: 10000 });
    await page.waitForTimeout(1200);
    if (!page.url().includes('/skywrite')) throw new Error(`url=${page.url()}`);
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
  });

  await step('Skywrite send button', async () => {
    await page.goto(HOME, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const bar = page.getByRole('button', { name: 'Open Skywrite' });
    const box = await bar.boundingBox();
    if (!box) throw new Error('skywrite bar not found');
    await page.mouse.click(box.x + box.width - 20, box.y + box.height / 2);
    await page.waitForTimeout(1200);
    if (!page.url().includes('/skywrite')) throw new Error(`url=${page.url()}`);
    await page.goto(HOME, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
  });

  const navTests = [
    ['Bottom nav — My Sky', 'My Sky', '/sky'],
    ['Bottom nav — Starpath', 'Starpath', '/starpath'],
    ['Bottom nav — Skywrite', 'Skywrite', '/skywrite'],
    ['Bottom nav — Me', 'Me', '/profile'],
    ['Bottom nav — Home', 'Home', '/home'],
  ];

  for (const [name, label, pathPart] of navTests) {
    await step(name, async () => {
      const tabs = page.getByText(label, { exact: true });
      const count = await tabs.count();
      const tab = tabs.nth(Math.max(0, count - 1));
      await tab.click({ timeout: 10000 });
      await page.waitForTimeout(1200);
      if (!page.url().includes(pathPart)) throw new Error(`url=${page.url()}`);
      if (label !== 'Home') {
        await page.goto(HOME, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);
      }
    });
  }

  await step('Home re-tap guard', async () => {
    const homeTabs = page.getByText('Home', { exact: true });
    const count = await homeTabs.count();
    await homeTabs.nth(Math.max(0, count - 1)).click();
    await page.waitForTimeout(800);
    if (!page.url().includes('/home')) throw new Error(`url=${page.url()}`);
  });

  await step('Home sections intact after nav', async () => {
    for (const m of ['My StarPath', 'Growing In', 'Today\u2019s Focus']) {
      if (!(await page.locator(`text=${m}`).first().isVisible())) {
        throw new Error(`missing ${m}`);
      }
    }
  });

  return { results, errors };
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const consoleErrors = await collectConsoleErrors(page);

log('INFO', '=== LAYOUT AUDIT ===');
const layoutResults = [];
for (const vp of VIEWPORTS) {
  const audit = await auditLayout(page, vp);
  const pass = audit.issues.length === 0;
  layoutResults.push({ viewport: vp.name, pass, ...audit });
  log(pass ? 'PASS' : 'FAIL', `${vp.name} (${vp.width}x${vp.height}) — ${pass ? 'ok' : audit.issues.join('; ')}`);
}

log('INFO', '=== INTERACTION TESTS (390x844) ===');
const interaction = await runInteractions(page);

await browser.close();

const layoutPass = layoutResults.every((r) => r.pass);
const interactionPass = interaction.results.every((r) => r.pass);
const runtimeErrors = [...new Set(consoleErrors)].filter(Boolean);

console.log('\n=== SUMMARY ===');
console.log(`Layout: ${layoutPass ? 'PASS' : 'FAIL'} (${layoutResults.filter((r) => r.pass).length}/${layoutResults.length})`);
console.log(`Interactions: ${interactionPass ? 'PASS' : 'FAIL'} (${interaction.results.filter((r) => r.pass).length}/${interaction.results.length})`);
console.log(`Runtime errors: ${runtimeErrors.length ? runtimeErrors.join(' | ') : 'none'}`);

process.exit(layoutPass && interactionPass && runtimeErrors.length === 0 ? 0 : 1);
