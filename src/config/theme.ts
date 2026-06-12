import type { FontPair, FontPairKey } from '../types/design';
import { siteConfig } from './site';

/**
 * Typographic pairings selectable via `siteConfig.fontPair`.
 * "Pretendard Variable" is inserted before the generic fallback in every stack
 * so Hangul glyphs fall through to Pretendard while Latin glyphs stay with the
 * primary font (per-glyph Unicode-range fallback handled by the browser).
 */
export const FONT_PAIRS: Record<FontPairKey, FontPair> = {
  modern: {
    display: '"Space Grotesk", "Pretendard Variable", system-ui, sans-serif',
    body: '"Manrope", "Pretendard Variable", system-ui, sans-serif',
    mono: '"JetBrains Mono", "Pretendard Variable", ui-monospace, monospace',
    label: 'Grotesk',
  },
  plex: {
    display: '"IBM Plex Sans", "Pretendard Variable", system-ui, sans-serif',
    body: '"IBM Plex Sans", "Pretendard Variable", system-ui, sans-serif',
    mono: '"IBM Plex Mono", "Pretendard Variable", ui-monospace, monospace',
    label: 'Plex',
  },
  editorial: {
    display: '"Sora", "Pretendard Variable", system-ui, sans-serif',
    body: '"Albert Sans", "Pretendard Variable", system-ui, sans-serif',
    mono: '"Space Mono", "Pretendard Variable", ui-monospace, monospace',
    label: 'Sora',
  },
};

/** Curated accent options — set `siteConfig.accent` to any of these (or your own hex). */
export const ACCENTS_CLASSIC = ['#2A6FDB', '#FF5A1F', '#10B981', '#7C5CFF', '#E5484D'] as const;
export const ACCENTS_NEON = ['#FF6A00', '#39FF14', '#00E5FF', '#C026FF', '#FF2D78'] as const;

/**
 * Apply the static, non-theme design tokens (accent, fonts, motion-derived
 * reveal timing) to the document root. Run once at startup; the dark/light
 * token swap is handled separately by `useTheme`.
 */
export function applyDesignTokens(root: HTMLElement = document.documentElement): void {
  root.style.setProperty('--accent', siteConfig.accent);

  const fp = FONT_PAIRS[siteConfig.fontPair] ?? FONT_PAIRS.modern;
  root.style.setProperty('--font-display', fp.display);
  root.style.setProperty('--font-body', fp.body);
  root.style.setProperty('--font-mono', fp.mono);

  const m = siteConfig.motion / 10;
  // Touch devices get a tighter, faster reveal — card swipes land quickly and
  // the full desktop stagger duration reads as lag on a phone.
  const scale = window.matchMedia('(pointer: coarse)').matches ? 0.55 : 1;
  root.style.setProperty('--reveal-shift', `${(8 + m * 34) * scale}px`);
  root.style.setProperty('--reveal-dur', `${((0.42 + m * 0.5) * scale).toFixed(3)}s`);
}
