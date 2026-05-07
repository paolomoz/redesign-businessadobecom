# Acrobat Studio — Offer Page Prototype

**GitHub:** `https://github.com/nooneswatching/acom-offer`
**Local path:** `/Users/jnewton/Library/CloudStorage/Dropbox-Adobe/Josh Newton/Adobe Brand Studio/ACOM/Prototypes/offer/`

---

## Page structure

Three sections + global nav:

1. **Hero** — scroll-driven mosaic convergence animation
2. **More than tools** — product feature carousel with dot/arrow navigation
3. **Built for business** — 4-column perks grid

Nav: fully-built global nav (desktop mega-nav + mobile overlay), shared from the ACOM prototype system.

---

## File structure

```
offer/
├── index.html                    ← main page
├── scripts/
│   ├── hero.js                   ← hero animation + carousel logic
│   ├── text-animate.js           ← global scroll-scrubbed text animator
│   ├── mega-nav.js               ← desktop mega-nav dropdown
│   └── mobile-nav.js             ← mobile nav overlay
├── styles/
│   ├── hero.css                  ← hero layout + mosaic sizing
│   ├── page.css                  ← body styles + text animator CSS
│   ├── offer-apps.css            ← carousel + perks sections
│   ├── nav.css / mega-nav.css / mobile-nav.css / nav-offer.css
│   └── global/
│       ├── reset.css             ← includes scrollbar-gutter: stable
│       ├── grid.css              ← 6/12-col responsive grid system
│       └── typography.css        ← Adobe Clean font stack + type scale
├── vendor/
│   ├── gsap.min.js
│   └── ScrollTrigger.min.js
└── assets/
    ├── images/hero/              ← col-1_01.png through col-5_03.png (15 images)
    ├── icons/
    └── fonts/
```

> `ScrollSmoother.min.js` is in `vendor/` but intentionally NOT loaded. Do not use it — it sets `#smooth-wrapper { position: fixed }` which collapses the document height to 0 and breaks all scroll events. Lenis is used for smooth scroll instead.

---

## Hero animation

### Architecture

```
.hero-pin-spacer   height: 220vh   ← gives the sticky hero its scroll distance
  #hero            position: sticky; top: 0; height: 100vh;
                   overflow-x: clip; overflow-y: hidden;
                   background: #fff; z-index: 1;
    .hero-text     hero copy + CTAs (fades out on scroll)
    .hero-mosaic-wrap   position: absolute; top: 66vh
      .hero-mosaic  display: flex; gap: 8px
        .mosaic-col × 5   width: 20.2vw; max-width: 291px
          .mosaic-card × 3 each   aspect-ratio: 1; border-radius: 16px
```

`#hero` sticks to the top while `.hero-pin-spacer` (220vh) scrolls behind it. ScrollTrigger watches the full spacer range — 120vh of scroll drives the animation. `scrub: 0.8` matches the lagged feel.

`overflow-x: clip` is required (not `hidden`) — the 5 columns total ~101vw, so clip prevents a horizontal scrollbar while still allowing vertical sticky to function. `z-index: 1` prevents the following section's background from painting over the mosaic overflow.

### Load-in animation

On page load, cards reveal via a clip-path ring ripple from the center-top tile (col 3, row 1). Uses Chebyshev distance to assign rings:

- Ring 0 (1 tile): col 3, row 1
- Ring 1 (5 tiles): adjacent tiles
- Ring 2 (9 tiles): everything else

Each ring: `clipPath: 'inset(50% round 16px)' → 'inset(0% round 16px)'`, staggered 0.1s per ring, 0.5s duration.

### Scroll animation (GSAP timeline)

```javascript
// scrub: 0.8 — matched in both ScrollTrigger instances for consistent feel

tl.to('.hero-text',       { opacity: 0, y: -80, ease: 'none', duration: 0.45 }, 0);
tl.to('.hero-mosaic-wrap',{ y: '-62vh', ease: 'none' }, 0);
tl.to(cols,               { x: 0, y: 0, ease: 'none' }, 0);
cols.forEach(col => tl.to(col.querySelectorAll('.mosaic-card'), { y: 0, ease: 'none' }, 0));

ScrollTrigger.create({
  trigger: '.hero-pin-spacer',
  start: 'top top', end: 'bottom bottom',
  scrub: 0.8, animation: tl,
});
```

### Spread-state geometry (Figma node 7379:8963, 1440×1024)

| Col | x-delta from tight | y-delta from col 3 |
|-----|--------------------|--------------------|
| 1   | −178px             | −307px             |
| 2   | −89px              | −124px             |
| 3   | 0 (anchor)         | 0 (anchor)         |
| 4   | +90px              | −100px             |
| 5   | +179px             | −290px             |

x-offsets scale with `vw` (1440px design width). y-offsets scale with `vh` (1024px design height).

Card internal gap: `100px spread → 8px tight`, scaled by `vw` (cards are square = 20.2vw).

---

## Text animator (`scripts/text-animate.js`)

Implements the Adobe Motion Docs Global Text Animator spec:

- **Trigger:** 90% VH → 40% VH, scrubbed directly to scroll
- **Mechanic:** Elements animate from a progressive y-offset to 0 simultaneously — upper elements resolve first, creating an elastic cascade feel
- **No masking** — elements slide in distance only, no clip/overflow
- **Two modes:**
  - `[data-ta]` — split into visual lines, each line animates as a unit
  - `[data-ta-unit]` — the whole element animates as one block

Offset formula: `(i + 1) × (window.innerHeight × 0.065)` — each item starts progressively further from rest.

Group elements with `[data-ta-group]`. All `[data-ta]` and `[data-ta-unit]` children within are collected in DOM order and assigned sequential offsets.

```html
<!-- Example usage -->
<div data-ta-group>
  <span class="t-eyebrow" data-ta>Eyebrow text</span>
  <h2 data-ta>Headline text</h2>
  <p data-ta>Body copy</p>
  <div class="ctas" data-ta-unit><!-- CTA buttons --></div>
</div>
```

**Pre-split HTML** — For headings with explicit line breaks or `ch`-constrained widths that reflow differently across environments, pre-split the lines in HTML:

```html
<h2 data-ta>
  <span class="ta-line"><span class="ta-line-inner">Line one text</span></span>
  <span class="ta-line"><span class="ta-line-inner">Line two text</span></span>
</h2>
```

`wrapLines()` detects existing `.ta-line-inner` markup and skips re-measuring — safe to pre-split.

Required CSS (already in `page.css`):
```css
[data-ta] .ta-line       { display: block; }
[data-ta] .ta-line-inner { display: block; }
[data-ta].t-eyebrow      { white-space: nowrap; }
```

---

## Carousel (`scripts/hero.js`)

The carousel track is left-aligned to the actual CSS grid column, not a CSS fallback. A hidden reference div (`#carouselGridRef .col-4`) is measured via `getBoundingClientRect()` after fonts/layout settle. This correctly handles the `max-width: 1920px` centering at very large viewports.

```javascript
function syncCarousel() {
  var r = ref.getBoundingClientRect();
  document.documentElement.style.setProperty('--card-width', r.width + 'px');
  document.documentElement.style.setProperty('--grid-col1-left', r.left + 'px');
}
syncCarousel();
window.addEventListener('resize', syncCarousel, { passive: true });
```

---

## Grid system (`styles/global/grid.css`)

| Breakpoint | Cols | Margin      |
|-----------|------|-------------|
| XS ≤ 767px | 6   | 24px fixed  |
| S 768–1023px | 6  | 24px fixed  |
| M 1024–1279px | 12 | 8.333%    |
| L 1280–1440px | 12 | 8.333%    |
| XL ≥ 1441px  | 12  | 8.333%    |

**Important:** When using `.col-12` inside a 6-column grid (S/XS), CSS grid creates implicit columns which breaks sibling `col-3` items (they become 3/12 = 25% instead of 3/6 = 50%). Always use `grid-column: 1 / -1` for full-width items at small breakpoints instead of `col-12`.

---

## Smooth scroll

Lenis (`lenis@1.1.14`) with GSAP ticker integration:

```javascript
var lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);
window.__lenis = lenis;
```

Nav scroll state (`gnav--scrolled` at >40px scroll) hooks into the Lenis scroll event when available, falls back to native scroll listener.

---

## Deployment

Static site — deploy `index.html`, `scripts/`, `styles/`, `assets/`, and `vendor/` to any static host.
