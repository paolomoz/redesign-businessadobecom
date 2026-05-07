# Direction — Adobe for Business redesign

_Resolved 2026-05-07. Mode A (brand-faithful) + reference-driven token override._

## Phrase

> "Redesign business.adobe.com based on the new design that our design team is working on. For now we have the 2 examples in the zip files in this folder."

## Restatement (dimensional vocabulary)

The user is migrating an existing brand site to a new visual system that **already exists** in two reference prototypes (`references/hub`, `references/bizpro-hub`). Direction is not being invented — it is being transcribed from the references. Strategy (audience, register, IA, voice) inherits from the captured current state. Visual system (palette, type scale, radii, motion, components) inherits from the references.

## Movements (vs current)

| Axis | From | To | Source |
|---|---|---|---|
| Decade | 2018–2022 SaaS-template | 2025-now editorial-screen | references/hub |
| Craft | flat-screen | editorial-screen + scroll-driven motion | references/hub motion stack (Lenis + GSAP) |
| Distinctiveness | familiar (Adobe-default) | distinctive (own type scale + signature hero shape) | typography.css + hero.css |
| Expressive axis | restrained | committed | type sizes 96/80/56 vs current ~32–40 |
| Tone | authoritative | authoritative + editorial | retains voice register; raises type register |
| Density | balanced (bordering packed) | balanced with airy hero | section-y 96px desktop |
| Audience | (unchanged — three enterprise tracks) | (unchanged) | current/PRODUCT.md |
| Register | brand (unchanged) | brand (unchanged) | current/PRODUCT.md |
| Color energy | (low — single blue + neutrals) | (low — same single blue + neutrals) | references retain the color discipline |

## Mode classification

**Mode A — brand-faithful — active.** Captured signal is `signal-strong` (palette has multiple distinct colors, named heading family, full type scale). The references encode the design team's *visual* direction; the user has explicitly told the agent not to invent a new direction. This is brand-faithful migration with the *target* token system supplied by the user (rather than rolled by the divergence toolkit).

**Mode B — anchor references — partially active.** The two zip files act as anchor references for the visual system, deterministically pinning:
- `decade` → 2025-now
- `craft` → editorial-screen with scroll-driven motion
- `font_deck` → Adobe Clean Display + Adobe Clean (with full Spectrum 2 weight ramp)
- `palette` → Spectrum 2 ground/content/primary tokens

**Mode C — ground-family override — active.** Both references use stark-white (`#ffffff`) ground, matching the captured brand. No override needed — Mode A and Mode C agree.

## Divergence inputs

| Dimension | Value | Picked by |
|---|---|---|
| decade | 2025-now | anchor-reference: references/hub |
| craft | editorial-screen | anchor-reference: references/hub |
| register | brand | inherited from current/PRODUCT.md |
| ground-family | stark-white | anchor-reference + brand-faithful match |
| font deck | Adobe Clean Display + Adobe Clean | user-constraint (references) |
| palette | Spectrum 2 tokens | user-constraint (references/bizpro-hub) |

The seed roll is **fully pinned** by the references. No dimension is rolled; every dimension is a transcription of an artifact the user supplied.

## Anti-toolbox audit (passes)

- No glassmorphism (refs use opaque pill nav, not frosted glass).
- No purple-blue gradient CTAs (refs use solid `#3b63fb`).
- No isometric hero illustration (refs use photographic mosaic).
- No centered hero + double-CTA-pair silhouette (refs use scroll-driven mosaic + single hero CTA pair, not the SaaS template).
- No gradient text (refs use solid charcoal display type).
- No editorial-register vocabulary on a non-editorial brand (Adobe is editorial-adjacent at this scale; the move is permitted).

No anti-toolbox hits required removal.

## Resolved direction (one paragraph)

Editorial, cinematic, type-led. White ground, near-black display type at 80–96px set in Adobe Clean Display Black, one saturated Spectrum 2 blue (`#3b63fb`) for actions, no other UI color. Cards round at 16px, the hero rounds at 32px on the bottom only (signature motif). Scroll position drives layout — the hero mosaic converges from spread to tight, cards reveal in clip-path rings, the editorial section parallaxes behind the hero. Lenis smooth-scroll + GSAP ScrollTrigger are part of the brand. The IA preserves the current site's portfolio-index spine, announcement marquee, and AI narrative; the visual system replaces the SaaS-template silhouette with editorial composition.

## Variant plan

Single variant for now. The user asked for a homepage prototype to react to before deciding whether to fork into A/B/C. Variant A is the only build; if the user wants exploration, we'll spawn B/C in a follow-up `direct` call.

## Improvements brief

`stardust/prototypes/home-improvements.md` — 5 specific gaps the variant A render must close.

## Next

`/stardust:prototype home` — build the home page side-by-side prototype and iterate via the impeccable craft loop.
