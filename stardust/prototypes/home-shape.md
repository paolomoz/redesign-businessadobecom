<!--
_provenance:
  writtenBy: stardust:prototype
  writtenAt: 2026-05-07
  inputs:
    - stardust/current/pages/home.json
    - stardust/direction.md
    - DESIGN.md
    - DESIGN.json
    - stardust/prototypes/home-improvements.md
    - references/hub/index.html
    - references/hub/styles/*.css
  stardustVersion: 0.3.0
-->

# Home — page shape brief

The redesign of `business.adobe.com/` rendered against the design team's reference visual system. Composition is editorial-led: type at 80–96px does the IA work, scroll position drives layout, every cluster of products gets one section header.

## Section sequence

1. **`global-nav`** — persistent mega-nav with Adobe logo, product menu, segments menu, learn, support, contact-sales, sign-in. White pill-on-scroll behavior from `references/hub/styles/nav.css`.
2. **`announcement-marquee`** — narrow band at the very top: *"Adobe completes the acquisition of Semrush. → Read the announcement"*. Single line, charcoal text, no card. (Source: `pages/home.json#outline[0]`.)
3. **`hero-mosaic`** — scroll-pinned hero (`hero-pin-spacer` with 220–240vh of scroll distance). White ground, 32px rounded bottom corners. Center copy block with eyebrow ("Adobe for Business"), Super-scale headline, body lead, primary + secondary CTA. Behind/around the copy: 5-column mosaic of 15 image cards that converge from spread to tight on scroll. Mosaic cards reuse the product-mnemonic SVGs and product-tile images from `references/bizpro-hub/assets/product-tile-images/`.
4. **`portfolio-anchor`** — Title-1 section opener: *"Explore all Adobe for Business products."* Plus a domain-tab strip (AI & agents · Content & workflows · Creativity & design · Data & analytics · Campaigns · Documents). Visual anchor for the long portfolio scroll.
5. **`domain-cluster`** ×6 — repeating block, one per portfolio domain. Each cluster:
   - Section header: eyebrow ("Domain 01"), Title-2 headline (the domain headline), Body-Large dek.
   - Product card grid: 4 cards in a 4-up at desktop, 2-up at tablet, stacked on mobile. Each card: 16px radius, square mnemonic icon, product name (Title-4), 1-line dek (Body-Medium), arrow-link.
   - End-of-cluster text link: *"See all <domain> products →"*.

   Domains and their products:
   - **AI & agents** — Experience Platform Agent Orchestrator · LLM Optimizer · Brand Concierge · All other agents.
   - **Content & workflows** — GenStudio · AEM Sites · AEM Assets · Adobe Commerce · Workfront.
   - **Creativity & design** — Creative Cloud Pro · Express · Firefly · Frame.io.
   - **Data & analytics** — Adobe Analytics · Customer Journey Analytics · Real-Time CDP · Mix Modeler.
   - **Campaigns** — Journey Optimizer · Journey Optimizer B2B Edition · Marketo Engage.
   - **Documents** — Acrobat Studio · Acrobat Sign.
6. **`solutions-band`** — full-bleed editorial section with `--background-subtle` (#f8f8f8) ground; tucks behind hero's rounded bottom on scroll-up. Two cards: large left (892×892, image with overlay copy) and shorter right (492-wide, image card + copy below). Copy: *"Personalization at scale."* / *"Unified customer experience."* / *"Content supply chain."* / etc. (one card per solution; this is the editorial-card pattern from `references/hub/styles/editorial.css`.)
7. **`customer-marquee`** — Title-2 headline *"Adobe is transforming the world's biggest brands."* + 6-up logo strip (Coca-Cola, Qualcomm, Premier League, Prudential, Cisco, Home Depot — from `pages/home.json#outline`). Each logo links to its case study.
8. **`closing-cta`** — Title-2 headline *"Let's talk about what Adobe for Business can do for you."* + Body-Large dek + primary CTA *Get started* + secondary text-link *Talk to sales*.
9. **`global-footer`** — multi-column site map (Products · Solutions · Industries · Resources · Company), region/language picker, legal row.

## Layout strategy per section

| Section | Composition | Span | Notes |
|---|---|---|---|
| announcement-marquee | inline single-line band | 12-col, 56px tall | Tappable, no border |
| hero-mosaic | center-stacked copy block + 5-col mosaic overlay | full bleed, 100vh, 220vh pin | 32px bottom radius |
| portfolio-anchor | left-anchored 8-col header + 4-col tab strip on the right (desktop); stacked on mobile | 12-col grid | Title-1 size |
| domain-cluster | 4-col header + 12-col card grid below | 12-col grid | 96px section-y |
| solutions-band | 8-col left card (892×892) + 4-col right card stack | 12-col grid | Editorial parallax |
| customer-marquee | centered Title-2 + 6-col logo grid | 12-col grid, 12-up logos | logos in a single row at desktop |
| closing-cta | center-stacked Title-2 + dek + CTAs | 8-col centered | 96px section-y, white ground |

## Key states

- **Nav scroll state.** Above 40px scroll: nav links transparent on top of hero; below: white pill with charcoal text. Use IntersectionObserver fallback to scroll listener.
- **Hero mosaic scroll state.** Three phases driven by scroll progress: (a) spread (cards offset per Figma 7379:8963 geometry), (b) tight (8px gap, headline visible), (c) collapse (mosaic translates -62vh, headline fades).
- **Domain tab strip.** Click scrolls to the matching `domain-cluster` with smooth-scroll via Lenis.
- **Reduced motion.** All scroll-driven motion off; mosaic renders in tight state; sections appear at full opacity.

## Interaction model

- Single primary CTA across the page is *Get started* (canonical contact-sales verb). Secondary action is *Talk to sales* (text link) or *Read the announcement* (eyebrow band).
- Each product card is an `<a>` to the product page; full card is the hit target.
- Mega-nav opens on hover (desktop) / tap (mobile). Mobile uses a full-screen overlay.

## Structural data attributes

Every section gets:

- `data-section="<name>"` (announcement-marquee, hero-mosaic, portfolio-anchor, domain-cluster, solutions-band, customer-marquee, closing-cta, global-footer)
- `data-purpose="<purpose>"` (announce | hero | nav-anchor | product-cluster | solutions | proof | conversion | sitemap)
- `data-domain="<id>"` on each `domain-cluster` (ai · content · creativity · data · campaigns · documents)

## Unsourced content

This prototype renders against captured copy from `pages/home.json`, the reference assets in `references/hub/assets/` and `references/bizpro-hub/assets/`. There is **no fabricated content** — every product name, headline, CTA label, and announcement is sourced from the captured page or the references.

Items that are *deferred* (not fabricated, but not deeply specified):

1. The 1-line product deks per card. Captured outline gives product names but not deks; we're using the deks present in the reference mega-nav (`references/hub/index.html` mnav-card-desc strings) since the references encode the design team's chosen copy.
2. Customer logos. Names are from `pages/home.json#outline`; the rendered logos are typographic placeholders (text in the brand mark) until we wire actual SVGs. Marked with `[data-placeholder="logo"]` and listed in `_provenance.unsourcedContent`.
3. Product tile images on the mosaic. We're reusing `references/bizpro-hub/assets/product-tile-images/grid_*_desktop.png` (which the design team has already placed in the references). Paths preserved for migrate.

## Open questions for iteration

- Should the announcement marquee absorb the Summit 2026 second-marquee, or stay single-purpose?
- Domain order: does the design team want AI first or Creativity first? Currently AI first (matches captured outline order).
- Number of products per cluster: capped at 4 to stay editorial; the captured site lists 5–7 per cluster. Trim or paginate?
