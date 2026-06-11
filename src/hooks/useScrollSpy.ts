import { useEffect, useState } from 'react';
import { NAV, type SectionId } from '../config/navigation';

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
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(1, window.scrollY / h) : 0);

      const mark = window.innerHeight * 0.4;
      let cur: SectionId = NAV[0].id;
      NAV.forEach((n) => {
        const el = document.getElementById(n.id);
        if (el && el.getBoundingClientRect().top <= mark) cur = n.id;
      });
      setActive(cur);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return { active, progress };
}
