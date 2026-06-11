import type { ReactElement } from 'react';

/**
 * Skills with no Simple Icons brand mark get a hand-drawn inline SVG here
 * (monoline, `currentColor`, matching the UI icon style). Rendered locally —
 * no network fetch. Swap these freely if a real brand mark turns up.
 */
export const CUSTOM_SKILL_ICONS: Record<string, ReactElement> = {
  // OpenClaw — a stylized mechanical claw/grabber.
  OpenClaw: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="4" r="1.4" />
      <path d="M12 5.4V10" />
      <path d="M12 10c0 4-1.7 7-4.6 9" />
      <path d="M12 10c0 4 1.7 7 4.6 9" />
      <path d="M12 10v9" />
    </svg>
  ),
};
