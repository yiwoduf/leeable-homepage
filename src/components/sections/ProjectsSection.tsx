import type { Project } from '../../types/portfolio';
import { Section, Kicker, SectionTitle, Card, Chip, Icon } from '../ui';
import { cssVars } from '../../lib/cssVars';
import { useI18n } from '../../i18n';
import { renderRich } from '../../i18n/rich';

function ProjectCard({ project, index, soon }: { project: Project; index: number; soon: string }) {
  const style = cssVars({ '--d': `${index * 0.05}s` });
  const body = (
    <>
      <div className="proj-top">
        <span className="proj-no">{String(index + 1).padStart(2, '0')} /</span>
        {project.link ? (
          <span className="proj-link">
            <Icon name="github" />
          </span>
        ) : (
          <span className="proj-nolink">{soon}</span>
        )}
      </div>
      <div className="proj-name">{project.name}</div>
      <p className="proj-desc">{project.desc}</p>
      <div className="proj-stack">
        {project.stack.map((t) => (
          <Chip key={t}>{t}</Chip>
        ))}
      </div>
    </>
  );

  // Renders as a link when public, otherwise a plain card.
  return project.link ? (
    <Card href={project.link} target="_blank" rel="noopener" className="proj-card reveal" style={style}>
      {body}
    </Card>
  ) : (
    <Card className="proj-card reveal" style={style}>
      {body}
    </Card>
  );
}

export function ProjectsSection({ projects }: { projects: Project[] }) {
  const { t } = useI18n();
  const s = t.sections.projects;

  return (
    <Section id="projects" alt label={s.screenLabel}>
      <Kicker idx="04">{s.kicker}</Kicker>
      <SectionTitle>{renderRich(s.title)}</SectionTitle>
      <div className="proj-grid">
        {projects.map((p, i) => (
          <ProjectCard key={p.name} project={p} index={i} soon={s.soon} />
        ))}
      </div>
    </Section>
  );
}
