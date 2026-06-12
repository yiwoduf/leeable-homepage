import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { glowHandlers } from '../../lib/cardGlow';

type Variant = 'default' | 'primary';

interface CommonProps {
  variant?: Variant;
  /** Enable the pointer-reactive comet glow. */
  glow?: boolean;
  className?: string;
  children: ReactNode;
}

type AnchorProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type ButtonElProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

/** Anchor when given `href`, otherwise a `<button>`. */
export type ButtonProps = AnchorProps | ButtonElProps;

/** The site's primary call-to-action — outline, solid (`primary`), or glowing.
 *  `glow` is the pointer-following area only (`glow-p`) — the spinning comet
 *  outline read as visual noise on buttons and is reserved for surfaces. */
export function Button(props: ButtonProps) {
  const cls = cx('btn', props.variant === 'primary' && 'primary', props.glow && 'glow-p', props.className);
  const glow = props.glow ? glowHandlers : {};

  if (props.href !== undefined) {
    const { variant, glow: _glow, className, children, ...rest } = props;
    return (
      <a className={cls} {...glow} {...rest}>
        {children}
      </a>
    );
  }
  const { variant, glow: _glow, className, children, ...rest } = props;
  return (
    <button className={cls} {...glow} {...rest}>
      {children}
    </button>
  );
}
