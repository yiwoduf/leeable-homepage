import type { ReactNode } from 'react';
import { cx } from '../../lib/cx';

interface KickerProps {
  /** Two-digit section index, e.g. "01". */
  idx: string;
  /** Center the kicker (used by the contact section). */
  center?: boolean;
  children: ReactNode;
}

/** Section eyebrow: monospace index + label with a trailing rule. */
export function Kicker({ idx, center, children }: KickerProps) {
  return (
    <div className={cx('kicker', 'reveal', center && 'center')}>
      <span className="idx">{idx}</span> {children}
    </div>
  );
}
