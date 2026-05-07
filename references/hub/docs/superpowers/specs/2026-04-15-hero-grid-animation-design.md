# Hero Grid Animation — Design Spec
**Date:** 2026-04-15  
**Prototype:** hub (`/Prototypes/hub`)  
**Status:** Approved — ready for implementation

---

## Overview

A scroll-driven hero animation where a 5-column grid of images converges, recedes in 3D space, and resolves into a flex-accordion card component — all within a single sticky viewport. The interaction has four distinct phases driven by one GSAP ScrollTrigger scrub timeline.

---

## 1. Page Structure

```
.hero-pin-spacer            (height: 400vh, position: relative)
  #hero                     (position: sticky, top: 0, height: 100vh)
    .hero-text              ← existing copy + CTAs
    .hero-image-grid        ← 5-column image grid, position: absolute, inset: 0
      .grid-col (×5)
        .grid-card (×3)     ← some cols have 2 images (col-3)
    .hero-hub-router        ← 4 cards, opacity: 0 initially, fades in at Phase 4
      .hhub-card (×4)
```

`#hero` gets `perspective: 1200px` and `overflow: visible` (off-screen columns must be reachable by GSAP). `.hero-image-grid` is `position: absolute; inset: 0; overflow: visible; z-index: 2` — above `.hero-text` (`z-index: 1`) so images scroll over the copy during convergence.

---

## 2. Image Grid — Initial State

**Image asset map:**

| Col | Row 1 | Row 2 | Row 3 (bottom) |
|-----|-------|-------|----------------|
| 1 | col-1_img-01.png | col-1_img-02.png | col-1_img-03.png |
| 2 | col-2_img-01_not-round.png | col-2_img-02.png | col-2_img-03.png |
| 3 | col-3_img-1.png | col-3_img-02_not-round.png | — (no image) |
| 4 | col-4_img-01.png | col-4_img-02.png | col-4_img-03.png |
| 5 | col-5_img-01.png | col-5_img-02.png | col-5_img-03.png |

**Image treatments (via `data-treatment` attribute):**
- Default: `border-radius: 16px`, no shadow
- `data-treatment="not-round"`: `border-radius: 0`, `box-shadow: 0 8px 32px rgba(0,0,0,0.14)`

**Column sizing:**
- Image width: `291px`
- Image aspect ratio: `1 / 1` (square) for rows 1–2; same initially for row 3
- Column gap (between images within a column): `8px`
- Inter-column gap (initial): `97px` → animates to `8px`
- Column 1 initial x: `-202px` (partially off-screen left); Column 5 initial x: `1352px` (partially off-screen right, in a 1440px viewport)

**Initial column X positions (1440px viewport, left edge of image):**
```
Col 1: x = -202px   (off-screen left)
Col 2: x =  186px
Col 3: x =  575px   (near horizontal center)
Col 4: x =  963px
Col 5: x = 1352px   (off-screen right)
```

**Initial vertical stagger (Y offset from Col 1's starting position):**
```
Col 1:   0px  (reference — highest column in viewport)
Col 2: +183px
Col 3: +307px
Col 4: +207px
Col 5:  +17px
```

Stagger values animate to `0` (each column's neutral centered position) by end of Phase 1.

---

## 3. Animation Phases

Single GSAP timeline. Trigger: `.hero-pin-spacer`, `start: "top top"`, `end: "bottom bottom"`, `scrub: 1`.  
Progress expressed as `0 → 1`.

### Phase 1 — Converge (0 → 0.25)
- All columns translate inward: inter-column gap `80px → 8px`
- Column x-spread collapses: off-screen columns slide into viewport
- Column Y stagger resolves: each column's `translateY` eases to `0`
- Hero text unchanged

### Phase 2 — Hero text recedes (0.20 → 0.55)
- `.hero-text` opacity: `1 → 0`
- `.hero-text` translateZ: `0 → -180px`
- `.hero-text` scale: `1 → 0.92`
- Convergence continues in parallel

### Phase 3 — Top rows recede (0.45 → 0.85)
Row 1 leads, Row 2 follows with ~0.1 progress offset:
- **Row 1:** `translateZ: 0 → -500px`, `opacity: 1 → 0`
- **Row 2:** `translateZ: 0 → -320px`, `opacity: 1 → 0`

No white overlay needed — `#hero` background is `#F6F6F6` (from Figma), so `opacity → 0` fades to background naturally. Row 3 (bottom) has **no Z movement** throughout.

### Phase 4 — Bottom row resolves, hub-router reveals (0.78 → 1.0)
- 4 bottom-row images (`col-1/2/4/5 img-03`) translate to their hub-router card x-positions
- `.hero-hub-router` fades in: `opacity: 0 → 1`
- Hub-router card chrome (header, background, footer) appears around the already-positioned images

---

## 4. Z-Space Technique

`#hero` carries `perspective: 1200px`. All transforms are CSS 3D — no scale simulation.

Apparent scale at terminal Z positions (for reference when tuning):
- `translateZ(-180px)` (hero text): `0.87×`
- `translateZ(-320px)` (Row 2): `0.79×`
- `translateZ(-500px)` (Row 1): `0.71×`

Vanishing point is at hero center (`perspective-origin: 50% 50%`).

---

## 5. Hub Router Cards

Ported from `acom-home` (`hub-router.css` + `hub-router.js`), adapted for 4 cards and no video (image only).

**Card content:**

| # | Image | Label | Tagline |
|---|-------|-------|---------|
| 1 | col-1_img-03.png | Sales | Close more deals. |
| 2 | col-2_img-03.png | Marketing | Take the pain out of campaigns. |
| 3 | col-4_img-03.png | Legal | Move the fine print faster. |
| 4 | col-5_img-03.png | Human Resources | Make policy more personal. |

**Interaction (flex accordion):**
- Collapsed width: `292px`, expanded: `492px`
- Collapsed height: `534px`, expanded height: `578px`
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)`, duration `600ms`
- Hover: card expands, background darkens to `#1a1a1a`, text goes white
- Track re-centers dynamically based on which card is active (same logic as acom-home)
- Mobile: standard stacked layout (≤1023px)

`.hero-hub-router` is `position: absolute` inside `#hero`, centered vertically, `opacity: 0` at start, `pointer-events: none` until scroll progress reaches `1.0` — enabled via a ScrollTrigger `onComplete` callback (prevents accidental hover interference mid-scroll).

---

## 6. Debug Panel

**Toggle:** `D` key (M is reserved for grid overlay).  
**Position:** Fixed, top-right, `z-index: 999`.  
**Style:** Frosted glass panel (`backdrop-filter: blur`), same visual language as the site.

**Controls:**

| Control | Type | Range | Default | CSS property |
|---------|------|--------|---------|--------------|
| Col 1 Y offset | Slider | 0 → +400px | 0 | `--dbg-col1-y` |
| Col 2 Y offset | Slider | 0 → +400px | 183 | `--dbg-col2-y` |
| Col 3 Y offset | Slider | 0 → +400px | 307 | `--dbg-col3-y` |
| Col 4 Y offset | Slider | 0 → +400px | 207 | `--dbg-col4-y` |
| Col 5 Y offset | Slider | 0 → +400px | 17 | `--dbg-col5-y` |
| Initial gap | Slider | 0 → 200px | 97 | `--dbg-initial-gap` |
| Final gap | Slider | 0 → 48px | 8 | `--dbg-final-gap` |
| Initial spread | Slider | 0 → 400px | 202 | `--dbg-spread` |

**Behaviour:**
- Changing any slider kills and rebuilds the GSAP timeline (debounced 300ms)
- All values persist to `localStorage` under `hub-debug-*` keys
- "Reset to defaults" button restores spec values and clears localStorage

---

## 7. Files

| Action | File | Purpose |
|--------|------|---------|
| Create | `styles/hero-grid.css` | Grid layout, card image styles, debug panel UI |
| Create | `styles/hero-hub-router.css` | Hub router card styles (adapted from acom-home) |
| Create | `scripts/hero-grid.js` | GSAP timeline + debug panel logic |
| Create | `scripts/hub-router.js` | Flex accordion interaction (ported from acom-home) |
| Modify | `index.html` | Hero spacer, grid HTML, hub-router HTML, script/style links |
| Modify | `styles/hero.css` | Add `perspective: 1200px`, `overflow: visible` to `#hero` |

---

## 8. Tech Stack

- **GSAP + ScrollTrigger** — scroll-driven timeline (already in project)
- **Lenis** — smooth scroll input (already in project, already integrated with GSAP ticker)
- **No new dependencies**

---

## Open Items / Tuning Expected

The following values are starting points and will be adjusted visually once running:
- Column Y stagger offsets
- Phase timing boundaries (especially Phase 2 start and Phase 3 overlap)
- `scrub` value (currently `1.0` — may want `0.8` for more lag)
- Z-depth terminal values per row
- Hub router card collapsed/expanded widths (may differ from acom-home at this viewport)
