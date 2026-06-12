import { useEffect, useState } from 'react';
import { onScrollerScroll, scrollerViewHeight, scrollerY } from '../lib/scroller';

/** Pointer band (px from the top edge) that summons the header on hover. */
const HOVER_REVEAL_ZONE = 80;

/**
 * Smart-header visibility: VISIBLE when scrolling UP (and always while the
 * hero section dominates the viewport), hidden when scrolling down — and
 * hidden again after `idleMs` of stillness following an upward reveal.
 * On hover-capable devices, parking the pointer along the top edge also
 * summons the header — no upward scroll required.
 *
 * @returns `true` when the element should be hidden.
 */
export function useHideOnScroll(idleMs = 600): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let timer = 0;
    let lastY = scrollerY();
    let inZone = false; // pointer parked in the top band → header pinned
    const onScroll = () => {
      const y = scrollerY();
      const dy = y - lastY;
      lastY = y;

      if (y < scrollerViewHeight() * 0.5 || inZone) {
        // still on the hero (sections are viewport-tall) or the pointer is
        // in the summon band — always visible
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

    // Hover-to-summon: entering the top band shows the header and pins it;
    // leaving re-arms the idle hide (only when scrolled past the hero, where
    // the header isn't pinned anyway). Zone-edge tracking keeps this to one
    // state change per crossing instead of work on every mousemove.
    const hoverable = window.matchMedia('(hover: hover)').matches;
    const onMouseMove = (e: MouseEvent) => {
      const entering = e.clientY <= HOVER_REVEAL_ZONE;
      if (entering === inZone) return;
      inZone = entering;
      if (entering) {
        window.clearTimeout(timer);
        setHidden(false);
      } else if (scrollerY() >= scrollerViewHeight() * 0.5) {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => setHidden(true), idleMs);
      }
    };
    if (hoverable) window.addEventListener('mousemove', onMouseMove, { passive: true });

    return () => {
      off();
      if (hoverable) window.removeEventListener('mousemove', onMouseMove);
      window.clearTimeout(timer);
    };
  }, [idleMs]);

  return hidden;
}
