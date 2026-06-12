import { useEffect } from 'react';
import { SKILL_ICONS } from '../config/skillIcons';

// Monochrome (black) brand marks → recolor to follow the theme text color so
// they stay visible in dark mode. (GitHub/X/Codex/OpenClaw render from inline
// currentColor SVGs already; colorful brand marks keep their own colors.)
const ADAPT = new Set(['nextdotjs', 'vercel']);

// Session cache so re-mounting the Skills section doesn't refetch.
const cache: Record<string, SVGSVGElement> = {};

// Track slugs that failed this session — never refetch them.
const failed = new Set<string>();

// Elements whose tag names are safe to keep inside an SVG.
const SVG_ALLOWLIST = new Set([
  'svg', 'g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline',
  'polygon', 'text', 'tspan', 'defs', 'title', 'desc', 'symbol', 'use',
  'clipPath', 'mask', 'linearGradient', 'radialGradient', 'stop', 'pattern',
]);

/**
 * Walks an SVG element tree and removes unsafe nodes/attributes in place.
 * Returns false if the root itself is not a safe <svg> element.
 */
function sanitizeSvg(node: SVGSVGElement): boolean {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT);

  const toRemove: Element[] = [];

  // Walk every element node. Collect disallowed ones for bulk removal after the
  // walk (removing during traversal would corrupt the walker's position).
  let current: Node | null = walker.currentNode;
  while (current !== null) {
    const el = current as Element;
    const tag = el.tagName.toLowerCase();

    if (!SVG_ALLOWLIST.has(tag)) {
      toRemove.push(el);
    } else {
      // Strip dangerous attributes only on allowed elements.
      const attrNames = Array.from(el.attributes).map((a) => a.name);
      for (const name of attrNames) {
        // Remove all event handlers.
        if (name.startsWith('on')) {
          el.removeAttribute(name);
          continue;
        }
        // Strip external hrefs (keep fragment-only '#…' references for <use>).
        if (name === 'href' || name === 'xlink:href') {
          const val = el.getAttribute(name) ?? '';
          if (!val.startsWith('#')) el.removeAttribute(name);
        }
      }
    }

    current = walker.nextNode();
  }

  // Remove disallowed nodes. Children of already-removed parents become
  // detached, so parentNode is null — removeChild call is safely skipped.
  for (const el of toRemove) el.parentNode?.removeChild(el);

  return true;
}

/**
 * Parses raw SVG text via DOMParser. Returns a sanitized, adopted SVGSVGElement
 * or null when the payload is invalid or unsafe.
 */
function parseSvg(raw: string): SVGSVGElement | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(raw.trim(), 'image/svg+xml');

  // DOMParser signals XML parse errors via a <parseerror> documentElement.
  const root = doc.documentElement;
  if (root.tagName === 'parsererror' || root.tagName.toLowerCase() !== 'svg') {
    return null;
  }

  const svgEl = root as unknown as SVGSVGElement;
  if (!sanitizeSvg(svgEl)) return null;

  // Adopt into the main document so DOM methods work normally.
  return document.adoptNode(svgEl) as SVGSVGElement;
}

/**
 * Lazily fetches Simple Icons brand SVGs and injects them into the skill
 * marquee chips (`.mc-ic[data-slug]`). Network/availability failures degrade
 * silently to the fallback square.
 */
export function useSkillIcons(): void {
  useEffect(() => {
    const slugs = [...new Set(Object.values(SKILL_ICONS))];
    let cancelled = false;

    const inject = (slug: string, svgEl: SVGSVGElement) => {
      document.querySelectorAll<HTMLElement>(`.mc-ic[data-slug="${slug}"]`).forEach((el) => {
        if (!el.firstChild) {
          // Clone so each chip gets its own node.
          el.replaceChildren(svgEl.cloneNode(true));
        }
      });
    };

    slugs.forEach((slug) => {
      // Skip slugs that already failed this session.
      if (failed.has(slug)) return;

      const cached = cache[slug];
      if (cached) {
        inject(slug, cached);
        return;
      }

      fetch(`https://cdn.simpleicons.org/${slug}`)
        .then((r) => r.text())
        .then((raw) => {
          if (cancelled) return;

          const svgEl = parseSvg(raw);
          if (!svgEl) {
            failed.add(slug);
            return;
          }

          if (ADAPT.has(slug)) {
            // The CDN's SVGs carry no fill at all (SVG default = black), so a
            // [fill] selector matches nothing — set currentColor on the root
            // and override any explicit hex fills below it.
            svgEl.setAttribute('fill', 'currentColor');
            svgEl.querySelectorAll('[fill]').forEach((el) => {
              if (el.getAttribute('fill') !== 'none') {
                el.setAttribute('fill', 'currentColor');
              }
            });
          }

          cache[slug] = svgEl;
          inject(slug, svgEl);
        })
        .catch(() => {
          // Offline or icon missing — cache the failure and keep the fallback.
          failed.add(slug);
        });
    });

    return () => {
      cancelled = true;
    };
  }, []);
}
