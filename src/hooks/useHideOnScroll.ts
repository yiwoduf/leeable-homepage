import { useEffect, useState } from 'react';
import { onScrollerScroll, scrollerY } from '../lib/scroller';

/**
 * Chrome visibility driver: VISIBLE while scrolling (and always at the very
 * top of the page), hidden again once scrolling has been idle for `idleMs`.
 *
 * @returns `true` when the element should be hidden.
 */
export function useHideOnScroll(idleMs = 600): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let timer = 0;
    const onScroll = () => {
      setHidden(false); // activity → show
      window.clearTimeout(timer);
      if (scrollerY() < 8) return; // pinned at the top — stay visible
      timer = window.setTimeout(() => setHidden(true), idleMs);
    };
    const off = onScrollerScroll(onScroll);
    onScroll();
    return () => {
      off();
      window.clearTimeout(timer);
    };
  }, [idleMs]);

  return hidden;
}
