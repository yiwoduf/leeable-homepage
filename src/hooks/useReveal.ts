import { useEffect } from 'react';
import { isScrollLocked } from '../lib/scrollController';
import { maxScrollY } from '../lib/viewport';

/**
 * Reveal-on-scroll, per element, tracking what you're actually looking at — in
 * BOTH directions.
 *
 * An element is "revealed" exactly while it sits in the viewport's reveal band,
 * so scrolling down reveals a section's records top-to-bottom as they rise in,
 * and scrolling back up reveals them bottom-to-top (reverse stagger) because each
 * re-enters from the top edge. Leaving the viewport clears it again, so the
 * entrance always replays — there's no "already rendered" stale state when you
 * return to a section.
 *
 *   • io       — live-toggles each element as it crosses the band, EXCEPT during
 *     a programmatic snap glide (deferred to settle, so a section's stagger plays
 *     on arrival instead of flashing past mid-slide).
 *   • settle   — after scrolling stops (incl. a glide finishing) reconciles every
 *     element to its band state; this plays the on-arrival stagger, and reveals
 *     the whole viewport at max-scroll so a footer pinned in the bottom dead-zone
 *     still shows.
 *
 * State is a `data-revealed` ATTRIBUTE, not a class: React owns `className` and
 * rewrites it whenever a component's own classes change (e.g. an expanding
 * solution card toggling `open`), which would wipe an externally-added class.
 * React never touches attributes it didn't render, so the reveal survives.
 */
const REVEAL_LINE = 0.88; // reveal once an element's top rises past this fraction of the viewport
const SETTLE_MS = 70;

export function useReveal(): void {
  useEffect(() => {
    const reveals = [...document.querySelectorAll<HTMLElement>('.reveal')];
    if (!reveals.length) return;

    const inBand = (el: Element): boolean => {
      const r = el.getBoundingClientRect();
      // at the very bottom nothing can rise further, so the whole viewport counts
      const limit = window.innerHeight * (window.scrollY >= maxScrollY() - 4 ? 1 : REVEAL_LINE);
      return r.top < limit && r.bottom > 0;
    };
    const setRevealed = (el: Element, on: boolean) => el.toggleAttribute('data-revealed', on);
    const reconcile = () => reveals.forEach((el) => setRevealed(el, inBand(el)));

    const io = new IntersectionObserver(
      (entries) => {
        if (isScrollLocked()) return; // defer glide-time toggles to settle
        for (const e of entries) setRevealed(e.target, e.isIntersecting);
      },
      { rootMargin: `0px 0px -${Math.round((1 - REVEAL_LINE) * 100)}% 0px` },
    );
    reveals.forEach((el) => io.observe(el));

    // publish scroll direction so directional reveals (e.g. the timeline line)
    // can draw from the edge you're entering — bottom-up when scrolling up.
    const root = document.documentElement;
    let lastY = window.scrollY;
    let settleId = 0;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) > 1) {
        root.dataset.scrolldir = y > lastY ? 'down' : 'up';
        lastY = y;
      }
      window.clearTimeout(settleId);
      settleId = window.setTimeout(reconcile, SETTLE_MS);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    reconcile(); // first paint

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(settleId);
    };
  }, []);
}
