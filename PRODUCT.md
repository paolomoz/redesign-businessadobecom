---
name: Adobe for Business
url: https://business.adobe.com
register: brand
mode: brand-faithful (Mode A — references encode the design team's chosen direction)
_provenance:
  writtenBy: stardust:direct
  writtenAt: 2026-05-07
  inputs:
    - stardust/current/PRODUCT.md
    - references/hub/HANDOFF.md
    - references/hub/styles/global/typography.css
    - references/bizpro-hub/bizpro-hub.html
---

# Adobe for Business

## Register

**Brand.** Marketing site for Adobe's enterprise portfolio — Experience Cloud, Creative Cloud for business, Document Cloud, GenStudio, Firefly, Marketo, Workfront, Analytics. The site does not host product UI; it converts attention into qualified pipeline (demo / contact-sales) and trains the market on what each Adobe product does.

## Users

Three concurrent enterprise audiences. The site routes between them rather than choosing one:

- **Marketing leaders** — CMO and direct reports, looking for analytics, journey orchestration, marketing automation, customer-data infrastructure.
- **Creative leaders** — VP Creative / Brand / Content, looking for production at scale, generative AI, asset management, brand consistency tooling.
- **Document and ops leaders** — looking for Acrobat at scale, signature workflows, PDF APIs, business document infrastructure.

Each audience can land on any page; the home is a portfolio index more than a persona funnel.

## Product purpose

Communicate Adobe's enterprise portfolio breadth, demonstrate AI leadership, and route prospects to product detail / contact-sales. The home leads with announcements (acquisitions, Summit, AI launches) because the buyer wants to know what's new before committing time to product detail.

## Brand personality

Derived from the references (`references/hub` and `references/bizpro-hub`):

- **Editorial.** Type does the heavy lifting — display sizes are huge (96/80/56/48), set in Adobe Clean Display Black. The page reads like a printed editorial spread, not a SaaS landing page.
- **Cinematic.** Scroll-driven motion is foundational, not decorative — mosaic hero converges, cards reveal in clip-path rings, sections parallax behind a hero with rounded bottom corners. Lenis smooth-scroll + GSAP scroll-timelines are part of the brand.
- **Quiet.** White ground, charcoal text, one saturated blue. Color is rare and deliberate. Adobe Red is the logo, not a palette member.
- **Authoritative.** Confident declarations, never breathless ("Unleash creativity at scale", "There's more to Acrobat than Acrobat"). No exclamation points. No "Get started" / "Sign up free" consumer language.
- **AI-forward, but specific.** Mentions of AI are tied to a named product or a named outcome. AI is never a generic flourish.

## Anti-references

- Not consumer Adobe (adobe.com proper). No free trials front-and-center, no "creators" framing, no Try-It-Now-style modals.
- Not a generic 2019 SaaS landing template. No centered-hero + double-CTA-pair silhouette; no isometric illustration; no purple gradient.
- Not Salesforce / HubSpot density. No 30-page navigation panels, no "see the platform" diagrams, no logo-cloud-of-everyone treadmill.
- Not pure brutalism / editorial-cosplay. The references are editorial in scale but disciplined — no hand-drawn marks, no Riso, no zine register.
- Not Figma-style "tiny + dense + clever." Adobe is at a scale where the home page must communicate at 96pt, not 14pt.

## Design principles

1. **Type leads.** Display type at 80–96px sets hierarchy. Color and ornament come second. If a section needs ornament to be legible, the type is wrong.
2. **Whitespace is the grid.** Sections breathe. The 12-column grid centers within an 8.333% margin, capped at 1920px. Density is *balanced*, not packed.
3. **Motion is structural.** Scroll position drives layout, not just opacity. The hero mosaic converges, cards ring-reveal, the editorial section parallaxes behind a 32px-rounded hero. Motion is a feature, not a polish layer.
4. **Image is editorial.** Photography fills cards full-bleed; product mnemonics earn their own tiles; image is never a stock-photo afterthought.
5. **One voice across products.** Every product page inherits the same hero shape, the same type rhythm, the same card primitive — the portfolio reads as one system, not 30 microsites.

## Accessibility & inclusion

- Type ratio ≥ 1.25 between adjacent scale steps; body ≥ 16px on desktop, 16px floor on mobile.
- Color contrast: charcoal text (`#2c2c2c` or `#131313`) on white passes AA at 12px+. Primary blue `#3b63fb` on white passes AA. White text only on saturated-blue or photographic surfaces with a contrast scrim.
- Motion: respects `prefers-reduced-motion`. The reference's reveal-tuner cuts scroll-driven motion when the system preference is set.
- Mega-nav and mobile-nav are keyboard-navigable; focus rings are inherited from the global reset.
