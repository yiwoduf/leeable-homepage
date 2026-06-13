import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { Project } from '../../types/portfolio';
import { Section, Kicker, SectionTitle, Card, Chip, Icon } from '../ui';
import { PuzzleMark } from '../ui/PuzzleMark';
import { cssVars } from '../../lib/cssVars';
import { scrollContainer } from '../../lib/scroller';
import { useI18n } from '../../i18n';
import { renderRich } from '../../i18n/rich';

/**
 * WebKit (iPad Safari) workaround. After a rotation or returning from another
 * tab, Safari keeps the grid's CACHED row tracks instead of re-sizing them to
 * the reflowed content: cards render stretched to old taller tracks (tags
 * pinned to the bottom of a huge box) or clipped by old shorter ones — states
 * the spec doesn't allow for auto rows, i.e. an engine bug, not our CSS.
 *
 * The fix forces the grid through display:none and back within a single task,
 * which rebuilds the tracks from scratch. No visible flash: the browser never
 * paints mid-task. Touch devices only — desktop engines don't have the bug.
 */
function useStaleTrackKick(gridRef: RefObject<HTMLDivElement>): void {
  useEffect(() => {
    if (!window.matchMedia('(pointer: coarse)').matches) return;
    const grid = gridRef.current;
    if (!grid) return;

    const kick = () => {
      const prev = grid.style.display;
      grid.style.display = 'none';
      void grid.offsetHeight; // flush layout while hidden
      grid.style.display = prev;
    };

    // Returning from the GitHub tab: same-tab restore fires pageshow; a
    // backgrounded-but-alive page fires visibilitychange instead.
    const onVisible = () => {
      if (document.visibilityState === 'visible') kick();
    };
    window.addEventListener('pageshow', kick);
    document.addEventListener('visibilitychange', onVisible);

    // Rotation: the fixed scroll container's width only changes on real
    // viewport changes. Kick one frame later, after the new layout lands.
    const host = scrollContainer();
    let ro: ResizeObserver | null = null;
    if (host) {
      let lastW = host.clientWidth;
      ro = new ResizeObserver(() => {
        const w = host.clientWidth;
        if (w === 0 || w === lastW) return;
        lastW = w;
        requestAnimationFrame(kick);
      });
      ro.observe(host);
    }

    return () => {
      window.removeEventListener('pageshow', kick);
      document.removeEventListener('visibilitychange', onVisible);
      ro?.disconnect();
    };
  }, [gridRef]);
}

/**
 * Skeleton cells that square off the ragged last grid row. With 5 cards the
 * 4-column window needs 3 fillers and the 3-column window needs 1 — each cell
 * carries a per-slot class (`sk-0`…) so CSS breakpoints decide which are
 * shown. Always in the DOM, deliberately static: a measured (ResizeObserver +
 * state) filler count mutated the grid while the tab was hidden behind an
 * external link, which glitched WebKit's grid row heights on restore.
 */
const SKELETON_SLOTS = [0, 1, 2] as const;

function ProjectCard({ project, index, soon }: { project: Project; index: number; soon: string }) {
  const style = cssVars({ '--d': `${index * 0.05}s` });
  const body = (
    <>
      <div className="proj-top">
        <span className="proj-no">{String(index + 1).padStart(2, '0')} /</span>
        {project.link ? (
          // live products get the globe (it's a destination, not source code)
          <span className={project.live ? 'proj-link live' : 'proj-link'}>
            <Icon name={project.live ? 'globe' : 'github'} />
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
  const gridRef = useRef<HTMLDivElement>(null);
  useStaleTrackKick(gridRef);

  return (
    <Section id="projects" alt label={s.screenLabel}>
      <Kicker idx="04">{s.kicker}</Kicker>
      <SectionTitle>{renderRich(s.title)}</SectionTitle>
      <div className="proj-grid" ref={gridRef}>
        {projects.map((p, i) => (
          <ProjectCard key={p.name} project={p} index={i} soon={s.soon} />
        ))}
        {SKELETON_SLOTS.map((i) => (
          <div
            key={`filler-${i}`}
            className={`proj-card proj-skeleton sk-${i} reveal`}
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
