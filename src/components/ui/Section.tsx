import type { ReactNode } from 'react';
import type { SectionId } from '../../config/navigation';
import { cx } from '../../lib/cx';

interface SectionProps {
  id: SectionId;
  /** Use the alternate background tone. */
  alt?: boolean;
  /** `data-screen-label` (design tooling / labeling). */
  label?: string;
  /** Extra classes on the `<section>` (e.g. 'contact'). */
  className?: string;
  /** Inner wrapper class — defaults to 'section-inner'. */
  innerClassName?: string;
  children: ReactNode;
}

/** Full-height section shell with a centered inner container. */
export function Section({
  id,
  alt,
  label,
  className,
  innerClassName = 'section-inner',
  children,
}: SectionProps) {
  return (
    <section id={id} className={cx('section', alt && 'alt', className)} data-screen-label={label}>
      <div className={innerClassName}>{children}</div>
    </section>
  );
}
