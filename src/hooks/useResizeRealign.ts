import { useEffect, useRef } from 'react';
import { realignTo } from '../lib/scroll';
import { scrollContainer } from '../lib/scroller';

/**
 * After the viewport changes size, re-align the scroll position onto the
 * section you were on. Sections are viewport-relative, so a size change
 * shifts them under the (unchanged) scroll offset — otherwise a rotation
 * leaves you looking at a different section than the nav highlight.
 *
 * The two hosts listen differently on purpose:
 * - Desktop: debounced window `resize`.
 * - Touch: a ResizeObserver on the fixed scroll container. Its box only
 *   changes on REAL viewport changes (rotation, split view) — never from the
 *   browser bar, since html/body are overflow:hidden in the touch model — so
 *   this cannot cause the mid-scroll jumps that window resize listeners do
 *   on phones. Zero-size passes (hidden tab) are ignored.
 */
export function useResizeRealign(activeId: string): void {
  const ref = useRef(activeId);
  ref.current = activeId;

  useEffect(() => {
    let timer = 0;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => realignTo(ref.current), 140);
    };

    const host = scrollContainer();
    if (host) {
      let lastW = host.clientWidth;
      let lastH = host.clientHeight;
      const ro = new ResizeObserver(() => {
        const w = host.clientWidth;
        const h = host.clientHeight;
        if (w === 0 || h === 0) return; // backgrounded tab — not a resize
        if (w === lastW && h === lastH) return;
        lastW = w;
        lastH = h;
        schedule();
      });
      ro.observe(host);
      return () => {
        ro.disconnect();
        window.clearTimeout(timer);
      };
    }

    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('resize', schedule);
      window.clearTimeout(timer);
    };
  }, []);
}
