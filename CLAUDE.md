# Project: Temporary Portfolio Landing Page

## Overview
Polished "Under Maintenance" landing page to replace the old college portfolio site.
This is a placeholder until the full portfolio is built with Supaplate (~September 2026).
Temporary does not mean ugly. This page represents me as a developer — it must look and feel premium.

## Tech Stack
- Framework: React (Vite)
- Styling: Tailwind CSS
- Animation: Framer Motion for smooth transitions and micro-interactions
- Icons: Lucide React or React Icons
- Hosting: Vercel (free tier, custom domain)
- No backend. No database. No CMS

## Site Structure
- Single page app, no routing needed
- Sections:
  - Hero: name, title ("Fullstack Developer"), short tagline
  - Social links: GitHub, LinkedIn, Email, Instagram (optional)
  - Status message: something like "New portfolio in progress — stay tuned"
  - Optional: subtle tech stack badges or interests
- Smooth scroll or fade-in animations on load

## Design Direction
- Clean, modern, dark theme (or dark with accent color)
- Typography-driven: one distinctive display font + one clean body font (Google Fonts)
- Generous whitespace, intentional layout
- Subtle hover effects on links and social icons
- Micro-interactions that show attention to detail (cursor effects, parallax, glow, etc.)
- Must feel like a designer-developer made this, not a template
- Mobile-first responsive — must look great on phone
- Consider a subtle background effect (grain texture, gradient mesh, particles, etc.)

## Content to Include
- Full name
- Title: "Fullstack Developer"
- Tagline (finalize with user — direction: "Building products with AI" or similar)
- Social links with icons: GitHub, LinkedIn, Email (mailto), Instagram (optional)
- Status: clear but tasteful "new site coming soon" indicator
- Copyright year (dynamic)
- Favicon: custom initials or minimal icon

## SEO & Meta
- Proper meta tags: title, description, og:title, og:description, og:image
- Favicon and apple-touch-icon
- Clean semantic HTML under the React layer
- robots.txt — allow indexing

## Deployment
- `npm run build` then deploy to Vercel
- Connect custom domain (domain TBD — likely firstname.dev or similar)
- Ensure HTTPS and proper DNS configuration

## What NOT to Do
- Do not add a blog, project gallery, or contact form — save for the full site
- Do not use a pre-made template or theme — build from scratch for originality
- Do not add analytics or tracking yet
- Do not spend more than 2 evenings on this — it is still temporary
- Do not over-scope. If a feature is not listed above, do not add it
