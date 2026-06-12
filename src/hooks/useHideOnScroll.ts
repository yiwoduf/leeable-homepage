import { useEffect, useState } from 'react';
import { onScrollerScroll, scrollerViewHeight, scrollerY } from '../lib/scroller';

/**
 * Smart-header visibility: VISIBLE when scrolling UP (and always while the
 * hero section dominates the viewport), hidden when scrolling down — and
 * hidden again after `idleMs` of stillness following an upward reveal.
 *
 * @returns `true` when the element should be hidden.
 */
export function useHideOnScroll(idleMs = 600): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let timer = 0;
    let lastY = scrollerY();
    const onScroll = () => {
      const y = scrollerY();
      const dy = y - lastY;
      lastY = y;

      if (y < scrollerViewHeight() * 0.5) {
        // still on the hero (sections are viewport-tall) — always visible
        window.clearTimeout(timer);
        setHidden(false);
        return;
      }
      if (dy > 1) {
        // moving down → hide
        window.clearTimeout(timer);
        setHidden(true);
      } else if (dy < -1) {
        // moving up → show, then auto-hide once things go still
        setHidden(false);
        window.clearTimeout(timer);
        timer = window.setTimeout(() => setHidden(true), idleMs);
      }
    };
    const off = onScrollerScroll(onScroll);
    return () => {
      off();
      window.clearTimeout(timer);
    };
  }, [idleMs]);

  return hidden;
}
