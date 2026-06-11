import type { ReactNode } from 'react';
import { cx } from '../../lib/cx';

/** Small monospace tag used for tech stacks and labels. */
export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx('chip', className)}>{children}</span>;
}
