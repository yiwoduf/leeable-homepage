import type { MouseEvent } from 'react';
import { scrollToId } from '../../lib/scroll';
import { cx } from '../../lib/cx';
import { Icon } from '../ui/Icon';
import { PuzzleMark } from '../ui/PuzzleMark';
import { useI18n } from '../../i18n';

interface TopBarProps {
  /** Slide the bar up off-screen (driven by useHideOnScroll). */
  hidden?: boolean;
  onOpenSettings: () => void;
}

/** Fixed top bar: brand mark + settings gear. Hides while scrolling. */
export function TopBar({ hidden, onOpenSettings }: TopBarProps) {
  const { t } = useI18n();

  const goHome = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToId('hero');
  };

  return (
    <header className={cx('topbar', hidden && 'hidden')}>
      <a className="brand" href="#hero" onClick={goHome}>
        <span className="mark"><PuzzleMark /></span>
        <span>
          <b>leeable</b>
          <span className="dim">.dev</span>
        </span>
      </a>
      <button
        className="settings-toggle"
        onClick={onOpenSettings}
        aria-label={t.topbar.settingsAria}
      >
        <Icon name="gear" />
      </button>
    </header>
  );
}
