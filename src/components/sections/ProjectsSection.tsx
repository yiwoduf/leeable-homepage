import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { Project } from '../../types/portfolio';
import { Section, Kicker, SectionTitle, Card, Chip, Icon } from '../ui';
import { PuzzleMark } from '../ui/PuzzleMark';
import { cssVars } from '../../lib/cssVars';
import { useI18n } from '../../i18n';
import { renderRich } from '../../i18n/rich';

/**
 * Number of skeleton cards needed to square off the grid's last row. Measures
 * the rendered track count (auto-fit makes it width-dependent), so the value
 * tracks viewport resizes; single-column layouts never get fillers.
 */
function useGridFillers(itemCount: number): {
  gridRef: RefObject<HTMLDivElement>;
  fillers: number;
} {
  const gridRef = useRef<HTMLDivElement>(null);
  const [fillers, setFillers] = useState(0);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const measure = () => {
      // Resolved track list, e.g. "283px 283px 283px" — collapsed auto-fit
      // tracks report as 0px and don't count.
      const cols = getComputedStyle(grid)
        .gridTemplateColumns.split(' ')
        .filter((w) => w !== '0px').length;
      setFillers(cols > 1 ? (cols - (itemCount % cols)) % cols : 0);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(grid);
    return () => ro.disconnect();
  }, [itemCount]);

  return { gridRef, fillers };
}

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
  const { gridRef, fillers } = useGridFillers(projects.length);

  return (
    <Section id="projects" alt label={s.screenLabel}>
      <Kicker idx="04">{s.kicker}</Kicker>
      <SectionTitle>{renderRich(s.title)}</SectionTitle>
      <div className="proj-grid" ref={gridRef}>
        {projects.map((p, i) => (
          <ProjectCard key={p.name} project={p} index={i} soon={s.soon} />
        ))}
        {Array.from({ length: fillers }, (_, i) => (
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
