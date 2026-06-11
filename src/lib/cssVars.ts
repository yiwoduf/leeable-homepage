import type { CSSProperties } from 'react';

/** CSS custom properties as a typed style object (e.g. reveal `--d` delay). */
export type CSSVars = Record<`--${string}`, string | number>;

/** Cast a bag of `--custom` properties to a React style object. */
export const cssVars = (vars: CSSVars): CSSProperties => vars as CSSProperties;
