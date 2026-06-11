import type { Experience } from '../../types/portfolio';
import { Section, Kicker, SectionTitle, Chip } from '../ui';
import { cssVars } from '../../lib/cssVars';

export function ExperienceSection({ experience }: { experience: Experience[] }) {
  return (
    <Section id="experience" alt label="Experience">
      <Kicker idx="02">Experience</Kicker>
      <SectionTitle>
        Where I've <span className="kw">built</span>.
      </SectionTitle>
      <div className="timeline">
        <span className="tl-line reveal" aria-hidden="true" />
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
              {e.tags.map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
