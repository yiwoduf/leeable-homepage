/**
 * Single owner of programmatic vertical scrolling. The nav (jump-to-section) and
 * the section pager both animate through here, sharing one `locked` flag so they
 * never fight. `locked` is true only for the animation's duration — no momentum
 * tail, no input lock-out.
 */

import { clampScroll } from './viewport';

const ease = (p: number): number => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

let animating = false;
let animId = 0;

/** True while a programmatic scroll animation is running. */
export const isScrollLocked = (): boolean => animating;

/** Smoothly scroll to an absolute Y. */
export function smoothScrollTo(target: number): void {
  cancelAnimationFrame(animId);
  const start = window.scrollY;
  const dist = clampScroll(target) - start;
  if (Math.abs(dist) < 2) {
    animating = false;
    return;
  }
  animating = true;
  // softer, slower glide between sections
  const dur = Math.min(950, Math.max(560, Math.abs(dist) * 0.72));
  const t0 = performance.now();
  const frame = (now: number) => {
    const p = Math.min(1, (now - t0) / dur);
    window.scrollTo({ top: Math.round(start + dist * ease(p)), behavior: 'instant' });
    if (p < 1) animId = requestAnimationFrame(frame);
    else animating = false;
  };
  animId = requestAnimationFrame(frame);
}
