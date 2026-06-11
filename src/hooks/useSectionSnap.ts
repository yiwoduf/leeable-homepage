import { useEffect } from 'react';
import { isScrollLocked, smoothScrollTo } from '../lib/scrollController';
import { sectionSnapTop, sectionSnapBottom } from '../lib/sectionMetrics';
import { sectionElements, activeSectionIndex } from '../lib/sections';
import { clampScroll } from '../lib/viewport';

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
 *   • pull past ~COMMIT of the way → it eases onto the next section
 *   • let go before that → it springs back to the edge you're on
 *
 * One gesture advances at most one section. On wheel, a burst commits once and is
 * then ignored until the wheel falls quiet for `GESTURE_GAP`; reaching an edge
 * mid-gesture "closes" it. On touch, one finger press-drag-release is the
 * gesture: drag scrolls / pulls, release commits or springs (a flick inside a
 * tall section coasts to its edge). Keyboard / reduced-motion stay native.
 */

const GESTURE_GAP = 80; // ms of wheel silence that ends one gesture / starts the next
const SPRING_DELAY = 320; // ms of stillness before an uncommitted wheel pull springs back
const COMMIT = 0.26; // fraction of the transition a WHEEL pull must cover before it advances
const PULL_CURVE = 0.5; // <1 front-loads the indicator so it shows early in the pull, not just near commit
const EDGE_EPS = 4; // px tolerance for "resting at a content edge"
const MIN_INTERNAL = 40; // sections with less internal scroll than this just pull (no dead slack)
const TOUCH_RESIST = 0.45; // how much the page follows the finger past an edge (rubber-band)
const NOTCH_DELTA = 60; // |deltaY| at/above which a wheel event is treated as a discrete notch
const WHEEL_GLIDE_EASE = 0.16; // per-frame approach factor for the notchy-wheel glide

export function useSectionSnap(): void {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const root = document.documentElement;
    const vh = () => window.innerHeight;
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

    const stopWheelGlide = () => {
      cancelAnimationFrame(wheelGlideId);
      wheelTarget = null;
    };

    const stepWheelGlide = () => {
      if (wheelTarget === null) return;
      if (isScrollLocked()) {
        // a section snap / nav glide took over — never fight it
        stopWheelGlide();
        return;
      }
      const cur = window.scrollY;
      const diff = wheelTarget - cur;
      if (Math.abs(diff) < 0.6) {
        window.scrollTo({ top: wheelTarget, behavior: 'instant' });
        wheelTarget = null;
        return;
      }
      window.scrollTo({ top: cur + diff * WHEEL_GLIDE_EASE, behavior: 'instant' });
      wheelGlideId = requestAnimationFrame(stepWheelGlide);
    };

    /** Move the section's internal scroll to `newY` — eased for notchy wheels. */
    const scrollInternal = (newY: number, base: number, notchy: boolean) => {
      if (newY === base) return;
      if (notchy) {
        wheelTarget = newY;
        cancelAnimationFrame(wheelGlideId);
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

    // ---- TOUCH (mobile) ----------------------------------------------------
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

    const onTouchStart = (e: TouchEvent) => {
      stopMomentum();
      stopWheelGlide(); // the finger takes over from any wheel glide
      // Ignore touch inside an overlay — also gates onTouchMove via tActive = false.
      const el = e.target instanceof Element ? e.target : null;
      if (el?.closest('[data-overlay]')) { tActive = false; return; }
      if (e.touches.length !== 1 || isScrollLocked()) {
        tActive = false;
        return;
      }
      const t = e.touches[0];
      tStartY = tLastY = t.clientY;
      tStartScroll = window.scrollY;
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
      if (el?.closest('[data-overlay]')) { tActive = false; setPull(''); return; }
      if (e.touches.length !== 1) {
        // a second finger (pinch) — bail out and let the browser handle it
        tActive = false;
        setPull('');
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
      e.preventDefault(); // own the scroll
      const raw = tStartScroll + drag;
      const commitPx = touchCommitPx();

      if (tMode === 'internal') {
        window.scrollTo({ top: Math.max(tRestTop, Math.min(tRestBot, raw)), behavior: 'instant' });
      } else if (tMode === 'pull-down') {
        const fingerOver = Math.max(0, raw - tRestBot);
        window.scrollTo({ top: tRestBot + Math.min(tNextRest - tRestBot, fingerOver * TOUCH_RESIST), behavior: 'instant' });
        tReady = fingerOver >= commitPx;
        setPull('down', fingerOver / commitPx, tNextLabel);
      } else if (tMode === 'pull-up') {
        const fingerOver = Math.max(0, tRestTop - raw);
        window.scrollTo({ top: tRestTop - Math.min(tRestTop - tPrevRest, fingerOver * TOUCH_RESIST), behavior: 'instant' });
        tReady = fingerOver >= commitPx;
        setPull('up', fingerOver / commitPx, tPrevLabel);
      }
    };

    const onTouchEnd = () => {
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
        // fling: coast with friction, bounded to the section (parks at its edges)
        let v = Math.max(-60, Math.min(60, tVel * 16)); // px/frame, capped
        if (Math.abs(v) < 0.6) return;
        const step = () => {
          const ny = Math.max(tRestTop, Math.min(tRestBot, window.scrollY + v));
          window.scrollTo({ top: ny, behavior: 'instant' });
          v *= 0.94;
          if (ny <= tRestTop || ny >= tRestBot || Math.abs(v) < 0.4) return;
          momentumId = requestAnimationFrame(step);
        };
        momentumId = requestAnimationFrame(step);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      stopMomentum();
      stopWheelGlide();
      window.clearTimeout(springId);
      setPull('');
    };
  }, []);
}
