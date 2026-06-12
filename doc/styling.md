# Styling

Global, hand-written CSS (no framework, no CSS-in-JS, no CSS modules). Composed
through `styles/index.css` in a deliberate cascade order:

```
tokens → base → utilities → components → layout → chrome → hero → sections
```

`main.tsx` imports `styles/index.css`; everything is global. Class names are
plain (BEM-ish but loose); components attach classes, CSS owns the look.

## Files

| File | Holds |
|---|---|
| `tokens.css` | **Design tokens** as CSS custom properties: dark theme on `:root`, light overrides under `[data-theme="light"]`. Colors (`--bg*`, `--surface*`, `--text*`, `--border*`, `--grid-line`, `--dot`), `--accent` family, fonts, `--maxw`, `--nav-w`, `--reveal-shift`/`--reveal-dur` (motion-tuned, overwritten by `applyDesignTokens`). |
| `base.css` | Reset (incl. `text-size-adjust: 100%` — gotchas.md §2), `<html>`/`<body>` base, hidden scrollbars, `::selection`. **`@media (pointer: coarse)`: html/body `overflow: hidden`, `<main>` becomes the fixed scroll container** with `touch-action: pinch-zoom; overscroll-behavior: none` so the touch pager owns vertical panning (reduced-motion stays native). |
| `utilities.css` | `.reveal` (the reveal-on-scroll primitive — opacity + translateY(`--reveal-shift`), transition `--reveal-dur`, delay `--d`; shown via `.reveal.in-view` or `.reveal[data-revealed]`), and `.glow`/`.glow-p` (spinning comet border + pointer glow). |
| `components.css` | `ui/` primitives (buttons, chips, icon buttons, stat tiles, responsive label rules). |
| `layout.css` | Fixed chrome (top bar, side nav, social rail, mobile nav, background field). |
| `chrome.css` | Top-bar hide transform, mobile nav, **and the scroll-hint / pull indicator** (stretching bar + glowing head + destination label, desktop & mobile). |
| `hero.css` | Hero section layout (split/reverse/center), name/script type, 3D stage frame, responsive stacking. |
| `sections.css` | About / Experience (timeline + `.tl-line`) / Solutions (cards) / Projects / Skills (marquee) / Contact / footer. |

## Theming

- Dark is the default (`:root` tokens, `color-scheme: dark`). Light swaps tokens
  under `[data-theme="light"]`. `useTheme` flips `<html data-theme>` and persists.
- `--accent` is set at runtime by `applyDesignTokens()` from `siteConfig.accent`
  (so changing the config recolors everything: links, highlights, glow, 3D).
- Fonts come from `FONT_PAIRS[siteConfig.fontPair]`, written to `--font-*`.
  (Web fonts themselves are loaded in `index.html`.)

## Reveal classes (see scroll-and-reveal.md)

- Add `reveal` to anything that should fade/slide in; set its order with
  `style={cssVars({'--d': '.1s'})}`.
- Shown by `.reveal[data-revealed]` (attribute toggled by `useReveal`) — **do not
  switch this to a class**; React would wipe it on components with dynamic
  classNames.
- `.reveal.in-view` force-shows always-on bits (the hero copy).
- The timeline line is the one special case: an unclipped `.tl-line` sensor wraps
  `.tl-line-draw`, which draws via `clip-path` and flips direction on
  `:root[data-scrolldir="up"]` (see gotchas.md §4–5 for why it's structured this way).

## Responsive

- Mobile breakpoint is **560px** (`@media (max-width: 560px)`): the side nav
  yields to the bottom `MobileNav`, hero socials become full-width labeled rows,
  the pull indicator lifts above the tab bar.
- Use existing tokens (`--maxw`, spacing, colors) rather than new magic numbers;
  match the surrounding section's idiom.
