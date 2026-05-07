---
name: Adobe for Business — target visual system
schemaVersion: 2
_provenance:
  writtenBy: stardust:direct
  writtenAt: 2026-05-07
  derivedFrom:
    - references/hub/styles/global/typography.css
    - references/hub/styles/global/grid.css
    - references/hub/styles/hero.css
    - references/hub/styles/editorial.css
    - references/bizpro-hub/bizpro-hub.html (Spectrum 2 tokens, lines 30-110)
colors:
  background: "#ffffff"
  surface: "#f8f8f8"
  surface-strong: "#f3f3f3"
  text: "#131313"
  text-subtle: "rgba(0,0,0,0.64)"
  text-muted: "#4a4a4a"
  primary: "#3b63fb"
  primary-strong: "#274dea"
  accent-red: "#eb1000"
  border: "#e1e1e1"
  divider: "#e9e9e9"
typography:
  display: '"Adobe Clean Display", "Adobe Clean", system-ui, sans-serif'
  body: '"Adobe Clean", "Adobe Clean Display", system-ui, sans-serif'
rounded:
  hero: 32px
  card: 16px
  pill: 999px
  chip: 4px
spacing:
  base: 8px
  section-y-desktop: 96px
  section-y-tablet: 64px
  section-y-mobile: 48px
components:
  - hero-mosaic
  - product-tile
  - editorial-card
  - cta-pill
  - mega-nav
  - section-header
  - sticky-cta
  - footer
---

# Adobe for Business — target visual system

## Overview

Editorial, cinematic, type-led. White ground; charcoal type at large display sizes does the heavy lifting; one saturated blue carries CTAs and links; motion is scroll-driven and structural.

The system inherits Adobe's Spectrum 2 token library (gray ramp 50–900, semantic role tokens, type scale fixed in Figma) and the motion / composition language captured in the design team's reference prototypes (`references/hub`, `references/bizpro-hub`).

## Palette

OKLCH-equivalent values are the literal hexes captured from the reference token system; they are kept as hex for parity with Adobe's Spectrum 2 implementation.

| Role | Token | Value | Notes |
|---|---|---|---|
| Page ground | `--color-background-default` | `#ffffff` | Stark white. The brand-native ground; do not tint. |
| Section alt | `--color-background-subtle` | `#f8f8f8` | Used for editorial section behind the rounded hero. |
| Strong neutral | `--color-gray-100` | `#e9e9e9` | Dividers and chip surfaces. |
| Body text | `--color-content-default` | `#131313` | Near-black. AA on white at 12px+. |
| Muted text | `--color-content-subtle` | `rgba(0,0,0,0.64)` | Secondary copy. |
| Soft text | `--color-content-soft` | `#4a4a4a` | Card body / supporting text. |
| Primary action | `--color-primary` | `#3b63fb` | Spectrum-2 blue-900. CTAs, links. |
| Primary hover | `--color-primary-strong` | `#274dea` | Hover / pressed for primary. |
| Brand mark only | `--color-adobe-red` | `#eb1000` | Reserved for the Adobe logo lockup. Never a UI color. |

**Reservation:** `--color-adobe-red` is reserved to the logo. A linter on prototype/migrate refuses pages where this hex appears outside an `<img>` tag with the Adobe logo asset.

## Typography

One family across the system: **Adobe Clean Display** (display) paired with **Adobe Clean** (body). Same family for everything; weight + size carry hierarchy.

| Step | Desktop | Tablet | Mobile | Weight | Line-height | Tracking |
|---|---|---|---|---|---|---|
| Super | 96 | 72 | 56 | 900 | 0.94 | -0.04em |
| Title 1 | 80 | 56 | 40 | 900 | 0.96 | -0.04em |
| Title 2 | 56 | 40 | 32 | 900 | 1.0 | -0.03em |
| Title 3 | 48 | 32 | 24 | 900 | 1.0 | -0.03em / -0.02em mobile |
| Title 4 | 24 | 20 | 20 | 900 | 1.0 | -0.02em |
| Body Large | 20 | 18 | 16 | 400 | 1.2–1.3 | 0 |
| Body Medium | 16 | — | — | 400 | 1.3 | +0.01em |
| Body Small | 14 | — | — | 400 | 1.3 | +0.01em |
| Eyebrow | 16 | — | — | 700 | 1.3 | -0.01em |
| Label | 14 | — | — | 700 | 1.3 | 0 |
| Caption | 12 | — | — | 700 | 1.3 | +0.02em |

**Rules.**
- Headings are Black (900). No mid-weight display headings.
- Mixed-case for headings ≥ 3 words. ALL CAPS only for Eyebrow and CTA labels ≤ 2 words.
- Tracking tightens as size grows (negative). Body tracks slightly positive at 16/14.

## Grid

12-column at ≥ 1024px with 8.333% side margins, capped at 1920px max-width. 6-column at < 1024px with 24px fixed side margins. 8px gutter throughout. (`references/hub/styles/global/grid.css`)

## Radius

| Token | Value | Use |
|---|---|---|
| `--radius-hero` | 32px | Hero block bottom corners — signature motif. |
| `--radius-card` | 16px | All cards, image tiles, mosaic cards. |
| `--radius-pill` | 999px | CTA pills (Spectrum 2 buttons are fully rounded). |
| `--radius-chip` | 4px | Eyebrow chips, badges. |

## Shadow & elevation

Single-layer drop shadows used sparingly. Default card surface is matte (no shadow); shadows apply only to floating elements (mega-nav panel, sticky CTA, hover state on editorial right card).

- `--shadow-card-hover` `0 4px 100px rgba(0,0,0,0.25)` (editorial right card; Figma drop shadow)
- `--shadow-floating` `0 16px 48px rgba(0,0,0,0.16)` (mega-nav, sticky CTA)

## Motion

Motion is structural, not decorative. Implemented via Lenis smooth-scroll + GSAP ScrollTrigger.

- **Hero mosaic** — 5-column image grid pinned for 220–240vh; cards converge from spread to tight on scroll, headline fades.
- **Reveal ripple** — on load, hero cards reveal via clip-path inset(50%→0%) staggered by Chebyshev ring.
- **Text animator** — `[data-ta]` and `[data-ta-unit]` blocks slide in from progressive y-offsets between 90vh and 40vh, scrubbed to scroll.
- **Editorial parallax** — section behind hero translates slower than scroll; tucks behind hero's 32px rounded bottom.
- **Reduced motion** — all scroll-driven motion disables under `prefers-reduced-motion: reduce`. The reveal-tuner module provides a runtime toggle for QA.

## Components (canonical)

### `button-primary`

```css
.ds-btn-primary {
  display: inline-flex; align-items: center; justify-content: center;
  height: 40px; padding: 0 20px;
  font: 700 14px/1 var(--font-body); letter-spacing: 0;
  color: #fff; background: var(--color-primary);
  border: 0; border-radius: var(--radius-pill);
  transition: background .2s ease;
}
.ds-btn-primary:hover { background: var(--color-primary-strong); }
```

### `button-secondary`

```css
.ds-btn-secondary {
  display: inline-flex; align-items: center; justify-content: center;
  height: 40px; padding: 0 20px;
  font: 700 14px/1 var(--font-body);
  color: var(--color-content-default);
  background: transparent;
  border: 1px solid rgba(0,0,0,0.7);
  border-radius: var(--radius-pill);
  transition: background .2s ease;
}
.ds-btn-secondary:hover { background: rgba(0,0,0,0.06); }
```

### `card` (default)

```css
.ds-card {
  background: var(--color-background-default);
  border-radius: var(--radius-card);
  overflow: hidden;
  display: flex; flex-direction: column;
}
```

### `eyebrow`

```css
.ds-eyebrow {
  font-family: var(--font-body);
  font-weight: 700; font-size: 16px; line-height: 1.3;
  letter-spacing: -0.01em;
  color: var(--color-content-default);
  text-transform: none;
}
```

### `link`

Inline links inherit `--color-primary`, no underline by default, underline on hover.

## Voice (DOs and DON'Ts)

**DO**
- "Unleash creativity at scale."
- "There's more to Acrobat than Acrobat."
- "Data and insights for a competitive edge."
- "Accelerated document workflows that deliver more impact."

**DON'T**
- "Get started for free!" — consumer register, exclamation point.
- "AI-powered everything for your team" — generic AI flourish.
- "The complete solution for the modern enterprise" — empty maximalism.
- "Try Adobe risk-free" — does not match the enterprise contract motion.

## Anti-toolbox

- No glassmorphism / frosted-glass nav.
- No purple-blue gradients on CTAs.
- No isometric / flat-illustration heroes.
- No centered hero with double-CTA-pair silhouette.
- No gradient text.
- No drop-shadowed text on photographic backgrounds without a contrast scrim.
- Adobe Red used only on the logo asset; never on a UI surface.
