import type { ReactElement, SVGProps } from 'react';

/**
 * Brand mark: two interlocking jigsaw pieces, tilted slightly for a diagonal
 * feel. The left piece carries the accent color; the right piece uses
 * `currentColor`, so it reads black in light mode and white in dark mode.
 *
 * Each edge is flat, a `tab` (knob bulging outward) or a `blank` (socket
 * bulging inward). The shared seam pairs the left tab with the right blank so
 * the pieces lock together. Outer corners are rounded; the two seam corners
 * stay sharp so the pieces meet flush with no gap.
 */
type Knob = 'flat' | 'tab' | 'blank';
type Point = readonly [number, number];

/** Half-width of a knob neck, how far the bulb reaches, and outer-corner radius. */
const NECK = 1.1;
const REACH = 1.0;
const CORNER = 1.5;

const fmt = (v: number): string => v.toFixed(2);

/**
 * Trace a closed piece from clockwise corners, per-edge knob types, and a
 * per-corner rounding flag (a sharp corner keeps the pieces flush at the seam).
 */
function buildPiece(
  corners: readonly Point[],
  knobs: readonly Knob[],
  rounded: readonly boolean[],
): string {
  const n = corners.length;
  const dirOf = (i: number): Point => {
    const a = corners[i];
    const b = corners[(i + 1) % n];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    return [dx / len, dy / len];
  };
  const r = Math.hypot(NECK, REACH);

  let d = '';
  for (let i = 0; i < n; i++) {
    const di = dirOf(i);
    const c0 = corners[i];
    const c1 = corners[(i + 1) % n];
    const inStart = rounded[i] ? CORNER : 0;
    const inEnd = rounded[(i + 1) % n] ? CORNER : 0;
    const sx = c0[0] + di[0] * inStart;
    const sy = c0[1] + di[1] * inStart;
    const ex = c1[0] - di[0] * inEnd;
    const ey = c1[1] - di[1] * inEnd;
    if (i === 0) d = `M ${fmt(sx)} ${fmt(sy)}`;

    const knob = knobs[i];
    if (knob === 'flat') {
      d += ` L ${fmt(ex)} ${fmt(ey)}`;
    } else {
      // Knob stays centred on the original edge midpoint, regardless of insets.
      const mx = (c0[0] + c1[0]) / 2;
      const my = (c0[1] + c1[1]) / 2;
      const ax = mx - di[0] * NECK;
      const ay = my - di[1] * NECK;
      const bx = mx + di[0] * NECK;
      const by = my + di[1] * NECK;
      const sweep = knob === 'tab' ? 1 : 0;
      d += ` L ${fmt(ax)} ${fmt(ay)} A ${fmt(r)} ${fmt(r)} 0 1 ${sweep} ${fmt(bx)} ${fmt(by)} L ${fmt(ex)} ${fmt(ey)}`;
    }

    if (rounded[(i + 1) % n]) {
      const dn = dirOf((i + 1) % n);
      const nx = c1[0] + dn[0] * CORNER;
      const ny = c1[1] + dn[1] * CORNER;
      d += ` A ${CORNER} ${CORNER} 0 0 1 ${fmt(nx)} ${fmt(ny)}`;
    }
  }
  return `${d} Z`;
}

// Left piece: tabs on top / seam / left, socket on the bottom. Outer corners
// (top-left, bottom-left) rounded; the two seam corners stay sharp.
const LEFT_PIECE = buildPiece(
  [[6, 11], [16, 11], [16, 21], [6, 21]],
  ['tab', 'tab', 'blank', 'tab'],
  [true, false, false, true],
);

// Right piece: socket on top, tabs on right / bottom, socket at the seam.
const RIGHT_PIECE = buildPiece(
  [[16, 11], [26, 11], [26, 21], [16, 21]],
  ['blank', 'tab', 'tab', 'blank'],
  [false, true, true, false],
);

export function PuzzleMark(props: SVGProps<SVGSVGElement>): ReactElement {
  return (
    <svg viewBox="2.88 8.54 26.24 14.92" fill="none" aria-hidden="true" {...props}>
      <g transform="rotate(-10 16 16)">
        <path d={LEFT_PIECE} fill="var(--accent)" />
        <path d={RIGHT_PIECE} fill="currentColor" />
      </g>
    </svg>
  );
}
