<!--
_provenance:
  writtenBy: stardust:direct
  writtenAt: 2026-05-07
  readArtifacts:
    - stardust/current/_brand-extraction.json
    - stardust/current/pages/home.json
    - references/hub/HANDOFF.md
    - references/hub/styles/global/typography.css
  stardustVersion: 0.3.0
  mode: brand-faithful + reference-driven (variant A brief)
-->

# Improvements — home

The variant A brief for the Adobe for Business homepage redesign. Five specific gaps between the captured site and the design team's reference target.

1. **[dated-pattern]** The current home leans on a small "Adobe completes the acquisition of Semrush" announcement card at the top, with the rest of the page being a flat catalog of "Explore products" sections (`pages/home.json#outline` — 6 of the first 12 H3s are literally "Explore products."). The references replace the catalog silhouette with a scroll-pinned editorial hero (mosaic image grid converging from spread to tight) plus parallax editorial sections. *Fix:* render the homepage as `hero-mosaic` → `editorial-band` → `product-portfolio-grid` → `ai-at-adobe` → `customer-stories` → `cta-band`, replacing the announcement-card-on-top + flat-catalog silhouette.

2. **[ia-clutter]** Six adjacent "Explore products" links at the same visual weight fragment intent. Each section ("AI-powered content management", "Unleash creativity at scale", "Data and insights for a competitive edge", "Advanced marketing automation", "Accelerated document workflows") has its own product cluster but the navigation between clusters is identical, flattening the hierarchy. *Fix:* lift the 5 portfolio domains into one type-led section header per cluster (Title-2, 56px), drop the "Explore products" treadmill, and let each cluster end with one canonical "See all <domain> products →" text link, not a button.

3. **[type-floor]** Current home headlines are Title-3-equivalent (~32–40px on desktop). Reference target is Super/Title-1 (96/80px) for marquee and Title-2 (56px) for cluster heads. The current type stack reads as SaaS-default; the reference type stack reads as editorial. *Fix:* enforce the reference type scale (Super 96 for marquee, Title-1 80 for editorial bands, Title-2 56 for cluster headers, Title-3 48 for product-tile titles, Body-Large 20 for deks).

4. **[motion-absence]** Current home is essentially static below the announcement marquee — sections appear at full opacity, no scroll-driven layout, no reveal sequence (`pages/home.json#sections` shows ~20 stacked sections with uniform render). The references treat scroll position as a layout dimension (mosaic converges, cards ring-reveal, editorial parallaxes behind a 32px-rounded hero). *Fix:* implement Lenis smooth-scroll + GSAP ScrollTrigger; apply hero-mosaic-converge, ring-reveal on first hero load, text-animate on every subsequent section header, and editorial-parallax behind the hero's rounded bottom.

5. **[image-treatment]** Captured product mnemonics and tile images (`B_app_*.svg` + `grid_*_desktop.png`) are present in the source but render as small, often-cropped icons inside text-dense cards. The references treat product imagery as full-bleed editorial — square `aspect-ratio: 1` mosaic cards on the hero, full-bleed `ed-card--left` 892×892 squares with overlaid copy in the editorial section. *Fix:* in the redesign, every hero mosaic card and every domain-cluster lead card is image-first with a 16px radius and full-bleed photography or product mnemonic; copy overlays the image with a contrast scrim only when needed.
