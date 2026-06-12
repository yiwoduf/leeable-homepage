import { useEffect, useState } from 'react';
import { NAV, type SectionId } from '../config/navigation';
import { onScrollerScroll, scrollerMaxY, scrollerViewHeight, scrollerY } from '../lib/scroller';

export interface ScrollSpyState {
  /** Id of the section currently under the scroll mark. */
  active: SectionId;
}

/**
 * Tracks the active section for the nav. The continuous scroll PROGRESS is
 * deliberately NOT React state — it changes on every scrolled pixel, and a
 * setState per scroll event re-renders the whole app per frame during touch
 * drags and flings (visible jank on phones). Instead it's published as the
 * `--nav-progress` CSS variable on the root, which the nav's progress bar
 * consumes directly. Updates are rAF-coalesced: at most one DOM write and one
 * (rarely changing) setState per frame.
 */
export function useScrollSpy(): ScrollSpyState {
  const [active, setActive] = useState<SectionId>('hero');

  useEffect(() => {
    const root = document.documentElement;
    let rafId = 0;
    let queued = false;

    const measure = () => {
      queued = false;

      const h = scrollerMaxY();
      const progress = h > 0 ? Math.min(1, scrollerY() / h) : 0;
      root.style.setProperty('--nav-progress', `${(progress * 100).toFixed(2)}%`);

      const mark = scrollerViewHeight() * 0.4;
      let cur: SectionId = NAV[0].id;
      NAV.forEach((n) => {
        const el = document.getElementById(n.id);
        if (el && el.getBoundingClientRect().top <= mark) cur = n.id;
      });
      setActive((prev) => (prev === cur ? prev : cur));
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      rafId = requestAnimationFrame(measure);
    };

    const off = onScrollerScroll(onScroll);
    measure();
    return () => {
      off();
      cancelAnimationFrame(rafId);
    };
  }, []);

  return { active };
}
