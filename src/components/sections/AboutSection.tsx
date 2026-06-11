import type { About } from '../../types/portfolio';
import { Section, Kicker, SectionTitle, Stat } from '../ui';
import { cssVars } from '../../lib/cssVars';

export function AboutSection({ about }: { about: About }) {
  return (
    <Section id="about" label="About">
      <Kicker idx="01">About</Kicker>
      <SectionTitle>
        From shipping software
        <br />
        to shipping <span className="kw">autonomy</span>.
      </SectionTitle>
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
