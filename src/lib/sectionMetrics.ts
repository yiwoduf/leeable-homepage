/**
 * Where a section should rest when snapped/navigated to. Targets the section's
 * *content* (`.section-inner` / `.contact-inner` / `.hero-inner`), not the padded
 * container edge — so the title sits nicely in view with the body below it,
 * regardless of how much breathing-room padding the section carries.
 *
 * Content that comfortably fits is centered; taller content lands with a little
 * breathing room above (snap-to-top) or below (snap-to-bottom).
 */

import { scrollerY, scrollerViewHeight } from './scroller';

const innerOf = (el: HTMLElement): HTMLElement =>
  (el.querySelector('.section-inner, .contact-inner, .hero-inner') as HTMLElement | null) ?? el;

/** Breathing room above/below the content when it's taller than the viewport. */
const breathing = () => Math.round(scrollerViewHeight() * 0.12);

/** Land the section's content near the top (centered if it fits). */
export function sectionSnapTop(el: HTMLElement): number {
  const r = innerOf(el).getBoundingClientRect();
  const top = r.top + scrollerY();
  const v = scrollerViewHeight();
  const pad = breathing();
  if (r.height <= v - pad * 2) return Math.round(top - (v - r.height) / 2);
  return Math.round(top - pad);
}

/** Land the section's content near the bottom (centered if it fits). */
export function sectionSnapBottom(el: HTMLElement): number {
  const r = innerOf(el).getBoundingClientRect();
  const top = r.top + scrollerY();
  const v = scrollerViewHeight();
  const pad = breathing();
  if (r.height <= v - pad * 2) return Math.round(top - (v - r.height) / 2);
  return Math.round(top + r.height - v + pad);
}
