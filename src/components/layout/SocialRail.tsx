import type { Identity } from '../../types/portfolio';
import { Icon } from '../ui/Icon';

/** Fixed right rail: GitHub / LinkedIn / Email / Résumé with hover tooltips. */
export function SocialRail({ identity }: { identity: Identity }) {
  return (
    <div className="socialrail">
      <a href={identity.github} target="_blank" rel="noopener" data-tip="GitHub" aria-label="GitHub">
        <Icon name="github" />
      </a>
      <a href={identity.linkedin} target="_blank" rel="noopener" data-tip="LinkedIn" aria-label="LinkedIn">
        <Icon name="linkedin" />
      </a>
      <a href={`mailto:${identity.email}`} data-tip="Email" aria-label="Email">
        <Icon name="mail" />
      </a>
      <span className="vline" />
      <a href={identity.resume} target="_blank" rel="noopener" data-tip="Résumé (PDF)" aria-label="Résumé">
        <Icon name="file" />
      </a>
    </div>
  );
}
