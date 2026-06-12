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

// ---- Momentum vs intent ------------------------------------------------------
// A trackpad keeps streaming decaying "momentum tail" deltas for up to ~1s
// after the fingers lift, and under load the browser queues/merges wheel
// events — which can fake delta spikes AND >GESTURE_GAP creation-time holes in
// the MIDDLE of a strong tail. So no boundary heuristic can be fully trusted;
// intent is decided POSITIVELY at the point that matters — starting a pull —
// by two industry-standard detectors that fail in opposite directions:
//   • THE RAMP — RISE_MIN consecutive velocity rises. A new touch always
//     accelerates from rest, so it fires even when the new swipe is weaker
//     than the old tail (flick-flick). Velocity = |deltaY| over the full
//     e.timeStamp gap (merge-correct); merging can fake at most two
//     consecutive rises, never three.
//   • THE QUIET BURST — real input (≥MIN_BURST of window mass) arriving
//     after a window of near-silence, two events in a row, AND only while the
//     momentum ENVELOPE is dead. The envelope (tailEnv) is a decaying max of
//     stream velocity with TAIL_ENV_TAU slower than any physical tail, so
//     live momentum always sits under it: a delivery hole makes a strong
//     tail look exactly like "input after silence" 90–180ms later, and the
//     env gate is the one signal that tells them apart (the tail arrives
//     under a live envelope; a finger after a real pause arrives after the
//     envelope has died). Only dense events feed the envelope — mouse
//     notches are sparse, leave no momentum, and are never self-blocked.
//     Mass is merge-proof (merging conserves delta sums; events spanning
//     more than a window are pro-rated). This path serves what ramps can't:
//     mouse notches, idle starts, and ultra-gentle sub-RISE_PX pulls.
// Tail remnants fail both BY CONSTRUCTION and contribute nothing: no movement,
// no indicator, no commit — even when a fake gap re-opens the gesture flags.
// PULL_SLOP px of finger-owned travel must still accumulate before anything
// engages (touch-slop hysteresis against micro-noise).
const RISE_MIN = 3; // consecutive velocity rises = finger; event merging can fake at most 2 (recovery + inflation, then forced deflation)
const RISE_PX = 8; // px — deltas below this don't count as rises (tail-end ±1px quantization fakes ±25% jumps)
const VEL_SANE = 12; // px/ms — faster than any human input; such an event is a merge artifact and carries no ramp evidence
const INTENT_VEL = 0.35; // px/ms — minimum speed a velocity ramp must reach to count as a finger (≈350px/s)
const BURST_WIN = 90; // ms — mass window: |deltaY| summed over the last window vs the window before it
const LIFT_RATIO = 0.85; // recent/prior window mass below this = momentum decaying → the fingers have lifted
const MIN_BURST = 18; // px — window mass below this is silence; at/above it is real input
const SPAN_CAP = 400; // ms — pro-rating gap cap: longer gaps are idle pauses, not plausible merge spans
const TAIL_ENV_TAU = 900; // ms — envelope decay; MUST be slower than any real tail (~150–400ms) or late tails outlive the gate
const ENV_DENSE_GAP = 48; // ms — only dense streams feed the envelope (momentum exists only after flicks)
const TAIL_DECAY_MIN = 6; // consecutive decelerating events — the fast fingers-lifted signal (mass collapse is the slow one)
const PULL_SLOP = 12; // px of finger-owned travel before a pull from rest engages (moves / indicates)

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
    // Diagnostic stream dump: open the site with ?wheellog to print every wheel
    // event's physics (gap/vel/env/evidence/flags) — ground truth for tuning
    // the momentum classifier on real devices instead of guessing.
    const wheelLog = new URLSearchParams(window.location.search).has('wheellog');
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
    let lastVel = 0; // previous event's velocity (px/ms) — the merge-proof stream metric
    let riseStreak = 0; // consecutive ≥RISE_PX accelerating events — the new-finger ramp signature
    let decayStreak = 0; // consecutive decelerating events — the fast lift signal (short tails)
    const burst: [number, number][] = []; // [timeStamp, pro-rated |deltaY|] — the rolling mass window
    let burstAccel = false; // previous event passed the quiet-burst test (evidence needs two in a row)
    let tailEnv = 0; // decaying max of stream velocity — live momentum can never exceed it
    let fingersLifted = false; // sticky: the window mass collapsed — the touch ended (cleared at gesture boundaries)
    let fingerProven = false; // sticky: evidence fired this gesture — the rest of the gesture is finger-owned
    let gestureUsed = false; // a section change already fired in the current gesture
    let gestureClosed = false; // this gesture ran into a content edge → no pulling until it lifts
    let pullAcc = 0; // slop accumulator: px pulled past the edge before the pull engages
    let pullDir = 0; // direction the slop is accumulating in (+1 down / -1 up)
    let pullEngaged = false; // this gesture's pull cleared PULL_SLOP and is live
    let springId = 0;

    const armSpring = (target: number) => {
      window.clearTimeout(springId);
      springId = window.setTimeout(() => {
        setPull('');
        pullAcc = 0;
        pullEngaged = false;
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
      if (!raw) return; // horizontal-only event — keep it out of the vertical gesture stream
      const absRaw = Math.abs(raw);
      // Event CREATION time, not processing time: a long frame delivers queued
      // wheel events in one late burst, and a processing-time clock would fake
      // a "gesture pause" exactly when the page hitches.
      const now = e.timeStamp;
      const gap = now - lastT;
      lastT = now;

      // Stream physics (constants above). SPAN velocity — |delta| over the
      // FULL creation-time gap — is the only merge-correct rate (a coalesced
      // event's delta accrued across its whole gap; dividing by less inflates
      // it into fake evidence). Events faster than any human (VEL_SANE) are
      // merge artifacts: they move content fine but carry no ramp evidence.
      const vel = absRaw / Math.max(4, gap);
      const sane = vel <= VEL_SANE;
      // THE RAMP: strictly consecutive ≥RISE_PX rises. Merging fakes at most
      // two in a row (recovery + inflation — the event after a merge always
      // inherits its span and reads deflated, breaking the chain); sub-RISE_PX
      // deltas are excluded (tail-end ±1px quantization fakes ±25% jumps).
      const rising = sane && absRaw >= RISE_PX && vel > lastVel * 1.15;
      const riseNow = rising ? riseStreak + 1 : 0;
      // THE QUIET BURST: pro-rated window sums — see the constants block.
      const mass = absRaw * Math.min(1, BURST_WIN / Math.max(1, Math.min(gap, SPAN_CAP)));
      burst.push([now, mass]);
      let recentMass = 0;
      let priorMass = 0;
      for (let k = burst.length - 1; k >= 0; k -= 1) {
        const age = now - burst[k][0];
        if (age >= BURST_WIN * 2) {
          burst.splice(0, k + 1);
          break;
        }
        if (age < BURST_WIN) recentMass += burst[k][1];
        else priorMass += burst[k][1];
      }
      const envBefore = tailEnv * Math.exp(-Math.min(2000, gap) / TAIL_ENV_TAU);
      // The burst's events must also clear a (merge-proof) velocity floor —
      // a dying tail's last dribble can clump ≥MIN_BURST of window mass right
      // as the envelope dies, but its velocity (conserved under merging)
      // stays far below anything a finger produces.
      const burstVel = absRaw / Math.max(4, Math.min(gap, BURST_WIN));
      const quietBurst =
        recentMass >= MIN_BURST &&
        priorMass < MIN_BURST &&
        envBefore < INTENT_VEL &&
        burstVel >= INTENT_VEL * 0.5;
      const fingerEvidence =
        (sane && riseNow >= RISE_MIN && vel >= INTENT_VEL) || (quietBurst && burstAccel);
      // Two lift signals, either marks "the touch ended" (sticky until the
      // next gesture boundary, so the re-swipe that follows can re-arm a
      // closed gesture — flick-flick — without waiting for wheel silence):
      // a window-over-window mass collapse (robust, needs ~150ms), or a run
      // of consecutive decelerating events (fast — catches short tails that
      // a new flick interrupts before the windows see the collapse).
      const lifting = priorMass >= MIN_BURST && recentMass < priorMass * LIFT_RATIO;
      const trackStream = () => {
        burstAccel = quietBurst;
        decayStreak = vel < lastVel * 0.98 ? decayStreak + 1 : rising ? 0 : decayStreak;
        if (lifting || decayStreak >= TAIL_DECAY_MIN) fingersLifted = true;
        riseStreak = riseNow;
        tailEnv =
          sane && e.deltaMode === 0 && gap <= ENV_DENSE_GAP ? Math.max(envBefore, vel) : envBefore;
        lastVel = vel;
        lastAbsDy = absRaw;
      };

      // While a glide is playing, swallow input but DON'T re-judge the gesture
      // flags from gaps — resetting mid-glide would let one flick's momentum
      // commit a second section. Finger EVIDENCE during the glide, though, is
      // a queued intent: it owns the gesture and releases the commit lock, so
      // the swipe takes over the moment the glide ends (no stuck section, and
      // rhythm scrolling stays snappy). Momentum can't fake evidence, so the
      // committing flick's own tail can't re-commit through this.
      if (isScrollLocked()) {
        if (fingerEvidence) {
          fingerProven = true;
          gestureUsed = false;
        }
        trackStream();
        return;
      }

      // Gesture boundaries. A pause starts a fresh gesture, and so does finger
      // evidence arriving after the fingers had provably lifted (flick-flick —
      // the tail keeps `gap` alive, but acceleration is a new finger). These
      // only make the pull branch REACHABLE: the pull itself independently
      // requires finger evidence per event, so a fake gap (event queueing can
      // fake >GESTURE_GAP creation holes mid-tail) re-opening the flags hands
      // momentum nothing. A bare delta spike only breaks the commit lock
      // (keeps rhythm hops responsive); it must NOT start a fresh gesture, or
      // mid-swipe acceleration would roll through the edge it just stopped at.
      if (gap > GESTURE_GAP || (fingersLifted && fingerEvidence)) {
        gestureUsed = false;
        gestureClosed = false;
        fingersLifted = false;
        fingerProven = false;
        pullAcc = 0;
        pullEngaged = false;
      } else if (absRaw > lastAbsDy + 16) {
        gestureUsed = false;
      }
      // Evidence proves the FINGER for the whole gesture, not just one event —
      // an ultra-gentle pull (sub-RISE_PX deltas) must keep accumulating after
      // its first proof, or it could never cross the slop.
      if (fingerEvidence) fingerProven = true;
      if (wheelLog)
        console.debug(
          `[wheel] dy=${raw.toFixed(1)} gap=${gap.toFixed(0)} vel=${vel.toFixed(2)} rec=${recentMass.toFixed(0)} pri=${priorMass.toFixed(0)} rise=${riseNow} lifted=${fingersLifted ? 1 : 0} ev=${fingerEvidence ? 1 : 0} proven=${fingerProven ? 1 : 0} closed=${gestureClosed ? 1 : 0} used=${gestureUsed ? 1 : 0}`,
        );
      trackStream();
      if (gestureUsed) return;

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
          if (newY >= restBot - EDGE_EPS) gestureClosed = true;
          setPull('');
          window.clearTimeout(springId);
          return;
        }
        // Rubber-band pull — the page position glides like the internal scroll
        // (no per-notch jerk); the indicator and commit threshold respond to
        // the pull TARGET so the gesture still feels immediate.
        const nextRest = clampScroll(sectionSnapTop(next));
        // THE intent gate: only finger-evidence events may build a pull from
        // rest — momentum remnants contribute nothing (no movement, no
        // indicator), regardless of how the gesture flags got re-opened. After
        // PULL_SLOP px of evidence-bearing travel the pull engages; a pull
        // already in progress (page visibly past the edge — only a finger can
        // have put it there) resumes without re-arming, and the engaging event
        // carries its post-slop remainder.
        let step = dy;
        if (!pullEngaged) {
          if (eff > restBot + 0.5) {
            pullEngaged = true;
          } else {
            if (!fingerProven) return;
            if (pullDir !== 1) {
              pullDir = 1;
              pullAcc = 0;
            }
            pullAcc += dy;
            if (pullAcc <= PULL_SLOP) return;
            pullEngaged = true;
            step = pullAcc - PULL_SLOP;
          }
        }
        const newY = Math.min(nextRest, Math.max(restBot, eff + step));
        const over = newY - restBot;
        const dist = nextRest - restBot;
        if (dist > 0 && over / dist >= COMMIT) {
          gestureUsed = true;
          // The commit consumes this gesture's proof — it must not leak into
          // the arrival section and let the leftover tail pull there.
          fingerProven = false;
          fingersLifted = false;
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
          if (newY <= restTop + EDGE_EPS) gestureClosed = true;
          setPull('');
          window.clearTimeout(springId);
          return;
        }
        // Rubber-band pull — eased exactly like the downward branch above,
        // with the same evidence-gated engage-after-slop accumulation.
        const prevRest = clampScroll(sectionSnapBottom(prev));
        let step = dy;
        if (!pullEngaged) {
          if (eff < restTop - 0.5) {
            pullEngaged = true;
          } else {
            if (!fingerProven) return;
            if (pullDir !== -1) {
              pullDir = -1;
              pullAcc = 0;
            }
            pullAcc += -dy;
            if (pullAcc <= PULL_SLOP) return;
            pullEngaged = true;
            step = -(pullAcc - PULL_SLOP);
          }
        }
        const newY = Math.max(prevRest, Math.min(restTop, eff + step));
        const over = restTop - newY;
        const dist = restTop - prevRest;
        if (dist > 0 && over / dist >= COMMIT) {
          gestureUsed = true;
          // Same as the downward branch: a commit consumes the gesture's proof.
          fingerProven = false;
          fingersLifted = false;
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
