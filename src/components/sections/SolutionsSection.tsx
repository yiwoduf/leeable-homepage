import type { Solution } from '../../types/portfolio';
import { Section, Kicker, SectionTitle, SectionLead } from '../ui';
import { SolutionCard } from './SolutionCard';

export function SolutionsSection({ solutions }: { solutions: Solution[] }) {
  return (
    <Section id="solutions" label="AI Solutions">
      <Kicker idx="03">AI Solutions</Kicker>
      <SectionTitle>
        Agents doing real <span className="kw">work</span>.
      </SectionTitle>
      <SectionLead>
        Autonomous systems I've designed and shipped to solve real-life problems — open a card to see the
        workflow and architecture.
      </SectionLead>
      <div className="sol-grid">
        {solutions.map((s, i) => (
          <SolutionCard key={s.codename} solution={s} no={i + 1} />
        ))}
      </div>
    </Section>
  );
}
