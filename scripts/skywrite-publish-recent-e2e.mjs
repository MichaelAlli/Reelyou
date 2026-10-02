/**
 * Local-only publish smoke: text post → Recent row visible (no API required).
 * Usage: npx expo start --web --port 8090  (separate terminal)
 *        node scripts/skywrite-publish-recent-e2e.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:8090/skywrite';
const unique = `E2E publish ${Date.now()}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 393, height: 852 } });
const timings = { started: Date.now() };
const consoleLogs = [];

page.on('console', (m) => {
  const text = m.text();
  if (text.includes('[skywrite-publish]')) consoleLogs.push(text);
});

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 120_000 });
await page.waitForTimeout(2000);

const textarea = page.locator('textarea').first();
await textarea.waitFor({ timeout: 60_000 });
await textarea.fill(unique);

await page.getByRole('button', { name: 'Preview' }).click();
await page.waitForTimeout(1500);

const postBtn = page.getByRole('button', { name: 'Post to Sky' });
await postBtn.waitFor({ timeout: 30_000 });

const labelSamples = [];
const labelPoll = setInterval(async () => {
  try {
    const postingText = await page.locator('text=/Posting|Uploading media/').first().textContent();
    if (postingText) labelSamples.push({ atMs: Date.now() - timings.started, text: postingText });
  } catch {
    // ignore
  }
}, 200);

timings.postClick = Date.now();
await postBtn.click();

await page.waitForFunction(
  () => !document.body.innerText.includes('Post to Sky') || document.querySelector('[role="dialog"]') === null,
  { timeout: 120_000 },
).catch(() => undefined);

clearInterval(labelPoll);
timings.finished = Date.now();

await page.goto(BASE.replace('/skywrite', '/sky'), { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2000);

const mySkywrites = page.getByRole('button', { name: /My Skywrites/i });
if (await mySkywrites.count()) {
  await mySkywrites.first().click();
  await page.waitForTimeout(1500);
}

const recentHit = await page.getByText(unique, { exact: false }).count();
const savingLabel = await page.getByText('Saving…').count();

await browser.close();

console.log(
  JSON.stringify(
    {
      ok: recentHit > 0,
      recentHit,
      savingLabelDuringFlow: savingLabel,
      labelSamples,
      durationMs: timings.finished - timings.started,
      postFlowMs: timings.finished - timings.postClick,
      consoleLogs,
      note: recentHit > 0 ? 'browser_recent_ok' : 'browser_recent_missing',
    },
    null,
    2,
  ),
);

process.exitCode = recentHit > 0 ? 0 : 1;
