# Hero Grid → Carousel Transition — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the hero scroll interaction so 5 masonry columns parallax, converge, and seamlessly transform into a 4-card elastic carousel via individual image positioning and a three-phase GSAP scrub timeline.

**Architecture:** Each of the 14 grid images is positioned individually with GSAP (absolute coords). Phase 1 converges them with parallax. Phase 2 separates bottom cards (settling to carousel position) from upper cards (exiting). Phase 3 does an instant opacity swap and clip-path reveal of card chrome.

**Tech Stack:** Vanilla JS, GSAP 3 + ScrollTrigger, CSS custom properties.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `index.html` | Modify (lines 765–793, 914–915) | Fix image width/height attrs; swap script load order |
| `styles/hero.css` | Modify | Add `--hero-scroll-distance` custom property; use in pin-spacer |
| `styles/hero-grid.css` | Rewrite | Absolute-positioned cards, remove debug panel CSS, add `--hero-grid-initial-gap` |
| `scripts/hero-grid.js` | Rewrite | Individual image positioning, 3-phase timeline, no debug panel |

---

### Task 1: Fix HTML image dimensions and script order

**Files:**
- Modify: `index.html:765-793` (image width/height attributes)
- Modify: `index.html:914-915` (script loading order)

The HTML currently has all images at `width="291" height="291"`. The actual source images have varying aspect ratios that create the masonry effect. The JS reads these attributes to calculate scaled heights, so they must match reality.

Also, swap script loading order so `hub-router.js` loads before `hero-grid.js` — the new hero-grid measures carousel card positions which requires hub-router to have initialized its track translateX.

- [ ] **Step 1: Update image dimensions in index.html**

Replace each image's width/height attributes with actual source dimensions:

```html
<!-- Col 1 -->
<div class="grid-card"><img src="assets/images/hero/col-1_img-01.png" alt="" width="584" height="584"></div>
<div class="grid-card"><img src="assets/images/hero/col-1_img-02.png" alt="" width="584" height="584"></div>
<div class="grid-card grid-card--bottom"><img src="assets/images/hero/col-1_img-03.png" alt="" width="584" height="788"></div>

<!-- Col 2 -->
<div class="grid-card"><img src="assets/images/hero/col-2_img-01_not-round.png" alt="" data-treatment="not-round" width="594" height="833"></div>
<div class="grid-card"><img src="assets/images/hero/col-2_img-02.png" alt="" width="594" height="584"></div>
<div class="grid-card grid-card--bottom"><img src="assets/images/hero/col-2_img-03.png" alt="" width="594" height="788"></div>

<!-- Col 3 -->
<div class="grid-card"><img src="assets/images/hero/col-3_img-1.png" alt="" width="584" height="584"></div>
<div class="grid-card"><img src="assets/images/hero/col-3_img-02_not-round.png" alt="" data-treatment="not-round" width="581" height="833"></div>

<!-- Col 4 -->
<div class="grid-card"><img src="assets/images/hero/col-4_img-01.png" alt="" width="585" height="585"></div>
<div class="grid-card"><img src="assets/images/hero/col-4_img-02.png" alt="" width="585" height="788"></div>
<div class="grid-card grid-card--bottom"><img src="assets/images/hero/col-4_img-03.png" alt="" width="585" height="788"></div>

<!-- Col 5 -->
<div class="grid-card"><img src="assets/images/hero/col-5_img-01.png" alt="" width="587" height="587"></div>
<div class="grid-card"><img src="assets/images/hero/col-5_img-02.png" alt="" width="587" height="584"></div>
<div class="grid-card grid-card--bottom"><img src="assets/images/hero/col-5_img-03.png" alt="" width="587" height="788"></div>
```

- [ ] **Step 2: Swap script loading order**

Change lines 914-915 from:
```html
<script src="scripts/hero-grid.js"></script>
<script src="scripts/hub-router.js"></script>
```
to:
```html
<script src="scripts/hub-router.js"></script>
<script src="scripts/hero-grid.js"></script>
```

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "fix: update hero image dimensions to actual source ratios; swap script order"
```

---

### Task 2: Update CSS — hero.css

**Files:**
- Modify: `styles/hero.css:1-9`

Add the `--hero-scroll-distance` custom property and use it for pin-spacer height.

- [ ] **Step 1: Add custom property and use it**

Add to the top of `hero.css`:
```css
/* ── Tunable hero parameters ── */
:root {
  --hero-scroll-distance: 400vh;
}
```

Change `.hero-pin-spacer` from:
```css
.hero-pin-spacer {
  height: 400vh;
  position: relative;
}
```
to:
```css
.hero-pin-spacer {
  height: var(--hero-scroll-distance, 400vh);
  position: relative;
}
```

- [ ] **Step 2: Commit**

```bash
git add styles/hero.css
git commit -m "feat: expose --hero-scroll-distance as tunable CSS custom property"
```

---

### Task 3: Rewrite CSS — hero-grid.css

**Files:**
- Rewrite: `styles/hero-grid.css`

Switch from flex-column layout to absolute-positioned individual cards. Remove all debug panel CSS. Add `--hero-grid-initial-gap` custom property.

- [ ] **Step 1: Replace hero-grid.css with new styles**

```css
/* ============================================
   Hub — Hero Image Grid
   ============================================ */

/* ── Tunable parameter ── */
:root {
  --hero-grid-initial-gap: 97px;
}

/* ── Grid container: absolute overlay ── */
.hero-image-grid {
  position: absolute;
  inset: 0;
  overflow: visible;
  z-index: 2;
  pointer-events: none;
  opacity: 0;                         /* shown by JS after initial positioning */
}

/* ── Column: semantic wrapper only — GSAP positions children directly ── */
.grid-col {
  position: static;
}

/* ── Card: absolutely positioned by GSAP ── */
.grid-card {
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  border-radius: 16px;
  /* width and height set by GSAP */
}

/* ── Images: fill their card container ── */
.grid-card img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ── Not-round treatment ── */
.grid-card--not-round {
  border-radius: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.14);
}
```

Note: the `data-treatment="not-round"` styling is now handled via GSAP setting `borderRadius: 0` and `boxShadow` on the card element during init. The CSS class above is a fallback but JS is authoritative.

- [ ] **Step 2: Commit**

```bash
git add styles/hero-grid.css
git commit -m "refactor: hero-grid CSS for absolute card positioning; remove debug panel styles"
```

---

### Task 4: Rewrite JS — hero-grid.js

**Files:**
- Rewrite: `scripts/hero-grid.js`

Complete rewrite: individual image positioning, 3-phase GSAP timeline, carousel target measurement, no debug panel.

- [ ] **Step 1: Replace hero-grid.js with new implementation**

```js
/* ============================================
   HERO GRID ANIMATION
   GSAP ScrollTrigger scrub timeline.
   Positions each image individually for masonry
   parallax → carousel transition.
   ============================================ */
(function () {
  'use strict';

  /* Skip on mobile */
  if (window.innerWidth < 1024) return;

  gsap.registerPlugin(ScrollTrigger);

  /* ═══════════════════════════════════════════
     CONSTANTS
     ═══════════════════════════════════════════ */
  var FINAL_GAP     = 8;                              // px — converged gap (matches carousel)
  var COL_OFFSETS   = [0, 183, 307, 207, 17];         // vertical stagger per column (px at 1440)
  var Y_DURATIONS   = [0.50, 0.45, 0.38, 0.45, 0.50]; // Phase 1 Y-tween duration per col (shorter = faster parallax)
  var X_DURATION    = 0.50;                            // Phase 1 X convergence duration (all cols)
  var TEXT_FADE_DUR = 0.35;                            // Hero text fade-out duration
  var EXIT_DUR      = 0.25;                            // Upper-image exit duration
  var SETTLE_START  = 0.50;                            // When bottom images begin settling
  var SETTLE_DUR    = 0.25;                            // Bottom-image settle duration
  var SWAP_TIME     = 0.75;                            // Instant swap point (grid → carousel)
  var REVEAL_DUR    = 0.25;                            // Clip-path reveal duration

  /* ═══════════════════════════════════════════
     DOM REFERENCES
     ═══════════════════════════════════════════ */
  var grid      = document.querySelector('.hero-image-grid');
  var heroText  = document.querySelector('.hero-text');
  var hubRouter = document.querySelector('.hero-hub-router');
  var hubCards  = Array.from(document.querySelectorAll('.hhub-card'));
  var hero      = document.getElementById('hero');

  /* ═══════════════════════════════════════════
     IMAGE DATA MODEL
     Build once — positions recalculated per resize.
     ═══════════════════════════════════════════ */
  var allImages = [];
  var colGroups = [[], [], [], [], []];

  Array.from(document.querySelectorAll('.grid-col')).forEach(function (col, colIdx) {
    Array.from(col.querySelectorAll('.grid-card')).forEach(function (card, rowIdx) {
      var img = card.querySelector('img');
      var w   = parseInt(img.getAttribute('width'), 10);
      var h   = parseInt(img.getAttribute('height'), 10);
      var data = {
        el:       card,
        img:      img,
        col:      colIdx,
        row:      rowIdx,
        isBottom: card.classList.contains('grid-card--bottom'),
        ratio:    h / w,
        notRound: img.getAttribute('data-treatment') === 'not-round',
        /* Recalculated per build: */
        scaledH: 0,
        initX: 0, initY: 0,
        convX: 0, convY: 0,
        targetX: 0, targetY: 0, targetW: 0, targetH: 0
      };
      allImages.push(data);
      colGroups[colIdx].push(data);
    });
  });

  var bottomImages = allImages.filter(function (d) { return d.isBottom; });
  var upperImages  = allImages.filter(function (d) { return !d.isBottom; });

  /* ═══════════════════════════════════════════
     TIMELINE BUILDER
     ═══════════════════════════════════════════ */
  var st = null;

  function buildTimeline() {
    if (st) st.kill();

    var vw = document.documentElement.clientWidth;
    var vh = window.innerHeight;

    /* ── Scale image width to viewport ── */
    var IMG_W = Math.round(291 * vw / 1440);
    document.documentElement.style.setProperty('--grid-img-w', IMG_W + 'px');

    /* ── Read tunable CSS custom property ── */
    var initialGap = parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--hero-grid-initial-gap'), 10
    ) || 97;

    /* ── Scale column offsets proportionally ── */
    var scale = vw / 1440;
    var scaledOffsets = COL_OFFSETS.map(function (o) { return Math.round(o * scale); });

    /* ── Per-image scaled heights ── */
    allImages.forEach(function (d) {
      d.scaledH = Math.round(IMG_W * d.ratio);
    });

    /* ── X positions ── */
    var initTotalW = 5 * IMG_W + 4 * initialGap;
    var initLeft   = (vw - initTotalW) / 2;
    var convTotalW = 5 * IMG_W + 4 * FINAL_GAP;
    var convLeft   = (vw - convTotalW) / 2;

    /* ── Y base: center bottom cards near 50vh after convergence ── */
    var avgBotCenter = 0;
    bottomImages.forEach(function (d) {
      var yAbove = 0;
      for (var r = 0; r < d.row; r++) {
        yAbove += colGroups[d.col][r].scaledH + FINAL_GAP;
      }
      avgBotCenter += scaledOffsets[d.col] + yAbove + d.scaledH / 2;
    });
    avgBotCenter /= bottomImages.length;

    var convergBaseY = Math.round(vh / 2 - avgBotCenter);
    var initBaseY    = convergBaseY + Math.round(vh * 0.55);

    /* ── Per-image initial + converged positions ── */
    allImages.forEach(function (d) {
      var yAboveI = 0, yAboveC = 0;
      for (var r = 0; r < d.row; r++) {
        yAboveI += colGroups[d.col][r].scaledH + initialGap;
        yAboveC += colGroups[d.col][r].scaledH + FINAL_GAP;
      }
      d.initX = initLeft   + d.col * (IMG_W + initialGap);
      d.initY = initBaseY  + scaledOffsets[d.col] + yAboveI;
      d.convX = convLeft   + d.col * (IMG_W + FINAL_GAP);
      d.convY = convergBaseY + scaledOffsets[d.col] + yAboveC;
    });

    /* ── Carousel target positions ──
       hub-router.js has already run and positioned the track.
       Measure each card-media rect relative to the hero (which is
       sticky at top:0, so hero origin ≈ viewport origin). */
    var heroRect = hero.getBoundingClientRect();
    bottomImages.forEach(function (d, i) {
      var media = hubCards[i].querySelector('.hhub-card-media');
      var rect  = media.getBoundingClientRect();
      d.targetX = rect.left - heroRect.left;
      d.targetY = rect.top  - heroRect.top;
      d.targetW = rect.width;
      d.targetH = rect.height;
    });

    /* ── Clip-path values ── */
    var headerH   = hubCards[0] ? hubCards[0].querySelector('.hhub-card-header').offsetHeight : 56;
    var footerH   = hubCards[0] ? hubCards[0].querySelector('.hhub-card-footer').offsetHeight : 80;
    var clipInit  = 'inset(' + headerH + 'px 0px ' + footerH + 'px 0px round 16px)';
    var clipFinal = 'inset(0px 0px 0px 0px round 16px)';

    /* ── Kill any in-flight tweens ── */
    var allEls = allImages.map(function (d) { return d.el; });
    gsap.killTweensOf(allEls.concat([heroText, hubRouter]).concat(hubCards));

    /* ──────────────────────────────────────────
       SET INITIAL STATE
       ────────────────────────────────────────── */
    allImages.forEach(function (d) {
      gsap.set(d.el, {
        x:            d.initX,
        y:            d.initY,
        width:        IMG_W,
        height:       d.scaledH,
        opacity:      1,
        borderRadius: d.notRound ? 0 : 16,
        boxShadow:    d.notRound ? '0 8px 32px rgba(0,0,0,0.14)' : 'none',
        overflow:     'hidden'
      });
    });

    gsap.set(heroText,  { opacity: 1, y: 0 });
    gsap.set(hubRouter, { opacity: 0 });
    gsap.set(hubCards,  { clipPath: clipInit });
    hubRouter.setAttribute('aria-hidden', 'true');
    hubRouter.style.pointerEvents = 'none';
    gsap.set(grid, { opacity: 1 });

    /* ──────────────────────────────────────────
       BUILD SCRUB TIMELINE
       ────────────────────────────────────────── */
    var tl = gsap.timeline();

    /* ▸ PHASE 1 — Convergence + Parallax (0 → 0.50)
         X: all columns converge uniformly.
         Y: differential per-column duration = parallax. */
    allImages.forEach(function (d) {
      tl.to(d.el, { x: d.convX, ease: 'none',       duration: X_DURATION },       0);
      tl.to(d.el, { y: d.convY, ease: 'power2.out',  duration: Y_DURATIONS[d.col] }, 0);
    });

    /* ▸ Hero text fade (0 → TEXT_FADE_DUR) */
    tl.to(heroText, {
      y: -280, opacity: 0, ease: 'power1.out', duration: TEXT_FADE_DUR
    }, 0);

    /* ▸ PHASE 2 — Separation
         Upper images exit upward + fade (staggered per column —
         starts when that column's Phase 1 Y finishes).
         Bottom images settle to carousel target. */
    upperImages.forEach(function (d) {
      tl.to(d.el, {
        y: d.convY - 600, opacity: 0, ease: 'power1.in', duration: EXIT_DUR
      }, Y_DURATIONS[d.col]);
    });

    bottomImages.forEach(function (d) {
      tl.to(d.el, {
        x: d.targetX, y: d.targetY,
        width: d.targetW, height: d.targetH,
        ease: 'power2.inOut', duration: SETTLE_DUR
      }, SETTLE_START);
    });

    /* ▸ PHASE 3 — Swap + Reveal
         Instant hide grid bottom images, show carousel.
         Clip-path expands to reveal card header/footer chrome. */
    bottomImages.forEach(function (d) {
      tl.set(d.el, { opacity: 0 }, SWAP_TIME);
    });

    tl.to(hubRouter, { opacity: 1, duration: 0.01, ease: 'none' }, SWAP_TIME);
    tl.to(hubCards,  { clipPath: clipFinal, ease: 'power2.out', duration: REVEAL_DUR }, SWAP_TIME);

    /* ── Wire to ScrollTrigger ── */
    st = ScrollTrigger.create({
      trigger:   '.hero-pin-spacer',
      start:     'top top',
      end:       'bottom bottom',
      scrub:     1,
      animation: tl,
      onLeave: function () {
        hubRouter.style.pointerEvents = 'auto';
        hubRouter.removeAttribute('aria-hidden');
        if (window.__hhubReset) window.__hhubReset();
      },
      onEnterBack: function () {
        hubRouter.style.pointerEvents = 'none';
        hubRouter.setAttribute('aria-hidden', 'true');
      }
    });
  }

  buildTimeline();

  /* ═══════════════════════════════════════════
     RESIZE HANDLER
     ═══════════════════════════════════════════ */
  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildTimeline, 200);
  }, { passive: true });

}());
```

- [ ] **Step 2: Commit**

```bash
git add scripts/hero-grid.js
git commit -m "feat: rewrite hero grid with individual image positioning and 3-phase timeline"
```

---

### Task 5: Visual Verification

**Files:** None (browser testing)

- [ ] **Step 1: Start dev server and open in browser**

```bash
npx serve . -l 3000
```

Open `http://localhost:3000` at desktop width (≥1440px).

- [ ] **Step 2: Verify Phase 1 — Convergence + Parallax**

Scroll slowly through the first half of the pinned section:
- Images should have varying heights (masonry, not all square)
- Center column (col 3) should rise noticeably faster than outer columns
- All columns converge horizontally — gaps shrink from ~97px to 8px
- Vertical gaps between images in each column shrink in sync with horizontal gaps
- Hero text fades up and disappears
- No horizontal scrollbar

- [ ] **Step 3: Verify Phase 2 — Separation**

Continue scrolling past the midpoint:
- Upper images (rows 1+2) should accelerate upward and fade out
- Column 3 images (no bottom card) should exit entirely
- Bottom images from cols 1,2,4,5 should slow down and ease toward center
- Bottom images should smoothly resize to match carousel card proportions

- [ ] **Step 4: Verify Phase 3 — Swap + Reveal**

Continue scrolling to completion:
- Bottom images should snap invisibly to carousel cards (no flash, no crossfade)
- Card chrome (category labels: Sales, Marketing, Legal, Human Resources) should unmask from behind the images via clip-path
- Footer taglines should also unmask
- After scroll completes, hovering cards should trigger elastic expand behavior

- [ ] **Step 5: Verify reverse scroll**

Scroll back up — the entire sequence should reverse smoothly:
- Carousel cards collapse back to grid images
- Images spread apart and rise to original positions
- Hero text fades back in
- Grid returns to initial state

- [ ] **Step 6: Adjust tunable parameters if needed**

If timing or spacing needs adjustment, modify:
- `--hero-scroll-distance` in `styles/hero.css` (total scroll length)
- `--hero-grid-initial-gap` in `styles/hero-grid.css` (starting gap between images)
- Constants at the top of `scripts/hero-grid.js` (phase timing, parallax speeds, etc.)
