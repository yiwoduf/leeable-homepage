# Content & config — where to edit

Almost everything editable lives in **two files**. Both are TypeScript, so the
editor autocompletes valid fields and flags typos.

## 1. `src/data/portfolio.ts` — all text content

Single content object (`portfolio: PortfolioData`, typed by `types/portfolio.ts`).

| To change… | Field |
|---|---|
| Name, role, location, email, résumé filename | `identity` |
| Social links (GitHub / LinkedIn / X) | `identity.github` / `.linkedin` / `.x` |
| About two paragraphs | `about.lead`, `about.body` |
| About facts (Based in, Languages, …) | `about.facts` — `{ k: label, v: value }` |
| About stat tiles (15+, 500+/day, …) | `about.stats` — `{ n: number, l: caption }` |
| Experience timeline | `experience[]` |
| └ current role (blue dot + pulse) | add `now: true` to that entry |
| └ subtitle / tech chips | `sub` / `tags` |
| Solutions (expandable cards) | `solutions[]` |
| └ status badge | `status: 'live' | 'in-progress'` |
| └ workflow nodes / outcome metrics | `flow[]` / `metrics[]` (empty `metrics` hides the block) |

- Solution cards auto-number (`no={i+1}` in SolutionsSection) and key on `codename` — codenames must be unique.
- `status: 'in-progress'` mutes the SOLUTION column (`.sol-planned`); an empty `metrics: []` hides the entire OUTCOME block.
| Projects | `projects[]` — `link: null` renders a non-link "SOON" card; `live: true` swaps the GitHub icon for a globe (live product URL) |
| Skills | `skills[]` — `{ group, items: [...] }` |

Adding/removing array items auto-updates the timeline, cards, chips, etc. Skill
glyphs: if an item is in `config/skillIcons.ts` it shows a fetched brand mark; in
`config/customSkillIcons.tsx` it shows a local inline SVG; otherwise a fallback
square.

## 2. `src/config/site.ts` — design knobs

| Knob | Values |
|---|---|
| `accent` | any hex |
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

Both languages ship together: every content change edits `portfolio.ts` (EN) and
`portfolio.ko.ts` (KO) in lockstep — identical array lengths and object shapes.
Keep flow-node `k` keys identical across EN/KO (they're the React keys; differing
keys remount the flow nodes on language switch and replay the stagger). Korean
stays natural 의역/합니다체; product names stay English.

## Tagline

The hero tagline is read from `identity.tagline` in `portfolio.ts` (EN) and
`portfolio.ko.ts` (KO) and rendered via `renderRich()` — `**bold**` markers
produce `<b>` tags, `*word*` produces the script-font `.kw` accent.

## Meeting scheduling

- Public event URL: `src/config/meeting.ts` (`MEETING_URL`). Copy the event's
  scheduling link in Calendly; no token or API key is needed.
- Invitee email verification is enabled for the current event (owner confirmed
  on 2026-09-05). Calendly handles the email code before confirming a booking;
  this setting lives in Calendly, not the site. Recheck it when replacing the event.
- Dialog/button copy: `meeting` in `src/i18n/ui.ts`, updated in EN/KO together.
- Outer dialog uses existing theme tokens in `src/styles/meeting.css`.
- Calendly Free keeps its own light booking UI and English system labels.
  Background/text/button color customization requires a paid Calendly plan;
  a site theme switch does not recolor the cross-origin iframe.
- The iframe mounts only when opened. Its cookie controls remain Calendly's.
  The external link stays available if embedding is blocked. Completion stays
  inside Calendly; Simon does not receive booking events or claim to book.
- Native dialog traps focus and restores the opener on close. Escape works
  from the site dialog; when focus is inside Calendly, use the visible close
  button (cross-origin keyboard events do not bubble to the parent page).
- Check cards with `node scripts/check-meeting.mjs`; check both locales and
  themes in the browser, including mobile width, iframe scrolling, closing,
  and reopening from Contact and Simon. `npm run dev` does not serve `/api/chat`;
  live model-response verification requires the Vercel preview backend.

Official references:
[iframe embed](https://calendly.com/help/how-to-embed-calendly-with-an-iframe),
[color customization](https://calendly.com/help/how-to-customize-your-embed),
[languages](https://calendly.com/help/how-to-change-your-event-type-language).
