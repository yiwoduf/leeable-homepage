import type { About } from '../../types/portfolio';
import { Section, Kicker, SectionTitle, Stat } from '../ui';
import { cssVars } from '../../lib/cssVars';
import { useI18n } from '../../i18n';
import { renderRich } from '../../i18n/rich';

export function AboutSection({ about }: { about: About }) {
  const { t } = useI18n();
  const s = t.sections.about;

  return (
    <Section id="about" label={s.screenLabel}>
      <Kicker idx="01">{s.kicker}</Kicker>
      <SectionTitle>{renderRich(s.title)}</SectionTitle>
      <div className="about-grid">
        <div>
          <p className="about-lead reveal">{about.lead}</p>
          <p className="about-body reveal" style={cssVars({ '--d': '.06s' })}>
            {about.body}
          </p>
        </div>
        <div className="facts reveal" style={cssVars({ '--d': '.1s' })}>
          {about.facts.map((f) => (
            <div className="fact" key={f.k}>
              <span className="k">{f.k}</span>
              <span className="v">{f.v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="statgrid reveal" style={cssVars({ '--d': '.12s' })}>
        {about.stats.map((s) => (
          <Stat key={s.l} n={s.n} l={s.l} />
        ))}
      </div>
    </Section>
  );
}
