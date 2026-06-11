import { NAV } from '../config/navigation';

/**
 * Single source of truth for "which section am I on", shared by the pager
 * (useSectionSnap) and the reveal driver (useReveal) so they can't drift apart.
 */

/** The section elements, in nav order, currently mounted in the DOM. */
export function sectionElements(): HTMLElement[] {
  const els: HTMLElement[] = [];
  for (const { id } of NAV) {
    const el = document.getElementById(id);
    if (el) els.push(el);
  }
  return els;
}

/**
 * Index of the section that owns an absolute-Y document position. Sections stack
 * contiguously, so every Y belongs to exactly one; positions above the first or
 * below the last clamp to the ends.
 */
export function sectionIndexAt(list: HTMLElement[], y: number): number {
  for (let i = 0; i < list.length; i++) {
    const r = list[i].getBoundingClientRect();
    const top = r.top + window.scrollY;
    if (y >= top && y < top + r.height) return i;
  }
  const firstTop = list[0].getBoundingClientRect().top + window.scrollY;
  return y < firstTop ? 0 : list.length - 1;
}

/** Index of the section under the viewport centre — the one you're "on". */
export function activeSectionIndex(list: HTMLElement[] = sectionElements()): number {
  return sectionIndexAt(list, window.scrollY + window.innerHeight / 2);
}
