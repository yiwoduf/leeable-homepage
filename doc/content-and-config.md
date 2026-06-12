# Content & config — where to edit

Almost everything editable lives in **two files**. Both are TypeScript, so the
editor autocompletes valid fields and flags typos.

## 1. `src/data/portfolio.ts` — all text content

Single content object (`portfolio: PortfolioData`, typed by `types/portfolio.ts`).

| To change… | Field |
|---|---|
| Name, role, location, email, résumé filename | `identity` |
| Social links (GitHub / LinkedIn / Instagram / X) | `identity.github` / `.linkedin` / `.instagram` / `.x` |
| About two paragraphs | `about.lead`, `about.body` |
| About facts (Based in, Languages, …) | `about.facts` — `{ k: label, v: value }` |
| About stat tiles (5+, 2,259+, …) | `about.stats` — `{ n: number, l: caption }` |
| Experience timeline | `experience[]` |
| └ current role (blue dot + pulse) | add `now: true` to that entry |
| └ subtitle / tech chips | `sub` / `tags` |
| Solutions (expandable cards) | `solutions[]` |
| └ status badge | `status: 'live' | 'in-progress'` |
| └ workflow nodes / outcome metrics | `flow[]` / `metrics[]` (empty `metrics` hides the block) |
| Projects | `projects[]` — `link: null` renders a non-link "soon" card |
| Skills | `skills[]` — `{ group, items: [...] }` |

Adding/removing array items auto-updates the timeline, cards, chips, etc. Skill
glyphs: if an item is in `config/skillIcons.ts` it shows a fetched brand mark; in
`config/customSkillIcons.tsx` it shows a local inline SVG; otherwise a fallback
square.

## 2. `src/config/site.ts` — design knobs

| Knob | Values |
|---|---|
| `accent` | any hex (curated sets in `config/theme.ts`) |
| `hero3d` | `'puzzle' | 'rubik' | 'network' | 'crystal' | 'core'` |
| `defaultTheme` | `'dark' | 'light'` (a returning visitor's saved choice wins) |
| `fontPair` | `'modern' | 'plex' | 'editorial'` |
| `background` | `'grid' | 'dots' | 'glow' | 'plain'` |
| `nav` | `'icons' | 'labels' | 'dots'` |
| `heroLayout` | `'split' | 'reverse' | 'center'` |
| `motion` | `0`–`10` (drives reveal timing + 3D speed) |

Valid options are also the unions in `types/design.ts`.

## 3. Other spots

- **Résumé PDF** — put it in `public/` and make the filename match
  `identity.resume` (currently `public/Jaeyol-Lee-Resume.pdf`).
- **Browser tab title / SEO** — `index.html` (`<title>` + meta description).
- **Section order / nav** — `config/navigation.ts` (`NAV`).

## 4. Korean content (`src/data/portfolio.ko.ts`)

A complete `PortfolioData` object with Korean copy. Loaded automatically when the
visitor's language is `ko`. Identity URLs, skills arrays, company/product names,
and place names stay in English as per Korean dev-industry convention.

## ⚠️ Tagline now flows from `identity.tagline`

The tagline is no longer hardcoded in `HeroSection.tsx`. It is read from
`identity.tagline` in `portfolio.ts` (EN) and `portfolio.ko.ts` (KO) and rendered
via `renderRich()` so `**bold**` markers produce `<b>` tags. To update the tagline,
edit the `tagline` field in the relevant portfolio file.

Note: Instagram/X URLs default to the GitHub handle (`yiwoduf`) — update if different.
