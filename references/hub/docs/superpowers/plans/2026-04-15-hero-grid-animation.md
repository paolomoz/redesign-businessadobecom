# Hero Grid Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a scroll-driven hero animation where a 5-column staggered image grid converges, recedes in 3D space, and resolves into a flex-accordion hub-router card component — all within a single sticky viewport.

**Architecture:** A CSS-sticky pin spacer (400vh) holds `#hero` in view while a single GSAP ScrollTrigger scrub timeline drives 4 animation phases. CSS `perspective: 1200px` on `#hero` provides native 3D depth. The hub-router is a ported flex-accordion from acom-home, adapted for 4 cards (no video). A debug panel (D-key) exposes 8 sliders for live tuning.

**Tech Stack:** GSAP 3 + ScrollTrigger (already in project), Lenis smooth scroll (already integrated), vanilla JS (ES5 compatible), CSS custom properties for debug tunability.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Verify | `assets/images/hero/` | 14 grid images already present (same files reused in hub-router cards) |
| Modify | `index.html:743-756` | Hero structure: pin-spacer, updated copy, grid HTML, hub-router HTML, new script/style links |
| Modify | `styles/hero.css` | Add `position: sticky`, `perspective: 1200px`, `overflow: visible`, `background: #F6F6F6` to `#hero` |
| Create | `styles/hero-grid.css` | Pin-spacer, grid container, column styles, image treatments, z-index layering, debug panel UI |
| Create | `styles/hero-hub-router.css` | Hub-router card layout, flex-accordion dimensions, hover states, mobile stacked fallback |
| Create | `scripts/hub-router.js` | Flex-accordion hover logic, track re-centering (adapted from `acom-home/scripts/hub-router.js`) |
| Create | `scripts/hero-grid.js` | GSAP timeline (Phases 1–4), ScrollTrigger setup, debug panel controls |

---

## Task 1: Verify image assets

**Files:**
- Read: `assets/images/hero/` (already exists with all 14 images)

All 14 grid images already exist in `assets/images/hero/`. This task just confirms the filenames are correct before wiring up the HTML.

- [ ] **Step 1: Confirm all 14 images are present**

```bash
ls assets/images/hero/
```

Expected output (14 files):
```
col-1_img-01.png
col-1_img-02.png
col-1_img-03.png
col-2_img-01_not-round.png
col-2_img-02.png
col-2_img-03.png
col-3_img-02_not-round.png
col-3_img-1.png
col-4_img-01.png
col-4_img-02.png
col-4_img-03.png
col-5_img-01.png
col-5_img-02.png
col-5_img-03.png
```

If any are missing, source them from the Figma design file before proceeding.

---

## Task 2: Update index.html — hero structure and copy

**Files:**
- Modify: `index.html:743-756` (the existing `<section id="hero">` block and surrounding comment)

Replace the bare hero section with the full pin-spacer + grid + hub-router structure. Also update hero copy to match Figma.

- [ ] **Step 1: Replace the hero section in index.html**

Find this block (approximately lines 740–758):
```html
    <!-- ══════════════════════════════════════
         HERO
         ══════════════════════════════════════ -->
    <section id="hero">
      <div class="hero-text">
        <div class="hero-app-id">
          <img src="assets/icons/B_app_AdobeAcrobatPDF.svg" alt="">
          <span class="t-eyebrow">Acrobat Studio</span>
        </div>
        <h1 class="t-title-1">A smarter way to<br>work with PDFs</h1>
        <p class="t-body-m">Faster insights, standout content creation with Adobe Express, and the PDF tools you trust — all in one place. PDF Spaces turn static files into conversational knowledge hubs, with a personalized AI Assistant for deeper insights.</p>
        <div class="hero-ctas">
          <a href="#" class="btn-primary">Try it free</a>
          <a href="#" class="btn-secondary">Buy now</a>
        </div>
      </div>
    </section>

    <!-- [NEW SECTIONS GO HERE] -->
```

Replace it with:
```html
    <!-- ══════════════════════════════════════
         HERO — scroll-pinned with image grid
         ══════════════════════════════════════ -->
    <div class="hero-pin-spacer">
      <section id="hero">

        <!-- Hero copy (z-index: 1 — grid images scroll over this) -->
        <div class="hero-text">
          <div class="hero-app-id">
            <img src="assets/icons/B_app_AdobeAcrobatPDF.svg" alt="">
            <span class="t-eyebrow">PDF &amp; Productivity</span>
          </div>
          <h1 class="t-title-1">With great power comes<br>great productivity.</h1>
          <p class="t-body-m">Do your best work faster with AI-powered document insights, secure collaboration, and professional content creation — all in one place.</p>
          <div class="hero-ctas">
            <a href="#" class="btn-primary">Try it free</a>
            <a href="#" class="btn-secondary">Buy now</a>
          </div>
        </div>

        <!-- Image grid (z-index: 2 — positioned absolutely, overflows hero edges) -->
        <div class="hero-image-grid" aria-hidden="true">

          <div class="grid-col" data-col="1">
            <div class="grid-card"><img src="assets/images/hero/col-1_img-01.png" alt="" width="291" height="291"></div>
            <div class="grid-card"><img src="assets/images/hero/col-1_img-02.png" alt="" width="291" height="291"></div>
            <div class="grid-card grid-card--bottom"><img src="assets/images/hero/col-1_img-03.png" alt="" width="291" height="291"></div>
          </div>

          <div class="grid-col" data-col="2">
            <div class="grid-card"><img src="assets/images/hero/col-2_img-01_not-round.png" alt="" data-treatment="not-round" width="291" height="291"></div>
            <div class="grid-card"><img src="assets/images/hero/col-2_img-02.png" alt="" width="291" height="291"></div>
            <div class="grid-card grid-card--bottom"><img src="assets/images/hero/col-2_img-03.png" alt="" width="291" height="291"></div>
          </div>

          <div class="grid-col" data-col="3">
            <div class="grid-card"><img src="assets/images/hero/col-3_img-1.png" alt="" width="291" height="291"></div>
            <div class="grid-card"><img src="assets/images/hero/col-3_img-02_not-round.png" alt="" data-treatment="not-round" width="291" height="291"></div>
            <!-- col-3 has no bottom row image -->
          </div>

          <div class="grid-col" data-col="4">
            <div class="grid-card"><img src="assets/images/hero/col-4_img-01.png" alt="" width="291" height="291"></div>
            <div class="grid-card"><img src="assets/images/hero/col-4_img-02.png" alt="" width="291" height="291"></div>
            <div class="grid-card grid-card--bottom"><img src="assets/images/hero/col-4_img-03.png" alt="" width="291" height="291"></div>
          </div>

          <div class="grid-col" data-col="5">
            <div class="grid-card"><img src="assets/images/hero/col-5_img-01.png" alt="" width="291" height="291"></div>
            <div class="grid-card"><img src="assets/images/hero/col-5_img-02.png" alt="" width="291" height="291"></div>
            <div class="grid-card grid-card--bottom"><img src="assets/images/hero/col-5_img-03.png" alt="" width="291" height="291"></div>
          </div>

        </div><!-- /.hero-image-grid -->

        <!-- Hub router (z-index: 3 — fades in at Phase 4, pointer-events off until complete) -->
        <div class="hero-hub-router" aria-hidden="true">
          <div class="hhub-track">

            <div class="hhub-card" data-index="0">
              <div class="hhub-card-header">
                <span class="hhub-card-label">Sales</span>
              </div>
              <div class="hhub-card-media">
                <img class="hhub-card-img" src="assets/images/hero/col-1_img-03.png" alt="">
              </div>
              <div class="hhub-card-footer">
                <div class="hhub-card-copy">
                  <p class="hhub-card-tagline">Close more deals.</p>
                </div>
                <span class="hhub-card-cta" aria-hidden="true">&#x203A;</span>
              </div>
            </div>

            <div class="hhub-card" data-index="1">
              <div class="hhub-card-header">
                <span class="hhub-card-label">Marketing</span>
              </div>
              <div class="hhub-card-media">
                <img class="hhub-card-img" src="assets/images/hero/col-2_img-03.png" alt="">
              </div>
              <div class="hhub-card-footer">
                <div class="hhub-card-copy">
                  <p class="hhub-card-tagline">Take the pain out of campaigns.</p>
                </div>
                <span class="hhub-card-cta" aria-hidden="true">&#x203A;</span>
              </div>
            </div>

            <div class="hhub-card" data-index="2">
              <div class="hhub-card-header">
                <span class="hhub-card-label">Legal</span>
              </div>
              <div class="hhub-card-media">
                <img class="hhub-card-img" src="assets/images/hero/col-4_img-03.png" alt="">
              </div>
              <div class="hhub-card-footer">
                <div class="hhub-card-copy">
                  <p class="hhub-card-tagline">Move the fine print faster.</p>
                </div>
                <span class="hhub-card-cta" aria-hidden="true">&#x203A;</span>
              </div>
            </div>

            <div class="hhub-card" data-index="3">
              <div class="hhub-card-header">
                <span class="hhub-card-label">Human Resources</span>
              </div>
              <div class="hhub-card-media">
                <img class="hhub-card-img" src="assets/images/hero/col-5_img-03.png" alt="">
              </div>
              <div class="hhub-card-footer">
                <div class="hhub-card-copy">
                  <p class="hhub-card-tagline">Make policy more personal.</p>
                </div>
                <span class="hhub-card-cta" aria-hidden="true">&#x203A;</span>
              </div>
            </div>

          </div><!-- /.hhub-track -->
        </div><!-- /.hero-hub-router -->

      </section><!-- /#hero -->
    </div><!-- /.hero-pin-spacer -->

    <!-- [NEW SECTIONS GO HERE] -->
```

- [ ] **Step 2: Add CSS links in `<head>` (after `styles/hero.css`)**

Find:
```html
  <link rel="stylesheet" href="styles/hero.css">
  <link rel="stylesheet" href="styles/offer-apps.css">
```

Replace with:
```html
  <link rel="stylesheet" href="styles/hero.css">
  <link rel="stylesheet" href="styles/hero-grid.css">
  <link rel="stylesheet" href="styles/hero-hub-router.css">
  <link rel="stylesheet" href="styles/offer-apps.css">
```

- [ ] **Step 3: Add JS links before the debug overlay script**

Find:
```html
  <!-- Debug: grid overlay + breakpoint indicator (M to show, G to toggle grid) -->
```

Insert immediately before that line:
```html
  <!-- Hero grid animation + hub router -->
  <script src="scripts/hero-grid.js"></script>
  <script src="scripts/hub-router.js"></script>

```

- [ ] **Step 4: Open in browser and verify baseline**

Expected: Hero copy shows with updated Figma text ("With great power comes great productivity."), eyebrow reads "PDF & Productivity". No JS errors in console. Grid image 404s are acceptable at this stage.

---

## Task 3: Update hero.css — 3D context and sticky positioning

**Files:**
- Modify: `styles/hero.css`

The `#hero` section needs sticky positioning to work with the pin-spacer, CSS perspective for 3D transforms, and `overflow: visible` so off-screen columns are reachable.

- [ ] **Step 1: Overwrite `styles/hero.css` with updated content**

```css
/* ============================================
   Hub — Hero
   ============================================ */

/* ── Pin-spacer: provides 400vh of scroll distance ── */
.hero-pin-spacer {
  height: 400vh;
  position: relative;
}

/* ── Hero viewport: sticky for the full 400vh range ── */
#hero {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: visible;            /* off-screen grid columns must be reachable */
  background: #F6F6F6;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;

  /* 3D perspective context — all translateZ transforms reference this */
  perspective: 1200px;
  perspective-origin: 50% 50%;
}

/* ── Text zone (z-index: 1 — grid images scroll over this) ── */
.hero-text {
  position: relative;
  z-index: 1;
  padding-top: 120px;
  padding-bottom: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
  transform-origin: center center; /* GSAP scales from center */
}

.hero-app-id {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.hero-app-id img {
  width: 24px;
  height: 24px;
  display: block;
}

.hero-app-id .t-eyebrow {
  color: #2c2c2c;
}

.hero-text h1 {
  max-width: 16ch;
}

.hero-text p {
  max-width: 48ch;
  color: #4a4a4a;
}

/* CTA buttons */
.hero-ctas {
  display: flex;
  align-items: center;
  gap: 12px;
}
```

- [ ] **Step 2: Open in browser and verify**

Expected: Hero text is centered vertically in viewport. Background is `#F6F6F6`. Scrolling past 100vh shows sticky behaviour (hero stays pinned while pin-spacer scrolls).

---

## Task 4: Create hero-grid.css — grid layout, image treatments, debug panel UI

**Files:**
- Create: `styles/hero-grid.css`

This file positions the image grid absolutely over the hero, styles individual cards, and provides the debug panel chrome. Column x/y positions are controlled by GSAP (not CSS).

- [ ] **Step 1: Create `styles/hero-grid.css`**

```css
/* ============================================
   Hub — Hero Image Grid
   ============================================ */

/* ── Grid container: absolute overlay, overflow visible for off-screen cols ── */
.hero-image-grid {
  position: absolute;
  inset: 0;
  overflow: visible;
  z-index: 2;                       /* above .hero-text (z:1) */
  transform-style: preserve-3d;     /* pass 3D context to column children */
  pointer-events: none;             /* columns are decoration only */
  /* opacity:0 until JS sets initial positions — prevents flash of un-staged columns */
  opacity: 0;
}

/* ── Column: positioned by GSAP (translateX / translateY) ── */
.grid-col {
  position: absolute;
  top: 0;
  left: 0;                          /* GSAP overrides via transform */
  width: 291px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transform-style: preserve-3d;     /* pass 3D context to card children */

  /* Vertical centre: shift column so its midpoint aligns with hero center.
     3 images (291px each) + 2 gaps (8px each) = 889px total height.
     Offset: -889px / 2 = -444.5px */
  margin-top: calc(50vh - 445px);
}

/* col-3 has only 2 images: 2×291 + 1×8 = 590px → offset: -295px */
.grid-col[data-col="3"] {
  margin-top: calc(50vh - 295px);
}

/* ── Individual card ── */
.grid-card {
  width: 291px;
  flex-shrink: 0;
  transform-style: preserve-3d;
}

/* ── Images: default rounded treatment ── */
.grid-card img {
  display: block;
  width: 291px;
  height: 291px;
  object-fit: cover;
  border-radius: 16px;
}

/* ── Not-round treatment: no radius, gains drop shadow ── */
.grid-card img[data-treatment="not-round"] {
  border-radius: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.14);
}

/* ══════════════════════════════════════════
   DEBUG PANEL
   Created by hero-grid.js — toggled with D key
   ══════════════════════════════════════════ */

.hero-debug-panel {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 999;
  width: 280px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  font-family: var(--font-body, system-ui, sans-serif);
  font-size: 11px;
  display: none;                    /* shown by JS */
}

.hero-debug-panel.is-visible {
  display: block;
}

.hero-debug-panel h4 {
  margin: 0 0 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(0, 0, 0, 0.5);
}

.dbg-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.dbg-row label {
  flex: 0 0 auto;
  width: 110px;
  color: #1a1a1a;
  font-size: 11px;
  line-height: 1.4;
}

.dbg-row input[type="range"] {
  flex: 1;
  min-width: 0;
  accent-color: #E00;
}

.dbg-row .dbg-val {
  flex: 0 0 32px;
  text-align: right;
  color: rgba(0, 0, 0, 0.5);
  font-variant-numeric: tabular-nums;
}

.dbg-reset {
  display: block;
  width: 100%;
  margin-top: 12px;
  padding: 6px 0;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  background: transparent;
  font-size: 11px;
  cursor: pointer;
  color: #1a1a1a;
}

.dbg-reset:hover {
  background: rgba(0, 0, 0, 0.04);
}
```

- [ ] **Step 2: Open in browser — verify no console errors from new CSS**

Expected: No errors. Page looks the same (grid CSS has no visible effect until JS sets initial positions).

---

## Task 5: Create hero-hub-router.css — flex accordion card component

**Files:**
- Create: `styles/hero-hub-router.css`

Adapted from `acom-home/styles/hub-router.css`. Key differences: 4 cards, different collapsed/expanded widths (292/492px), no video, `position: absolute` inside `#hero`, class prefix `hhub-` to avoid conflicts.

- [ ] **Step 1: Create `styles/hero-hub-router.css`**

```css
/* ============================================
   Hub — Hero Hub Router
   Flex-accordion card component (desktop ≥1024px)
   Adapted from acom-home/styles/hub-router.css
   ============================================ */

/* ── Timing tokens ── */
:root {
  --hhub-duration: 600ms;
  --hhub-ease:     cubic-bezier(0.16, 1, 0.3, 1);
}

/* ══════════════════════════════════════════
   DESKTOP (≥1024px)
   ══════════════════════════════════════════ */

/* ── Hub router container: absolute, centred in hero viewport ── */
.hero-hub-router {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;                       /* above grid (z:2) */
  pointer-events: none;             /* enabled via JS on ScrollTrigger onLeave */
}

/* ── Track: flex row of cards ── */
.hhub-track {
  display: flex;
  gap: 8px;
  align-items: stretch;
  transition: transform var(--hhub-duration) var(--hhub-ease);
  will-change: transform;
}

/* ── Card ── */
.hhub-card {
  flex: 0 0 292px;
  height: 578px;
  border-radius: 16px;
  overflow: hidden;
  background: #f0f0f0;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition:
    flex-basis        var(--hhub-duration) var(--hhub-ease),
    background-color  var(--hhub-duration) var(--hhub-ease);
}

/* ── Card header ── */
.hhub-card-header {
  display: flex;
  align-items: center;
  padding: 24px 24px 16px;
  flex-shrink: 0;
}

.hhub-card-label {
  font-family: var(--font-body, system-ui, sans-serif);
  font-size: 12px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 0.06em;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--hhub-duration) var(--hhub-ease);
}

/* ── Card media ── */
.hhub-card-media {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.hhub-card-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ── Card footer ── */
.hhub-card-footer {
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 24px 24px;
}

.hhub-card-copy {
  flex: 1;
  min-width: 0;
}

.hhub-card-tagline {
  font-family: var(--font-body, system-ui, sans-serif);
  font-size: 14px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.56);
  line-height: 1.5;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--hhub-duration) var(--hhub-ease);
}

/* ── Arrow CTA ── */
.hhub-card-cta {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  border: 1.5px solid rgba(255, 255, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  line-height: 1;
  opacity: 0;
  transition: opacity 200ms ease;
}

/* ══════════════════════════════════════════
   ACTIVE STATE
   ══════════════════════════════════════════ */

.hhub-card--active {
  flex-basis: 492px;
  background: #1a1a1a;
}

.hhub-card--active .hhub-card-label   { color: rgba(255, 255, 255, 0.65); }
.hhub-card--active .hhub-card-tagline {
  color: rgba(255, 255, 255, 0.56);
  white-space: normal;    /* allow tagline to wrap in expanded state */
}
.hhub-card--active .hhub-card-cta     { opacity: 1; }

/* ══════════════════════════════════════════
   MOBILE / TABLET (< 1024px)
   The full grid + hub-router animation assumes
   desktop. On mobile, show a simple static hero.
   ══════════════════════════════════════════ */

@media (max-width: 1023px) {
  .hero-hub-router  { display: none; }
  .hero-image-grid  { display: none; }

  .hero-pin-spacer  { height: auto; }

  #hero {
    position: relative;
    height: auto;
    min-height: 100vh;
    overflow: hidden;
  }
}
```

- [ ] **Step 2: Open in browser — verify no CSS errors**

Expected: No console errors. Hub-router is not yet visible (opacity: 0 set by GSAP in Task 7).

---

## Task 6: Create scripts/hub-router.js — flex accordion interaction

**Files:**
- Create: `scripts/hub-router.js`

Adapted from `acom-home/scripts/hub-router.js`. Key changes: 4 cards (`CARD_COUNT = 4`), different dimensions (`CARD_COLLAPSED = 292`, `CARD_EXPANDED = 492`), `hhub-` class names, no video logic.

- [ ] **Step 1: Create `scripts/hub-router.js`**

```javascript
/* ============================================
   HERO HUB ROUTER — Elastic expand carousel
   Adapted from acom-home/scripts/hub-router.js
   Desktop only (>=1024px). Pointer events are
   enabled by hero-grid.js when scroll completes.
   ============================================ */
(function () {
  'use strict';

  if (window.innerWidth < 1024) return;

  /* ── Configuration ── */
  var CARD_COLLAPSED = 292;
  var CARD_EXPANDED  = 492;
  var CARD_GAP       = 8;
  var CARD_COUNT     = 4;

  /* ── DOM ── */
  var track = document.querySelector('.hhub-track');
  if (!track) return;

  var cards = Array.from(track.querySelectorAll('.hhub-card'));

  /* ── Compute translateX to re-centre the track ──
     card 0  -> left edge at grid margin
     card 3  -> right edge at (vw - grid margin)
     others  -> centre expanded track, clamped to margins
  ── */
  function computeTranslate(activeIndex) {
    var vw            = document.documentElement.clientWidth;
    var margin        = vw * 0.08333;
    var collapsedSpan = CARD_COUNT * CARD_COLLAPSED + (CARD_COUNT - 1) * CARD_GAP;
    var expandedSpan  = CARD_EXPANDED + (CARD_COUNT - 1) * CARD_COLLAPSED + (CARD_COUNT - 1) * CARD_GAP;

    if (activeIndex === null) {
      return -(collapsedSpan - vw) / 2;
    }
    if (activeIndex === 0) {
      return margin;
    }
    if (activeIndex === CARD_COUNT - 1) {
      return (vw - margin) - expandedSpan;
    }
    var centered = -(expandedSpan - vw) / 2;
    var maxTx    =  margin;
    var minTx    = (vw - margin) - expandedSpan;
    return Math.max(minTx, Math.min(maxTx, centered));
  }

  function applyTranslate(tx) {
    track.style.transform = 'translateX(' + tx + 'px)';
  }

  /* ── Hover state ── */
  var activeCard = null;

  function activate(card) {
    if (activeCard === card) return;
    if (activeCard) activeCard.classList.remove('hhub-card--active');
    activeCard = card;
    card.classList.add('hhub-card--active');
    applyTranslate(computeTranslate(parseInt(card.dataset.index, 10)));
  }

  function resetTrack() {
    if (activeCard) activeCard.classList.remove('hhub-card--active');
    activeCard = null;
    applyTranslate(computeTranslate(null));
  }

  /* ── Bind events ── */
  cards.forEach(function (card) {
    card.addEventListener('mouseenter', function () { activate(card); });
  });

  var outer = track.closest('.hero-hub-router');
  if (outer) outer.addEventListener('mouseleave', resetTrack);

  /* ── Init + resize ── */
  function init() {
    track.style.transition = 'none';
    applyTranslate(computeTranslate(null));
    requestAnimationFrame(function () { track.style.transition = ''; });
  }

  init();
  window.addEventListener('resize', init);

  /* Expose reset for hero-grid.js to call after scroll completes */
  window.__hhubReset = resetTrack;

}());
```

- [ ] **Step 2: Test hub-router interaction in DevTools**

In DevTools console, run:
```javascript
document.querySelector('.hero-hub-router').style.opacity = '1';
document.querySelector('.hero-hub-router').style.pointerEvents = 'auto';
```

Then hover over the 4 cards. Expected: cards expand to 492px on hover with dark background. Mouse-leave collapses them. Track re-centres smoothly.

---

## Task 7: Create scripts/hero-grid.js — all 4 phases + debug panel

**Files:**
- Create: `scripts/hero-grid.js`

This is the complete animation script: initial state setup, all 4 scroll phases, the ScrollTrigger scrub timeline, and the debug panel (D-key toggle). Everything is in one self-contained IIFE.

- [ ] **Step 1: Create `scripts/hero-grid.js`**

```javascript
/* ============================================
   HERO GRID ANIMATION
   GSAP ScrollTrigger scrub timeline — 4 phases.
   CSS sticky handles the pin; this script only
   drives the scrub animation (no pin:true).
   ============================================ */
(function () {
  'use strict';

  /* Skip on mobile — CSS hides the grid below 1024px */
  if (window.innerWidth < 1024) return;

  gsap.registerPlugin(ScrollTrigger);

  /* ── Layout constants ── */
  var IMG_W = 291;

  /* ── Debug defaults (measured from Figma) ── */
  var DEFAULTS = {
    col1Y:       0,
    col2Y:     183,
    col3Y:     307,
    col4Y:     207,
    col5Y:      17,
    initialGap: 97,
    finalGap:    8,
    spread:      0    /* additional off-screen offset for col 1 and col 5 */
  };

  /* ── Read debug values from localStorage (fall back to defaults) ── */
  function getDebugValues() {
    function get(key) {
      var v = localStorage.getItem('hub-debug-' + key);
      return v !== null ? parseFloat(v) : DEFAULTS[key];
    }
    return {
      colY:       [get('col1Y'), get('col2Y'), get('col3Y'), get('col4Y'), get('col5Y')],
      initialGap: get('initialGap'),
      finalGap:   get('finalGap'),
      spread:     get('spread')
    };
  }

  /* ── Compute initial column X positions ──
     At initialGap=97, the natural centred layout puts col 0 at x≈-202px
     (off-screen left) and col 4 at x≈1351px (off-screen right) in a
     1440px viewport. 'spread' adds extra off-screen distance to outer cols.
  ── */
  function getInitialX(d) {
    var vw     = window.innerWidth;
    var totalW = 5 * IMG_W + 4 * d.initialGap;
    var left   = (vw - totalW) / 2;
    return [0, 1, 2, 3, 4].map(function (i) {
      var base = left + i * (IMG_W + d.initialGap);
      if (i === 0) return base - d.spread;
      if (i === 4) return base + d.spread;
      return base;
    });
  }

  /* ── Compute converged column X positions (Phase 1 end state) ── */
  function getFinalX(d) {
    var vw     = window.innerWidth;
    var totalW = 5 * IMG_W + 4 * d.finalGap;
    var left   = (vw - totalW) / 2;
    return [0, 1, 2, 3, 4].map(function (i) {
      return left + i * (IMG_W + d.finalGap);
    });
  }

  /* ── Compute Phase 4 deltas ──
     Each bottom card (cols 0,1,3,4 in 0-indexed terms) translates to its
     hub-router card centre. The delta is applied to the CARD element on top
     of the column's already-translated x.
  ── */
  function getBottomCardDeltas(d) {
    var vw         = window.innerWidth;
    var hubCardW   = 292;
    var hubGap     = 8;
    var hubTotalW  = 4 * hubCardW + 3 * hubGap;   /* 1192px */
    var hubLeft    = (vw - hubTotalW) / 2;
    var finalX     = getFinalX(d);
    var colIndices = [0, 1, 3, 4];

    /* Hub card centres (viewport-absolute x) */
    var hubCentres = [0, 1, 2, 3].map(function (i) {
      return hubLeft + i * (hubCardW + hubGap) + hubCardW / 2;
    });

    return colIndices.map(function (colIdx, i) {
      var gridCentre = finalX[colIdx] + IMG_W / 2;
      return hubCentres[i] - gridCentre;
    });
  }

  /* ──────────────────────────────────────────
     TIMELINE BUILDER
     Called on init and on debug panel changes.
  ────────────────────────────────────────── */
  var st = null;

  function buildTimeline() {
    if (st) st.kill();

    var d = getDebugValues();

    var cols        = Array.from(document.querySelectorAll('.grid-col'));
    var grid        = document.querySelector('.hero-image-grid');
    var heroText    = document.querySelector('.hero-text');
    var row1        = Array.from(document.querySelectorAll('.grid-col .grid-card:first-child'));
    var row2        = Array.from(document.querySelectorAll('.grid-col .grid-card:nth-child(2)'));
    var bottomCards = Array.from(document.querySelectorAll('.grid-card--bottom'));
    var hubRouter   = document.querySelector('.hero-hub-router');

    gsap.killTweensOf([cols, grid, heroText, row1, row2, bottomCards, hubRouter]);

    var initX  = getInitialX(d);
    var finalX = getFinalX(d);
    var deltas = getBottomCardDeltas(d);

    /* ── Set initial state ── */
    cols.forEach(function (col, i) {
      gsap.set(col, { x: initX[i], y: d.colY[i] });
    });
    gsap.set(row1,        { z: 0, opacity: 1 });
    gsap.set(row2,        { z: 0, opacity: 1 });
    gsap.set(bottomCards, { x: 0, opacity: 1 });
    gsap.set(heroText,    { opacity: 1, z: 0, scale: 1 });
    gsap.set(hubRouter,   { opacity: 0 });
    hubRouter.setAttribute('aria-hidden', 'true');
    hubRouter.style.pointerEvents = 'none';

    /* Reveal grid now that columns are positioned */
    gsap.set(grid, { opacity: 1 });

    /* ── Build scrub timeline ── */
    var tl = gsap.timeline();

    /* Phase 1 (0 -> 0.25): columns converge, y-stagger resolves */
    cols.forEach(function (col, i) {
      tl.to(col, { x: finalX[i], y: 0, ease: 'none', duration: 0.25 }, 0);
    });

    /* Phase 2 (0.20 -> 0.55): hero text recedes in z-space */
    tl.to(heroText, {
      opacity:  0,
      z:       -180,
      scale:    0.92,
      ease:    'none',
      duration: 0.35
    }, 0.20);

    /* Phase 3a (0.45 -> 0.85): Row 1 recedes deepest and fades */
    tl.to(row1, {
      z:        -500,
      opacity:   0,
      ease:     'none',
      duration:  0.40
    }, 0.45);

    /* Phase 3b (0.55 -> 0.85): Row 2 recedes, offset 0.1 behind Row 1 */
    tl.to(row2, {
      z:        -320,
      opacity:   0,
      ease:     'none',
      duration:  0.30
    }, 0.55);

    /* Phase 4 (0.78 -> 1.0): bottom row moves to hub positions + fades out */
    bottomCards.forEach(function (card, i) {
      tl.to(card, {
        x:        deltas[i],
        opacity:   0,
        ease:     'power2.inOut',
        duration:  0.22
      }, 0.78);
    });

    /* Phase 4 (0.78 -> 1.0): hub-router fades in as cards fade out */
    tl.to(hubRouter, {
      opacity:  1,
      ease:    'none',
      duration: 0.22
    }, 0.78);

    /* ── Wire to ScrollTrigger ── */
    st = ScrollTrigger.create({
      trigger:   '.hero-pin-spacer',
      start:     'top top',
      end:       'bottom bottom',
      scrub:     1,
      animation: tl,
      onLeave: function () {
        /* Animation complete — enable hub-router interaction */
        hubRouter.style.pointerEvents = 'auto';
        hubRouter.removeAttribute('aria-hidden');
        if (window.__hhubReset) window.__hhubReset();
      },
      onEnterBack: function () {
        /* User scrolled back into the animation — disable hub-router */
        hubRouter.style.pointerEvents = 'none';
        hubRouter.setAttribute('aria-hidden', 'true');
      }
    });
  }

  buildTimeline();

  /* Expose for debug panel */
  window.__heroGridRebuild = buildTimeline;

  /* ══════════════════════════════════════════
     DEBUG PANEL
     Toggle with D key (M is reserved for grid overlay)
  ══════════════════════════════════════════ */

  var debugPanel  = null;
  var rebuildTimer = null;

  var SLIDER_DEFS = [
    { key: 'col1Y',      label: 'Col 1 Y offset', min:   0, max: 400, step: 1 },
    { key: 'col2Y',      label: 'Col 2 Y offset', min:   0, max: 400, step: 1 },
    { key: 'col3Y',      label: 'Col 3 Y offset', min:   0, max: 400, step: 1 },
    { key: 'col4Y',      label: 'Col 4 Y offset', min:   0, max: 400, step: 1 },
    { key: 'col5Y',      label: 'Col 5 Y offset', min:   0, max: 400, step: 1 },
    { key: 'initialGap', label: 'Initial gap',     min:   0, max: 200, step: 1 },
    { key: 'finalGap',   label: 'Final gap',       min:   0, max:  48, step: 1 },
    { key: 'spread',     label: 'Initial spread',  min:   0, max: 400, step: 1 }
  ];

  function createDebugPanel() {
    var panel   = document.createElement('div');
    panel.className = 'hero-debug-panel';

    var heading = document.createElement('h4');
    heading.textContent = 'Hero Grid Debug';
    panel.appendChild(heading);

    SLIDER_DEFS.forEach(function (def) {
      var stored = localStorage.getItem('hub-debug-' + def.key);
      var val    = stored !== null ? parseFloat(stored) : DEFAULTS[def.key];

      var row = document.createElement('div');
      row.className = 'dbg-row';

      var label = document.createElement('label');
      label.textContent = def.label;

      var slider = document.createElement('input');
      slider.type        = 'range';
      slider.min         = String(def.min);
      slider.max         = String(def.max);
      slider.step        = String(def.step);
      slider.value       = String(val);
      slider.dataset.key = def.key;

      var valDisplay = document.createElement('span');
      valDisplay.className   = 'dbg-val';
      valDisplay.textContent = String(val);

      slider.addEventListener('input', function () {
        var v = parseFloat(this.value);
        valDisplay.textContent = String(v);
        localStorage.setItem('hub-debug-' + this.dataset.key, String(v));
        clearTimeout(rebuildTimer);
        rebuildTimer = setTimeout(buildTimeline, 300);
      });

      row.appendChild(label);
      row.appendChild(slider);
      row.appendChild(valDisplay);
      panel.appendChild(row);
    });

    var resetBtn = document.createElement('button');
    resetBtn.className   = 'dbg-reset';
    resetBtn.textContent = 'Reset to defaults';
    resetBtn.addEventListener('click', function () {
      SLIDER_DEFS.forEach(function (def) {
        localStorage.removeItem('hub-debug-' + def.key);
      });
      Array.from(panel.querySelectorAll('input[type="range"]')).forEach(function (s) {
        s.value = String(DEFAULTS[s.dataset.key]);
        s.nextElementSibling.textContent = String(DEFAULTS[s.dataset.key]);
      });
      buildTimeline();
    });
    panel.appendChild(resetBtn);

    document.body.appendChild(panel);
    return panel;
  }

  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key !== 'd' && e.key !== 'D') return;
    if (!debugPanel) debugPanel = createDebugPanel();
    debugPanel.classList.toggle('is-visible');
  });

}());
```

- [ ] **Step 2: Open in browser — verify initial grid render**

Expected: On page load, grid columns appear in their staggered starting positions (col 1 slightly off-screen left, col 5 slightly off-screen right, inner cols staggered down). Image 404 errors are expected if real images haven't been placed yet.

If columns don't appear: check console for GSAP errors; verify `vendor/gsap.min.js` and `vendor/ScrollTrigger.min.js` are loaded before `scripts/hero-grid.js`.

- [ ] **Step 3: Scroll test — all 4 phases**

Scroll slowly from the top through the full 400vh. Expected progression:

| Scroll progress | Expected |
|----------------|----------|
| 0–25% | Columns converge inward, y-stagger flattens to aligned row |
| 20–55% | Hero heading/copy fades and recedes (perspective shrinks it) |
| 45–85% | Row 1 images recede deepest (−500px z) and disappear; Row 2 follows behind |
| 78–100% | Bottom 4 images translate toward centre and fade; hub-router cards fade in |
| 100% | Hub-router fully visible and interactive |

Common fixes:
- **Z-recession invisible**: Confirm `transform-style: preserve-3d` is on `.hero-image-grid`, `.grid-col`, `.grid-card` in `hero-grid.css`
- **Hero text doesn't recede**: Confirm `transform-origin: center center` is on `.hero-text` in `hero.css`
- **Hub-router appears at wrong position**: Confirm `left: 50%; transform: translate(-50%, -50%)` on `.hero-hub-router` in `hero-hub-router.css`
- **Hub-router not interactive at scroll end**: Confirm `onLeave` callback is enabling `pointer-events: auto`

- [ ] **Step 4: Debug panel test — press D**

Expected: Frosted-glass panel appears top-right with 8 sliders. Dragging a Col Y slider visually shifts that column's starting height after ~300ms. Reset button restores spec defaults.

- [ ] **Step 5: Commit**

```bash
git add scripts/hero-grid.js scripts/hub-router.js styles/hero-grid.css styles/hero-hub-router.css styles/hero.css index.html assets/images/hero/
git commit -m "feat: complete hero grid animation — all 4 phases + debug panel"
```

---

## Task 8: Final integration check

**Files:**
- Read: `index.html` (verify script/style order)

- [ ] **Step 1: Confirm script loading order in index.html**

Scripts before `</body>` must appear in this exact order:
1. `lenis.min.js` (CDN)
2. `vendor/gsap.min.js`
3. `vendor/ScrollTrigger.min.js`
4. Inline Lenis + ScrollTrigger integration script
5. Inline nav scroll-state script
6. `scripts/mega-nav.js`
7. `scripts/mobile-nav.js`
8. `scripts/hero-grid.js`  ← must come AFTER GSAP
9. `scripts/hub-router.js`
10. Inline debug grid overlay script (M/G keys)

`hero-grid.js` must be after GSAP. `hub-router.js` must be after `hero-grid.js` (so `window.__hhubReset` is defined when hub-router calls it — actually hub-router.js SETS `window.__hhubReset`, not reads it, so order doesn't strictly matter, but keeping them together is clean).

- [ ] **Step 2: Mobile verification (< 1024px)**

Resize browser to 375px width. Expected: Static hero with centered text and CTAs. No image grid, no hub-router. No JS errors.

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "chore: final integration — hero grid animation complete"
```

---

## Known Tuning Points

The spec calls these out as starting points requiring visual adjustment:

| Value | File | Where to change |
|-------|------|----------------|
| Column Y stagger | `hero-grid.js` `DEFAULTS` | Use D-key debug panel |
| Phase timing boundaries (0.25, 0.55, 0.85...) | `hero-grid.js` `buildTimeline()` | Edit the position args on each `tl.to()` |
| `scrub` lag | `hero-grid.js` `ScrollTrigger.create` | Try `scrub: 0.8` for more lag |
| Z-depth terminal values (−500, −320) | `hero-grid.js` Phase 3 | Edit `z:` values directly |
| Hub router card widths | `hub-router.js` `CARD_COLLAPSED` / `CARD_EXPANDED` | May differ at actual viewport |
| Column vertical centering | `hero-grid.css` `.grid-col { margin-top }` | Eyeball after real images land |
