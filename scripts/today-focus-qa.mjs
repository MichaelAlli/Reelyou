/**
 * Today's Focus — final functional QA script.
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:8090';
const HOME = `${BASE}/home?preview=1`;
const STORAGE_KEY = '@reellyou/today-focus';
const DEFAULT_PROMPT = 'What habit or belief are you building today?';
const CUSTOM = 'Speak with more confidence';

const VIEWPORTS = [360, 390, 393, 412, 430];

function log(status, msg) {
  console.log(`[${status}] ${msg}`);
}

async function openEdit(page) {
  await page.getByText('Edit', { exact: true }).click({ timeout: 10000 });
  await page.waitForURL(/today-focus-edit/, { timeout: 10000 });
}

async function getHomePrompt(page) {
  return page.evaluate(({ defaultPrompt, customSample }) => {
    const candidates = [...document.querySelectorAll('*')].filter((el) => {
      if (el.children.length > 0) return false;
      const t = el.textContent?.trim() ?? '';
      return (
        t === defaultPrompt ||
        t.startsWith('Stay present') ||
        t.startsWith('Move at') ||
        t.startsWith('Notice one') ||
        t.startsWith('Return to') ||
        t.startsWith('Give gentle') ||
        t.startsWith('Move kindly') ||
        t === customSample
      );
    });
    return candidates[0]?.textContent?.trim() ?? null;
  }, { defaultPrompt: DEFAULT_PROMPT, customSample: CUSTOM });
}

async function readStoredFocus(page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, STORAGE_KEY);
}

async function saveSuggestion(page, label) {
  await openEdit(page);
  await page.getByText(label, { exact: true }).click();
  await page.getByText('Set as today\u2019s focus', { exact: true }).click();
  await page.waitForURL(/\/home/, { timeout: 10000 });
  await page.waitForTimeout(800);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text());
});
page.on('pageerror', (err) => errors.push(err.message));

const results = {
  selection: { pass: false, notes: [] },
  custom: { pass: false, notes: [] },
  clear: { pass: false, notes: [] },
  persistence: { pass: false, notes: [] },
  reflection: { pass: false, notes: [] },
  mobile: { pass: false, notes: [] },
};

// --- Setup ---
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(HOME, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(2000);

// --- 1. Focus selection ---
try {
  await openEdit(page);
  const suggestions = await page.evaluate(() =>
    [...document.querySelectorAll('*')]
      .filter((el) => el.textContent?.trim() === 'Stay present with what matters today')
      .map(() => 'Stay present with what matters today'),
  );
  if (suggestions.length === 0) throw new Error('Edit screen did not open with suggestions');
  results.selection.notes.push('Edit opens with suggestions');

  await page.goBack();
  await page.waitForTimeout(600);

  const toTest = [
    'Stay present with what matters today',
    'Move at a pace that feels honest',
    'Notice one small moment of growth',
    'Return to what feels meaningful',
  ];

  for (const label of toTest) {
    await saveSuggestion(page, label);
    const stored = await readStoredFocus(page);
    const prompt = await getHomePrompt(page);
    if (stored?.value !== label || stored?.source !== 'suggested') {
      throw new Error(`Storage mismatch for "${label}": ${JSON.stringify(stored)}`);
    }
    if (prompt !== label) {
      throw new Error(`Home prompt mismatch for "${label}": got "${prompt}"`);
    }
    results.selection.notes.push(`Saved suggestion: ${label}`);
  }
  results.selection.pass = true;
  log('PASS', 'Focus selection');
} catch (e) {
  results.selection.notes.push(e.message);
  log('FAIL', `Focus selection: ${e.message}`);
}

// --- 2. Custom focus ---
try {
  await openEdit(page);
  const input = page.getByPlaceholder('What deserves your attention today?');
  await input.fill(CUSTOM);
  await page.getByText('Set as today\u2019s focus', { exact: true }).click();
  await page.waitForURL(/\/home/, { timeout: 10000 });
  await page.waitForTimeout(800);

  const stored = await readStoredFocus(page);
  const prompt = await getHomePrompt(page);
  if (stored?.value !== CUSTOM || stored?.source !== 'custom') {
    throw new Error(`Custom storage mismatch: ${JSON.stringify(stored)}`);
  }
  if (prompt !== CUSTOM) throw new Error(`Home custom prompt: "${prompt}"`);

  await openEdit(page);
  const inputVal = await page.getByPlaceholder('What deserves your attention today?').inputValue();
  if (inputVal !== CUSTOM) throw new Error(`Reopen custom state: "${inputVal}"`);
  await page.goBack();
  await page.waitForTimeout(500);

  results.custom.pass = true;
  results.custom.notes.push('Custom save, Home display, reopen state OK');
  log('PASS', 'Custom focus');
} catch (e) {
  results.custom.notes.push(e.message);
  log('FAIL', `Custom focus: ${e.message}`);
}

// --- 3. Clear focus ---
try {
  await openEdit(page);
  await page.getByText('Clear today\u2019s focus', { exact: true }).click();
  await page.waitForURL(/\/home/, { timeout: 10000 });
  await page.waitForTimeout(800);

  const stored = await readStoredFocus(page);
  const prompt = await getHomePrompt(page);
  if (stored?.value) throw new Error(`Storage not cleared: ${JSON.stringify(stored)}`);
  if (prompt !== DEFAULT_PROMPT) throw new Error(`Home not neutral: "${prompt}"`);
  const guilt = await page.evaluate(() =>
    document.body.innerText.toLowerCase().includes('error') ||
    document.body.innerText.toLowerCase().includes('failed'),
  );
  if (guilt) throw new Error('Unexpected error/guilt messaging on Home');

  results.clear.pass = true;
  results.clear.notes.push('Clear resets Home to default prompt');
  log('PASS', 'Clear focus');
} catch (e) {
  results.clear.notes.push(e.message);
  log('FAIL', `Clear focus: ${e.message}`);
}

// --- 4. Persistence ---
try {
  await saveSuggestion(page, 'Return to what feels meaningful');
  await page.goto(`${BASE}/sky`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.goto(HOME, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  let prompt = await getHomePrompt(page);
  if (prompt !== 'Return to what feels meaningful') {
    throw new Error(`After tab nav: "${prompt}"`);
  }

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  prompt = await getHomePrompt(page);
  const stored = await readStoredFocus(page);
  if (prompt !== 'Return to what feels meaningful') {
    throw new Error(`After reload: "${prompt}"`);
  }
  if (stored?.value !== 'Return to what feels meaningful') {
    throw new Error(`After reload storage: ${JSON.stringify(stored)}`);
  }

  results.persistence.pass = true;
  results.persistence.notes.push('Survives tab nav + page reload via localStorage');
  log('PASS', 'Persistence');
} catch (e) {
  results.persistence.notes.push(e.message);
  log('FAIL', `Persistence: ${e.message}`);
}

// --- 6. Reflection ---
try {
  await page.goto(HOME, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  await page.getByText('Answer your reflection prompt \u2192', { exact: true }).click();
  await page.waitForURL(/\/skywrite/, { timeout: 10000 });
  await page.waitForTimeout(800);

  const input = page.getByPlaceholder('Share your reflection...');
  await input.waitFor({ state: 'visible' });
  await input.fill('Today I practiced speaking up in one small moment.');
  await page.getByText('Release Skywrite', { exact: true }).click();
  await page.waitForTimeout(1200);

  const success = await page.getByText('Your reflection became a star in your sky.').isVisible();
  if (!success) throw new Error('Skywrite submit did not reach success state');

  const reflectionInStorage = await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.reflection ?? null;
  }, STORAGE_KEY);

  results.reflection.pass = true;
  results.reflection.notes.push('Skywrite opens, text entry, submit success');
  if (reflectionInStorage) {
    results.reflection.notes.push('Reflection stored in today-focus state');
  } else {
    results.reflection.notes.push(
      'NOT IMPLEMENTED: reflection not stored in centralized todayFocus state (Skywrite uses local composer state only)',
    );
  }
  log('PASS', 'Reflection interaction (with storage caveat)');
} catch (e) {
  results.reflection.notes.push(e.message);
  log('FAIL', `Reflection: ${e.message}`);
}

// --- 7. Mobile QA ---
try {
  let mobilePass = true;
  for (const width of VIEWPORTS) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(HOME, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const editVisible = await page.getByText('Edit', { exact: true }).isVisible();
    const focusVisible = await page.getByText('Today\u2019s Focus').isVisible();
    const navVisible = await page.getByText('Home', { exact: true }).last().isVisible();
    if (!editVisible || !focusVisible || !navVisible) {
      mobilePass = false;
      results.mobile.notes.push(`Fail at ${width}px`);
    } else {
      results.mobile.notes.push(`OK ${width}px`);
    }

    await openEdit(page);
    const setBtn = page.getByText('Set as today\u2019s focus', { exact: true });
    await setBtn.scrollIntoViewIfNeeded();
    const btnBox = await setBtn.boundingBox();
    if (!btnBox || btnBox.y + btnBox.height > 844) {
      mobilePass = false;
      results.mobile.notes.push(`Set button clipped at ${width}px`);
    }
    await page.goBack();
    await page.waitForTimeout(400);
  }
  results.mobile.pass = mobilePass;
  log(mobilePass ? 'PASS' : 'FAIL', 'Mobile QA');
} catch (e) {
  results.mobile.notes.push(e.message);
  log('FAIL', `Mobile QA: ${e.message}`);
}

// --- 8. Regression markers ---
const regression = await page.setViewportSize({ width: 390, height: 844 }).then(async () => {
  await page.goto(HOME, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  return page.evaluate(() => {
    const body = document.body.innerText;
    return {
      hero: /Good (morning|afternoon|evening),/.test(body) && body.includes('Michael'),
      skywrite: body.includes('Write your sky...'),
      starpath: body.includes('My StarPath'),
      mySky: body.includes('My Sky'),
      growingIn: body.includes('Growing In'),
      bottomNav: ['Home', 'My Sky', 'Starpath', 'Skywrite', 'Me'].every((t) => body.includes(t)),
    };
  });
});

await browser.close();

console.log('\n=== QA SUMMARY ===');
console.log(JSON.stringify({ results, regression, runtimeErrors: [...new Set(errors)] }, null, 2));

const allCorePass =
  results.selection.pass &&
  results.custom.pass &&
  results.clear.pass &&
  results.persistence.pass &&
  results.mobile.pass &&
  Object.values(regression).every(Boolean);

process.exit(allCorePass && errors.length === 0 ? 0 : 1);
