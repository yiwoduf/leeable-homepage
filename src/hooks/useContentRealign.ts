import { useEffect, useRef } from 'react';
import { isScrollLocked, smoothScrollTo } from '../lib/scrollController';
import { sectionSnapTop } from '../lib/sectionMetrics';
import { clampScroll } from '../lib/viewport';

/**
 * Keep the snap aligned when a section's own height changes — e.g. a solution
 * card expanding/collapsing. On a collapse the document shrinks under the
 * unchanged scroll position, which can strand you between sections; once the
 * height settles we re-frame the section you're on. Growth (opening a card) is
 * left alone: the new content is right there below it, no jump wanted.
 *
 * Window resizes are ignored here (useResizeRealign owns those), so a content
 * collapse and a window resize don't both fire.
 */
export function useContentRealign(activeId: string): void {
  const ref = useRef(activeId);
  ref.current = activeId;

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return; // desktop snap only

    let lastH = document.documentElement.scrollHeight;
    let lastW = window.innerWidth;
    let lastVH = window.innerHeight;
    let timer = 0;

    const ro = new ResizeObserver(() => {
      const h = document.documentElement.scrollHeight;
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
    ro.observe(document.body);

    return () => {
      ro.disconnect();
      window.clearTimeout(timer);
    };
  }, []);
}
