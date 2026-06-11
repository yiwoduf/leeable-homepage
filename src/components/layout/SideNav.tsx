import type { NavStyle } from '../../types/design';
import { NAV, type SectionId } from '../../config/navigation';
import { scrollToId } from '../../lib/scroll';
import { cx } from '../../lib/cx';
import { Icon } from '../ui/Icon';

interface SideNavProps {
  active: SectionId;
  /** Scroll progress 0–1 (drives the labels-mode progress bar). */
  progress: number;
  navStyle: NavStyle;
  boxed: boolean;
}

/** Fixed left section nav with scroll-spy highlighting + progress. */
export function SideNav({ active, progress, navStyle, boxed }: SideNavProps) {
  return (
    <nav className={cx('sidenav', boxed && 'boxed')} data-style={navStyle} aria-label="Sections">
      <div className="nav-progress">
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${progress * 100}%`,
            background: 'var(--accent)',
            transition: 'height .1s linear',
          }}
        />
      </div>
      {NAV.map((n) => (
        <button
          key={n.id}
          className={cx('navitem', active === n.id && 'active')}
          onClick={() => scrollToId(n.id)}
          aria-current={active === n.id ? 'true' : undefined}
          aria-label={n.label}
        >
          <span className="ni-dot" />
          <span className="ni-icon">
            <Icon name={n.icon} />
          </span>
          <span className="lbl">{n.label}</span>
        </button>
      ))}
    </nav>
  );
}
