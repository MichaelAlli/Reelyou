/**
 * Dev-only Home responsive smoke test — checks layout at phone viewports.
 * Usage: node scripts/verify-home-responsive.mjs
 */
import { chromium } from 'playwright';

const VIEWPORTS = [
  { name: 'iPhone 13', width: 390, height: 844 },
  { name: 'iPhone 14 Pro', width: 393, height: 852 },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
  { name: 'Android small', width: 360, height: 800 },
  { name: 'Android large', width: 412, height: 915 },
];

const URL = 'http://localhost:8090/home?preview=1';

async function auditViewport(page, viewport) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(2500);

  const metrics = await page.evaluate(() => {
    const root = document.querySelector('#root');
    const scrollEl = [...document.querySelectorAll('div')].find((el) => {
      const style = getComputedStyle(el);
      return style.overflowY === 'auto' || style.overflowY === 'scroll';
    });

    const scaled = [...document.querySelectorAll('*')].filter((el) => {
      const t = getComputedStyle(el).transform;
      return t && t !== 'none' && /matrix\([^)]*,\s*0(?:\.|,)/.test(t) === false && /scale\((?!1\)|1,)/.test(t);
    }).length;

    const bodyWidth = document.body.getBoundingClientRect().width;
    const rootWidth = root?.getBoundingClientRect().width ?? 0;
    const scrollHeight = scrollEl?.scrollHeight ?? 0;
    const clientHeight = scrollEl?.clientHeight ?? window.innerHeight;
    const canScroll = scrollHeight > clientHeight + 8;

    const focusText = [...document.querySelectorAll('*')].find(
      (el) => el.textContent?.includes("Today's Focus") || el.textContent?.includes('Today\u2019s Focus'),
    );
    const nav = [...document.querySelectorAll('*')].find((el) => el.textContent?.trim() === 'Home' && el.tagName !== 'HTML');
    const focusRect = focusText?.getBoundingClientRect();
    const navRect = nav?.closest('div')?.getBoundingClientRect();

    return {
      bodyWidth,
      rootWidth,
      scaledElements: scaled,
      canScroll,
      scrollHeight,
      clientHeight,
      focusVisible: focusRect ? focusRect.bottom <= window.innerHeight + 2 || canScroll : false,
      navBottom: navRect?.bottom ?? 0,
      viewportHeight: window.innerHeight,
    };
  });

  const widthOk = Math.abs(metrics.rootWidth - viewport.width) <= 2;
  const noScale = metrics.scaledElements === 0;
  const scrollOk = metrics.canScroll;
  const pass = widthOk && noScale && scrollOk;

  return { pass, widthOk, noScale, scrollOk, metrics };
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const results = [];

for (const vp of VIEWPORTS) {
  try {
    const result = await auditViewport(page, vp);
    results.push({ viewport: vp.name, ...result });
    console.log(
      `${result.pass ? 'PASS' : 'FAIL'} ${vp.name} (${vp.width}x${vp.height}) — width:${result.widthOk} noScale:${result.noScale} scroll:${result.scrollOk} rootW:${result.metrics.rootWidth.toFixed(0)}`,
    );
  } catch (err) {
    results.push({ viewport: vp.name, pass: false, error: String(err) });
    console.log(`FAIL ${vp.name} — ${err.message ?? err}`);
  }
}

await browser.close();

const allPass = results.every((r) => r.pass);
process.exit(allPass ? 0 : 1);
