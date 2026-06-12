import type { Project } from '../../types/portfolio';
import { Section, Kicker, SectionTitle, Card, Chip, Icon } from '../ui';
import { PuzzleMark } from '../ui/PuzzleMark';
import { cssVars } from '../../lib/cssVars';
import { useI18n } from '../../i18n';
import { renderRich } from '../../i18n/rich';

/**
 * Skeleton cells that square off the 3-column layout's ragged second row
 * (4 cards → 2 empty slots). Always in the DOM; CSS breakpoints decide
 * whether they're shown. Deliberately static: a measured (ResizeObserver +
 * state) filler count mutated the grid while the tab was hidden behind an
 * external link, which glitched WebKit's grid row heights on restore.
 */
const SKELETON_SLOTS = [0, 1] as const;

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
        {SKELETON_SLOTS.map((i) => (
          <div
            key={`filler-${i}`}
            className="proj-card proj-skeleton reveal"
            style={cssVars({ '--d': `${(projects.length + i) * 0.05}s` })}
            aria-hidden="true"
          >
            <PuzzleMark />
          </div>
        ))}
      </div>
    </Section>
  );
}
