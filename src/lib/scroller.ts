/**
 * Scroll-host abstraction. Desktop scrolls the document; touch devices scroll
 * a fixed <main> container instead (see base.css) so the browser bar never
 * moves, CSS `vh` stays equal to the real viewport, and snap geometry is
 * pixel-exact (root-scroller snap is unreliable on iOS). Every scroll
 * consumer reads and writes through these helpers so both hosts behave
 * identically — on desktop they resolve to the window equivalents.
 *
 * The container is `position: fixed; inset: 0`, so viewport coordinates and
 * container coordinates coincide — `rect.top + scrollerY()` is the absolute
 * content position on both hosts.
 */

const isCoarse = (): boolean => window.matchMedia('(pointer: coarse)').matches;

/** The scrolling element on touch devices, or null when the window scrolls. */
export function scrollContainer(): HTMLElement | null {
  return isCoarse() ? document.querySelector('main') : null;
}

/** Current vertical scroll position of the active scroll host. */
export function scrollerY(): number {
  const c = scrollContainer();
  return c ? c.scrollTop : window.scrollY;
}

/** Visible height of the active scroll host (== viewport height). */
export function scrollerViewHeight(): number {
  const c = scrollContainer();
  return c ? c.clientHeight : window.innerHeight;
}

/** The furthest the active scroll host can scroll vertically. */
export function scrollerMaxY(): number {
  const c = scrollContainer();
  return c
    ? Math.max(0, c.scrollHeight - c.clientHeight)
    : Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

/** Scroll the active host to an absolute Y. */
export function scrollerTo(top: number, behavior: ScrollBehavior): void {
  const c = scrollContainer();
  if (c) c.scrollTo({ top, behavior });
  else window.scrollTo({ top, behavior });
}

/** Subscribe to the active host's scroll events; returns the unsubscriber. */
export function onScrollerScroll(fn: () => void): () => void {
  const target: EventTarget = scrollContainer() ?? window;
  target.addEventListener('scroll', fn, { passive: true });
  return () => target.removeEventListener('scroll', fn);
}
