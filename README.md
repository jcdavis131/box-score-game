# The Box Score

A fast, standalone drafting card game. One 108-card deck, 4 rounds,
Marv / Dex / Prudence (or a friend), and a champion card to prove it.

## Play it

Open `index.html` in any browser — no build step, no login. Or serve it:

```bash
npx serve .
```

## Verify it

```bash
node verify.js
```

Deck counts, seed reproducibility, edge cases (Hot Hand, Timeout chains,
vote splits, rings all-tie), and 3,000 simulated games across 2–5 players
— all asserted in code.

## Structure

- `index.html` — page, masthead, table scene, modals, SEO + Open Graph.
- `style.css` — Newsprint bones + vibrant per-type colors, 3D cards,
  isometric table, dark mode, reduced motion.
- `game.js` — sections in order: CONFIG · RNG + seed · DECK · ENGINE
  (UI-free) · BOTS (pure pick functions) · MOTION (one rAF timeline) ·
  UI · BOOT. `CONFIG.TITLE` is the one-line rebrand.
- `verify.js` — the evidence contract (see SPEC.md).
- `SPEC.md` — the wiki. The spec is the contract; deviations are flagged
  there, never silently reinterpreted.

## v1.1 — spectate + viral polish

Spectate bot-tournament mode is built: `stepTurn` drives the UI-free
engine one turn at a time on a timer (Play/Pause, speed, Finish now),
5 seeded games per tournament code, standings, event feed, and deep
links (`?code=`, `?mode=spectate&tourney=`). MANDALA.md is the goal
record (panel-reviewed, top-down); SPEC.md stays the wiki.

## Deploy

Production is Vercel, connected to this repo (GitHub + Vercel, one owner).
The live URL must return 200 and serve the new bytes before anything is
called done.

## v1.1 seams (shipped)

Spectate drives the engine with `stepTurn` (one full turn per call)
on a timer — `autoPlayGame` runs to completion and cannot step, so
the stepwise runner was the honest seam. Tournament pairings are
seeded series over the `pickBot` personalities, not random draws.
