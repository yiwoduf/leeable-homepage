/** Vertical-scroll geometry helpers, shared by every scroll consumer. */

import { scrollerMaxY } from './scroller';

/** The furthest the active scroll host can scroll vertically. */
export const maxScrollY = (): number => scrollerMaxY();

/** Clamp an absolute Y into the scrollable range, rounded to a whole pixel. */
export const clampScroll = (y: number): number => Math.max(0, Math.min(maxScrollY(), Math.round(y)));
