import type { ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { cssVars } from '../../lib/cssVars';

interface SectionTitleProps {
  children: ReactNode;
  /** Reveal stagger delay. */
  delay?: string;
  className?: string;
}

/** Large display heading used at the top of each content section. */
export function SectionTitle({ children, delay = '.06s', className }: SectionTitleProps) {
  return (
    <h2 className={cx('sec-title', 'reveal', className)} style={cssVars({ '--d': delay })}>
      {children}
    </h2>
  );
}
