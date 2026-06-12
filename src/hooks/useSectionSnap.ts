import { useEffect } from 'react';
import { isScrollLocked, smoothScrollTo } from '../lib/scrollController';
import { sectionSnapTop, sectionSnapBottom } from '../lib/sectionMetrics';
import { sectionElements, activeSectionIndex } from '../lib/sections';
import { clampScroll } from '../lib/viewport';
import { scrollContainer, scrollerY } from '../lib/scroller';
import { nativeJumpTo } from '../lib/scroll';

/**
 * Full-screen section pager — DESKTOP WHEEL ONLY.
 *
 *   • inside a section taller than the viewport you scroll its content freely; a
 *     gesture that *starts* mid-section scrolls to the content edge and stops
 *     there — it can't run on into the neighbor
 *   • only a gesture that *begins* at a content edge pulls toward the neighbor:
 *     the page follows into the gap and a directional indicator fills up (see
 *     <ScrollHint>) so you feel how far you've pulled
 *   • pull past ~COMMIT of the way → it eases onto the next section
 *   • let go before that → it springs back to the edge you're on
 *
 * One gesture advances at most one section: a wheel burst commits once and is
 * then ignored until the wheel falls quiet for `GESTURE_GAP`; reaching an edge
 * mid-gesture "closes" it. Keyboard / reduced-motion stay native.
 *
 * TOUCH DEVICES ARE INTENTIONALLY NATIVE: JS-driven document scrolling during
 * touch flickers on iOS WebKit (compositor races), so coarse pointers use the
 * platform's own CSS scroll-snap instead — `scroll-snap-type: y mandatory` +
 * `scroll-snap-stop: always` in base.css gives the same model natively (free
 * scrolling inside tall sections, magnetic rest at edges, no double-skips)
 * with zero scroll hijacking. This hook simply does nothing on touch devices.
 */

const GESTURE_GAP = 80; // ms of wheel silence that ends one gesture / starts the next
const SPRING_DELAY = 320; // ms of stillness before an uncommitted wheel pull springs back
const COMMIT = 0.26; // fraction of the transition a pull must cover before it advances
const PULL_CURVE = 0.5; // <1 front-loads the indicator so it shows early in the pull, not just near commit
const EDGE_EPS = 4; // px tolerance for "resting at a content edge"
const MIN_INTERNAL = 40; // sections with less internal scroll than this just pull (no dead slack)
const NOTCH_DELTA = 60; // |deltaY| at/above which a wheel event is treated as a discrete notch

// The glide uses TIME-BASED exponential decay — `1 - exp(-dt / τ)` — so
// convergence speed is identical at 60/90/120/144Hz (a fixed per-frame factor
// would run twice as fast on a 120Hz screen).
const WHEEL_GLIDE_TAU = 96; // ms — notchy-wheel glide time constant
const MAX_FRAME_DT = 64; // ms — clamp dt across tab-switch / hitch gaps

export function useSectionSnap(): void {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const root = document.documentElement;
    const vh = () => window.innerHeight;
    const maxStep = () => Math.max(110, Math.round(vh() * 0.14));

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

    // ---- TOUCH DEVICES: the card model (see base.css / layout.css) ---------
    // Scrolling is 100% native inside the fixed <main> container: every
    // section is ONE uniform full-height card with a single snap stop, and
    // taller content scrolls inside its card. This branch never writes scroll
    // DURING a gesture; it only:
    //   1. reproduces the desktop edge rules via overscroll handoff (a swipe
    //      starting mid-content stops at the content edge; one starting at an
    //      edge chains out to the pager)
    //   2. drives the pull indicator read-only from scroll position
    //   3. enforces one-card-per-gesture AFTER momentum settles (a single
    //      corrective native jump if WebKit's momentum ever overshoots).
    if (window.matchMedia('(pointer: coarse)').matches) {
      const container = scrollContainer();
      if (!container) return;

      const innerOf = (el: HTMLElement): HTMLElement =>
        el.querySelector<HTMLElement>('.section-inner, .hero-inner, .contact-inner') ?? el;

      // ---- EDGE HANDOFF (the desktop edge rules, via overscroll) -----------
      // Cards contain their own scrolling (layout.css). A gesture that STARTS
      // mid-content must stop at the content edge (contain); only a gesture
      // that starts AT an edge and moves outward may chain to the pager
      // (auto). Outward needs the direction, so it's decided on the first
      // move of each gesture — before the boundary can be hit.
      const handoffCleanups = sectionElements().map((sec) => {
        const inner = innerOf(sec);
        let startY = 0;
        let startTop = true;
        let startBot = true;
        let decided = false;
        const onTs = (e: TouchEvent) => {
          startY = e.touches[0]?.clientY ?? 0;
          startTop = inner.scrollTop <= 1;
          startBot = inner.scrollTop >= inner.scrollHeight - inner.clientHeight - 1;
          decided = false;
          // no internal overflow → a pure page card; always hand off
          inner.style.overscrollBehaviorY = startTop && startBot ? 'auto' : 'contain';
        };
        const onTm = (e: TouchEvent) => {
          if (decided) return;
          decided = true;
          const dy = (e.touches[0]?.clientY ?? startY) - startY; // + = finger down = scroll up
          const outward = (startTop && dy > 0) || (startBot && dy < 0);
          if (outward) inner.style.overscrollBehaviorY = 'auto';
        };
        inner.addEventListener('touchstart', onTs, { passive: true });
        inner.addEventListener('touchmove', onTm, { passive: true });
        return () => {
          inner.removeEventListener('touchstart', onTs);
          inner.removeEventListener('touchmove', onTm);
        };
      });

      // Uniform card stops — each section's top inside the container. This is
      // the whole rest model now; no intermediate stops exist.
      const restsOf = (): number[] => sectionElements().map((el) => el.offsetTop);
      const nearestRest = (rests: number[], y: number): number => {
        let best = 0;
        for (let k = 1; k < rests.length; k++) {
          if (Math.abs(rests[k] - y) < Math.abs(rests[best] - y)) best = k;
        }
        return best;
      };

      // One-step-PER-GESTURE backstop. `committedIdx` is the last rest the
      // page settled on; `gestures` counts touchstarts since then, so two
      // quick flicks legitimately advance two rests (each gesture owns one
      // step) while a single mega-fling that WebKit lets overshoot gets one
      // corrective jump. `armed` gates the pull indicator to gesture time so
      // the snap's tiny arrival bounce can't flash the NEXT gap's label.
      let committedY = -1; // last settled rest POSITION (value, not index —
      // indices drift when content growth changes the rest list)
      let gestures = 0;
      let touching = false;
      let armed = false;
      let settleId = 0;
      const onSettle = () => {
        if (touching || 'snapJump' in root.dataset) return;
        const rests = restsOf();
        const arrived = nearestRest(rests, scrollerY());
        if (committedY >= 0 && gestures > 0) {
          const from = nearestRest(rests, committedY);
          const delta = arrived - from;
          if (Math.abs(delta) > gestures) {
            const target = from + Math.sign(delta) * gestures;
            committedY = rests[target];
            gestures = 0;
            armed = false;
            setPull('');
            nativeJumpTo(rests[target]);
            return;
          }
        }
        committedY = rests[arrived];
        gestures = 0;
        armed = false;
        setPull('');
      };
      const armSettle = () => {
        window.clearTimeout(settleId);
        settleId = window.setTimeout(onSettle, 140);
      };
      const onTouchStart = () => {
        touching = true;
        armed = true;
        window.clearTimeout(settleId);
        if (committedY < 0) {
          const rests = restsOf();
          committedY = rests[nearestRest(rests, scrollerY())];
        }
        gestures += 1;
      };
      const onTouchEnd = () => {
        touching = false;
        armSettle();
      };

      const onScroll = () => {
        if (!touching) armSettle();
        // Indicator only during a gesture (touch → settle) and never during a
        // nav jump — the snap's arrival bounce outside gesture time would
        // otherwise flash the next gap's label.
        if (!armed || 'snapJump' in root.dataset) {
          setPull('');
          return;
        }
        const list = sectionElements();
        if (!list.length) return;
        const tops = restsOf();
        const y = scrollerY();
        // Locate the card gap we're traversing.
        let i = 0;
        for (let k = 0; k < tops.length; k++) {
          if (tops[k] <= y + 1) i = k;
        }
        const lo = tops[i];
        const hi = i + 1 < tops.length ? tops[i + 1] : lo;
        const dist = hi - lo;
        const frac = dist > 8 ? (y - lo) / dist : 0;
        // Minimum progress filters out snap-arrival micro-bounces.
        if (frac < 0.06 || frac > 0.94) {
          setPull('');
          return;
        }
        // Direction comes from the live scroll direction (set by useReveal).
        if (root.dataset.scrolldir === 'up') {
          setPull('up', 1 - frac, list[i].dataset.screenLabel ?? '');
        } else {
          setPull('down', frac, list[i + 1]?.dataset.screenLabel ?? '');
        }
      };

      container.addEventListener('touchstart', onTouchStart, { passive: true });
      container.addEventListener('touchend', onTouchEnd, { passive: true });
      container.addEventListener('touchcancel', onTouchEnd, { passive: true });
      container.addEventListener('scroll', onScroll, { passive: true });

      return () => {
        handoffCleanups.forEach((off) => off());
        container.removeEventListener('touchstart', onTouchStart);
        container.removeEventListener('touchend', onTouchEnd);
        container.removeEventListener('touchcancel', onTouchEnd);
        container.removeEventListener('scroll', onScroll);
        window.clearTimeout(settleId);
        setPull('');
      };
    }

    // ---- WHEEL (trackpad / mouse) ------------------------------------------
    let lastT = 0;
    let lastAbsDy = 0;
    let gestureUsed = false; // a section change already fired in the current gesture
    let gestureClosed = false; // this gesture ran into a content edge → no pulling until it lifts
    let springId = 0;

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
      const cur = window.scrollY;
      const diff = wheelTarget - cur;
      if (Math.abs(diff) < 0.6) {
        window.scrollTo({ top: wheelTarget, behavior: 'instant' });
        wheelTarget = null;
        return;
      }
      const k = 1 - Math.exp(-dt / WHEEL_GLIDE_TAU);
      window.scrollTo({ top: cur + diff * k, behavior: 'instant' });
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
        window.scrollTo({ top: newY, behavior: 'instant' });
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

      // While a glide is playing, swallow input but DON'T re-judge the gesture —
      // resetting mid-glide would let one flick's momentum commit a second section.
      if (isScrollLocked()) {
        lastAbsDy = absRaw;
        return;
      }

      // A pause starts a fresh gesture (re-arms edge pulling); a mid-stream delta
      // spike only breaks a stale momentum lock so a new flick responds without
      // waiting the old one out — it must NOT re-arm a pull that already ran into
      // an edge this gesture, or one long swipe could cross two sections.
      if (gap > GESTURE_GAP) {
        gestureUsed = false;
        gestureClosed = false;
      } else if (absRaw > lastAbsDy + 16) {
        gestureUsed = false;
      }
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
      const y = window.scrollY;
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
        const newY = Math.min(nextRest, Math.max(restBot, eff + dy));
        const over = newY - restBot;
        const dist = nextRest - restBot;
        if (dist > 0 && over / dist >= COMMIT) {
          gestureUsed = true;
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
        // Rubber-band pull — eased exactly like the downward branch above.
        const prevRest = clampScroll(sectionSnapBottom(prev));
        const newY = Math.max(prevRest, Math.min(restTop, eff + dy));
        const over = restTop - newY;
        const dist = restTop - prevRest;
        if (dist > 0 && over / dist >= COMMIT) {
          gestureUsed = true;
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

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel);
      stopWheelGlide();
      window.clearTimeout(springId);
      setPull('');
    };
  }, []);
}
