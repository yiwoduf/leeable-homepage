import { useEffect, useRef } from 'react';
import { realignTo } from '../lib/scroll';

/**
 * After a window resize, re-align the viewport onto the section you were on.
 * Sections are viewport-relative, so a resize shifts them under the (unchanged)
 * scroll position — which otherwise leaves the viewport on a different section
 * than the nav highlight. We capture the pre-resize section via a ref and snap
 * back to it once the resize settles (which then refreshes the highlight).
 */
export function useResizeRealign(activeId: string): void {
  const ref = useRef(activeId);
  ref.current = activeId;

  useEffect(() => {
    // desktop only — on touch, "resize" fires from the URL bar showing/hiding
    // during scroll, which would cause unwanted jumps.
    if (window.matchMedia('(pointer: coarse)').matches) return;
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => realignTo(ref.current), 140);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.clearTimeout(timer);
    };
  }, []);
}
