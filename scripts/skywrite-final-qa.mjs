import { chromium } from 'playwright';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:8081/home?preview=1';

function parseUserHashtags(text) {
  const regex = /#([A-Za-z][A-Za-z0-9_]*)/g;
  const seen = new Set();
  const tags = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const tag = match[1].toLowerCase();
    if (!seen.has(tag)) {
      seen.add(tag);
      tags.push(tag);
    }
  }
  return tags;
}

async function openSkywrite(page) {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1200);
  await page.getByLabel('Open Skywrite').click();
  await page.getByText('Release Skywrite').waitFor({ timeout: 30000 });
}

async function postSkywrite(page, text, visibilityLabel) {
  await page.getByPlaceholder('Share your reflection...').fill(text);
  if (visibilityLabel) {
    await page.getByText(visibilityLabel, { exact: true }).click();
  }
  await page.getByText('Release Skywrite').click();
  await page.getByText('Your reflection became a star').waitFor({ timeout: 15000 });
}

async function getLatestPost(page) {
  return page.evaluate(async () => {
    const raw = localStorage.getItem('@reellyou/skywrites');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.posts?.[0] ?? null;
  });
}

async function clearSkywrites(page) {
  await page.evaluate(() => localStorage.removeItem('@reellyou/skywrites'));
}

async function run(page) {
  const report = {
    noHashtag: {},
    naturalHashtags: {},
    edgeCases: {},
    visibility: {},
    regression: {},
    runtime: { errors: [], pageErrors: [] },
  };

  page.on('console', (m) => { if (m.type() === 'error') report.runtime.errors.push(m.text()); });
  page.on('pageerror', (e) => report.runtime.pageErrors.push(String(e)));

  await openSkywrite(page);
  const composerBody = await page.locator('body').innerText();
  report.noHashtag.noTagsSection = !composerBody.includes('Tags');
  report.noHashtag.noPredefinedChips =
    !composerBody.includes('Entrepreneurship') && !composerBody.includes('Healing');
  report.noHashtag.hasPrivacy = composerBody.includes('Privacy');
  report.noHashtag.hasMood = composerBody.includes('Mood');

  await clearSkywrites(page);
  const noTagText = 'Had a really good conversation today.';
  await postSkywrite(page, noTagText);
  const noTagPost = await getLatestPost(page);
  report.noHashtag.posts = noTagPost?.text === noTagText && (noTagPost?.userHashtags?.length ?? 0) === 0;

  await openSkywrite(page);
  const naturalText = 'Starting something new today. #courage #entrepreneurship';
  await postSkywrite(page, naturalText);
  const naturalPost = await getLatestPost(page);
  report.naturalHashtags.textExact = naturalPost?.text === naturalText;
  report.naturalHashtags.parsed =
    JSON.stringify(naturalPost?.userHashtags) === JSON.stringify(['courage', 'entrepreneurship']);

  report.edgeCases.unit = {
    courage: parseUserHashtags('#Courage'),
    lower: parseUserHashtags('#courage'),
    punct: parseUserHashtags('#entrepreneurship,'),
    bang: parseUserHashtags('#creativity!'),
    dup: parseUserHashtags('#growth #growth'),
    mixedDup: parseUserHashtags('#Courage #courage'),
  };
  report.edgeCases.pass =
    JSON.stringify(report.edgeCases.unit.courage) === JSON.stringify(['courage']) &&
    JSON.stringify(report.edgeCases.unit.lower) === JSON.stringify(['courage']) &&
    JSON.stringify(report.edgeCases.unit.punct) === JSON.stringify(['entrepreneurship']) &&
    JSON.stringify(report.edgeCases.unit.bang) === JSON.stringify(['creativity']) &&
    JSON.stringify(report.edgeCases.unit.dup) === JSON.stringify(['growth']) &&
    JSON.stringify(report.edgeCases.unit.mixedDup) === JSON.stringify(['courage']);

  await openSkywrite(page);
  await postSkywrite(page, 'Private thought.', 'Private');
  const privatePost = await getLatestPost(page);
  await openSkywrite(page);
  await postSkywrite(page, 'Orbit thought.', 'Orbit');
  const orbitPost = await getLatestPost(page);
  await openSkywrite(page);
  await postSkywrite(page, 'Public thought.', 'Public Sky');
  const publicPost = await getLatestPost(page);
  report.visibility = {
    private: privatePost?.visibility === 'private',
    orbit: orbitPost?.visibility === 'orbit',
    public: publicPost?.visibility === 'public',
  };

  await page.goto(BASE, { waitUntil: 'networkidle' });
  const home = await page.locator('body').innerText();
  report.regression = {
    skywriteEntry: home.includes('Write your sky') || home.includes('Open Skywrite'),
    starpath: home.includes('My StarPath'),
    bottomNav: home.includes('Home') && home.includes('Skywrite'),
    noTagsOnHome: !home.includes('Tags'),
  };

  return report;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const report = await run(page);
await browser.close();

const pass =
  report.noHashtag.posts &&
  report.noHashtag.noTagsSection &&
  report.naturalHashtags.textExact &&
  report.naturalHashtags.parsed &&
  report.edgeCases.pass &&
  Object.values(report.visibility).every(Boolean) &&
  Object.values(report.regression).every(Boolean) &&
  report.runtime.pageErrors.length === 0;

console.log(JSON.stringify({ pass, report }, null, 2));
process.exit(pass ? 0 : 1);
