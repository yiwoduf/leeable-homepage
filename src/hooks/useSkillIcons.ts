import { useEffect } from 'react';
import { SKILL_ICONS } from '../config/skillIcons';

// Monochrome brand marks → recolor to follow the theme text color.
const ADAPT = new Set(['nextdotjs', 'vercel', 'openai']);

// Session cache so re-mounting the Skills section doesn't refetch.
const cache: Record<string, string> = {};

/**
 * Lazily fetches Simple Icons brand SVGs and injects them into the skill
 * marquee chips (`.mc-ic[data-slug]`). Network/availability failures degrade
 * silently to the fallback square.
 */
export function useSkillIcons(): void {
  useEffect(() => {
    const slugs = [...new Set(Object.values(SKILL_ICONS))];
    let cancelled = false;

    const inject = (slug: string, svg: string) => {
      document.querySelectorAll<HTMLElement>(`.mc-ic[data-slug="${slug}"]`).forEach((el) => {
        if (!el.firstChild) el.innerHTML = svg;
      });
    };

    slugs.forEach((slug) => {
      const cached = cache[slug];
      if (cached) {
        inject(slug, cached);
        return;
      }
      fetch(`https://cdn.simpleicons.org/${slug}`)
        .then((r) => r.text())
        .then((raw) => {
          if (cancelled || raw.indexOf('<svg') !== 0) return;
          const svg = ADAPT.has(slug)
            ? raw.replace(/fill="#[0-9a-fA-F]{3,6}"/g, 'fill="currentColor"')
            : raw;
          cache[slug] = svg;
          inject(slug, svg);
        })
        .catch(() => {
          /* offline or icon missing — keep the fallback */
        });
    });

    return () => {
      cancelled = true;
    };
  }, []);
}
