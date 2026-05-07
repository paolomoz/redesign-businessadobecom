# Hero Grid → Carousel Transition

## Overview

Rebuild the hero scroll interaction so that a 5-column masonry image grid parallaxes, converges, and seamlessly transforms into a 4-card elastic carousel. The transition must feel continuous — no crossfades, no visible swap.

## Storyboard Summary

1. **Initial state**: 5 offset columns of images sit around centered hero copy. Wide gaps (~97px) between columns and between images within each column. Outer columns partially off-screen.
2. **Mid-scroll**: Hero copy fades up. Images parallax upward (center column fastest, outer columns slowest). Columns converge horizontally. Gaps shrink in sync (H and V always equal).
3. **Settled state**: Bottom images from columns 1, 2, 4, 5 have separated from their columns, settled to center of viewport with 8px gaps. Upper images and all of column 3 have scrolled out. A clip-path animation reveals card chrome (category labels + taglines) from behind the images, completing the transformation into the elastic carousel.

## Tunable Parameters

Exposed as CSS custom properties for easy adjustment:

| Property | Default | Purpose |
|---|---|---|
| `--hero-scroll-distance` | `400vh` | Total scroll length for the pinned interaction |
| `--hero-grid-initial-gap` | `97px` | Starting gap between columns and between images within columns |

These are the only two values that need frequent tuning. All other constants (final gap = 8px, column Y offsets, parallax ratios) are hardcoded in JS as clearly-labeled constants at the top of the file.

## Architecture

### Individual Image Positioning

**Current approach (being replaced):** GSAP animates 5 column containers. Images are flex children within columns. Bottom cards can't separate independently.

**New approach:** GSAP positions all 14 images individually via absolute positioning. Each image gets its own x/y animation path. This enables the bottom cards to decouple from their column's trajectory at the separation point.

The column `.grid-col` elements remain in the DOM for semantic grouping but no longer drive layout — each `.grid-card` is `position: absolute` and GSAP controls its `x` and `y`.

### Timeline Phases

#### Phase 1: Convergence + Parallax (0 → 0.50)

- All 14 images rise upward (Y) with differential speeds per column:
  - Columns 1, 5 (outer): slowest
  - Columns 2, 4 (inner): medium
  - Column 3 (center): fastest
- All images converge horizontally (X) from initial spread to tight grouping
- Gap animates from `--hero-grid-initial-gap` → 8px (both horizontal between columns and vertical between images in the same column, always equal)
- Hero text fades up and out (opacity 1→0, y offset upward)

#### Phase 2: Separation (0.50 → 0.75)

- **Bottom cards** (last image in cols 1, 2, 4, 5) decelerate and ease toward their final resting positions — the exact pixel positions of the carousel card image areas
- **Upper cards** (rows 1, 2 in all columns, plus all of column 3) accelerate upward and fade out
- By the end of this phase, the 4 bottom images are pixel-aligned with the `.hhub-card-media` areas of the carousel

#### Phase 3: Swap + Reveal (0.75 → 1.0)

- **Instant swap**: Grid bottom images set to `opacity: 0`, carousel container set to `opacity: 1`. Because images are identical and pixel-aligned, swap is invisible.
- **Clip-path expand**: Each `.hhub-card` animates from `inset(headerH 0 footerH 0 round 16px)` → `inset(0 0 0 0 round 16px)`. This unmasks the card header (category label) and footer (tagline + CTA arrow) from behind the image.

### Position Calculation

For each image, its position at any point in the timeline is:

```
x = columnX(colIndex, currentGap)
y = columnBaseY(colIndex) + (rowIndex * scaledImageHeight(colIndex, rowIndex)) + (rowIndex * currentGap)
```

Where:
- `columnX` interpolates from initial spread positions to converged positions
- `columnBaseY` includes the per-column vertical offset (for staggering)
- `scaledImageHeight` uses each image's natural aspect ratio (masonry)
- `currentGap` interpolates from initialGap to finalGap

Bottom cards in Phase 2 break from this formula and ease independently toward their carousel target positions.

### Carousel Target Positions

The 4 bottom images must land at the exact position of each `.hhub-card-media` element within the carousel. These are calculated at init time by measuring:

1. The `.hero-hub-router` container position (centered in viewport)
2. Each `.hhub-card` position within the track
3. The `.hhub-card-media` offset within each card (below the header)

This ensures the grid images overlap the card images perfectly at swap time.

### Image Aspect Ratios

Source images have varying dimensions creating the masonry effect:

| Image | Ratio | Type |
|---|---|---|
| col-X_img-0X (584x584) | 1:1 | Square |
| col-X_img-0X (594x833, 581x833) | ~1:1.4 | Tall document |
| col-X_img-0X (584x788, etc.) | ~1:1.35 | Tall photo |

The HTML `width`/`height` attributes need updating to match actual ratios so `height: auto` produces the correct masonry heights. The grid images use their natural aspect ratio. The carousel cards use `object-fit: cover` on the same images.

### What Gets Removed

- Debug panel (entire JS block: `createDebugPanel()`, `SLIDER_DEFS`, D-key listener)
- Debug CSS (`.hero-debug-panel`, `.dbg-row`, `.dbg-val`, `.dbg-reset`)
- `localStorage` debug value reading (`getDebugValues()`, `hub-debug-*` keys)
- `window.__heroGridRebuild` export (no longer needed without debug panel)

### What Stays

- HTML structure (5 `.grid-col` containers with `.grid-card` children)
- CSS sticky pin-spacer architecture (`position: sticky` on `#hero`)
- Hub-router elastic carousel behavior (`hub-router.js`)
- Hub-router CSS (`.hero-hub-router`, `.hhub-card`, etc.)
- Mobile breakpoint behavior (grid hidden below 1024px)

### Files Modified

| File | Changes |
|---|---|
| `scripts/hero-grid.js` | Full rewrite: individual image positioning, new timeline phases, remove debug panel |
| `styles/hero-grid.css` | Update for absolute image positioning, add CSS custom properties, remove debug panel styles |
| `styles/hero.css` | Use `--hero-scroll-distance` custom property for pin-spacer height |
| `index.html` | Update image `width`/`height` attributes to match actual aspect ratios |

### Scrub Behavior

The entire animation is driven by a single GSAP ScrollTrigger with `scrub: 1`. This means:
- Scrolling down plays the animation forward
- Scrolling up plays it backward
- All phases must be reversible (no DOM manipulation mid-timeline)
- The instant swap in Phase 3 is just opacity toggles, fully reversible

### Edge Cases

- **Resize**: Full rebuild on debounced resize (positions recalculated for new viewport)
- **Reverse scrub**: All GSAP tweens are naturally reversible. The opacity swap and clip-path work in both directions.
- **ScrollTrigger onLeave/onEnterBack**: Continue to toggle carousel pointer-events and aria-hidden
