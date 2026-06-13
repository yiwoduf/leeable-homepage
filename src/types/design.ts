/**
 * Design-system types — the finite sets of design choices the site supports.
 * Edit the live values in `src/config/site.ts`; these unions keep that file
 * honest (autocomplete + compile-time checks for valid options).
 */

/** The theme actually applied to the page (`<html data-theme>`). */
export type ThemeMode = 'dark' | 'light';
/** What the user chose in settings — `system` resolves to a ThemeMode at runtime. */
export type ThemePreference = ThemeMode | 'system';
export type FontPairKey = 'modern' | 'plex' | 'editorial';
export type BackgroundVariant = 'grid' | 'dots' | 'glow' | 'plain';
export type NavStyle = 'icons' | 'labels' | 'dots';
export type HeroLayout = 'split' | 'reverse' | 'center';
export type Hero3DVariant = 'puzzle' | 'rubik' | 'network' | 'crystal' | 'core';

/** A typographic pairing applied via CSS custom properties. */
export interface FontPair {
  display: string;
  body: string;
  mono: string;
  label: string;
}

/** Single source of truth for the site's design knobs. */
export interface SiteConfig {
  /** Theme the site loads with (a returning visitor's choice overrides this). */
  defaultTheme: ThemeMode;
  /** Accent color (hex). Drives links, highlights, the 3D object, etc. */
  accent: string;
  fontPair: FontPairKey;
  background: BackgroundVariant;
  nav: NavStyle;
  navBoxed: boolean;
  heroLayout: HeroLayout;
  hero3d: Hero3DVariant;
  /** Motion intensity, 0 (still) – 10 (lively). */
  motion: number;
}
