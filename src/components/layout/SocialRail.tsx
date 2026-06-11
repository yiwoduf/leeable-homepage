import type { Identity } from '../../types/portfolio';
import { Icon } from '../ui/Icon';
import { useI18n } from '../../i18n';

/** Fixed right rail: GitHub / LinkedIn / Email / Résumé with hover tooltips. */
export function SocialRail({ identity }: { identity: Identity }) {
  const { t } = useI18n();

  return (
    <div className="socialrail">
      <a href={identity.github} target="_blank" rel="noopener" data-tip={t.social.github} aria-label={t.social.github}>
        <Icon name="github" />
      </a>
      <a href={identity.linkedin} target="_blank" rel="noopener" data-tip={t.social.linkedin} aria-label={t.social.linkedin}>
        <Icon name="linkedin" />
      </a>
      <a href={`mailto:${identity.email}`} data-tip={t.social.email} aria-label={t.social.email}>
        <Icon name="mail" />
      </a>
      <span className="vline" />
      <a href={identity.resume} target="_blank" rel="noopener" data-tip={t.social.resumePdf} aria-label={t.social.resume}>
        <Icon name="file" />
      </a>
    </div>
  );
}
