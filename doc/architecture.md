# Architecture

Single-page portfolio for Jaeyol (Peter) Lee. Vite + React 18 + TypeScript (strict)
+ vanilla Three.js. No router, no CSS framework, no state library — one page, a
content object, a design-config object, and a set of focused hooks.

## Stack & scripts

- **Vite 6**, **React 18.3.1**, **TypeScript 5.6** (strict, `noUnusedLocals`,
  `noUnusedParameters`, `noImplicitOverride`), **three 0.137.5**.
- `npm run dev` — dev server. `npm run build` — `tsc --noEmit && vite build`.
  `npm run typecheck` — types only. `npm run preview` — preview the build.
- Deployment is configured separately; out of scope for these docs.

## i18n and Settings

`src/i18n/` provides a zero-dependency i18n system. `LanguageProvider` (wraps `<App/>` in `main.tsx`) manages `lang` state, persists to `localStorage`, and sets `document.documentElement.lang` + `dataset.lang`. `useI18n()` returns `{ lang, setLang, t, content }` where `t` is `UI_STRINGS[lang]` and `content` is the language-specific portfolio object (EN: `data/portfolio.ts`, KO: `data/portfolio.ko.ts`). A `resize` event is dispatched on language change so `useResizeRealign` re-aligns the viewport. `src/i18n/rich.tsx` provides `renderRich()` for lightweight `\n`/`*kw*`/`**bold**` markup in section titles and taglines.

The `SettingsModal` (gear button in `TopBar`) lets visitors switch theme (dark/light) and language (EN/KO) instantly. It carries `data-overlay` on its backdrop so the scroll pager ignores wheel/touch events inside it.

## Boot sequence

`index.html` → `src/main.tsx`:
1. `applyDesignTokens()` (config/theme.ts) writes `--accent`, font vars, and
   motion-derived `--reveal-shift` / `--reveal-dur` to `<html>` **before first
   paint** (avoids a flash).
2. `createRoot(#root).render(<StrictMode><App/></StrictMode>)`.

`App.tsx` wires the hooks, then renders fixed chrome + a `<main>` of 7 sections:

```
useTheme()            → isDark, toggle           (persists <html data-theme>)
useScrollSpy()        → active, progress         (nav highlight + progress bar)
useHideOnScroll()     → headerHidden             (slides the TopBar away)
useReveal()           → (side effect)            per-element reveal-on-scroll
useSectionSnap()      → (side effect)            the wheel+touch section pager
useResizeRealign(active)  → re-frame on window resize
useContentRealign(active) → re-frame on content collapse (card close)

<BackgroundField/> <TopBar/> <SideNav/> <MobileNav/> <SocialRail/> <ScrollHint/>
<main>
  Hero · About · Experience · Solutions · Projects · Skills · Contact
</main>
```

## Directory map

```
src/
  main.tsx                 entry: apply tokens, mount App
  App.tsx                  shell: wire hooks + render chrome + sections

  data/portfolio.ts        ★ ALL content (text) — single source of truth
  config/
    site.ts                ★ design knobs (accent, hero3d, fonts, layout, motion)
    theme.ts               FONT_PAIRS, ACCENTS_*, applyDesignTokens()
    navigation.ts          NAV array (id, label, icon) — section order
    skillIcons.ts          skill label → Simple Icons slug (fetched at runtime)
    customSkillIcons.tsx   inline SVGs for skills with no brand mark (OpenClaw)

  types/
    portfolio.ts           content model (PortfolioData, Identity, …)
    design.ts              design-knob unions (SiteConfig, Hero3DVariant, …)

  components/
    ui/                    reusable primitives (Button, Card, Chip, Icon, Section,
                           SectionTitle, SectionLead, Kicker, Stat, IconButton)
    layout/                fixed chrome (TopBar, SideNav, MobileNav, SocialRail,
                           BackgroundField, ScrollHint)
    sections/              one component per page section (+ Hero3D, SolutionCard,
                           EmailCopy)

  hooks/                   one concern each (see scroll-and-reveal.md for the
                           scroll/reveal ones; useTheme, useScrollSpy,
                           useHideOnScroll, useSkillIcons for the rest)

  lib/
    scrollController.ts    smoothScrollTo() + isScrollLocked()  (THE scroll owner)
    scroll.ts              scrollToId() (nav jump), realignTo() (instant re-frame)
    sectionMetrics.ts      sectionSnapTop()/Bottom() — where a section rests
    sections.ts            sectionElements(), sectionIndexAt(), activeSectionIndex()
    viewport.ts            maxScrollY(), clampScroll()
    cardGlow.ts            glowHandlers (pointer-reactive comet glow)
    cx.ts                  classnames helper        cssVars.ts  --var style helper
    three/heroEngine.ts    Three.js hero object engine (makeHero → HeroController)

  styles/                  global CSS, composed via index.css (see styling.md)
```

## Data flow

- **Content** flows one way: `portfolio.ts` → typed against `types/portfolio.ts`
  → passed as props from `App.tsx` into section components. To change copy, edit
  `portfolio.ts` only (one exception — see content-and-config.md).
- **Design** flows from `config/site.ts` → `applyDesignTokens()` writes CSS vars
  + props into components (accent, hero3d variant, layout, motion).
- **Scroll/reveal state** is imperative and lives on the document root as
  attributes/CSS vars (`data-theme`, `data-pull`, `--pull`, `--pull-label`,
  `data-scrolldir`, and per-element `data-revealed`). Hooks set them; CSS reacts.

## Conventions

- Components are presentational; behavior lives in hooks/lib. Each `ui/` and
  `layout/` piece is small and reused.
- `Button`/`Card` render an `<a>` when given `href`, else `<button>`/`<div>`.
- Cross-module "which section am I on" math is single-sourced in `lib/sections.ts`;
  scroll-range math in `lib/viewport.ts`. Don't re-derive these inline.
- TypeScript is strict — unused locals/params fail the build.
