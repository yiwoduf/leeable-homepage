import type { CSSProperties, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { cssVars } from '../../lib/cssVars';

interface SectionLeadProps {
  children: ReactNode;
  /** Reveal stagger delay. */
  delay?: string;
  className?: string;
  /** Extra inline style merged after the reveal delay var. */
  style?: CSSProperties;
}

/** Supporting paragraph under a section title. */
export function SectionLead({ children, delay = '.13s', className, style }: SectionLeadProps) {
  return (
    <p className={cx('sec-lead', 'reveal', className)} style={{ ...cssVars({ '--d': delay }), ...style }}>
      {children}
    </p>
  );
}
