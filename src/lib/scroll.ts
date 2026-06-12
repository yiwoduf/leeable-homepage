import { smoothScrollTo } from './scrollController';
import { sectionSnapTop } from './sectionMetrics';
import { clampScroll } from './viewport';

/**
 * Instantly re-align the viewport onto a section's snap position. Used after a
 * window resize, where section positions shift (they're viewport-relative) but
 * the scroll position doesn't — leaving the viewport on a different section than
 * the nav highlight. Re-aligning keeps you on the section you were on.
 */
export function realignTo(id: string): void {
  if (id === 'hero') {
    window.scrollTo({ top: 0, behavior: 'instant' });
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({ top: clampScroll(sectionSnapTop(el)), behavior: 'instant' });
}

/**
 * Nav jump-to-section: smooth-scroll via the shared controller (so the snap
 * engine doesn't hijack it mid-way) and land on the section's content — title in
 * view, body below — rather than its padded container edge. Used by the nav,
 * brand mark, and the hero's in-page links.
 *
 * Touch devices use the browser's NATIVE smooth scroll instead: the page has
 * CSS `scroll-snap-type: y mandatory` there, and iOS re-snaps mid-flight
 * against a JS-driven rAF animation (flicker, then it springs back). Native
 * smooth scrolling cooperates with snap and settles on the snap position.
 */
export function scrollToId(id: string): void {
  const target = id === 'hero' ? 0 : (() => {
    const el = document.getElementById(id);
    return el ? sectionSnapTop(el) : null;
  })();
  if (target === null) return;

  if (window.matchMedia('(pointer: coarse)').matches) {
    window.scrollTo({ top: clampScroll(target), behavior: 'smooth' });
    return;
  }
  smoothScrollTo(target);
}
