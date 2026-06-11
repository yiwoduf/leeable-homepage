# Component catalog

Three buckets: `ui/` (reusable primitives), `layout/` (fixed chrome), `sections/`
(one per page section). Each folder has a barrel `index.ts`.

## `components/ui/` — primitives

| Component | Purpose / notes |
|---|---|
| `Icon` | Inline-SVG icon set keyed by `name` (`IconName`). Holds github, linkedin, **instagram, x**, mail, download, sun, moon, arrow, chevron, file, home, user, briefcase, cpu, folder, layers, copy, check. Add new icons here. |
| `IconButton` | Square icon `<a>` (hero socials). `showLabel` reveals a text label in responsive layouts. Glows by default. |
| `Button` | Primary CTA. `<a>` when `href` given, else `<button>`. `variant='primary'` solid, `glow` comet border. |
| `Card` | Glowing surface base for project/solution/stat cards. `<a>` when `href`. `glow` = `'glow'` (comet border) or `'glow-p'` (pointer glow only). |
| `Chip` | Small monospace tag (tech stacks, timeline tags). |
| `Section` | Full-height section shell: `<section id className data-screen-label>` + a centered `.section-inner` (override via `innerClassName`, e.g. Contact uses `contact-inner`). `alt` = alternate bg tone. |
| `SectionTitle` | Large display `<h2>`, `.reveal` with `--d` delay. Wrap accent words in `<span class="kw">`. |
| `SectionLead` | Supporting paragraph under a title, `.reveal`. |
| `Kicker` | Section eyebrow: mono index (`idx="01"`) + label, `.reveal`. `center` for Contact. |
| `Stat` | Metric tile (big number + label) with pointer glow. |

Reveal/glow plumbing: most primitives carry the `reveal` class and accept
`cssVars({'--d': ...})` for stagger; glow comes from `glowHandlers` (lib/cardGlow).

## `components/layout/` — fixed chrome

| Component | Purpose |
|---|---|
| `BackgroundField` | Fixed full-viewport `.bgfield[data-variant]` (grid/dots/glow/plain). |
| `TopBar` | Brand mark (→ scroll to hero) + dark/light toggle. `hidden` slides it up (driven by `useHideOnScroll`). |
| `SideNav` | Fixed left nav with scroll-spy highlight + a progress fill. `data-style` = icons/labels/dots. Desktop. |
| `MobileNav` | Bottom tab bar, always visible on small screens. |
| `SocialRail` | Fixed right rail: GitHub / LinkedIn / Email / Résumé with hover tips. |
| `ScrollHint` | The pull indicator markup (two bars + two labels). Pure markup; driven by `data-pull`/`--pull`/`--pull-label` — see scroll-and-reveal.md. |

Nav items come from `config/navigation.ts` (`NAV`). `SideNav`/`MobileNav` call
`scrollToId(id)` (lib/scroll) to jump.

## `components/sections/` — page sections

Order matches `NAV` and `App.tsx`: Hero · About · Experience · Solutions ·
Projects · Skills · Contact. Each takes its slice of `portfolio` as props.

| Section | Notes |
|---|---|
| `HeroSection` | Name (split into first + script rest), role, intro, Résumé + Get-in-touch buttons, social `IconButton`s (GitHub/LinkedIn/Instagram/X), and the 3D stage. **Intro tagline is hardcoded here** (bold formatting) — `identity.tagline` is unused. A ResizeObserver fits the name/type to the column width. |
| `Hero3D` | Mounts the Three.js engine (`lib/three/heroEngine.makeHero`) and forwards live prop changes via the `HeroController` (`setAccent/setVariant/setMotion/setDark/destroy`). |
| `AboutSection` | Lead + body, a facts grid, and a `Stat` grid. |
| `ExperienceSection` | Timeline: a `.tl-line` (the animated vertical line, see scroll-and-reveal.md) + a `.tl-item.reveal` per role. `now: true` adds the pulsing "now" ring + accent dot. |
| `SolutionsSection` / `SolutionCard` | Expandable cards. `SolutionCard` is the **dynamic-height** one: measures its body `scrollHeight` to animate open/closed; its className changes with `open`/`armed` (the reason reveal uses a data-attribute). `status` = `'live'`/`'in-progress'`. |
| `ProjectsSection` | Grid of `Card`s; renders as a link when `project.link` is set, else a plain card with a "soon" marker. |
| `SkillsSection` | Per-group marquee rows. Icons: `SKILL_ICONS` slug → Simple Icons SVG fetched at runtime by `useSkillIcons`; `CUSTOM_SKILL_ICONS` for inline ones (OpenClaw); else a fallback square. |
| `ContactSection` | "Let's build something", `EmailCopy`, GitHub/LinkedIn/Résumé buttons, and the footer. Uses `contact-inner`. |
| `EmailCopy` | Email + one-click copy button with a transient "Copied" state. |

## Other hooks (non-scroll)

| Hook | Returns / effect |
|---|---|
| `useTheme` | `{ theme, isDark, toggle }`. Persists `<html data-theme>` + `localStorage['leeable:theme']`; initial from saved choice else `siteConfig.defaultTheme`. |
| `useScrollSpy` | `{ active, progress }` for the nav. `active` = last section whose top crossed 40% of the viewport (deliberately eager, distinct from the pager's center probe). |
| `useHideOnScroll(idleMs=600)` | `true` while scrolling; reveals after idle; always shows at the very top. Drives the TopBar. |
| `useSkillIcons` | Fetches Simple Icons brand SVGs into `.mc-ic[data-slug]`; session-cached; degrades silently offline. |
