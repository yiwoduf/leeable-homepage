# leeable.dev — portfolio

Personal portfolio for **Jaeyol (Peter) Lee** — built with **Vite + React + TypeScript**,
with a vanilla **Three.js** hero object. Bilingual (English / 한국어) with an
AI chat assistant ("Simon") served by a Vercel Function.

## Commands

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check (app + api) + production build → dist/
npm run preview  # preview the production build
npm run typecheck# type-check only (app + api)
npx vercel dev   # dev server INCLUDING the /api chat function (needs .env — see SETUP.md)
```

The chat backend needs three environment variables on Vercel — see **[SETUP.md](SETUP.md)**.
Without them the site works fully; the chat widget just shows an offline notice.

## Customizing the design

All design choices live in **one** type-safe file — `src/config/site.ts`. Editor
autocomplete will offer the valid options for each field.

```ts
export const siteConfig = {
  defaultTheme: 'dark',     // 'dark' | 'light'  (visitor's choice is remembered)
  accent: '#2A6FDB',        // any hex — curated options in src/config/theme.ts
  fontPair: 'modern',       // 'modern' | 'plex' | 'editorial'
  background: 'grid',       // 'grid' | 'dots' | 'glow' | 'plain'
  nav: 'icons',             // 'icons' | 'labels' | 'dots'
  navBoxed: false,
  heroLayout: 'split',      // 'split' | 'reverse' | 'center'
  hero3d: 'puzzle',         // 'puzzle' | 'rubik' | 'network' | 'crystal' | 'core'
  motion: 4,                // 0 (still) – 10 (lively)
};
```

- **Change the 3D object** → set `hero3d`.
- **Change the accent color** → set `accent` (see `ACCENTS_CLASSIC` / `ACCENTS_NEON` in `src/config/theme.ts`).
- **Edit content** (experience, projects, skills, …) → `src/data/portfolio.ts` (EN) and `src/data/portfolio.ko.ts` (KO).
- **Edit UI strings / section titles** → `src/i18n/ui.ts` (both languages, type-checked).
- **Replace the résumé** → drop a new PDF in `public/` and update `identity.resume`.

## Project structure

```
api/                         # Vercel Functions: /api/chat (Simon assistant, streaming)
src/
├── main.tsx                 # entry: applies design tokens, mounts <App> in LanguageProvider
├── App.tsx                  # shell composition + wiring of hooks
├── config/                  # design knobs (site.ts), nav, fonts/accents, skill icons
├── data/                    # portfolio content — portfolio.ts (EN) + portfolio.ko.ts (KO)
├── i18n/                    # LanguageProvider, useI18n(), UI string dictionary
├── types/                   # content + design-system types
├── hooks/                   # theme, scroll-spy, section-snap, reveal, skill icons
├── lib/                     # scroll math, pointer glow, css helpers, Three.js engine
├── components/
│   ├── ui/                  # reusable kit: Button, IconButton, Card, Chip, Icon,
│   │                        #   Section, SectionTitle, SectionLead, Kicker, Stat
│   ├── layout/              # TopBar, SideNav, SocialRail, BackgroundField, SettingsModal
│   ├── chat/                # Simon chat widget (launcher, panel, streaming client)
│   └── sections/            # Hero, About, Experience, Solutions, Projects, Skills, Contact
└── styles/                  # global CSS, split by concern (index.css composes them)
```
