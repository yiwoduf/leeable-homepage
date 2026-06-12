# Gotchas — bug postmortems & invariants

Hard-won lessons from real bugs shipped and fixed in this codebase. Each entry: symptom →
root cause → the fix that lives in the code today. Read this before debugging anything that
"only happens on iPad" or "only happens in one language".

---

## 1. Grid/flex children shrink-wrapping to text width (per-language layout drift)

**Symptom:** the hero rendered ~12% smaller in Korean than English; `.hero-inner` measured
1048px (EN) / 909px (KO) instead of the intended 1180px.

**Cause:** a grid/flex container with an implicit `auto` track makes a child's `width: 100%`
*cyclic* — it resolves as `fit-content`, so the box shrink-wraps to the **text's max-content
width**, which differs per language. `margin: 0 auto` on the child also opts it out of stretch.

**Fix (invariant):** sections and the hero use `display: grid; grid-template-columns: 100%` —
a *definite* track. Never center full-width content with an auto-track grid or flex-column +
auto margins. (`src/styles/layout.css` `.section`, `hero.css` `.hero`)

## 2. iOS text autosizing inflating card text (uniform card growth/clipping)

**Symptom:** project cards uniformly grew tall after returning from an external tab, clipped
after rotation — looked like a layout bug, was actually font inflation.

**Fix:** `html { -webkit-text-size-adjust: 100%; text-size-adjust: 100% }` in `base.css`.
Never remove it.

## 3. WebKit stale grid row tracks after rotation / tab return

**Symptom:** iPad: grid rows kept heights from the *previous* layout — cards stretched to huge
old tracks (tags pinned at the bottom of an empty box) or clipped by shorter old ones. Spec-wise
impossible for auto rows ⇒ engine bug.

**Fix:** `useStaleTrackKick` in `ProjectsSection.tsx` — on `pageshow` / `visibilitychange(visible)` /
container width change, force the grid through `display:none` + layout flush + restore within one
task (no paint in between, so no flash). Touch-only. Also: never *mutate* a grid's children while
the tab is hidden — the skeleton fillers are static DOM gated by CSS breakpoints for exactly this
reason (a measured JS filler count corrupted WebKit's restore).

## 4. clip-path × IntersectionObserver = reveal oscillation

**Symptom:** the experience timeline line never drew when arriving from below via nav — polling
showed `data-revealed` flipping true/false every ~100ms forever.

**Cause:** IO judges intersection by **clipped visible area**. The line hid via
`clip-path: inset(100% 0 0 0)` (bottom-up draw), so the first revealed sliver was below the fold
→ IO reported not-intersecting → reveal system un-revealed it → loop. The observer was watching
the animation it caused.

**Fix (pattern):** split sensor from drawing. Outer `.tl-line` = unclipped reveal sensor (what
IO and the band check measure); inner `.tl-line-draw` = the clip-path animation. Apply the same
split to any future clip/scale entrance on an observed element.

Related: a `scaleY(0)` element collapses its bounding rect onto the transform-origin — rect-based
visibility checks then measure a single point (possibly offscreen). Prefer clip-path on an inner
node over transform-scale for draw-in effects.

## 5. CSS specificity trap with `:root[data-...]` state selectors

`:root[data-scrolldir="up"] .x.reveal` (0-4-1) outranks `.x.reveal[data-revealed]` (0-3-1).
Direction-dependent *hidden* states must be scoped with `:not([data-revealed])` so the revealed
rule always wins. (`sections.css` timeline rules)

## 6. iOS `vh` is unstable; `svh` is not

`100vh` re-resolves when Safari's chrome changes (tab return, rotation) — under min-height
containers that churn corrupted layout. All section sizing uses `svh` with a `vh` fallback line
above it (older engines drop the svh declaration). Keep the double declaration when editing.

## 7. Scroll host abstraction (window vs fixed `<main>`)

Touch devices scroll a `position: fixed; inset: 0` `<main>` container (browser bar never moves,
geometry exact); desktop scrolls the window. **Always** use `src/lib/scroller.ts`
(`scrollerY/scrollerTo/onScrollerScroll/scrollerViewHeight`) — direct `window.scrollY` reads are
a desktop-only bug waiting to happen. Resize handling differs by host on purpose:
window `resize` on desktop, ResizeObserver on the container on touch (URL-bar resizes can't fire
it; zero-size passes from hidden tabs are ignored).

## 8. Vercel Functions are ESM at runtime

Relative imports inside `api/` need explicit `.js` extensions (`./_lib/simon.js`).
`tsc` passes without them; the deployed function dies with `ERR_MODULE_NOT_FOUND`.

## 9. Simple Icons CDN quirks (skill marquee)

- The CDN's SVGs often carry **no fill attribute** (SVG default = black): recoloring must set
  `fill` on the **root** `<svg>` (`useSkillIcons` ADAPT set), not just query `[fill]` descendants.
- Monochrome black marks (`nextdotjs`, `vercel`, `opencode`) are in the ADAPT set → recolored to
  `currentColor` for dark mode. Colored brand marks are left alone.
- Missing/trademarked marks (Java cup, OpenClaw, Codex) are inline `currentColor` SVGs in
  `customSkillIcons.tsx` — no fetch.
- Safari may return the *specified* `repeat(auto-fit, …)` text for computed
  `grid-template-columns` — never parse that string to count columns; measure geometry
  (children sharing the first row's `offsetTop`) if you ever need a column count.

## 10. React-owned className vs external state

The reveal system writes the `data-revealed` **attribute**, never a class: React rewrites
`className` on re-render (e.g. a solution card toggling `open`) and would wipe externally-added
classes. Same rule applies to any future externally-toggled visual state.

## 11. Scroll-position React state is a render storm

Continuous scroll values must not live in React state — the nav progress bar reads the
`--nav-progress` CSS variable written rAF-coalesced by `useScrollSpy`. `setActive` fires only on
actual section change. Keep it that way; a per-pixel `setState` re-rendered the whole app every
frame on phones.

## 12. Trackpad momentum tail vs gesture boundaries (edge freeze → ghost pulls)

**Symptom v1:** trackpad only — swipe from mid-section to the content edge, swipe again:
nothing moves until ~1s of stillness ("wiggling the mouse" fixed it — it just made you pause).
**Symptom v2 (after a timing-rule fix for v1):** a hard swipe stops cleanly at the edge, then a
beat later the page tugs itself a few px and the pull indicator flashes on and off.

**Cause:** a trackpad keeps emitting decaying momentum-tail deltas for up to ~1s after the
fingers lift, so `GESTURE_GAP` (80ms of true silence) never elapses between two quick swipes —
the second swipe was judged part of the first, still-closed gesture (v1). And near its end a
tail goes sparse and tiny (1–3px, 30–90ms apart) — **indistinguishable per event** from a
gentle new touch — so a "40ms void = new touch" timing rule misread those remnants, re-opened
the gesture, and let them start a pull that the spring then snapped back (v2).

**Fix (two principles, `useSectionSnap.ts` — no per-quirk timing rules):**

1. **Stream physics.** Momentum only ever decays. `TAIL_DECAY_MIN` consecutive strictly-
   decreasing deltas confirm a tail; the first clear RISE inside a confirmed tail is physically
   a new finger → treated as a fully fresh gesture (re-arms edge pulls; catches pause-free
   flick-flick rhythm scrolling). Gap timing uses `e.timeStamp` (creation time) so delivery
   hitches can't fake a pause.
2. **Input slop.** A wheel pull from rest engages only after `PULL_SLOP` (12px) of accumulated
   travel — below it nothing moves and no indicator shows. Whatever the classifier can't decide
   per-event (sparse remnants, zero-delta-faked pauses, accidental brushes) dies in the slop
   instead of ghost-tugging a parked page. A pull already visibly in progress resumes freely.

**Invariant:** no single wheel event carries enough information to be classified as intent —
only streams do. If a new input quirk appears, extend one of the two principles; do not add
another timing threshold.

## 13. Headless-Chrome verification recipes (used throughout this repo's history)

- Screenshot: `chrome --headless=new --screenshot=out.png --window-size=1440,900
  --virtual-time-budget=10000 <url>` (virtual time breaks rAF glides — use `--timeout=<ms>` plus
  an image pointing at a non-routable IP to hold the `load` event when real time matters).
- Locale: `--accept-lang=ko-KR --lang=ko-KR` flips the i18n autodetect.
- DOM assertions: `--dump-dom | grep` — note CSS/`<style>` text is included, so grep for
  `class="…"` markup, not bare class names.
