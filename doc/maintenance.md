# Maintenance — pending tasks & recurring upkeep

The running to-do list for this repo. Anything here is EXPECTED future work —
check this file at the start of a session before asking "is there anything
pending?". Completed items get deleted, not struck through.

## Pending (one-shot)

### 1. Remove the esbuild security override once Vite catches up

**What:** `package.json` carries a temporary pin:

```json
"overrides": { "esbuild": "^0.28.1" }
```

**Why it exists:** GHSA-gv7w-rqvm-qjhr (esbuild ≤0.28.0, missing binary
integrity verification — install-time supply-chain issue, Deno installer
path; practical risk to this npm+Vercel project was ~zero, but the
Dependabot alert is legitimate). Vite 6.4.3 still pins `esbuild: ^0.25.0`,
so the override forces the patched version through the tree.

**When to remove:** when Vite ships a release whose own esbuild range covers
the fix. Check with:

```sh
npm view vite@6 dependencies.esbuild   # or @7/@8 if upgrading majors
```

**How:** delete the `overrides` block → `npm update vite` → `npm install` →
verify `npm ls esbuild` is ≥0.28.1 (or whatever Vite then pins) and
`npm audit` is clean → `npm run build` + headless render check.

**Keep regardless:** `build.target: 'es2022'` in `vite.config.ts`. It was
added because esbuild ≥0.28 no longer lowers syntax to Vite 6's legacy
default target list, but it's the right target anyway — every supported
browser ships es2022 natively. Do not revert it when removing the override.

### 2. Re-verify the trackpad gesture patch on real hardware over time

The wheel pager is the ecd1d3d baseline + the Lethargy-method trackpad patch
(gotchas.md §12). It's simulation-proven and user-verified, but it models
physical input — if ANY wheel symptom ever resurfaces (stuck edge, ghost
pull, section skip, dead mouse):

1. Reproduce with `?wheellog` open in the console — capture the per-event dump.
2. Reproduce the captured pattern in `scripts/sim-wheel.mjs` FIRST.
3. Only then adjust the classifier. Run `npm run sim:wheel` after any change.

Known, accepted limitations (documented, not bugs to "fix" reactively):
single pixel-mode mouse notch within 600ms of trackpad use is swallowed
(2nd notch works); earliest-stamp event merging is a theoretical-only
adversary; a deliberate decel-then-push "pump" at an edge can cross.

## Recurring upkeep

- **Dependabot alerts:** triage by (a) is the vulnerable code path actually
  used here? (b) runtime dependency or build/install-time? Runtime `dependencies`
  with high/critical severity → fix immediately; everything else → normal
  maintenance. `npm audit` locally to confirm; prefer targeted `overrides`
  or minor bumps over `npm audit fix --force` (it has suggested a vite@4
  downgrade before — never follow that).
- **Content updates** (stats, projects, experience): edit
  `src/data/portfolio.ts` AND `src/data/portfolio.ko.ts` together (hard rule),
  UI strings in `src/i18n/ui.ts` (both locales), and keep Simon's fact sheet
  (`api/_lib/simon.ts`) consistent when the facts change (stats, roles, links).
  Map of what lives where: content-and-config.md.
- **The 500+/day stat** ("records processed + indexed" / "처리·인덱싱 데이터")
  is the ongoing daily throughput of the autonomous RAG pipelines. Keep it
  synchronized in both data files (about stat, Independent experience, and
  News HQ metric) and `simon.ts` if the operating volume changes.
- **Projects grid parity:** the skeleton fillers assume 7 cards (1 filler via
  sk-0 at 4-col; 2 fillers via sk-0+sk-1 at 3-col; 0 at 1-col). If a card is
  added/removed, recount the empty cells per breakpoint
  (`(cols − cards mod cols) mod cols`) and adjust `SKELETON_SLOTS` + the
  `.proj-skeleton` media rules in `sections.css`.
- **Before every commit:** `npm run typecheck`; after touching
  `useSectionSnap.ts`: `npm run sim:wheel`; after layout changes: headless
  screenshot/DOM check in BOTH locales (recipes: gotchas.md §13 — note the
  machine's system locale is Korean, so pass `--accept-lang` explicitly for EN).

## Future / someday (user-driven, do not start unprompted)

- Promote `link: null` SOON cards to real links as projects ship; add new
  `link: null` cards for new WIP (machinery in use — `OpenClaw News RAG Plugin`
  is the current SOON card).
- Remove the `?wheellog` diagnostic only if the wheel path is ever deemed
  permanently settled — it costs nothing while present.
