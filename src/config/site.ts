import type { SiteConfig } from '../types/design';

/**
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  SITE DESIGN CONFIG — edit here to restyle the whole site.           │
 * │  This is the single source of truth for every design choice.        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Every field is type-checked, so your editor will autocomplete the valid
 * options and flag typos. The two you'll likely touch most:
 *
 *   • accent  — any hex color. Curated options live in `ACCENTS_CLASSIC` /
 *               `ACCENTS_NEON` (see ./theme.ts), e.g. '#2A6FDB', '#FF6A00'.
 *   • hero3d  — the floating 3D object in the hero. One of:
 *               'puzzle' | 'rubik' | 'network' | 'crystal' | 'core'.
 */
export const siteConfig: SiteConfig = {
  /** 'dark' | 'light' — a returning visitor's saved choice wins over this. */
  defaultTheme: 'dark',

  /** Accent color (hex). See ACCENTS_CLASSIC / ACCENTS_NEON in ./theme.ts. */
  accent: '#FF6A00',

  /** 'modern' (Grotesk+Manrope) | 'plex' (IBM Plex) | 'editorial' (Sora+Albert). */
  fontPair: 'modern',

  /** Background field: 'grid' | 'dots' | 'glow' | 'plain'. */
  background: 'grid',

  /** Left section nav: 'icons' | 'labels' | 'dots'. */
  nav: 'icons',

  /** Draw a frosted panel behind the left nav. */
  navBoxed: false,

  /** Hero composition: 'split' (text left) | 'reverse' (text right) | 'center'. */
  heroLayout: 'split',

  /** Hero 3D object: 'puzzle' | 'rubik' | 'network' | 'crystal' | 'core'. */
  hero3d: 'puzzle',

  /** Motion intensity, 0 (still) – 10 (lively). Drives reveals + 3D speed. */
  motion: 4,
};

/** Motion as a 0–1 factor, consumed by the 3D engine and reveal tokens. */
export const motionFactor = siteConfig.motion / 10;
