import { chromium } from 'playwright';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:8081/home?preview=1';

async function openSkywrite(page) {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1200);
  await page.getByLabel('Open Skywrite').click();
  await page.getByText('Release Skywrite').waitFor({ timeout: 30000 });
}

async function run(page) {
  const report = { tagsRemoved: false, postNoTags: false, postWithTags: false, runtime: { errors: [] } };
  page.on('console', (m) => { if (m.type() === 'error') report.runtime.errors.push(m.text()); });
  page.on('pageerror', (e) => report.runtime.errors.push(String(e)));

  await openSkywrite(page);
  const body = await page.locator('body').innerText();
  report.tagsRemoved = !body.includes('Tags') && !body.includes('Growth') && !body.includes('Entrepreneurship');

  await page.getByPlaceholder('Share your reflection...').fill('A quiet moment of clarity today.');
  await page.getByText('Release Skywrite').click();
  await page.getByText('Your reflection became a star').waitFor({ timeout: 15000 });
  report.postNoTags = true;

  await openSkywrite(page);
  const text = "I'm finally starting the business I've been thinking about. #entrepreneurship #courage";
  await page.getByPlaceholder('Share your reflection...').fill(text);
  await page.getByText('Public Sky').click();
  await page.getByText('Release Skywrite').click();
  await page.getByText('Your reflection became a star').waitFor({ timeout: 15000 });

  const stored = await page.evaluate(async () => {
    const raw = localStorage.getItem('@reellyou/skywrites');
    return raw ? JSON.parse(raw) : null;
  });
  const latest = stored?.posts?.[0];
  report.postWithTags =
    latest?.text === text &&
    JSON.stringify(latest?.userHashtags) === JSON.stringify(['entrepreneurship', 'courage']) &&
    latest?.visibility === 'public';

  return report;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const report = await run(page);
await browser.close();

const pass = report.tagsRemoved && report.postNoTags && report.postWithTags && report.runtime.errors.length === 0;
console.log(JSON.stringify({ pass, report }, null, 2));
process.exit(pass ? 0 : 1);
