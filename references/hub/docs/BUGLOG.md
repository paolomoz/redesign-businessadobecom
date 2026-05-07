# Bug log

Running record of bugs hit in this repo, their root cause, and the fix shipped.
Goal: don't re-introduce the same bug twice. When you touch an area called out
here, skim the relevant entry before making changes.

Format: newest entries at the top. One heading per bug, in the form
`## [YYYY-MM-DD] Short symptom — area`.

---

## [2026-04-24] After D→M→D, cards 0 and 1 off-screen left — hub-track stuck with translateX(-594)

**Symptom.** After a full desktop → mobile → desktop drag cycle, hub cards
0 (Sales) and 1 (Marketing) were invisible during both the grid phase and
the settle; cards 2 (Legal) and 3 (HR) rendered correctly. Looked like
cards 0 and 1 had specifically-bad transforms.

**Root cause (confirmed via console instrumentation, not a guess this
time).** Every hub card was displaced −578 px from the vp x that
hero-grid.js's math intended. The math wasn't wrong — `HUB_X_OFFSET`
computed correctly for the current viewport. What was wrong was the
`.hhub-track` element's own transform: `translateX(-594px)`, where
hero-grid.js assumed it to be `translateX(HUB_X_OFFSET)` (≈ −16 at that
vw). Cards 2 and 3 happened to still land on screen after the −578 shift;
cards 0 and 1 ended up at vp x ≈ −779 and −448 — off the viewport's left
edge.

That stale `-594` on the track came from `hub-router.js`:
```js
function computeTranslate(activeIndex) {
  var vw = document.documentElement.clientWidth;
  var restSpan = 4 * 291 + 3 * 8;          // 1188
  if (activeIndex === null) {
    return (vw - restSpan) / 2;
  }
  …
}
```
`(0 - 1188) / 2` is exactly −594. So at some point during the D→M→D drag,
`hub-router.js`'s resize listener fired at a moment when
`document.documentElement.clientWidth === 0` — a transient the browser
exposes in the middle of a resize-drag across breakpoints — wrote
`translateX(-594px)` to the inline style, and that wrong transform
survived all the way through the rebuild because nothing downstream
re-wrote it.

**Fix.** Two edits, belt-and-suspenders:

1. `scripts/hero-grid.js` (primary fix): after computing `settleLeft`, the
   buildTimeline function now writes `.hhub-track`'s transform itself:
   ```js
   if (hubTrack) hubTrack.style.transform = 'translateX(' + settleLeft + 'px)';
   ```
   The track's rendered offset is now always in sync with the
   `HUB_X_OFFSET` used in the card math — not dependent on whether
   hub-router.js happened to have run with a sane `clientWidth`.

2. `scripts/hub-router.js` (defensive): `init()` now early-returns when
   `document.documentElement.clientWidth <= 0`, so it can't write a
   `-594` (or similarly broken) translate in the first place. The next
   real resize event fixes things up.

**Don't re-introduce this by.** Removing the explicit track-transform
write in buildTimeline and trusting hub-router.js alone to have set it
— that's what caused the bug. Treat hub-track's transform as owned by
whichever of the two scripts is currently responsible for hub-card
positioning. When desktop is building, desktop owns it.

**Meta-note on process.** I shipped two guessed fixes for this bug
before instrumenting (tightened `cleanupMobile`, switched `clearProps`
to `'all'`). Neither mattered — the actual cause was completely
different. Lesson: when the reproduction is sporadic and the visible
symptom doesn't point clearly at one subsystem, instrument first. The
console logs took 10 minutes to add and immediately surfaced the −578
per-card displacement that pinned the cause to the track transform.

**Related files.** `scripts/hero-grid.js`, `scripts/hub-router.js`.

---

## [2026-04-24] Hub cards flash in flex-flow over the hero headline on page load — hero-grid init

**Symptom.** Sporadic. On fresh load or refresh (with scroll at the top of
the page), the four hub cards appear briefly in a horizontal row at the
vertical centre of the hero, overlapping the "With great power comes great
productivity" headline, before `onUpdate` corrects them on the user's first
scroll. Scrolling down even a pixel removes the bad state permanently for
the session; subsequent hard-refreshes may or may not reproduce.

**Root cause.** Race between `buildTimeline()` and `ScrollTrigger.create()`.
The synchronous setup inside `buildTimeline()` correctly adds
`.hhub-card--flying` and writes the grid-position GSAP transforms on all
hub cards, then releases the `:not(.hhub-ready)` gate so the hub router
becomes visible. But `ScrollTrigger.create()` (called a few lines later)
kicks off an internal refresh that fires `onUpdate` with its computed
progress. On cold loads the pin-spacer's measured bounds, the Lenis
handshake, and pending font/image layout all finish in slightly different
orders across runs — and occasionally the very first `onUpdate` sees a
progress value briefly `>= SWAP_TIME` (0.9375). When that happens,
`settle()` fires: it clears the flying inline transforms on all four hub
cards via `gsap.set(bottomImages, { clearProps: 'all' })` and removes the
`.hhub-card--flying` class. Because the gate was already released, that's
what the browser paints — hub cards in their default flex-flow state
inside `.hhub-track`, centred in the hero and layered over the headline.
The moment the user scrolls, `onUpdate` fires again at the correct p=0,
`unsettle()` restores the flying state, and `onUpdate`'s loop rewrites
the grid-position transforms.

**Fix.** Inside `scripts/hero-grid.js`'s `buildTimeline()`:
1. Moved `hubRouter.classList.add('hhub-ready')` out of the synchronous
   setup block and down into a `requestAnimationFrame` that runs _after_
   `ScrollTrigger.create()`. That gives GSAP's ticker one frame to run
   and any transient `onUpdate` tick to settle before the router is
   allowed to paint.
2. Inside that rAF, _unconditionally_ replay the p=0 initial-state write
   before flipping the gate: flip `settled = false`, strip `is-settled`,
   reset `aria-hidden` / `pointer-events` to their flying defaults,
   re-add `.hhub-card--flying`, rewrite the grid-position transforms on
   every `bottomImages` entry with the same math as the sync block, and
   call `applyChromeReveal(0)`.

Made the repair unconditional rather than gated on a "did settle leak?"
check because there's a second race path — `settle()` followed by
`unsettle()` in the same init sequence — which leaves cards with
`--flying` back on but positioned at `targetX/Y` (carousel coords), also
overlapping the headline. A single-signal check wouldn't catch that; an
unconditional replay is idempotent in the happy path (writes the same
values that are already there) and covers every permutation. The
animation itself is untouched.

**Don't re-introduce this by.** Moving the `hhub-ready` add back into the
synchronous block, or by adding any new state writes _after_
`ScrollTrigger.create()` but _before_ the rAF gate release (those would
race against the same refresh tick). If a third script starts writing
classes/transforms on hub cards during init, funnel its work through
the same rAF so ordering stays deterministic.

**Related files.** `scripts/hero-grid.js`.

---

## [2026-04-24] Hub card positions garbled after crossing 768px breakpoint — hero-grid resize

**Symptom.** Dragging the browser window across the 768px desktop/mobile
breakpoint in either direction left the hub cards (Sales/Marketing/Legal/HR)
positioned incorrectly. Most visible going mobile → desktop: cards landed in a
flex-row at the vertical centre of the hero instead of at their flying-grid
positions, then re-positioned oddly on subsequent scroll.

**Root cause.** Two scripts (`scripts/hero-grid.js` desktop,
`scripts/hero-grid-mobile.js` mobile) each registered an independent
`resize` listener with a 200ms debounce. Both callbacks fired on every
cross-breakpoint resize, in script-tag registration order (desktop first,
mobile second). Each callback did _both_ its own cleanup _and_ its own build
in one block, so on M→D the desktop build fired first (installing
`.hhub-card--flying` + inline GSAP transforms on all four hub cards), and
then the mobile callback fired second and ran `cleanupMobile()` which
wiped the class and the inline styles desktop had just written. The hub
cards fell back to flex-flow inside `.hhub-track`; subsequent scroll
`onUpdate` ticks layered new `x/y` transforms on top of that flex layout,
which looked "completely messed up."

A secondary contributor was `scripts/hub-router.js`: it early-returned on
mobile (`if (window.innerWidth < 768) return;`), so its resize listener was
only registered when the page initially loaded on desktop. That meant
(a) if the page loaded on mobile then dragged to desktop, `.hhub-track`
never got the inline `translateX` transform that `hero-grid.js`'s flying-card
math depends on (hub-track is meant to be the containing block for the
absolutely-positioned flying hub cards, and only a transform makes it so),
and (b) if the page loaded on desktop then dragged to mobile, the inline
desktop-shaped `translateX` persisted and overrode mobile's
`transform: none`.

There was also a third minor issue: mobile's scroll listeners (registered
via `ensureScrollListeners` and kept around by design) called `updateGates`
after M→D and would invoke mobile's `settle()` / `unsettle()` on desktop,
further corrupting desktop's hub-card state.

**Fix.** `scripts/hero-grid-mobile.js`: pared `cleanupMobile()` down to
state mobile owns (its own ScrollTrigger, the settle rAF, `mobile-ready`
pin-spacer classes, `mobileGrid.style.top`, and chrome tweens) — removed
the `.hhub-card--flying` class removal, the `clearProps` on hub cards,
chrome clipPaths, and hub-router `is-settled`/`opacity`. Desktop's
`buildTimeline()` already re-initialises all of that at its own top, so
clobbering it here is pure interference. Also early-returned
`updateGates` on `innerWidth >= 768`.

`scripts/hub-router.js`: removed the top-level mobile early-return; moved
the breakpoint gate into `init()` so on mobile it now clears any stale
inline transform (and active state) so mobile CSS's `transform: none`
applies. Added `innerWidth < 768` guards to `activate` and `resetTrack`
so hover events from touch-capable devices can't fire the desktop
translate.

**Don't re-introduce this by.** Having _either_ hero-grid script touch
state the other owns. Treat the two scripts as co-tenants of the same
DOM: each one is only allowed to clear what it created. The resize
callbacks fire in registration order and there's no coordination
between them, so asymmetric cleanup is the only way to avoid ordering
races without adding an orchestrator. If this grows a third variant
(e.g. a tablet layout), switch to a single-orchestrator model instead
of adding a fourth listener.

**Related files.** `scripts/hero-grid.js`, `scripts/hero-grid-mobile.js`,
`scripts/hub-router.js`, `styles/hero-hub-router.css`.

---
