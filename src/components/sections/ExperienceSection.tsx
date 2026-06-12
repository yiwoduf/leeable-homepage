import type { Experience } from '../../types/portfolio';
import { Section, Kicker, SectionTitle, Chip } from '../ui';
import { cssVars } from '../../lib/cssVars';
import { useI18n } from '../../i18n';
import { renderRich } from '../../i18n/rich';

export function ExperienceSection({ experience }: { experience: Experience[] }) {
  const { t } = useI18n();
  const s = t.sections.experience;

  return (
    <Section id="experience" alt label={s.screenLabel}>
      <Kicker idx="02">{s.kicker}</Kicker>
      <SectionTitle>{renderRich(s.title)}</SectionTitle>
      <div className="timeline">
        {/* outer span = reveal sensor (never clipped, so the observer sees a
            stable box); inner span = the actual line, drawn via clip-path */}
        <span className="tl-line reveal" aria-hidden="true">
          <span className="tl-line-draw" />
        </span>
        {experience.map((e, i) => (
          <div className="tl-item reveal" key={`${e.role}-${e.period}`} style={cssVars({ '--d': `${i * 0.08}s` })}>
            <span className="tl-dot" />
            {e.now && <span className="tl-now" />}
            <div className="tl-head">
              <div className="tl-role">
                {e.role}
                {e.sub && <span className="tl-sub">{e.sub}</span>}
              </div>
              <span className="tl-period">{e.period}</span>
            </div>
            <div className="tl-org">{e.org}</div>
            <ul className="tl-points">
              {e.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <div className="tl-tags">
              {e.tags.map((tag) => (
                <Chip key={tag}>{tag}</Chip>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
