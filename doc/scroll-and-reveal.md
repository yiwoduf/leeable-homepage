# Scroll & reveal system

This is the most intricate part of the app and the most-iterated. Read this
before touching `useSectionSnap`, `useReveal`, `scrollController`, or the
`.reveal` / scroll-hint CSS. **Verify changes empirically** (headless wheel/touch
bursts) — the behavior is full of timing edge cases.

> **One pager, two hosts.** The SAME JS engine drives wheel (desktop) and
> touch (mobile); all scroll I/O goes through `lib/scroller.ts`, which
> resolves to the window on desktop and to a fixed, viewport-sized `<main>`
> container on coarse pointers (`base.css`). The container keeps the browser
> bar frozen so geometry never drifts, and the document itself never scrolls
> on mobile. The pager owns every gesture (touch-action pinch-zoom + first-move
> preventDefault) and writes positions with frame-coalesced, TIME-BASED rAF
> loops — exactly one scroll writer at any moment. Reveals on touch are
> reveal-once and fire per-section as it enters (no replay), with shortened
> motion (`applyDesignTokens` scales `--reveal-*` on coarse pointers).

## Hard product constraints (do not regress)

1. **Exactly ONE section per gesture**, desktop AND mobile. Multi-section
   "ride-through" is explicitly forbidden; never advance more than one section per gesture.
2. **Pull only arms at a content edge.** A gesture that *starts* mid-section
   (tall sections) scrolls the content and **stops at the edge** — it must not
   cross. You lift and pull again from the edge to cross.
3. **Smooth, never laggy/stiff.** But smoothness never beats #1/#2 — when they
   conflict, strict wins.
4. **Reveal tracks the viewport in both directions.** Records reveal top-to-bottom
   scrolling down, bottom-to-top scrolling up (reverse stagger), and replay when
   you return to a section.

## The pager — `hooks/useSectionSnap.ts`

Owns the wheel (desktop) and touch (mobile) entirely, so there's no native
momentum to fight; behavior is identical on both. Disabled only for
`prefers-reduced-motion` (then native scroll).

**Section rest positions** come from `lib/sectionMetrics.ts`:
`sectionSnapTop(el)` / `sectionSnapBottom(el)` target the section's *content*
(`.section-inner` / `.contact-inner` / `.hero-inner`), not the padded edge.
Content that fits the viewport is centered (top === bottom); taller content rests
with `breathing = round(vh*0.12)` above (top) or below (bottom). "Which section
am I on" = `activeSectionIndex()` (center probe) from `lib/sections.ts`.

**Wheel path:** owns `wheel` (preventDefault all). A burst commits once then is
ignored until the wheel falls quiet for `GESTURE_GAP` (80ms). Key state:
- `gestureUsed` — a commit already fired this gesture. Reset on a gap, a fresh
  delta spike (`absRaw > lastAbsDy + 16`), or two-in-a-row deliberate events (a
  swipe queued during a snap glide takes over the moment it ends). **Never
  reset it mid-glide** (`isScrollLocked()`), or one flick double-commits.
- `gestureClosed` — this gesture ran into an edge via internal scroll. A
  >`GESTURE_GAP` hole alone does NOT release it (event queueing fakes holes
  mid-tail): release takes TRUE silence (`TRUE_GAP` 240ms), seen momentum
  (`tailSeen`) + deliberate input, or a sparse-only (mouse) stream. Never a
  bare spike — one long swipe can't roll into a pull.
- **The pull-start gate** — opening a pull from a parked edge takes a notch
  device, a finger ramp (`RISE_MIN`×`RISE_PX` velocity rises), or two
  deliberate events past the `closedAt`+`TRUE_GAP` blind spot. The classifier
  behind "deliberate" is the Lethargy method on exactly-attributed mass
  windows — gotchas.md §12 has the full physics. A pull already in progress
  flows exactly as the baseline. **Run `node scripts/sim-wheel.mjs` after ANY
  change to the wheel path** — it proves the baseline bugs, asserts the fixes,
  4,000 adversarial runs, mouse bit-parity, and the legit gestures. Debug a
  real device with `?wheellog` (per-event console dump).
- A section with `restBot - restTop <= MIN_INTERNAL` (40px) has no real internal
  scroll, so it pulls immediately (no dead slack — fixes the hero's ~15px slop).

**Touch path:** owns `touchstart/move/end` (`touchmove` non-passive,
preventDefault single-finger; multi-finger bails so pinch-zoom works). The mode
is decided at the first move from the start position (edge → `pull-*`, else
`internal`), mirroring the wheel's edge rule. `internal` follows the finger 1:1
within `[restTop, restBot]`; on release it **flings** with friction (0.94),
bounded to the section. `pull-*` rubber-bands the page (`TOUCH_RESIST` 0.45) and
fills the indicator by finger travel; release past `touchCommitPx()`
(`max(64, vh*0.14)`) commits, else springs back. `html { touch-action: pinch-zoom }`
(coarse pointers, base.css) hands vertical panning to JS while keeping pinch.

**Commit** = `smoothScrollTo(neighborRest)` (a glide); during a glide
`isScrollLocked()` is true and both paths swallow input.

**Tuning constants** (top of the file): `COMMIT 0.26` (wheel: fraction of the gap
to pull before crossing — raise = less sensitive), `PULL_CURVE 0.5` (front-loads
the indicator so it shows early, not just near commit), `SPRING_DELAY`,
`GESTURE_GAP`, `EDGE_EPS`, `MIN_INTERNAL`, `TOUCH_RESIST`, `touchCommitPx`, and
the trackpad intent set (`INTENT_WIN`, `INTENT_KEEP`, `INTENT_FLOOR`,
`INTENT_RETAIN`, `TAIL_DECAY_MIN`, `TRUE_GAP`, `RISE_MIN`, `RISE_PX`,
`VEL_SANE` — see gotchas.md §12).

## The pull indicator — `ScrollHint` + chrome.css

The pager publishes `data-pull` (`up`/`down`/``), `--pull` (0–1, already
curved), and `--pull-label` (destination section name, JSON-quoted) on `<html>`.
`ScrollHint` is pure markup (two bars + two `.hint-label`s); chrome.css makes the
bar **stretch** with `--pull` (`height: 22px + --pull*74px`), brighten to accent
with a glowing head, and fade the destination label in. Same indicator on mobile,
lifted above the bottom tab bar (`@media max-width:560px`). (The old
`useScrollHint` / `data-hint` path was removed — `data-pull` is the one indicator.)

## The scroll owner — `lib/scrollController.ts`

`smoothScrollTo(targetY)` is the single owner of programmatic scrolling (nav
jumps via `scroll.ts`, pager commits, realigns). It rAFs an easeInOutCubic glide
(`behavior:'instant'` per frame) and holds `isScrollLocked()` true only for its
duration — no momentum tail. Everything that scrolls goes through here so they
never fight.

## Reveal — `hooks/useReveal.ts`

Per-element, viewport-band, **both directions**. An element is revealed exactly
while it sits in the band (`top < 0.88·vh && bottom > 0`; at max-scroll the whole
viewport counts so a bottom-pinned footer shows). One IntersectionObserver
toggles live as elements cross — **except during a glide** (`isScrollLocked`),
which is deferred to a scroll-settle reconcile (70ms) so a section's stagger
plays on arrival instead of flashing past mid-slide. Leaving clears it, so the
entrance replays on return.

**CRITICAL:** reveal state is a **`data-revealed` attribute, NOT a class**. React
rewrites `className` wholesale whenever a component's own classes change (e.g.
`SolutionCard` toggling `open`/`armed`), which would wipe an externally-added
class and make the card vanish. React never touches attributes it didn't render,
so an attribute survives. CSS: `.reveal[data-revealed] { opacity:1; transform:none }`.

**Stagger** comes from each `.reveal`'s `--d` transition-delay (set via
`cssVars`), plus natural per-element entry timing on scroll.

**Direction:** `useReveal` publishes `data-scrolldir` (`up`/`down`) on `<html>`.
The Experience **timeline line** draws top-down scrolling down, bottom-up coming
back up. It is split into an unclipped sensor (`.tl-line`, what the observers
measure) and an inner `.tl-line-draw` that animates `clip-path` — clipping the
observed element itself collapsed its visible area and made the reveal oscillate
forever on upward nav jumps (see gotchas.md §4); the hidden-state rule for "up"
is scoped `:not([data-revealed])` to avoid a specificity trap (§5).

## Dynamic section height — `useContentRealign`

A `SolutionCard` expand/collapse changes the section's height under a fixed
scroll position, which can strand you between sections. A ResizeObserver
(host-agnostic: it watches the container's children — the sections — on touch,
`document.body` on desktop) re-frames the active section (smooth) **on collapse
only** (growth is left alone — the new content is right there). Window/viewport
resizes are owned by `useResizeRealign`: window `resize` on desktop, a
ResizeObserver on the fixed container on touch (rotation, split view — the URL
bar can never fire it), plus a `pageshow(persisted)` realign for bfcache returns.

## How to verify (headless)

No automation deps are installed — system Chrome headless against the dev server
has been the working recipe (commands and caveats in gotchas.md §12). Patterns
that have caught regressions:
- **Wheel:** dispatch a burst of `WheelEvent`s; assert separate bursts each
  advance exactly 1 (never 2), and a hard burst from a TALL section's middle
  stays put at the edge.
- **Reveal:** check `data-revealed` toggles per element, the footer reveals at
  max-scroll, and the tl-line reveals ONCE and stays revealed after a nav jump
  from below (poll the attribute — an on/off oscillation is the §4 bug).
- **rAF glides don't run under `--virtual-time-budget`** — use `--timeout` plus
  a load-holding image when the journey needs real time.

Playwright is only needed for these checks — it's a dev-only dependency.
