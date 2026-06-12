import { useEffect } from 'react';
import { isScrollLocked } from '../lib/scrollController';
import { maxScrollY } from '../lib/viewport';
import { onScrollerScroll, scrollContainer, scrollerViewHeight, scrollerY } from '../lib/scroller';
import { sectionElements } from '../lib/sections';

/**
 * Reveal-on-scroll, per element, tracking what you're actually looking at — in
 * BOTH directions.
 *
 * An element is "revealed" exactly while it sits in the viewport's reveal band,
 * so scrolling down reveals a section's records top-to-bottom as they rise in,
 * and scrolling back up reveals them bottom-to-top (reverse stagger) because each
 * re-enters from the top edge. Leaving the viewport clears it again, so the
 * entrance always replays — there's no "already rendered" stale state when you
 * return to a section. (Desktop only — touch devices reveal once and keep it;
 * see the `replay` flag below.)
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
 *
 * A MutationObserver keeps the observed set live: React RECREATES `.reveal`
 * nodes when content swaps (language change) or a cascading re-render churns
 * the tree (theme change) — freshly-mounted nodes are observed immediately and
 * reconciled against the band, so they can never get stuck at opacity 0.
 */
const REVEAL_LINE = 0.88; // reveal once an element's top rises past this fraction of the viewport
const SETTLE_MS = 70;

export function useReveal(): void {
  useEffect(() => {
    const reveals = new Set<HTMLElement>(document.querySelectorAll<HTMLElement>('.reveal'));

    // Touch devices: reveal ONCE and keep it. The desktop "clear on exit so the
    // entrance replays" choreography strobes on a phone — a fast flick moves a
    // full viewport in ~300ms, so outgoing content un-reveals instantly while
    // incoming content is still mid-fade → whole-screen blackout flicker.
    // The band also moves to the viewport edge so a flick can't outrun it.
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const replay = !coarse;
    const line = coarse ? 0.97 : REVEAL_LINE;

    const inBand = (el: Element): boolean => {
      const r = el.getBoundingClientRect();
      // at the very bottom nothing can rise further, so the whole viewport counts
      const limit = scrollerViewHeight() * (scrollerY() >= maxScrollY() - 4 ? 1 : line);
      return r.top < limit && r.bottom > 0;
    };
    const setRevealed = (el: Element, on: boolean) => {
      if (!on && !replay) return; // reveal-once on touch — never strip it back
      el.toggleAttribute('data-revealed', on);
    };
    const reconcile = () =>
      reveals.forEach((el) => {
        if (!el.isConnected) {
          // React replaced the node — stop tracking the orphan.
          reveals.delete(el);
          io.unobserve(el);
          return;
        }
        setRevealed(el, inBand(el));
      });

    const io = new IntersectionObserver(
      (entries) => {
        if (isScrollLocked()) return; // defer glide-time toggles to settle
        for (const e of entries) setRevealed(e.target, e.isIntersecting);
      },
      { rootMargin: `0px 0px -${Math.round((1 - line) * 100)}% 0px` },
    );
    // Desktop only: live per-element toggles while you scroll. On touch the
    // native snap has no scroll lock to defer behind, so live toggles would
    // reveal elements one-by-one mid-flight and erase the arrival stagger.
    if (replay) reveals.forEach((el) => io.observe(el));

    // Touch: reveal each CARD's content as a group the moment the card is a
    // third visible — the stagger starts while the snap is still gliding in,
    // so arrival feels immediate (the settle reconcile below stays as a
    // safety net for anything this misses).
    let secIO: IntersectionObserver | null = null;
    if (!replay) {
      secIO = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            e.target
              .querySelectorAll<HTMLElement>('.reveal')
              .forEach((el) => el.toggleAttribute('data-revealed', true));
          }
        },
        { root: scrollContainer(), threshold: 0.34 },
      );
      sectionElements().forEach((sec) => secIO?.observe(sec));
    }

    // Track .reveal nodes mounted after this effect ran (content/theme swaps).
    const track = (el: HTMLElement) => {
      if (reveals.has(el)) return;
      reveals.add(el);
      if (replay) io.observe(el);
      setRevealed(el, inBand(el)); // already in the band → show right away
    };
    const mo = new MutationObserver((records) => {
      for (const rec of records) {
        for (const node of rec.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches('.reveal')) track(node);
          node.querySelectorAll<HTMLElement>('.reveal').forEach(track);
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // publish scroll direction so directional reveals (e.g. the timeline line)
    // can draw from the edge you're entering — bottom-up when scrolling up.
    const root = document.documentElement;
    let lastY = scrollerY();
    let settleId = 0;
    const onScroll = () => {
      const y = scrollerY();
      if (Math.abs(y - lastY) > 1) {
        root.dataset.scrolldir = y > lastY ? 'down' : 'up';
        lastY = y;
      }
      window.clearTimeout(settleId);
      settleId = window.setTimeout(reconcile, SETTLE_MS);
    };
    const offScroll = onScrollerScroll(onScroll);

    reconcile(); // first paint

    return () => {
      io.disconnect();
      secIO?.disconnect();
      mo.disconnect();
      offScroll();
      window.clearTimeout(settleId);
    };
  }, []);
}
