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
**Symptom v2 (after a timing-rule fix):** a hard swipe stops at the edge, then a beat later the
page tugs itself a few px and the pull indicator flashes. **Symptom v3 (after a delta-rise
fix):** a VERY hard swipe stops at the edge, then advances to the next section by itself.

**Causes, in order discovered:**
- A trackpad keeps emitting decaying momentum-tail deltas for up to ~1s after the fingers
  lift, so `GESTURE_GAP` (80ms of true silence) never elapses between two quick swipes (v1).
- Near its end a tail goes sparse and tiny — indistinguishable *per event* from a gentle new
  touch — so a "40ms void = new touch" timing rule misread remnants and let them pull (v2).
- The browser **coalesces wheel events under load** (reveals + glide rAF jank during a hard
  scroll): two tail events merge into one with ~double the delta, so a *per-event delta* rise
  detector saw "momentum rising = new finger" mid-tail, re-opened the closed gesture, and the
  still-strong tail blew through the 12px slop and the 26% commit → self-advance (v3).

**The architecture that finally held** (after a full custom-model rewrite regressed mouse +
arrival flows and was reverted): restore the wheel pager to its known-good baseline — where
mouse and touch were flawless — and add a SURGICAL, additive-only patch that gates exactly two
trackpad decisions. The patch is the industry method (d4nyll/lethargy, as used by fullPage.js):
classify each wheel event deliberate-vs-momentum by comparing the newest slice of scroll
against the one before it — momentum only ever decays. Modernized three ways, each pinned to a
simulated failure:

- **Mass windows, exactly attributed.** The slices are TIME windows (`INTENT_WIN` 100ms) of
  |deltaY| mass, with each event's mass spread across its creation-time span — the browser
  merges wheel events under load, and merging conserves delta sums, so exact attribution keeps
  the ratio truthful where per-event sizes/timings lie. `e.timeStamp` clock (delivery hitches
  can't distort the windows).
- **Device mode.** A direction whose retained history (`INTENT_RETAIN` 600ms) is all-sparse
  (every gap ≥40ms) is a notch device: momentum physically requires dense streams, so sparse
  streams are always deliberate. This keeps EVERY mouse flow bit-identical to the baseline —
  asserted in simulation.
- **Session awareness.** An empty older-window means "input after real quiet" only when there
  is NO session history at all; with dense history on record it is a delivery hole or a tail's
  death-gap — momentum.

The two gated decisions (everything else is the untouched baseline):

1. **Releasing a closed edge-lock** (the STUCK fix): a >`GESTURE_GAP` hole releases
   `gestureClosed` only after TRUE silence (`TRUE_GAP` 240ms — beyond any delivery hole), once
   momentum was actually seen (`tailSeen`: an event classified momentum, or `TAIL_DECAY_MIN`
   velocity decreases — fingers provably lifted), or on a sparse-only stream. Deliberate input
   after seen-momentum also re-arms directly (flick-flick, no silence needed). A single swipe
   that merely accelerates never sees momentum → it can never roll through the edge it hit.
2. **Opening a pull from a parked edge** (the SKIP/ghost fix): takes a notch device, a finger
   ramp (`RISE_MIN`=3 consecutive ≥`RISE_PX` velocity rises — reliable even in the window-
   ratio's ~240ms blind spot around the closing swipe's peak, and merging can fake at most 2),
   or two deliberate events once past that blind spot (`closedAt` + `TRUE_GAP`). A pull
   already in progress flows exactly as baseline.

**Verification harness: `scripts/sim-wheel.mjs`** — mirrors the decision flow exactly, FIRST
proves it reproduces both baseline bugs (stuck re-flick, post-glide tail re-commit), then
asserts: the patch fixes both; 4,000 adversarial runs (latest-stamp merging, 7–12-event
freezes, violent+medium flicks, normal+floaty tails, tall + fitting-section arrivals) open
zero pulls and zero commits; four mouse flows are BIT-IDENTICAL patched-vs-baseline; and seven
legit trackpad gestures all engage. Run it after ANY change to the wheel path. (Earliest-stamp
merging — which no real browser does — can still defeat ramp detection in theory; reported by
the sim, not asserted.) On a real device, `?wheellog` dumps per-event classification.

Adversarial review caught two mouse regressions pre-ship (both now sim cases): the
deliberate-pair `gestureUsed` release must be `!streamSparse`-guarded or one sustained mouse
spin advances several sections, and after trackpad use the dense history makes the first
PIXEL-mode mouse notch read non-sparse — that single notch is swallowed (bounded, documented
cost: the second notch always pulls; `deltaMode !== 0` devices bypass entirely; a full notchy
bypass would let strong merged tail events open ghost pulls).

**Invariants:** (1) the baseline gesture model is correct for mouse/touch — never restructure
it for a trackpad symptom; gate, don't rewrite. (2) No single wheel event carries enough
information to be classified — only streams do. (3) New quirk? Reproduce it in sim-wheel.mjs
first, then adjust the classifier; never add another bare timing threshold.

## 13. Headless-Chrome verification recipes (used throughout this repo's history)

- Screenshot: `chrome --headless=new --screenshot=out.png --window-size=1440,900
  --virtual-time-budget=10000 <url>` (virtual time breaks rAF glides — use `--timeout=<ms>` plus
  an image pointing at a non-routable IP to hold the `load` event when real time matters).
- Locale: `--accept-lang=ko-KR --lang=ko-KR` flips the i18n autodetect.
- DOM assertions: `--dump-dom | grep` — note CSS/`<style>` text is included, so grep for
  `class="…"` markup, not bare class names.
