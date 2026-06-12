import { useEffect, useRef } from 'react';
import { isScrollLocked, smoothScrollTo } from '../lib/scrollController';
import { sectionSnapTop } from '../lib/sectionMetrics';
import { clampScroll } from '../lib/viewport';
import { scrollContainer } from '../lib/scroller';

/**
 * Keep the snap aligned when a section's own height changes — e.g. a solution
 * card expanding/collapsing. On a collapse the content shrinks under the
 * unchanged scroll position, which can strand you between sections; once the
 * height settles we re-frame the section you're on. Growth (opening a card) is
 * left alone: the new content is right there below it, no jump wanted.
 *
 * Host-agnostic: watches whichever element actually scrolls (the document on
 * desktop, the fixed <main> container on touch devices).
 *
 * Window resizes are ignored here (useResizeRealign owns those on desktop;
 * on touch the container is viewport-fixed so resizes barely matter), so a
 * content collapse and a window resize don't both fire.
 */
export function useContentRealign(activeId: string): void {
  const ref = useRef(activeId);
  ref.current = activeId;

  useEffect(() => {
    const host = scrollContainer();
    const contentHeight = () =>
      host ? host.scrollHeight : document.documentElement.scrollHeight;

    let lastH = contentHeight();
    let lastW = window.innerWidth;
    let lastVH = window.innerHeight;
    let timer = 0;

    const ro = new ResizeObserver(() => {
      const h = contentHeight();
      const windowResized = window.innerWidth !== lastW || window.innerHeight !== lastVH;
      const shrank = h < lastH - 4;
      lastH = h;
      lastW = window.innerWidth;
      lastVH = window.innerHeight;
      if (windowResized || !shrank) return; // only re-frame on a content collapse

      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (isScrollLocked()) return;
        const el = document.getElementById(ref.current);
        if (el) smoothScrollTo(clampScroll(sectionSnapTop(el)));
      }, 150);
    });
    // The container's own box is viewport-fixed and never resizes — observe
    // its children (the sections) so content growth/collapse actually fires.
    const targets: Element[] = host ? Array.from(host.children) : [document.body];
    targets.forEach((t) => ro.observe(t));

    return () => {
      ro.disconnect();
      window.clearTimeout(timer);
    };
  }, []);
}
