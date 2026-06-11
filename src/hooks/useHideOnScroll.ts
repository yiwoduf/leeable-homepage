import { useEffect, useState } from 'react';

/**
 * Hide a fixed element while scrolling, reveal it once scrolling has paused for
 * `idleMs`. Always revealed at the very top of the page.
 *
 * @returns `true` when the element should be hidden.
 */
export function useHideOnScroll(idleMs = 600): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let timer = 0;
    const onScroll = () => {
      if (window.scrollY < 8) {
        window.clearTimeout(timer);
        setHidden(false);
        return;
      }
      setHidden(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setHidden(false), idleMs);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(timer);
    };
  }, [idleMs]);

  return hidden;
}
