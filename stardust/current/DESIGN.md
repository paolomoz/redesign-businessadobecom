---
name: Adobe for Business — current visual system
_provenance: aggregated from 5 pages crawled on 2026-05-07
colors:
  background: "#ffffff"
  surface: "#f5f5f5"
  text: "#2c2c2c"
  text-strong: "#000000"
  primary: "#274dea"
  border: "#e1e1e1"
typography:
  display: 'Adobe Clean, "Trebuchet MS", sans-serif'
  body: 'Adobe Clean, "Trebuchet MS", sans-serif'
rounded:
  card: 16px
  button: 25px
spacing:
  base: 8px
  section-y: 96px
components:
  - card
  - product-tile
  - cta-pill
  - hero-marquee
  - mega-nav
  - footer
---

# Adobe for Business — current visual system

## Palette

- **Background.** Predominantly white; some sections use pale gray (#f5f5f5) for separation. No dark backgrounds in the 5-page sample.
- **Text.** Default body color is `#2c2c2c` (rgb(44,44,44)) — slightly warmer than pure black. True black is reserved for strong headings. White text appears only on saturated-color or image backgrounds.
- **Primary accent.** A single saturated blue: `#274dea` (rgb(39,77,234)). Used for primary CTAs and link-style actions.
- **Borders / dividers.** Light neutrals (`#e1e1e1`-ish range), low contrast; the design relies on whitespace more than rules.

## Typography

One family handles the entire site:

- `Adobe Clean` (with `adobe-clean` web-font fallback, then Trebuchet MS, then sans-serif).

Display sizes are large; the type scale carries hierarchy because color does not. Weight contrast (regular for body, bold/black for headlines) does the rest. There is no second editorial face.

## Radius

- **16px** is the dominant card radius (cards, hero tiles, product tiles).
- **25px** is the button/pill radius (fully rounded CTAs).
- 4px and 50% appear occasionally for chips and dots.

## Shadow

Subtle, single-layer drop shadows: `rgba(0,0,0,0.2) 0 3px 3px 0` and similar. Used sparingly on cards and modal layers; the system is largely flat.

## Spacing

8px base grid. Section vertical rhythm is large (~96px desktop, ~64px tablet) — the home reads as a *catalog of products with whitespace between* rather than a continuous narrative.

## Components observed across sample pages

- **Mega-nav** with persistent product menu and search.
- **Hero marquee** — full-width image or video with overlaid title + CTA pair.
- **Product tile** — eyebrow, title, 1-line dek, "Explore products" link, frequently with icon and tile image.
- **Section header** — eyebrow + title + dek + optional CTA, repeated dozens of times per page.
- **Card grid** — variable column count by breakpoint; 16px radius is constant.
- **Sticky footer banner / CTA** — appears on product pages.
- **Footer** — multi-column site map, region picker, legal row.
