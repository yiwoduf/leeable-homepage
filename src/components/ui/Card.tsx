import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { glowHandlers } from '../../lib/cardGlow';

type GlowVariant = 'glow' | 'glow-p';

interface CommonProps {
  /** Which glow treatment: spinning comet border ('glow') or pointer glow only ('glow-p'). */
  glow?: GlowVariant;
  className?: string;
  children?: ReactNode;
}

type DivCard = CommonProps & HTMLAttributes<HTMLDivElement> & { href?: undefined };
type AnchorCard = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/** Anchor when given `href`, otherwise a `<div>`. */
export type CardProps = DivCard | AnchorCard;

/** Glowing surface primitive — the base for project/solution/stat cards. */
export function Card(props: CardProps) {
  const cls = cx(props.className, props.glow ?? 'glow');

  if (props.href !== undefined) {
    const { glow, className, children, ...rest } = props;
    return (
      <a className={cls} {...glowHandlers} {...rest}>
        {children}
      </a>
    );
  }
  const { glow, className, children, ...rest } = props;
  return (
    <div className={cls} {...glowHandlers} {...rest}>
      {children}
    </div>
  );
}
