import type { NavStyle } from '../../types/design';
import { NAV, type SectionId } from '../../config/navigation';
import { scrollToId } from '../../lib/scroll';
import { cx } from '../../lib/cx';
import { Icon } from '../ui/Icon';
import { useI18n } from '../../i18n';

interface SideNavProps {
  active: SectionId;
  navStyle: NavStyle;
  boxed: boolean;
}

/**
 * Fixed left section nav with scroll-spy highlighting + progress. The
 * progress fill height comes straight from the `--nav-progress` CSS variable
 * (written by useScrollSpy) — no per-scroll React re-render.
 */
export function SideNav({ active, navStyle, boxed }: SideNavProps) {
  const { t } = useI18n();

  return (
    <nav className={cx('sidenav', boxed && 'boxed')} data-style={navStyle} aria-label={t.navAria}>
      <div className="nav-progress">
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: 'var(--nav-progress, 0%)',
            background: 'var(--accent)',
            transition: 'height .1s linear',
          }}
        />
      </div>
      {NAV.map((n) => {
        const label = t.nav[n.id];
        return (
          <button
            key={n.id}
            className={cx('navitem', active === n.id && 'active')}
            onClick={() => scrollToId(n.id)}
            aria-current={active === n.id ? 'true' : undefined}
            aria-label={label}
          >
            <span className="ni-dot" />
            <span className="ni-icon">
              <Icon name={n.icon} />
            </span>
            <span className="lbl">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
