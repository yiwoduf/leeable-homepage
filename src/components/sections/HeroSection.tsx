import { useEffect, useRef } from 'react';
import type { HeroLayout, Hero3DVariant } from '../../types/design';
import type { Identity } from '../../types/portfolio';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Icon } from '../ui/Icon';
import { Hero3D } from './Hero3D';
import { scrollToId } from '../../lib/scroll';

const VARIANT_LABEL: Record<Hero3DVariant, string> = {
  puzzle: 'assembly',
  rubik: 'cube-matrix',
  network: 'node-network',
  crystal: 'crystal',
  core: 'ai-core',
};

interface HeroSectionProps {
  identity: Identity;
  layout: HeroLayout;
  hero3d: Hero3DVariant;
  accent: string;
  /** Motion factor, 0–1. */
  motion: number;
  dark: boolean;
}

export function HeroSection({ identity, layout, hero3d, accent, motion, dark }: HeroSectionProps) {
  const [first, ...restName] = identity.name.split(' ');
  const copyRef = useRef<HTMLDivElement>(null);

  // Fit the display name + intro type to the copy column width.
  useEffect(() => {
    const el = copyRef.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth;
      if (!w) return;
      const ns = Math.max(48, Math.min(232, w * 0.272));
      el.style.setProperty('--name-size', `${ns}px`);
      el.style.setProperty('--script-size', `${Math.max(80, Math.min(360, w * 0.4))}px`);
      el.style.setProperty('--tag-size', `${Math.max(18, Math.min(34, w * 0.045))}px`);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [layout]);

  return (
    <section className="section hero" id="hero" data-layout={layout} data-screen-label="Hero">
      <div className="hero-inner">
        <div className="hero-copy reveal in-view" ref={copyRef}>
          <div className="hero-handle">
            <span className="ping" /> {identity.location} · {new Date().getFullYear()}
          </div>
          <h1 className="hero-name">
            <span className="ln">{first}</span>
            <span className="ln accent script">{restName.join(' ')}</span>
          </h1>
          <div className="hero-role">
            <span className="bar" />
            {identity.role}
          </div>
          <p className="hero-tag">
            I build <b>multi-agent AI systems</b> that automate real-world workflows end to end.
          </p>
          <div className="hero-cta">
            <Button variant="primary" href={identity.resume} target="_blank" rel="noopener">
              <Icon name="download" /> Résumé
            </Button>
            <Button
              glow
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToId('contact');
              }}
            >
              <span>Get in touch</span> <Icon name="arrow" />
            </Button>
            <div className="hero-social">
              <IconButton icon="github" label="GitHub" showLabel href={identity.github} target="_blank" rel="noopener" />
              <IconButton icon="linkedin" label="LinkedIn" showLabel href={identity.linkedin} target="_blank" rel="noopener" />
              <IconButton icon="instagram" label="Instagram" showLabel href={identity.instagram} target="_blank" rel="noopener" />
              <IconButton icon="x" label="X" showLabel href={identity.x} target="_blank" rel="noopener" />
            </div>
          </div>
        </div>
        <div className="hero-stage">
          <Hero3D accent={accent} variant={hero3d} motion={motion} dark={dark} />
          <div className="stage-frame">
            <span className="corner tl" />
            <span className="corner tr" />
            <span className="corner bl" />
            <span className="corner br" />
          </div>
          <div className="stage-tag">[ {VARIANT_LABEL[hero3d]} ]</div>
        </div>
      </div>
    </section>
  );
}
