import { smoothScrollTo } from './scrollController';
import { sectionSnapTop } from './sectionMetrics';
import { clampScroll } from './viewport';
import { scrollContainer, scrollerY, scrollerTo } from './scroller';

/**
 * Instantly re-align the viewport onto a section's snap position. Used after a
 * window resize, where section positions shift (they're viewport-relative) but
 * the scroll position doesn't — leaving the viewport on a different section than
 * the nav highlight. Re-aligning keeps you on the section you were on.
 */
export function realignTo(id: string): void {
  if (id === 'hero') {
    scrollerTo(0, 'instant');
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  // Card model on touch: rests are the cards' own tops inside the container.
  const target = scrollContainer() ? el.offsetTop : clampScroll(sectionSnapTop(el));
  scrollerTo(target, 'instant');
}

/**
 * Nav jump-to-section: smooth-scroll via the shared controller (so the snap
 * engine doesn't hijack it mid-way) and land on the section's content — title in
 * view, body below — rather than its padded container edge. Used by the nav,
 * brand mark, and the hero's in-page links.
 *
 * Touch devices jump natively with snap suspended for the flight — see
 * `nativeJumpTo`.
 */
export function scrollToId(id: string): void {
  const el = id === 'hero' ? null : document.getElementById(id);
  if (id !== 'hero' && !el) return;

  if (scrollContainer()) {
    // Card model on touch: jump to the card's own top.
    nativeJumpTo(el ? el.offsetTop : 0);
    return;
  }
  smoothScrollTo(el ? sectionSnapTop(el) : 0);
}

/**
 * Touch-device jump: suspend CSS snap for the flight, scroll natively, then
 * re-engage snap on landing. With `scroll-snap-stop: always` active, iOS
 * aborts a native smooth scroll at the first snap position it passes — so
 * jumps further than one stop would never arrive without this. Also used by
 * the pager's one-step backstop (useSectionSnap) for corrective moves.
 */
export function nativeJumpTo(target: number): void {
  const root = document.documentElement;
  const host: EventTarget = scrollContainer() ?? window;
  root.dataset.snapJump = '';

  let settleId = 0;
  let failsafeId = 0;
  const done = () => {
    delete root.dataset.snapJump; // snap re-engages exactly at the rest we chose
    host.removeEventListener('scrollend', done);
    host.removeEventListener('touchstart', done);
    window.clearInterval(settleId);
    window.clearTimeout(failsafeId);
  };

  // Arrival detection: scrollend where supported, settle-polling as fallback,
  // and a hard failsafe. A touch mid-flight hands control back immediately.
  host.addEventListener('scrollend', done, { once: true });
  host.addEventListener('touchstart', done, { once: true, passive: true });
  let lastY = -1;
  let still = 0;
  settleId = window.setInterval(() => {
    const y = scrollerY();
    if (Math.abs(y - lastY) < 1) {
      still += 1;
      if (still >= 3) done();
    } else {
      still = 0;
    }
    lastY = y;
  }, 120);
  failsafeId = window.setTimeout(done, 1800);

  scrollerTo(target, 'smooth');
}
