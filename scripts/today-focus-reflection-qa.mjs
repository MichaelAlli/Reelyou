/**
 * Today Focus + Reflection — full loop QA
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:8090';
const HOME = `${BASE}/home?preview=1`;
const KEY = '@reellyou/today-focus';
const DEFAULT = 'What habit or belief are you building today?';
const FOCUS_A = 'Build confidence';
const FOCUS_B = 'Make space for creativity';
const REFLECTION_A = 'I want to speak up without second guessing myself.';
const REFLECTION_B = 'I made room for one creative moment today.';
const VIEWPORTS = [360, 390, 393, 412, 430];

function log(s, m) { console.log(`[${s}] ${m}`); }

async function storage(page) {
  return page.evaluate((k) => {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : null;
  }, KEY);
}

async function homePrompt(page) {
  return page.evaluate(({ def, samples }) => {
    const el = [...document.querySelectorAll('*')].find((n) => {
      if (n.children.length) return false;
      const t = n.textContent?.trim() ?? '';
      return t === def || samples.some((s) => t === s);
    });
    return el?.textContent?.trim() ?? null;
  }, { def: DEFAULT, samples: [FOCUS_A, FOCUS_B] });
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(e.message));

const report = { steps: [], mobile: [], errors: [] };

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(HOME, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(2000);

// A-E: focus custom save
await page.getByText('Edit', { exact: true }).click();
await page.waitForURL(/today-focus-edit/);
await page.getByPlaceholder('What deserves your attention today?').fill(FOCUS_A);
await page.getByText('Set as today\u2019s focus', { exact: true }).click();
await page.waitForURL(/\/home/);
await page.waitForTimeout(800);
let prompt = await homePrompt(page);
report.steps.push(['E focus on home', prompt === FOCUS_A]);

// F-H: reflection save
await page.getByText('Answer your reflection prompt \u2192', { exact: true }).click();
await page.waitForURL(/today-focus-reflection/);
await page.waitForTimeout(600);
const ctxVisible = await page.getByText('Reflection', { exact: true }).isVisible();
await page.getByLabel('Write a short reflection...').fill(REFLECTION_A);
await page.getByText('Save', { exact: true }).click();
await page.waitForURL(/\/home/);
const stored1 = await storage(page);
report.steps.push(['H reflection saved', stored1?.reflection === REFLECTION_A && stored1?.value === FOCUS_A]);
report.steps.push(['H focus context shown', ctxVisible]);

// I-J: navigate away/back
await page.goto(`${BASE}/sky`);
await page.waitForTimeout(800);
await page.goto(HOME);
await page.waitForTimeout(1200);
prompt = await homePrompt(page);
report.steps.push(['J focus after nav', prompt === FOCUS_A]);

// K: reopen reflection
await page.getByText('Answer your reflection prompt \u2192').click();
await page.waitForURL(/today-focus-reflection/);
const reopenVal = await page.getByLabel('Write a short reflection...').inputValue();
report.steps.push(['K reflection preserved', reopenVal === REFLECTION_A]);
await page.goBack();

// L: edit reflection
await page.getByText('Answer your reflection prompt \u2192').click();
await page.getByLabel('Write a short reflection...').fill(REFLECTION_B);
await page.getByText('Save', { exact: true }).click();
await page.waitForURL(/\/home/);
const stored2 = await storage(page);
report.steps.push(['L reflection updated', stored2?.reflection === REFLECTION_B]);

// M-N: change focus clears reflection
await page.getByText('Edit', { exact: true }).click();
await page.getByPlaceholder('What deserves your attention today?').fill(FOCUS_B);
await page.getByText('Set as today\u2019s focus', { exact: true }).click();
await page.waitForURL(/\/home/);
const stored3 = await storage(page);
report.steps.push(['N focus changed', stored3?.value === FOCUS_B]);
report.steps.push(['N reflection cleared on focus change', stored3?.reflection == null]);

// O-P: clear focus
await page.getByText('Edit', { exact: true }).click();
await page.getByText('Clear today\u2019s focus', { exact: true }).click();
await page.waitForURL(/\/home/);
prompt = await homePrompt(page);
const stored4 = await storage(page);
report.steps.push(['P neutral home', prompt === DEFAULT]);
report.steps.push(['P storage cleared', !stored4?.value && !stored4?.reflection]);

// Q-R: reload
await page.getByText('Edit', { exact: true }).click();
await page.getByPlaceholder('What deserves your attention today?').fill(FOCUS_A);
await page.getByText('Set as today\u2019s focus', { exact: true }).click();
await page.getByText('Answer your reflection prompt \u2192').click();
await page.getByLabel('Write a short reflection...').fill(REFLECTION_A);
await page.getByText('Save', { exact: true }).click();
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2000);
const stored5 = await storage(page);
prompt = await homePrompt(page);
report.steps.push(['R reload persistence', stored5?.reflection === REFLECTION_A && prompt === FOCUS_A]);

// Mobile
for (const w of VIEWPORTS) {
  await page.setViewportSize({ width: w, height: w === 360 ? 800 : 844 });
  await page.goto(HOME);
  await page.waitForTimeout(800);
  await page.getByText('Answer your reflection prompt \u2192').click();
  await page.waitForURL(/today-focus-reflection/);
  const saveVisible = await page.getByText('Save', { exact: true }).isVisible();
  await page.getByText('Save', { exact: true }).scrollIntoViewIfNeeded();
  report.mobile.push([w, saveVisible]);
  await page.goBack();
}

// Regression
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(HOME);
await page.waitForTimeout(1000);
const reg = await page.evaluate(() => {
  const b = document.body.innerText;
  return {
    hero: /Good (morning|afternoon|evening),/.test(b) && b.includes('Michael'),
    skywrite: b.includes('Write your sky...'),
    starpath: b.includes('My StarPath'),
    mySky: b.includes('My Sky'),
    growingIn: b.includes('Growing In'),
    nav: ['Home', 'My Sky', 'Starpath', 'Skywrite', 'Me'].every((t) => b.includes(t)),
  };
});

await browser.close();

const pass = report.steps.every(([, ok]) => ok) && report.mobile.every(([, ok]) => ok) && errors.length === 0;
console.log(JSON.stringify({ pass, report, reg, errors: [...new Set(errors)] }, null, 2));
process.exit(pass ? 0 : 1);
