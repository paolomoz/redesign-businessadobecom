import { firefox } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const URL = process.argv[2] || 'https://business.adobe.com/';
const OUT = process.argv[3] || 'stardust/current/assets/screenshots/home-fullpage.png';
const VIEWPORT = { width: 1440, height: 900 };
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:128.0) Gecko/20100101 Firefox/128.0';

await fs.mkdir(path.dirname(OUT), { recursive: true });
const browser = await firefox.launch();
const ctx = await browser.newContext({
  viewport: VIEWPORT,
  deviceScaleFactor: 2,
  userAgent: UA,
  locale: 'en-US',
  reducedMotion: 'reduce',
});
const page = await ctx.newPage();
console.log('navigating', URL);
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});

// Wait until body height exceeds viewport (real content has hydrated)
async function waitForContent(maxMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const h = await page.evaluate(() => document.body.scrollHeight);
    if (h > 1500) return h;
    await new Promise(r => setTimeout(r, 600));
  }
  return await page.evaluate(() => document.body.scrollHeight);
}
const initialHeight = await waitForContent(30000);
console.log('post-hydrate height:', initialHeight);
// Slow scroll to trigger lazy loads — the live site lazy-injects fragments,
// without scrolling the page reports a tiny height.
async function fullScroll() {
  return await page.evaluate(async () => {
    const stop = () => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    let y = 0;
    let lastH = 0;
    let stable = 0;
    // Slow stepwise scroll, smaller steps, longer waits — Adobe EDS lazy-loads
    // section fragments only when they near the viewport.
    for (let pass = 0; pass < 200; pass++) {
      y += window.innerHeight * 0.4;
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 700));
      const h = stop();
      if (h === lastH) {
        stable++;
        if (stable > 4 && y > h - window.innerHeight) break;
      } else {
        stable = 0;
        lastH = h;
      }
    }
    // Final pass: scroll to absolute bottom and wait for any final lazy loads
    window.scrollTo(0, stop());
    await new Promise(r => setTimeout(r, 2000));
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 1200));
    return stop();
  });
}
const totalHeight = await fullScroll();
console.log('total scroll height:', totalHeight);

// Resize the viewport to match the page so fullPage screenshot captures everything
// (Firefox+Playwright fullPage occasionally misses lazy-loaded content if viewport
// is significantly smaller than page; a tall viewport works around it.)
await page.setViewportSize({ width: 1440, height: Math.min(totalHeight, 32000) });
await page.evaluate(() => window.scrollTo(0, 0));
await new Promise(r => setTimeout(r, 800));

await page.screenshot({ path: OUT, fullPage: true });
console.log('saved', OUT);
await browser.close();
