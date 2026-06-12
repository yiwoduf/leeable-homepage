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
      // Backgrounded-tab passes (e.g. returning from an external link on
      // iPad Safari) report zero sizes — keep the last good value instead of
      // recomputing fillers from a degenerate layout.
      if (!grid.clientWidth) return;

      // Column count from geometry: how many children share the first row's
      // offsetTop. Robust where parsing grid-template-columns is not — Safari
      // can return the specified repeat(auto-fit, …) text instead of the
      // resolved track list.
      const kids = Array.from(grid.children) as HTMLElement[];
      if (kids.length === 0) return;
      const firstTop = kids[0].offsetTop;
      let cols = 0;
      for (const kid of kids) {
        if (kid.offsetTop !== firstTop) break;
        cols += 1;
      }

      setFillers(cols > 1 ? (cols - (itemCount % cols)) % cols : 0);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(grid);

    // Safari restore paths (bfcache, returning from another tab) can skip the
    // resize pipeline entirely — re-measure after the page is shown again.
    const remeasure = () => requestAnimationFrame(measure);
    window.addEventListener('pageshow', remeasure);
    document.addEventListener('visibilitychange', remeasure);
    return () => {
      ro.disconnect();
      window.removeEventListener('pageshow', remeasure);
      document.removeEventListener('visibilitychange', remeasure);
    };
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
