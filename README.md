# leeable-homepage

Personal portfolio landing page — a polished placeholder while the full portfolio is in development.

**Live:** [leeable.dev](https://leeable.dev)

## Stack

- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Hosting:** Vercel

## Project Structure

```
src/
├── components/        # UI components (Hero, StatusBadge, ExperienceSection, ...)
├── config/
│   └── siteData.ts    # All site content lives here — edit this to update the page
└── hooks/
    └── useTheme.ts    # Dark/light mode toggle logic
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Updating Content

All personal data (name, title, socials, experience) is in one place:

```
src/config/siteData.ts
```

No environment variables needed — the data is public and baked into the bundle at build time.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Deployment

Deployed to Vercel via GitHub integration. Every push to `main` triggers a production build automatically.
