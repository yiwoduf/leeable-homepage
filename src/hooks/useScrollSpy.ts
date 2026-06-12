import { useEffect, useState } from 'react';
import { NAV, type SectionId } from '../config/navigation';
import { onScrollerScroll, scrollerMaxY, scrollerViewHeight, scrollerY } from '../lib/scroller';

export interface ScrollSpyState {
  /** Id of the section currently under the scroll mark. */
  active: SectionId;
  /** Overall scroll progress, 0–1. */
  progress: number;
}

/** Tracks the active section and overall scroll progress for the nav. */
export function useScrollSpy(): ScrollSpyState {
  const [active, setActive] = useState<SectionId>('hero');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = scrollerMaxY();
      setProgress(h > 0 ? Math.min(1, scrollerY() / h) : 0);

      const mark = scrollerViewHeight() * 0.4;
      let cur: SectionId = NAV[0].id;
      NAV.forEach((n) => {
        const el = document.getElementById(n.id);
        if (el && el.getBoundingClientRect().top <= mark) cur = n.id;
      });
      setActive(cur);
    };

    const off = onScrollerScroll(onScroll);
    onScroll();
    return off;
  }, []);

  return { active, progress };
}
