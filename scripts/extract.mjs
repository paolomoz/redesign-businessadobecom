import { firefox } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const ORIGIN = 'https://business.adobe.com';
const OUT_DIR = path.resolve('stardust/current');
const ASSET_DIR = path.join(OUT_DIR, 'assets');
const PAGE_DIR = path.join(OUT_DIR, 'pages');
const SHOT_DIR = path.join(ASSET_DIR, 'screenshots');
const MEDIA_DIR = path.join(ASSET_DIR, 'media');
const CRAWL_LOG = path.join(OUT_DIR, '_crawl-log.json');
const VIEWPORT = { width: 1440, height: 900 };
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:128.0) Gecko/20100101 Firefox/128.0';

await fs.mkdir(PAGE_DIR, { recursive: true });
await fs.mkdir(SHOT_DIR, { recursive: true });
await fs.mkdir(MEDIA_DIR, { recursive: true });

const TARGETS = [
  { slug: 'home', url: '/' },
  { slug: 'genstudio', url: '/products/genstudio' },
  { slug: 'adobe-analytics', url: '/products/adobe-analytics' },
  { slug: 'experience-manager-sites', url: '/products/experience-manager/sites/aem-sites' },
  { slug: 'marketo', url: '/products/marketo' },
];

function shortHash(s) {
  return crypto.createHash('sha1').update(s).digest('hex').slice(0, 8);
}

const browser = await firefox.launch();
const context = await browser.newContext({
  viewport: VIEWPORT,
  deviceScaleFactor: 2,
  userAgent: UA,
  locale: 'en-US',
  reducedMotion: 'reduce',
  extraHTTPHeaders: {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'accept-language': 'en-US,en;q=0.9',
  },
});

const crawlLog = {
  _provenance: { extractedAt: new Date().toISOString(), origin: ORIGIN, viewport: VIEWPORT },
  discovered: [],
  selected: TARGETS,
  crawl: { successes: [], failures: [] },
};

for (const t of TARGETS) {
  const url = ORIGIN + t.url;
  console.log(`\n[${t.slug}] ${url}`);
  // Each page in fresh context to dodge any edge throttling on hot connection
  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    userAgent: UA,
    locale: 'en-US',
    reducedMotion: 'reduce',
    extraHTTPHeaders: {
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'accept-language': 'en-US,en;q=0.9',
    },
  });
  const page = await ctx.newPage();
  const started = Date.now();
  let waitMode = 'medium';
  try {
    let resp;
    let attempts = 0;
    while (attempts < 3) {
      try {
        resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        break;
      } catch (e) {
        attempts++;
        if (attempts >= 3) throw e;
        console.log(`  retry ${attempts} after ${e.message.slice(0, 60)}`);
        await new Promise(r => setTimeout(r, 2500));
      }
    }
    if (!resp || resp.status() >= 400) {
      throw new Error(`HTTP ${resp ? resp.status() : 'no-response'}`);
    }
    // Medium wait: networkidle with cap
    await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => { waitMode = 'medium (fallback)'; });
    // Scroll-to-bottom in 4 steps to trigger lazy-load
    await page.evaluate(async () => {
      const h = window.innerHeight;
      const steps = 4;
      for (let i = 1; i <= steps; i++) {
        window.scrollTo(0, h * i);
        await new Promise(r => setTimeout(r, 300));
      }
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 200));
    });
    const waitMs = Date.now() - started;

    const title = await page.title();
    const meta = await page.evaluate(() => {
      const get = (sel) => document.querySelector(sel)?.getAttribute('content') || null;
      return {
        description: get('meta[name="description"]'),
        ogTitle: get('meta[property="og:title"]'),
        ogDescription: get('meta[property="og:description"]'),
        ogImage: get('meta[property="og:image"]'),
        themeColor: get('meta[name="theme-color"]'),
      };
    });

    const outline = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h => {
        out.push({ level: Number(h.tagName[1]), text: (h.innerText || '').trim().slice(0, 200) });
      });
      return out;
    });

    const ctas = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('a,button').forEach(el => {
        const text = (el.innerText || el.textContent || '').trim();
        if (!text || text.length > 80) return;
        const href = el.getAttribute('href') || null;
        const role = el.getAttribute('role') || el.tagName.toLowerCase();
        const cs = getComputedStyle(el);
        const looksCta = (
          cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent'
        ) || el.matches('.cta, .button, [class*="button"], [class*="cta"]');
        if (looksCta) out.push({ text, href, role });
      });
      return out.slice(0, 80);
    });

    const links = await page.evaluate((origin) => {
      const internal = new Set();
      const external = new Set();
      document.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
        try {
          const u = new URL(href, location.href);
          if (u.origin === origin) internal.add(u.pathname);
          else external.add(u.origin + u.pathname);
        } catch {}
      });
      return { internal: [...internal].slice(0, 200), external: [...external].slice(0, 100) };
    }, ORIGIN);

    const sections = await page.evaluate(() => {
      const out = [];
      const parts = document.querySelectorAll('section, main > div, .section, [data-section]');
      parts.forEach((s, i) => {
        if (i > 30) return;
        const cs = getComputedStyle(s);
        const rect = s.getBoundingClientRect();
        const text = (s.innerText || '').trim().slice(0, 600);
        out.push({
          index: i,
          tag: s.tagName.toLowerCase(),
          className: (s.className || '').toString().slice(0, 200),
          height: Math.round(rect.height),
          background: cs.backgroundColor,
          color: cs.color,
          fontFamily: cs.fontFamily,
          textPreview: text,
        });
      });
      return out;
    });

    const colors = await page.evaluate(() => {
      const tally = new Map();
      const bump = (k) => tally.set(k, (tally.get(k) || 0) + 1);
      document.querySelectorAll('*').forEach(el => {
        const cs = getComputedStyle(el);
        if (cs.color && cs.color !== 'rgba(0, 0, 0, 0)') bump('color::' + cs.color);
        if (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') bump('bg::' + cs.backgroundColor);
        if (cs.borderColor && cs.borderTopWidth !== '0px') bump('border::' + cs.borderColor);
      });
      return [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 60);
    });

    const fonts = await page.evaluate(() => {
      const tally = new Map();
      document.querySelectorAll('*').forEach(el => {
        const cs = getComputedStyle(el);
        const key = `${cs.fontFamily}|${cs.fontWeight}|${cs.fontSize}`;
        tally.set(key, (tally.get(key) || 0) + 1);
      });
      return [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40);
    });

    const radii = await page.evaluate(() => {
      const tally = new Map();
      document.querySelectorAll('*').forEach(el => {
        const cs = getComputedStyle(el);
        if (cs.borderRadius && cs.borderRadius !== '0px') {
          tally.set(cs.borderRadius, (tally.get(cs.borderRadius) || 0) + 1);
        }
      });
      return [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
    });

    const shadows = await page.evaluate(() => {
      const tally = new Map();
      document.querySelectorAll('*').forEach(el => {
        const cs = getComputedStyle(el);
        if (cs.boxShadow && cs.boxShadow !== 'none') {
          tally.set(cs.boxShadow, (tally.get(cs.boxShadow) || 0) + 1);
        }
      });
      return [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
    });

    const media = await page.evaluate(() => {
      const out = { images: [], svg: 0, video: 0, iframe: 0 };
      document.querySelectorAll('img').forEach(img => {
        if (out.images.length > 50) return;
        out.images.push({
          src: img.currentSrc || img.src,
          alt: img.alt || '',
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      });
      out.svg = document.querySelectorAll('svg').length;
      out.video = document.querySelectorAll('video').length;
      out.iframe = document.querySelectorAll('iframe').length;
      return out;
    });

    const forms = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('form').forEach(f => {
        const fields = [];
        f.querySelectorAll('input, textarea, select').forEach(el => {
          fields.push({ tag: el.tagName.toLowerCase(), type: el.getAttribute('type') || null, name: el.getAttribute('name') || null });
        });
        out.push({ action: f.getAttribute('action') || null, fields });
      });
      return out;
    });

    const headerFooter = await page.evaluate(() => {
      const get = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const links = [...el.querySelectorAll('a')].slice(0, 30).map(a => ({ text: (a.innerText || '').trim().slice(0, 60), href: a.getAttribute('href') }));
        return { tag: el.tagName.toLowerCase(), links };
      };
      return {
        header: get('header') || get('[role="banner"]') || get('[class*="nav"]') || get('[class*="header"]'),
        footer: get('footer') || get('[role="contentinfo"]'),
      };
    });

    // Screenshot
    const shotPath = path.join(SHOT_DIR, `${t.slug}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });

    const pageData = {
      _provenance: { url, slug: t.slug, extractedAt: new Date().toISOString(), waitMs, waitMode, viewport: VIEWPORT },
      title,
      meta,
      outline,
      sections,
      ctas,
      links,
      colors,
      fonts,
      radii,
      shadows,
      media,
      forms,
      systemComponents: headerFooter,
    };

    await fs.writeFile(path.join(PAGE_DIR, `${t.slug}.json`), JSON.stringify(pageData, null, 2));
    crawlLog.crawl.successes.push({ slug: t.slug, url, waitMs, waitMode });
    console.log(`  ✓ ${title.slice(0, 60)} (${waitMs}ms, mode=${waitMode})`);
  } catch (err) {
    crawlLog.crawl.failures.push({ slug: t.slug, url, error: String(err.message || err) });
    console.log(`  ✗ ${err.message || err}`);
  } finally {
    await page.close();
    await ctx.close();
    await new Promise(r => setTimeout(r, 1500));
  }
}

await fs.writeFile(CRAWL_LOG, JSON.stringify(crawlLog, null, 2));
await browser.close();
console.log('\nDone.');
