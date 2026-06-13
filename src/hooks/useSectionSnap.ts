import { useEffect } from 'react';
import { isScrollLocked, smoothScrollTo, stopScrollGlide } from '../lib/scrollController';
import { sectionSnapTop, sectionSnapBottom } from '../lib/sectionMetrics';
import { sectionElements, activeSectionIndex } from '../lib/sections';
import { clampScroll } from '../lib/viewport';
import { scrollContainer, scrollerY, scrollerTo, scrollerViewHeight } from '../lib/scroller';

/**
 * Full-screen section pager with rubber-band feedback. The input (wheel on
 * desktop, touch drag on mobile) is owned entirely, so there's no native
 * momentum to fight and the behaviour is identical on both.
 *
 *   • inside a section taller than the viewport you scroll its content freely; a
 *     gesture that *starts* mid-section scrolls to the content edge and stops
 *     there — it can't run on into the neighbor
 *   • only a gesture that *begins* at a content edge pulls toward the neighbor:
 *     the page follows into the gap and a directional indicator fills up (see
 *     <ScrollHint>) so you feel how far you've pulled
 *   • pull past the commit threshold → it eases onto the next section
 *   • let go before that → it springs back to the edge you're on
 *
 * One gesture advances at most one section. On wheel, a burst commits once and
 * is then ignored until the wheel falls quiet for `GESTURE_GAP`; reaching an
 * edge mid-gesture "closes" it. On touch, one finger press-drag-release is the
 * gesture: drag scrolls / pulls, release commits or springs (a flick inside a
 * tall section coasts to its edge). Keyboard / reduced-motion stay native.
 *
 * HOST: all reads/writes go through lib/scroller.ts — the window on desktop,
 * the fixed <main> container on touch devices (base.css). The container keeps
 * the browser bar frozen so geometry never drifts, and the document itself
 * never scrolls on mobile (html/body are locked).
 */

const GESTURE_GAP = 80; // ms of wheel silence that ends one gesture / starts the next
const SPRING_DELAY = 320; // ms of stillness before an uncommitted wheel pull springs back
const COMMIT = 0.26; // fraction of the transition a WHEEL pull must cover before it advances
const PULL_CURVE = 0.5; // <1 front-loads the indicator so it shows early in the pull, not just near commit
const EDGE_EPS = 4; // px tolerance for "resting at a content edge"
const MIN_INTERNAL = 40; // sections with less internal scroll than this just pull (no dead slack)
const TOUCH_RESIST = 0.45; // how much the page follows the finger past an edge (rubber-band)
const NOTCH_DELTA = 60; // |deltaY| at/above which a wheel event is treated as a discrete notch

// ---- Trackpad intent classification (the Lethargy method) -------------------
// A trackpad keeps streaming decaying "momentum tail" deltas for up to ~1s
// after the fingers lift, which breaks two spots in the wheel gesture model:
// the tail keeps `gap` below GESTURE_GAP so a closed gesture never re-arms
// (page stuck at the edge until the user pauses), and a delivery hitch or
// delta spike inside the tail can reset the flags and let the tail itself
// pull/commit at the next section (ghost pulls, section skipping).
// The industry approach (d4nyll/lethargy, as used by fullPage.js) classifies
// each wheel event as deliberate-or-momentum by comparing the newest slice of
// scroll against the one before it — momentum only ever decays, so its
// newest/older ratio sits below what a finger sustains. Two modernizations:
// the slices are TIME windows of |deltaY| MASS (event rates vary 60–125Hz+),
// and each event's mass is attributed across its creation-time span, because
// the browser merges wheel events under load — merging conserves delta sums,
// so exact attribution keeps the ratio truthful where per-event sizes and
// timings lie. Mouse notch trains hold a constant ratio ≈1 and sail through:
// the classifier only ever gates trackpad momentum.
const INTENT_WIN = 100; // ms — each comparison half-window
const INTENT_KEEP = 0.92; // newest/older mass ratio a finger sustains; tails decay to ≲0.88
const INTENT_FLOOR = 12; // px per window — less is a dying dribble, not input
const INTENT_RETAIN = 600; // ms — stream history horizon (device-mode + session awareness)
const TAIL_DECAY_MIN = 6; // consecutive decelerating events = momentum is playing (fast lift signal)
const TRUE_GAP = 240; // ms — beyond any delivery hole AND the window-ratio blind spot around a swipe's peak
const RISE_MIN = 3; // consecutive ≥RISE_PX velocity rises = a finger ramp; merging fakes at most 2
const RISE_PX = 8; // px — deltas below this don't count as rises (±1px quantization fakes ±25% jumps)
const VEL_SANE = 12; // px/ms — beyond human input; merge artifacts carry no ramp evidence

// All rAF loops below use TIME-BASED exponential decay — `1 - exp(-dt / τ)` —
// so convergence speed is identical at 60/90/120/144Hz (a fixed per-frame
// factor would run twice as fast on a 120Hz screen). τ values are tuned to
// match the intended feel at 60Hz.
const WHEEL_GLIDE_TAU = 96; // ms — notchy-wheel glide time constant
const TOUCH_FOLLOW_TAU = 17; // ms — finger-follow time constant (tight, no lag)
const FLING_TAU = 270; // ms — fling friction time constant
const FLING_MAX_V = 3.6; // px/ms — fling launch velocity cap
const MAX_FRAME_DT = 64; // ms — clamp dt across tab-switch / hitch gaps

export function useSectionSnap(): void {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const root = document.documentElement;
    const vh = () => scrollerViewHeight();
    const maxStep = () => Math.max(110, Math.round(vh() * 0.14));
    const touchCommitPx = () => Math.max(64, Math.round(vh() * 0.14)); // finger drag past an edge to commit

    // publish pull state for <ScrollHint>: direction, 0–1 progress, and the
    // destination section's name (shown faintly toward the side you're pulling).
    const setPull = (dir: 'up' | 'down' | '', progress = 0, label = '') => {
      if (dir) {
        root.dataset.pull = dir;
        // front-load the visual so the line is clearly filling well before commit
        const shown = Math.pow(Math.min(1, Math.max(0, progress)), PULL_CURVE);
        root.style.setProperty('--pull', shown.toFixed(3));
        root.style.setProperty('--pull-label', JSON.stringify(label));
      } else if (root.dataset.pull) {
        root.dataset.pull = '';
        root.style.setProperty('--pull', '0');
        root.style.removeProperty('--pull-label');
      }
    };

    // ---- WHEEL (trackpad / mouse) ------------------------------------------
    let lastT = 0;
    let lastAbsDy = 0;
    let gestureUsed = false; // a section change already fired in the current gesture
    let gestureClosed = false; // this gesture ran into a content edge → no pulling until it lifts
    let tailSeen = false; // momentum arrived while closed → the fingers provably lifted
    let springId = 0;

    // ---- Intent classifier state (constants above the hook) ----------------
    // Per-direction history of [creationTime, |deltaY|, accrualSpan, isSparse];
    // the last classification per direction backs the two-in-a-row pull-start
    // rule, and `streamSparse` reports the device mode of the latest event's
    // direction (a purely sparse stream cannot be carrying momentum).
    const histDn: [number, number, number, boolean][] = [];
    const histUp: [number, number, number, boolean][] = [];
    let lastStampT = 0; // e.timeStamp of the previous wheel event (creation-time clock)
    let lastIntentDn = true;
    let lastIntentUp = true;
    let streamSparse = true; // latest classified direction had a sparse-only (notch-device) history
    let lastVel = 0; // span velocity of the previous event (merge-proof)
    let decayStreak = 0; // consecutive decelerating events — the fast momentum signal
    let riseStreak = 0; // consecutive ≥RISE_PX accelerating events — the finger-ramp signal
    let closedAt = -1e9; // when the gesture last closed at an edge (ratio intent is blind near that peak)
    // Diagnostic: open the site with ?wheellog to dump per-event classification.
    const wheelLog = new URLSearchParams(window.location.search).has('wheellog');

    const overlap = (a0: number, a1: number, b0: number, b1: number) =>
      Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));

    /** Feed one wheel event into the stream model and classify it: deliberate input (true) or momentum (false)? */
    const classifyIntent = (down: boolean, d: number, t: number, stampGap: number): boolean => {
      const hist = down ? histDn : histUp;
      // An event's delta accrued since the previous event (merging!), capped to
      // the comparison range — longer gaps are idle pauses, not accrual.
      hist.push([t, d, Math.max(1, Math.min(stampGap, INTENT_WIN * 2)), stampGap >= 40]);
      while (hist.length && hist[0][0] <= t - INTENT_RETAIN) hist.shift();
      // Momentum exists only in dense streams. A direction whose whole
      // retained history is sparse (every gap ≥ 40ms) is a notch device —
      // mouse wheels — and is always deliberate. This is what keeps every
      // mouse flow bit-identical to the unpatched pager.
      streamSparse = hist.every((h) => h[3]);
      if (streamSparse) return true;
      let newMass = 0;
      let oldMass = 0;
      let older = false;
      for (const [te, de, se] of hist) {
        const s0 = te - se;
        newMass += (de * overlap(s0, te, t - INTENT_WIN, t)) / se;
        oldMass += (de * overlap(s0, te, t - INTENT_WIN * 2, t - INTENT_WIN)) / se;
        if (te <= t - INTENT_WIN * 2) older = true;
      }
      if (newMass < INTENT_FLOOR) return false;
      if (oldMass > 0) return newMass >= oldMass * INTENT_KEEP;
      // Older window empty: with no session history at all this is input after
      // real quiet (deliberate); with dense history on record it is a delivery
      // hole or a dying tail's gap — momentum, not a new touch.
      return !older;
    };

    const armSpring = (target: number) => {
      window.clearTimeout(springId);
      springId = window.setTimeout(() => {
        setPull('');
        if (!isScrollLocked()) smoothScrollTo(target);
      }, SPRING_DELAY);
    };

    // ---- WHEEL GLIDE (smooths notchy mouse-wheel input) --------------------
    // Trackpads emit a dense stream of small deltas — applying them 1:1 already
    // feels smooth and stays untouched. Discrete mouse wheels emit one big step
    // per notch, which reads as a hard tick; for those, accumulate notches into
    // a target and ease toward it with rAF. Gesture/edge logic is unchanged —
    // it simply judges from the glide TARGET (the effective position).
    let wheelTarget: number | null = null;
    let wheelGlideId = 0;
    let wheelPrevT = 0;

    const stopWheelGlide = () => {
      cancelAnimationFrame(wheelGlideId);
      wheelTarget = null;
    };

    const stepWheelGlide = (now: number) => {
      if (wheelTarget === null) return;
      if (isScrollLocked()) {
        // a section snap / nav glide took over — never fight it
        stopWheelGlide();
        return;
      }
      const dt = Math.min(MAX_FRAME_DT, Math.max(0.1, now - wheelPrevT));
      wheelPrevT = now;
      const cur = scrollerY();
      const diff = wheelTarget - cur;
      if (Math.abs(diff) < 0.6) {
        scrollerTo(wheelTarget, 'instant');
        wheelTarget = null;
        return;
      }
      const k = 1 - Math.exp(-dt / WHEEL_GLIDE_TAU);
      scrollerTo(cur + diff * k, 'instant');
      wheelGlideId = requestAnimationFrame(stepWheelGlide);
    };

    /** Move the section's internal scroll to `newY` — eased for notchy wheels. */
    const scrollInternal = (newY: number, base: number, notchy: boolean) => {
      if (newY === base) return;
      if (notchy) {
        wheelTarget = newY;
        cancelAnimationFrame(wheelGlideId);
        wheelPrevT = performance.now();
        wheelGlideId = requestAnimationFrame(stepWheelGlide);
      } else {
        stopWheelGlide();
        scrollerTo(newY, 'instant');
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // let pinch-zoom through
      // Ignore events that originate inside an overlay (settings modal, chat widget).
      const el = e.target instanceof Element ? e.target : null;
      if (el?.closest('[data-overlay]')) return;
      e.preventDefault();

      const raw = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * vh() : e.deltaY;
      const absRaw = Math.abs(raw);
      const now = performance.now();
      const gap = now - lastT;
      lastT = now;

      // Classify deliberate-vs-momentum on the CREATION-time clock (a long
      // frame delivers queued events in one late burst; processing time would
      // distort the windows exactly when the page hitches). The classifier is
      // fed on every real event — including during glides — so its windows
      // stay truthful; `wasIntent` backs the two-in-a-row pull-start rule.
      const down = raw > 0;
      const stampGap = e.timeStamp - lastStampT;
      lastStampT = e.timeStamp;
      const intent = raw ? classifyIntent(down, absRaw, e.timeStamp, stampGap) : false;
      const wasIntent = down ? lastIntentDn : lastIntentUp;
      if (raw) {
        if (down) lastIntentDn = intent;
        else lastIntentUp = intent;
        // Per-event span velocity (merge-proof) backs two fast signals the
        // window ratio is too slow for: TAIL_DECAY_MIN decreases in a row mark
        // momentum ~50–100ms in (the fingers lifted), and RISE_MIN increases
        // in a row mark a finger ramp — a new touch always accelerates from
        // rest, and event merging can fake at most two rises, never three.
        const vel = absRaw / Math.max(4, Math.min(stampGap, INTENT_WIN * 2));
        decayStreak = vel < lastVel * 0.98 ? decayStreak + 1 : vel > lastVel * 1.15 ? 0 : decayStreak;
        riseStreak = vel <= VEL_SANE && absRaw >= RISE_PX && vel > lastVel * 1.15 ? riseStreak + 1 : 0;
        lastVel = vel;
        if (gestureClosed && (!intent || decayStreak >= TAIL_DECAY_MIN)) tailSeen = true;
      }

      // While a glide is playing, swallow input but DON'T re-judge the gesture —
      // resetting mid-glide would let one flick's momentum commit a second section.
      if (isScrollLocked()) {
        lastAbsDy = absRaw;
        return;
      }

      // A pause starts a fresh gesture; a mid-stream delta spike only breaks a
      // stale momentum lock so a new flick responds without waiting the old
      // one out — as does deliberate input proven two events in a row (a swipe
      // queued during a snap glide must take over the moment it ends).
      // TRACKPAD GUARD on the pause rule: under load the browser queues/merges
      // wheel events, which fakes >GESTURE_GAP creation holes in the middle of
      // a strong tail — so a hole alone must not unlock a closed edge. It
      // unlocks only after TRUE silence (longer than any delivery hole), once
      // momentum was actually seen (the fingers provably lifted), or on a
      // sparse-only notch stream (mouse — no momentum to fake it).
      if (gap > GESTURE_GAP) {
        gestureUsed = false;
        if (gap > TRUE_GAP || tailSeen || streamSparse || !gestureClosed) {
          gestureClosed = false;
          tailSeen = false;
        }
      } else if (absRaw > lastAbsDy + 16 || (!streamSparse && intent && wasIntent)) {
        // The deliberate-pair release exists for DENSE streams only (a swipe
        // queued during a snap glide, still streaming at glide end). A sparse
        // notch train must keep the baseline burst rule — every notch
        // classifies deliberate, so without the !streamSparse guard one
        // sustained mouse spin would clear the commit lock on every notch
        // and advance several sections.
        gestureUsed = false;
      }
      // Trackpad stuck-fix: the tail keeps `gap` alive, so a closed gesture
      // also re-arms on deliberate input after momentum was seen — momentum
      // proves the fingers lifted, intent proves they came back. A single
      // swipe that merely accelerates never sees momentum → it stays closed
      // and cannot roll through the edge it stopped at.
      if (raw && gestureClosed && tailSeen && intent) {
        gestureClosed = false;
        tailSeen = false;
      }
      if (wheelLog)
        console.debug(
          `[wheel] dy=${raw.toFixed(1)} gap=${gap.toFixed(0)} intent=${intent ? 1 : 0} was=${wasIntent ? 1 : 0} sparse=${streamSparse ? 1 : 0} tail=${tailSeen ? 1 : 0} closed=${gestureClosed ? 1 : 0} used=${gestureUsed ? 1 : 0}`,
        );
      lastAbsDy = absRaw;
      if (gestureUsed || !raw) return;

      const cap = maxStep();
      const dy = Math.max(-cap, Math.min(cap, raw));
      const dir = dy > 0 ? 1 : -1;

      const list = sectionElements();
      if (!list.length) return;
      const i = activeSectionIndex(list);
      const restTop = clampScroll(sectionSnapTop(list[i]));
      const restBot = clampScroll(sectionSnapBottom(list[i]));
      const y = scrollerY();
      // Effective position: mid-glide, judge from where the glide is headed so
      // consecutive notches accumulate instead of re-reading a lagging scrollY.
      const eff = wheelTarget ?? y;
      const notchy = e.deltaMode !== 0 || absRaw >= NOTCH_DELTA;

      if (dir > 0) {
        const next = list[i + 1];
        // Pull only when this gesture began resting at the bottom edge (a section
        // that barely overflows has no real content to scroll, so it pulls at
        // once). Otherwise scroll the content and stop at the edge, closing the
        // gesture — so a hard scroll from mid-section settles instead of crossing.
        const atEdge = restBot - restTop <= MIN_INTERNAL || eff >= restBot - EDGE_EPS;
        if (gestureClosed || !next || !atEdge) {
          const newY = Math.min(restBot, Math.max(restTop, eff + dy));
          scrollInternal(newY, eff, notchy);
          if (newY >= restBot - EDGE_EPS) {
            if (!gestureClosed) closedAt = now;
            gestureClosed = true;
          }
          setPull('');
          window.clearTimeout(springId);
          return;
        }
        // Trackpad skip/ghost-fix: momentum must not START a pull from a
        // parked edge — it can reach here when a delivery hitch or delta
        // spike resets the gesture flags mid-tail (and at sections that fit
        // the viewport, atEdge is trivially true on arrival). Opening from
        // rest takes a notch device, a finger ramp (reliable even right after
        // a close), or two deliberate events once past the window-ratio blind
        // spot around the closing swipe's peak. A pull already in progress
        // (only a finger can have opened it) flows as before.
        if (
          eff <= restBot + 0.5 &&
          e.deltaMode === 0 &&
          !streamSparse &&
          riseStreak < RISE_MIN &&
          !(intent && wasIntent && now - closedAt >= TRUE_GAP)
        )
          return;
        // Rubber-band pull — the page position glides like the internal scroll
        // (no per-notch jerk); the indicator and commit threshold respond to
        // the pull TARGET so the gesture still feels immediate.
        const nextRest = clampScroll(sectionSnapTop(next));
        const newY = Math.min(nextRest, Math.max(restBot, eff + dy));
        const over = newY - restBot;
        const dist = nextRest - restBot;
        if (dist > 0 && over / dist >= COMMIT) {
          gestureUsed = true;
          closedAt = now; // the arrival edge starts inside the blind spot too
          window.clearTimeout(springId);
          setPull('');
          stopWheelGlide(); // hand the position to the snap glide
          smoothScrollTo(nextRest);
        } else if (over > 0 && dist > 0) {
          scrollInternal(newY, eff, notchy);
          // The destination's data-screen-label carries the translated name.
          setPull('down', over / dist / COMMIT, next.dataset.screenLabel ?? '');
          armSpring(restBot);
        } else {
          scrollInternal(newY, eff, notchy);
          setPull('');
          window.clearTimeout(springId);
        }
      } else {
        const prev = list[i - 1];
        const atEdge = restBot - restTop <= MIN_INTERNAL || eff <= restTop + EDGE_EPS;
        if (gestureClosed || !prev || !atEdge) {
          const newY = Math.max(restTop, Math.min(restBot, eff + dy));
          scrollInternal(newY, eff, notchy);
          if (newY <= restTop + EDGE_EPS) {
            if (!gestureClosed) closedAt = now;
            gestureClosed = true;
          }
          setPull('');
          window.clearTimeout(springId);
          return;
        }
        // Same start gate as the downward branch: momentum can't open a pull.
        if (
          eff >= restTop - 0.5 &&
          e.deltaMode === 0 &&
          !streamSparse &&
          riseStreak < RISE_MIN &&
          !(intent && wasIntent && now - closedAt >= TRUE_GAP)
        )
          return;
        // Rubber-band pull — eased exactly like the downward branch above.
        const prevRest = clampScroll(sectionSnapBottom(prev));
        const newY = Math.max(prevRest, Math.min(restTop, eff + dy));
        const over = restTop - newY;
        const dist = restTop - prevRest;
        if (dist > 0 && over / dist >= COMMIT) {
          gestureUsed = true;
          closedAt = now; // the arrival edge starts inside the blind spot too
          window.clearTimeout(springId);
          setPull('');
          stopWheelGlide(); // hand the position to the snap glide
          smoothScrollTo(prevRest);
        } else if (over > 0 && dist > 0) {
          scrollInternal(newY, eff, notchy);
          setPull('up', over / dist / COMMIT, prev.dataset.screenLabel ?? '');
          armSpring(restTop);
        } else {
          scrollInternal(newY, eff, notchy);
          setPull('');
          window.clearTimeout(springId);
        }
      }
    };

    // ---- TOUCH (mobile — drives the fixed <main> container) ---------------
    let tActive = false;
    let tStartY = 0;
    let tStartScroll = 0;
    let tLastY = 0;
    let tLastT = 0;
    let tVel = 0; // px/ms, + = scrolling down
    let tMode: 'none' | 'internal' | 'pull-down' | 'pull-up' = 'none';
    let tRestTop = 0;
    let tRestBot = 0;
    let tNextRest = 0;
    let tPrevRest = 0;
    let tIndex = 0;
    let tHasNext = false;
    let tHasPrev = false;
    let tNextLabel = '';
    let tPrevLabel = '';
    let tReady = false; // pulled far enough to commit on release
    let momentumId = 0;

    const stopMomentum = () => cancelAnimationFrame(momentumId);

    // ---- TOUCH FOLLOW (frame-coalesced finger tracking) --------------------
    // Touch events fire at the digitizer rate (often 60Hz) while screens paint
    // at up to 120Hz — writing scroll inside every touchmove makes alternate
    // frames idle and reads as judder. Instead the handlers only record the
    // finger's desired page position; a rAF loop applies it once per frame
    // with a tight ease, so the page sticks to the finger but moves smoothly.
    let tDesired: number | null = null;
    let tFollowId = 0;
    let tFollowPrevT = 0;

    const stopTouchFollow = () => {
      cancelAnimationFrame(tFollowId);
      tDesired = null;
    };

    const stepTouchFollow = (now: number) => {
      if (tDesired === null) return;
      const dt = Math.min(MAX_FRAME_DT, Math.max(0.1, now - tFollowPrevT));
      tFollowPrevT = now;
      const cur = scrollerY();
      const diff = tDesired - cur;
      if (Math.abs(diff) < 0.5) {
        if (diff !== 0) scrollerTo(tDesired, 'instant');
      } else {
        const k = 1 - Math.exp(-dt / TOUCH_FOLLOW_TAU);
        scrollerTo(cur + diff * k, 'instant');
      }
      tFollowId = requestAnimationFrame(stepTouchFollow);
    };

    const followTo = (target: number) => {
      const wasIdle = tDesired === null;
      tDesired = target;
      if (wasIdle) {
        tFollowPrevT = performance.now();
        tFollowId = requestAnimationFrame(stepTouchFollow);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      stopMomentum();
      stopWheelGlide(); // the finger takes over from any wheel glide
      stopTouchFollow();
      window.clearTimeout(springId); // defuse a pending wheel spring-back
      // Ignore touch inside an overlay — also gates onTouchMove via tActive = false.
      const el = e.target instanceof Element ? e.target : null;
      if (el?.closest('[data-overlay]')) { tActive = false; return; }
      if (e.touches.length !== 1) {
        tActive = false;
        return;
      }
      // A finger landing mid-glide GRABS the page (native feel). Rejecting the
      // touch here would leave its moves uncancelled — the browser would claim
      // the gesture, fire its own momentum on release, and fight the glide.
      if (isScrollLocked()) stopScrollGlide();
      const t = e.touches[0];
      tStartY = tLastY = t.clientY;
      tStartScroll = scrollerY();
      tLastT = performance.now();
      tVel = 0;
      tMode = 'none';
      tReady = false;
      const list = sectionElements();
      if (!list.length) {
        tActive = false;
        return;
      }
      tIndex = activeSectionIndex(list);
      tRestTop = clampScroll(sectionSnapTop(list[tIndex]));
      tRestBot = clampScroll(sectionSnapBottom(list[tIndex]));
      tHasNext = tIndex + 1 < list.length;
      tHasPrev = tIndex > 0;
      tNextRest = tHasNext ? clampScroll(sectionSnapTop(list[tIndex + 1])) : tRestBot;
      tPrevRest = tHasPrev ? clampScroll(sectionSnapBottom(list[tIndex - 1])) : tRestTop;
      tNextLabel = tHasNext ? (list[tIndex + 1].dataset.screenLabel ?? '') : '';
      tPrevLabel = tHasPrev ? (list[tIndex - 1].dataset.screenLabel ?? '') : '';
      tActive = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!tActive) return;
      // Ignore moves inside an overlay (gesture started outside → bail now).
      const el = e.target instanceof Element ? e.target : null;
      if (el?.closest('[data-overlay]')) { tActive = false; setPull(''); stopTouchFollow(); return; }
      if (e.touches.length !== 1) {
        // a second finger (pinch) — bail out and let the browser handle it
        tActive = false;
        setPull('');
        stopTouchFollow();
        return;
      }
      // Own the gesture from the VERY FIRST move. If the first (sub-slop) move
      // is not cancelled, iOS claims the gesture as a native scroll and fires
      // its own momentum on release — which then fights our fling loop and
      // shakes the screen. Cancelable-guarded: no-op for forced native phases.
      if (e.cancelable) e.preventDefault();
      if (!e.cancelable && tMode === 'none') {
        // The browser has already committed this gesture to native scrolling
        // (non-cancelable moves before we established a mode) — withdraw
        // completely instead of running our writers against native momentum.
        tActive = false;
        stopTouchFollow();
        return;
      }
      const y = e.touches[0].clientY;
      const drag = tStartY - y; // + = finger up = scroll down
      const now = performance.now();
      const dt = now - tLastT;
      if (dt > 0) tVel = (tLastY - y) / dt;
      tLastY = y;
      tLastT = now;

      // decide the gesture's mode once the drag shows intent (mirrors the wheel's
      // edge rule: started at the edge → pull; started mid-section → internal)
      if (tMode === 'none') {
        if (Math.abs(drag) < 6) return;
        const rangeSmall = tRestBot - tRestTop <= MIN_INTERNAL;
        if (drag > 0)
          tMode = (rangeSmall || tStartScroll >= tRestBot - EDGE_EPS) && tHasNext ? 'pull-down' : 'internal';
        else tMode = (rangeSmall || tStartScroll <= tRestTop + EDGE_EPS) && tHasPrev ? 'pull-up' : 'internal';
      }
      const raw = tStartScroll + drag;
      const commitPx = touchCommitPx();

      if (tMode === 'internal') {
        followTo(Math.max(tRestTop, Math.min(tRestBot, raw)));
      } else if (tMode === 'pull-down') {
        const fingerOver = Math.max(0, raw - tRestBot);
        followTo(tRestBot + Math.min(tNextRest - tRestBot, fingerOver * TOUCH_RESIST));
        tReady = fingerOver >= commitPx;
        setPull('down', fingerOver / commitPx, tNextLabel);
      } else if (tMode === 'pull-up') {
        const fingerOver = Math.max(0, tRestTop - raw);
        followTo(tRestTop - Math.min(tRestTop - tPrevRest, fingerOver * TOUCH_RESIST));
        tReady = fingerOver >= commitPx;
        setPull('up', fingerOver / commitPx, tPrevLabel);
      }
    };

    const onTouchEnd = () => {
      stopTouchFollow(); // freeze the follow loop; release logic owns the position
      if (!tActive) return;
      tActive = false;
      const mode = tMode;
      tMode = 'none';
      setPull('');
      if (mode === 'pull-down') {
        smoothScrollTo(tReady ? tNextRest : tRestBot);
      } else if (mode === 'pull-up') {
        smoothScrollTo(tReady ? tPrevRest : tRestTop);
      } else if (mode === 'internal') {
        // fling: coast with friction, bounded to the section (parks at its
        // edges). Velocity is px/ms and friction decays by elapsed time, so
        // the coast feels identical at any refresh rate.
        let v = Math.max(-FLING_MAX_V, Math.min(FLING_MAX_V, tVel));
        if (Math.abs(v) < 0.036) return;
        let prevT = performance.now();
        const step = (now: number) => {
          const dt = Math.min(MAX_FRAME_DT, Math.max(0.1, now - prevT));
          prevT = now;
          const ny = Math.max(tRestTop, Math.min(tRestBot, scrollerY() + v * dt));
          scrollerTo(ny, 'instant');
          v *= Math.exp(-dt / FLING_TAU);
          if (ny <= tRestTop || ny >= tRestBot || Math.abs(v) < 0.024) return;
          momentumId = requestAnimationFrame(step);
        };
        momentumId = requestAnimationFrame(step);
      } else {
        // mode 'none' — e.g. a tap that grabbed a glide mid-transition. If the
        // page was left resting between sections, settle onto the nearest rest.
        const y0 = scrollerY();
        if (y0 > tRestBot + EDGE_EPS) {
          smoothScrollTo(y0 - tRestBot < tNextRest - y0 ? tRestBot : tNextRest);
        } else if (y0 < tRestTop - EDGE_EPS) {
          smoothScrollTo(tRestTop - y0 < y0 - tPrevRest ? tRestTop : tPrevRest);
        }
      }
    };

    // Touch listens on the active scroll host: the fixed container on touch
    // devices, the window otherwise (e.g. touchscreen laptops). The cast is
    // safe — both hosts dispatch DOM TouchEvents for these types.
    const touchHost: HTMLElement | Window = scrollContainer() ?? window;
    const ts = onTouchStart as EventListener;
    const tm = onTouchMove as EventListener;
    const te = onTouchEnd as EventListener;

    window.addEventListener('wheel', onWheel, { passive: false });
    touchHost.addEventListener('touchstart', ts, { passive: true });
    touchHost.addEventListener('touchmove', tm, { passive: false });
    touchHost.addEventListener('touchend', te, { passive: true });
    touchHost.addEventListener('touchcancel', te, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      touchHost.removeEventListener('touchstart', ts);
      touchHost.removeEventListener('touchmove', tm);
      touchHost.removeEventListener('touchend', te);
      touchHost.removeEventListener('touchcancel', te);
      stopMomentum();
      stopWheelGlide();
      stopTouchFollow();
      window.clearTimeout(springId);
      setPull('');
    };
  }, []);
}
