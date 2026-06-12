import type { AnchorHTMLAttributes } from 'react';
import { cx } from '../../lib/cx';
import { glowHandlers } from '../../lib/cardGlow';
import { Icon, type IconName } from './Icon';

interface IconButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  icon: IconName;
  /** Accessible label (also the title for assistive tech). */
  label: string;
  glow?: boolean;
  /** Also render the label as visible text (revealed in responsive layouts). */
  showLabel?: boolean;
}

/** Square icon link (e.g. hero social buttons). Pointer glow by default (no
 *  comet outline — too noisy at button scale); can reveal a text label. */
export function IconButton({ icon, label, glow = true, showLabel = false, className, ...rest }: IconButtonProps) {
  return (
    <a className={cx('iconbtn', glow && 'glow-p', className)} aria-label={label} {...(glow ? glowHandlers : {})} {...rest}>
      <Icon name={icon} />
      {showLabel && (
        <span className="iconbtn-label" aria-hidden="true">
          {label}
        </span>
      )}
    </a>
  );
}
