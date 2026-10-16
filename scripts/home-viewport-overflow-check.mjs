import { chromium } from 'playwright';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:8090';
const VIEWPORTS = [
  { label: '375x667', width: 375, height: 667 },
  { label: '390x844', width: 390, height: 844 },
  { label: '393x852', width: 393, height: 852 },
  { label: '430x932', width: 430, height: 932 },
];

const OVERFLOW_SCRIPT = () => {
  const doc = document.documentElement;
  const body = document.body;
  const docOverflow = doc.scrollWidth - doc.clientWidth;
  const bodyOverflow = body.scrollWidth - body.clientWidth;
  const offenders = [];
  const all = document.querySelectorAll('*');
  for (const el of all) {
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) continue;
    const sw = el.scrollWidth;
    const cw = el.clientWidth;
    if (sw - cw > 2 && cw > 0) {
      offenders.push({
        tag: el.tagName,
        id: el.id || null,
        className: String(el.className || '').slice(0, 80),
        scrollMinusClient: sw - cw,
        rectWidth: Math.round(rect.width),
        rectLeft: Math.round(rect.left),
        rectRight: Math.round(rect.right),
      });
    }
    if (rect.left < -2 || rect.right > window.innerWidth + 2) {
      offenders.push({
        tag: el.tagName,
        id: el.id || null,
        className: String(el.className || '').slice(0, 80),
        clip: 'outside-viewport',
        rectLeft: Math.round(rect.left),
        rectRight: Math.round(rect.right),
        innerWidth: window.innerWidth,
      });
    }
  }
  offenders.sort((a, b) => (b.scrollMinusClient ?? 0) - (a.scrollMinusClient ?? 0));
  const greeting = [...document.querySelectorAll('*')].find((n) =>
    /^Good (morning|afternoon|evening),$/.test(n.textContent?.trim() ?? ''),
  );
  let greetingBox = null;
  if (greeting) {
    const r = greeting.getBoundingClientRect();
    greetingBox = {
      left: Math.round(r.left),
      right: Math.round(r.right),
      width: Math.round(r.width),
    };
  }
  const navRowOffender = offenders.find(
    (o) => o.scrollMinusClient >= 6 && o.rectWidth === 38,
  );
  return {
    innerWidth: window.innerWidth,
    docOverflow,
    bodyOverflow,
    greetingBox,
    navIconOverflow: navRowOffender?.scrollMinusClient ?? 0,
    topOffenders: offenders.slice(0, 12),
  };
};

async function run() {
  const browser = await chromium.launch();
  const results = [];
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(`${BASE}/home?preview=1&qaPreview=1`, {
      waitUntil: 'networkidle',
      timeout: 120000,
    });
    await page.waitForTimeout(1500);
    const metrics = await page.evaluate(OVERFLOW_SCRIPT);
    results.push({ viewport: vp.label, ...metrics });
    await page.close();
  }
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
  const failed = results.filter(
    (r) =>
      r.docOverflow > 0 ||
      r.bodyOverflow > 0 ||
      !r.greetingBox ||
      r.greetingBox.left < 8 ||
      r.greetingBox.right > r.innerWidth - 8,
  );
  if (failed.length > 0) {
    process.exit(1);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
