# Component catalog

Four buckets: `ui/` (reusable primitives), `layout/` (fixed chrome), `sections/`
(one per page section), `chat/` (Simon assistant). Each folder has a barrel `index.ts`.

## `components/ui/` — primitives

| Component | Purpose / notes |
|---|---|
| `Icon` | Inline-SVG icon set keyed by `name` (`IconName`). Holds github, linkedin, x, globe, mail, download, arrow, chevron, file, home, user, briefcase, cpu, folder, layers, copy, check, gear, close. Add new icons here. |
| `IconButton` | Square icon `<a>` (hero socials). `showLabel` reveals a text label in responsive layouts. Pointer glow (`glow-p`) by default — no comet outline at button scale. |
| `Button` | Primary CTA. `<a>` when `href` given, else `<button>`. `variant='primary'` solid. `glow` = pointer-following glow only (`glow-p`); the comet outline is reserved for surfaces. |
| `Card` | Glowing surface base for project/solution/stat cards. `<a>` when `href`. `glow` = `'glow'` (comet border) or `'glow-p'` (pointer glow only). |
| `Chip` | Small monospace tag (tech stacks, timeline tags). |
| `Section` | Full-height section shell: `<section id className data-screen-label>` + a centered `.section-inner` (override via `innerClassName`, e.g. Contact uses `contact-inner`). `alt` = alternate bg tone. |
| `SectionTitle` | Large display `<h2>`, `.reveal` with `--d` delay. Accent words come from `renderRich` `*word*` markers (`.kw`). |
| `SectionLead` | Supporting paragraph under a title, `.reveal`. |
| `Kicker` | Section eyebrow: mono index (`idx="01"`) + label, `.reveal`. `center` for Contact. |
| `Stat` | Metric tile (big number + label) with pointer glow. |
| `PuzzleMark` | Procedurally-built brand mark (two interlocking jigsaw pieces). Used by the TopBar brand and, recolored via CSS `fill: currentColor`, by the project-grid skeleton cells. |

Reveal/glow plumbing: most primitives carry the `reveal` class and accept
`cssVars({'--d': ...})` for stagger; glow comes from `glowHandlers` (lib/cardGlow).

## `components/layout/` — fixed chrome

| Component | Purpose |
|---|---|
| `BackgroundField` | Fixed full-viewport `.bgfield[data-variant]` (grid/dots/glow/plain). |
| `TopBar` | Brand mark (→ scroll to hero) + settings gear (opens `SettingsModal`). `hidden` slides it up (driven by `useHideOnScroll`). |
| `MeetingModal` | Shared native dialog for Contact and Simon; free Calendly iframe, themed EN/KO header, external-link fallback. |
| `SettingsModal` | Theme (dark/light) + language (EN/KO) switcher; focus-trapped dialog. |
| `SideNav` | Fixed left nav with scroll-spy highlight; progress fill reads the `--nav-progress` CSS variable (no per-scroll React state). `data-style` = icons/labels/dots. Desktop. |
| `MobileNav` | Bottom tab bar, always visible on small screens. |
| `SocialRail` | Fixed right rail: GitHub / LinkedIn / X / Email / Résumé with hover tips. |
| `ScrollHint` | The pull indicator markup (two bars + two labels). Pure markup; driven by `data-pull`/`--pull`/`--pull-label` — see scroll-and-reveal.md. |

Nav items come from `config/navigation.ts` (`NAV`). `SideNav`/`MobileNav` call
`scrollToId(id)` (lib/scroll) to jump.

## `components/sections/` — page sections

Order matches `NAV` and `App.tsx`: Hero · About · Experience · Solutions ·
Projects · Skills · Contact. Each takes its slice of `portfolio` as props.

| Section | Notes |
|---|---|
| `HeroSection` | Name (first word + script "Lee"), role, tagline (`identity.tagline` via `renderRich`), Résumé + Get-in-touch buttons, social `IconButton`s (GitHub/LinkedIn/X), 3D stage. A ResizeObserver fits the name/type sizes to the copy column width. |
| `Hero3D` | Mounts the Three.js engine (`lib/three/heroEngine.makeHero`) and forwards live prop changes via the `HeroController`. The engine pauses its rAF loop when scrolled off-screen (IntersectionObserver). |
| `AboutSection` | Lead + body, a facts grid, and a `Stat` grid. |
| `ExperienceSection` | Timeline: `.tl-line` (unclipped reveal **sensor**) wrapping `.tl-line-draw` (the clip-path draw animation — see gotchas.md §4) + a `.tl-item.reveal` per role. `now: true` adds the pulsing ring. |
| `SolutionsSection` / `SolutionCard` | Expandable cards. `SolutionCard` measures its body `scrollHeight` to animate open/closed; its className changes with `open`/`armed` (the reason reveal uses a data-attribute). Body: PROBLEM \| SOLUTION columns (in-progress solutions render muted via `.sol-planned`), then ROLE, flow nodes, metrics. |
| `ProjectsSection` | Grid of `Card`s (link → GitHub icon; `live: true` → accent globe icon; `link: null` → "SOON" badge). Two static `.proj-skeleton` cells (`sk-0`, `sk-1`) square off the ragged last row — with 7 cards, the 4-column grid wraps 4+3 so only `sk-0` shows; the 3-column grid wraps 3+3+1 so both show; the single column shows none (CSS-gated). Recount on card add/remove — see maintenance.md. `useStaleTrackKick` rebuilds the grid tracks after rotation/tab-return on touch (WebKit bug — gotchas.md §3). |
| `SkillsSection` | Per-group marquee rows. Icons: `SKILL_ICONS` slug → Simple Icons SVG fetched by `useSkillIcons` (black marks recolored via the ADAPT set); `CUSTOM_SKILL_ICONS` inline SVGs (OpenClaw, Codex, Java); else a fallback square. |
| `ContactSection` | Big line, `EmailCopy` codebox, GitHub/LinkedIn/X/Résumé buttons (pointer glow), footer with © line and a GitHub view-source icon next to "Built in public". |
| `EmailCopy` | Code-block style email: window bar (`.cb-bar` dots + `contact.sh`) over a graph-paper body with `$` prompt + copy button (right-aligned). Carries the full `glow` (comet outline + pointer glow, raised above the opaque child backgrounds). |

## `components/chat/` — Simon assistant

`ChatWidget` (launcher + panel mount) → `ChatPanel` (header/messages/composer) →
`useChat` (streaming fetch to `/api/chat`, history capping, error states) →
`ChatMessage` (renders text + `[[card:*]]` tokens via `linkCards.tsx`).
`[[card:meeting]]` renders a localized button calling the same `App` callback as
Contact. Opening the meeting dialog keeps the chat mounted and its conversation intact.
Strings in `chatStrings.ts` (EN/KO). Backend contract & security: `SETUP.md`.

## Other hooks (non-scroll)

| Hook | Returns / effect |
|---|---|
| `useTheme` | `{ theme, isDark, toggle }`. Persists `<html data-theme>` + `localStorage['leeable:theme']`. |
| `useScrollSpy` | `{ active }` for the nav. Continuous progress is **not** React state — it's published as the `--nav-progress` CSS variable, rAF-coalesced (gotchas.md §11). |
| `useHideOnScroll(idleMs=600)` | Smart header: pinned on the hero, hidden scrolling down, shown scrolling up (auto-hides after idle), and summoned by hovering the top 80px band on hover-capable devices. |
| `useSkillIcons` | Fetches Simple Icons brand SVGs into `.mc-ic[data-slug]`; sanitizes them; recolors ADAPT-set marks to `currentColor`; session-cached; degrades silently offline. |
