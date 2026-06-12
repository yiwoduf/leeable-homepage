import { smoothScrollTo } from './scrollController';
import { sectionSnapTop } from './sectionMetrics';
import { clampScroll } from './viewport';
import { scrollerTo } from './scroller';

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
  scrollerTo(clampScroll(sectionSnapTop(el)), 'instant');
}

/**
 * Nav jump-to-section: smooth-scroll via the shared controller (so the snap
 * engine doesn't hijack it mid-way) and land on the section's content — title in
 * view, body below — rather than its padded container edge. Used by the nav,
 * brand mark, and the hero's in-page links. Host-agnostic: the controller
 * animates whichever scroller is active (window or the touch container).
 */
export function scrollToId(id: string): void {
  if (id === 'hero') {
    smoothScrollTo(0);
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  smoothScrollTo(sectionSnapTop(el));
}
