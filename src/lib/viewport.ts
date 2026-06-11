/** Vertical-scroll geometry helpers, shared by every scroll consumer. */

/** The furthest the document can scroll vertically. */
export const maxScrollY = (): number =>
  Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

/** Clamp an absolute Y into the scrollable range, rounded to a whole pixel. */
export const clampScroll = (y: number): number => Math.max(0, Math.min(maxScrollY(), Math.round(y)));
