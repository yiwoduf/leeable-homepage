# Project docs

Read the relevant docs before starting work and check the existing site design.
Whenever a feature, behavior, layout, or configuration changes, briefly update
the corresponding docs in the same task. Keep the current behavior, relevant
files/settings, EN/KO and theme considerations, and meaningful limitations easy
to find; update existing sections instead of duplicating a chronological log.

- [architecture.md](architecture.md) — source tree, boot sequence, data flow
- [scroll-and-reveal.md](scroll-and-reveal.md) — the section-snap pager + reveal system (the most intricate part — read before touching scroll)
- [gotchas.md](gotchas.md) — bug postmortems & invariants (WebKit traps, CSS pitfalls, verification recipes) — read before debugging anything iPad-only or language-dependent
- [components.md](components.md) — UI / layout / section component catalog + hooks
- [styling.md](styling.md) — CSS organization, tokens, theming, reveal classes
- [content-and-config.md](content-and-config.md) — where to edit content & design knobs
- [maintenance.md](maintenance.md) — pending tasks (esbuild override removal…) & recurring upkeep — check at session start
- [../SETUP.md](../SETUP.md) — Simon chat backend: env vars, security model, rate limits
- [../CLAUDE.md](../CLAUDE.md) — session briefing: stack, hard rules, conventions
