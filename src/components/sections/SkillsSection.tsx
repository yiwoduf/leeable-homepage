import type { SkillGroup } from '../../types/portfolio';
import { Section, Kicker, SectionTitle, SectionLead } from '../ui';
import { cssVars } from '../../lib/cssVars';
import { SKILL_ICONS } from '../../config/skillIcons';
import { CUSTOM_SKILL_ICONS } from '../../config/customSkillIcons';
import { useSkillIcons } from '../../hooks/useSkillIcons';

function MarqueeRow({ group, items, index }: { group: string; items: string[]; index: number }) {
  // Repeat the base set until one "half" comfortably exceeds the viewport, then
  // render two identical halves so translateX(-50%) loops seamlessly.
  const half: string[] = [];
  while (half.length < Math.max(14, items.length * 2)) half.push(...items);
  const dur = `${Math.round(half.length * 3.4)}s`;

  return (
    <div
      className="mrow reveal"
      data-dir={index % 2 === 1 ? 'rev' : 'fwd'}
      style={cssVars({ '--d': `${0.12 + index * 0.05}s` })}
    >
      <div className="mlabel">{group}</div>
      <div className="mviewport">
        <div className="mtrack" style={cssVars({ '--mdur': dur })}>
          {[...half, ...half].map((it, j) => {
            const custom = CUSTOM_SKILL_ICONS[it];
            const slug = SKILL_ICONS[it];
            return (
              <div className="mcap" key={`${it}-${j}`}>
                {custom ? (
                  <span className="mc-ic">{custom}</span>
                ) : slug ? (
                  <span className="mc-ic" data-slug={slug} />
                ) : (
                  <span className="md" />
                )}
                <b>{it}</b>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SkillsSection({ skills }: { skills: SkillGroup[] }) {
  useSkillIcons();
  return (
    <Section id="skills" label="Skills">
      <Kicker idx="05">Skills / Stack</Kicker>
      <SectionTitle>
        The <span className="kw">toolkit</span>.
      </SectionTitle>
      <SectionLead>
        The languages, frameworks, and AI tooling I reach for — grouped by where they live in the stack.
      </SectionLead>
      <div className="skill-marquee">
        {skills.map((row, i) => (
          <MarqueeRow key={row.group} group={row.group} items={row.items} index={i} />
        ))}
      </div>
    </Section>
  );
}
