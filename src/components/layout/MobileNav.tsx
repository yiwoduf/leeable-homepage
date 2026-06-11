import { NAV, type SectionId } from '../../config/navigation';
import { scrollToId } from '../../lib/scroll';
import { cx } from '../../lib/cx';
import { Icon } from '../ui/Icon';

/** Bottom tab bar shown on small screens; always visible. */
export function MobileNav({ active }: { active: SectionId }) {
  return (
    <nav className="mobilenav" aria-label="Sections">
      {NAV.map((n) => (
        <button
          key={n.id}
          className={cx('mnav-item', active === n.id && 'active')}
          onClick={() => scrollToId(n.id)}
          aria-label={n.label}
          aria-current={active === n.id ? 'true' : undefined}
        >
          <Icon name={n.icon} />
        </button>
      ))}
    </nav>
  );
}
