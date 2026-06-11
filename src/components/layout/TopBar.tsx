import type { MouseEvent } from 'react';
import { scrollToId } from '../../lib/scroll';
import { cx } from '../../lib/cx';
import { Icon } from '../ui/Icon';

interface TopBarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  /** Slide the bar up off-screen (driven by useHideOnScroll). */
  hidden?: boolean;
}

/** Fixed top bar: brand mark + dark/light toggle. Hides while scrolling. */
export function TopBar({ isDark, onToggleTheme, hidden }: TopBarProps) {
  const goHome = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToId('hero');
  };

  return (
    <header className={cx('topbar', hidden && 'hidden')}>
      <a className="brand" href="#hero" onClick={goHome}>
        <span className="mark">L</span>
        <span>
          <b>leeable</b>
          <span className="dim">.dev</span>
        </span>
      </a>
      <button className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
        <Icon name={isDark ? 'sun' : 'moon'} /> {isDark ? 'Light' : 'Dark'}
      </button>
    </header>
  );
}
