import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Solution } from '../../types/portfolio';
import { Icon } from '../ui/Icon';
import { cx } from '../../lib/cx';
import { cssVars } from '../../lib/cssVars';
import { glowHandlers } from '../../lib/cardGlow';
import { useI18n } from '../../i18n';

interface SolutionCardProps {
  solution: Solution;
  /** 1-based card index. */
  no: number;
}

export function SolutionCard({ solution, no }: SolutionCardProps) {
  const { t } = useI18n();
  const sc = t.solutionCard;
  const [open, setOpen] = useState(false);
  const [armed, setArmed] = useState(false); // gate the height transition until first interaction
  const innerRef = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);

  // Animate the body open/closed by measuring its natural height.
  useEffect(() => {
    const measure = () => setH(open && innerRef.current ? innerRef.current.scrollHeight : 0);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [open]);

  const bodyStyle: CSSProperties = { height: h, ...(armed ? {} : { transition: 'none' }) };

  return (
    <div
      className={cx('sol-card', 'glow', 'reveal', open && 'open', armed && 'armed')}
      style={cssVars({ '--d': `${(no - 1) * 0.1}s` })}
      {...glowHandlers}
    >
      <button
        className="sol-head"
        onClick={() => {
          setArmed(true);
          setOpen((o) => !o);
        }}
        aria-expanded={open}
      >
        <span className="sol-no">{String(no).padStart(2, '0')}</span>
        <span className="sol-headmain">
          <span className="sol-title">
            {solution.title}
            <span className="sol-code">/ {solution.codename}</span>
          </span>
          <span className="sol-blurb">{solution.blurb}</span>
        </span>
        <span className={cx('sol-status', solution.status)}>
          {solution.status === 'live' ? sc.live : sc.inProgress}
        </span>
        <span className="sol-toggle" aria-hidden="true">
          <Icon name="chevron" />
        </span>
      </button>
      <div className="sol-body" style={bodyStyle}>
        <div className="sol-bodyinner" ref={innerRef}>
          <div className="sol-cols">
            <div>
              <div className="sol-section-l">{sc.problem}</div>
              <p className="sol-text">{solution.problem}</p>
            </div>
            <div className={cx(solution.status !== 'live' && 'sol-planned')}>
              <div className="sol-section-l">
                {sc.solution}
                {solution.status !== 'live' && (
                  <span className="sol-planned-tag">{sc.inProgress}</span>
                )}
              </div>
              <p className="sol-text">{solution.solution}</p>
            </div>
          </div>
          <div>
            <div className="sol-section-l">{sc.role}</div>
            <p className="sol-text sol-role">{solution.role}</p>
          </div>
          <div>
            <div className="sol-section-l">{sc.system}</div>
            <div className="flow">
              {solution.flow.map((n, i) => (
                <div className="flow-node" key={n.k} style={cssVars({ '--fd': `${i * 0.06}s` })}>
                  <div className="fk">{n.k}</div>
                  <div className="fd">{n.d}</div>
                </div>
              ))}
            </div>
          </div>
          {solution.metrics.length > 0 && (
            <div>
              <div className="sol-section-l">{sc.outcome}</div>
              <div className="sol-metrics">
                {solution.metrics.map((m) => (
                  <div className="sol-metric" key={m.l}>
                    <div className="mn">{m.n}</div>
                    <div className="ml">{m.l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
