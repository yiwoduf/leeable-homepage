import type { MouseEvent as ReactMouseEvent } from 'react';

/**
 * Pointer-reactive glow used by `.glow` / `.glow-p` surfaces (cards, buttons).
 * Tracks the cursor (`--mx`/`--my` for the radial glow) and aims the rotating
 * comet-border so its head lands at the cursor (`--angle`).
 */
export function handlePointerGlow(e: ReactMouseEvent<HTMLElement>): void {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;
  el.style.setProperty('--mx', `${x}px`);
  el.style.setProperty('--my', `${y}px`);
  const angle = (Math.atan2(y - r.height / 2, x - r.width / 2) * 180) / Math.PI + 90;
  el.style.setProperty('--angle', `${angle - 58}deg`); // land the comet head at the cursor
}

/** Resume the idle spin; the glow fades out in place. */
export function clearPointerGlow(e: ReactMouseEvent<HTMLElement>): void {
  e.currentTarget.style.removeProperty('--angle');
}

/** Convenience: spread onto any `.glow`/`.glow-p` element to wire both handlers. */
export const glowHandlers = {
  onMouseMove: handlePointerGlow,
  onMouseLeave: clearPointerGlow,
} as const;
