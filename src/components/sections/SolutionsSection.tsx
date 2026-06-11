import type { Solution } from '../../types/portfolio';
import { Section, Kicker, SectionTitle, SectionLead } from '../ui';
import { SolutionCard } from './SolutionCard';
import { useI18n } from '../../i18n';
import { renderRich } from '../../i18n/rich';

export function SolutionsSection({ solutions }: { solutions: Solution[] }) {
  const { t } = useI18n();
  const s = t.sections.solutions;

  return (
    <Section id="solutions" label={s.screenLabel}>
      <Kicker idx="03">{s.kicker}</Kicker>
      <SectionTitle>{renderRich(s.title)}</SectionTitle>
      <SectionLead>{s.lead}</SectionLead>
      <div className="sol-grid">
        {solutions.map((sol, i) => (
          <SolutionCard key={sol.codename} solution={sol} no={i + 1} />
        ))}
      </div>
    </Section>
  );
}
