import fs from 'node:fs/promises';
import path from 'node:path';

const PAGE_DIR = 'stardust/current/pages';
const OUT = 'stardust/current/_brand-extraction.json';

const files = (await fs.readdir(PAGE_DIR)).filter(f => f.endsWith('.json'));
const pages = await Promise.all(files.map(async f => JSON.parse(await fs.readFile(path.join(PAGE_DIR, f), 'utf8'))));

function tally(arr) {
  const m = new Map();
  for (const [k, v] of arr) m.set(k, (m.get(k) || 0) + v);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

const allColors = tally(pages.flatMap(p => p.colors));
const allFonts = tally(pages.flatMap(p => p.fonts));
const allRadii = tally(pages.flatMap(p => p.radii));
const allShadows = tally(pages.flatMap(p => p.shadows));

// Split colors into roles
const colorByRole = { color: [], background: [], border: [] };
for (const [k, n] of allColors) {
  const [role, val] = k.split('::');
  if (colorByRole[role]) colorByRole[role].push({ value: val, count: n });
}

// Font families
const families = new Map();
for (const [k, n] of allFonts) {
  const [family] = k.split('|');
  families.set(family, (families.get(family) || 0) + n);
}
const familyList = [...families.entries()].sort((a, b) => b[1] - a[1]);

// Type sizes — heading vs body candidates
const sizesByFamily = new Map();
for (const [k, n] of allFonts) {
  const [family, weight, size] = k.split('|');
  const key = family;
  if (!sizesByFamily.has(key)) sizesByFamily.set(key, []);
  sizesByFamily.get(key).push({ weight, size, count: n });
}

// CTA labels (first 30 from home)
const home = pages.find(p => p._provenance.slug === 'home');
const ctaLabels = home ? home.ctas.map(c => c.text).filter(Boolean).slice(0, 30) : [];

// Voice samples — first big H1/H2 + lead text
const voiceSamples = {
  heroHeadline: home?.outline.find(o => o.level <= 2)?.text || null,
  outlineSample: home?.outline.slice(0, 12).map(o => o.text) || [],
  ctaSamples: [...new Set(ctaLabels)].slice(0, 12),
};

// System components — header/footer per page if shared shape
const headers = pages.map(p => ({ slug: p._provenance.slug, header: p.systemComponents?.header }));
const footers = pages.map(p => ({ slug: p._provenance.slug, footer: p.systemComponents?.footer }));

// Logo file copy if available — Adobe site uses inline SVG; capture from home screenshot path
const brand = {
  _provenance: { generatedAt: new Date().toISOString(), pages: pages.map(p => p._provenance.slug) },
  origin: 'https://business.adobe.com',
  palette: {
    background: colorByRole.background.slice(0, 12),
    text: colorByRole.color.slice(0, 12),
    border: colorByRole.border.slice(0, 8),
  },
  type: {
    families: familyList.map(([family, n]) => ({ family, count: n })),
    sizesByFamily: Object.fromEntries(
      [...sizesByFamily.entries()].map(([fam, arr]) => [fam, arr.sort((a, b) => b.count - a.count).slice(0, 12)])
    ),
  },
  motifs: {
    radius: allRadii.slice(0, 8).map(([v, c]) => ({ value: v, count: c })),
    shadow: allShadows.slice(0, 6).map(([v, c]) => ({ value: v, count: c })),
  },
  voice: voiceSamples,
  systemComponents: { headers, footers },
};

await fs.writeFile(OUT, JSON.stringify(brand, null, 2));
console.log('wrote', OUT);
console.log('top-bg', brand.palette.background.slice(0, 5));
console.log('top-text', brand.palette.text.slice(0, 5));
console.log('families', brand.type.families.slice(0, 5));
console.log('radii', brand.motifs.radius.slice(0, 5));
