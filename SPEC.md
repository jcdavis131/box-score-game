# The Box Score — SPEC (wiki, source of truth)

Working title: **The Box Score**. The final name is still open; the name
lives in one place (`CONFIG.TITLE` in `game.js`) so a rebrand is a
one-line change. This document is the contract. Anything not pinned here
is listed under **Interpretations** — flagged, never silently reinterpreted.

## Locked spec

- **Deck:** one 108-card deck, shuffled once, shared across all 4 ROUNDS
  (not quarters). No reshuffle between rounds; undealt cards stay undealt.
- **Counts:** Alley-Oop 14 (5 per pair) · Triple-Double 14 (10 per set of 3) ·
  Buckets 14 (1 / 3 / 6 / 10 / 15 for 1 / 2 / 3 / 4 / 5+ of a kind) ·
  All-Star Votes 26 total (1-star 6, 2-star 12, 3-star 8; ranked by total
  stars, most 6 / second 3 / ties split) · Free Throw 5 (1 each) ·
  Layup 10 (2 each) · Deep Three 5 (3 each) · Hot Hand 6 (triples the NEXT
  shot in the same round only: 3 / 6 / 9; worth 0 if no shot follows) ·
  Timeout 4 (draft one extra card from your hand that turn, worth 0) ·
  Rings 10 (kept all game; end of game most +6 / fewest −6 / ties split;
  all-tie nets zero).
- **Sets** are scored per round and reset; only Rings carry across rounds.
- **Hand sizes:** 10 / 9 / 6 / 5 cards for 2 / 3 / 4 / 5 players, per round.
- **Seats:** solo = player vs 3 personality bots — Marv the Collector, Dex
  the Gunner, Prudence the Ledger, each with a distinct drafting
  personality. 2-player games get a bot third seat.
- **Faces:** real NBA players/coaches as variants (~60+ faces). Names +
  team / era / position + one-line flavor ONLY. NO player photos, NO team
  logos — hard licensing guardrail. Unofficial fan game, no league
  affiliation.
- **Features:** wax-pack opening ritual · session binder · "IN THE BOOKS"
  red stamp per round · final box score + Rings swing · graded draft
  report card · downloadable champion-card PNG · 5-letter seeded deck
  codes (same seed = same deck, shareable) · one-tap "Copy the challenge".
- **Visuals:** Newsprint bones (fine ink lines on paper, tabular numerals,
  one red accent, Playfair-style masthead) + vibrant per-type colors
  across emblems, chips, and a palette bar under the masthead. Real CSS 3D
  card graphics (tilt on hover, flip on play, depth and shadow) and fun
  isometric animations (table scene, dealing, passing, pack tear and
  fan-out, scoring stamps, champion celebration). One rAF-driven motion
  timeline per scene; picks instant; `prefers-reduced-motion` respected.
  Mobile-first, lean, no heavy frameworks. Brighter dark mode.
- **Viral/standalone:** SEO + Open Graph meta, instant play with no login,
  shareable challenge codes.

## Interpretations (flagged, not silent)

1. **Votes, second place.** Second-place points (3) are awarded only when
   there is a lone leader AND the second-place star total is above 0.
   An all-way tie above 0 splits the 6 only. All-zero stars award nothing.
2. **Rings swing.** Most splits +6, fewest splits −6. If one player leads
   and the rest tie for fewest, they split −6. All-tie nets zero.
3. **Timeout chains.** Each Timeout pick grants another pick from the same
   hand, and chains: a second Timeout grants a third pick, and so on. The
   chain ends on a non-Timeout pick or an empty hand.
4. **Hot Hand "shot".** Shots are Free Throw, Layup, Deep Three only
   (1 / 2 / 3 → 3 / 6 / 9). A pending Hot Hand survives non-shot picks
   within the round and expires at round end, worth 0.
5. **Draft structure.** Each turn all seats pick once (humans in seat
   order, bots immediately after), then hands rotate. Odd rounds pass one
   way, even rounds the other.
6. **Seed scope.** A deck code reproduces the deck order (and bot
   tie-breaks, which share the seed). It does not reproduce a full game,
   because outcomes also depend on human picks.
7. **Fractional points.** Vote and ring splits can produce .5 points;
   scores display trimmed (e.g. 24.5, never 24.50).

## Evidence contract (verify.js, script-checked, never eyeballed)

- Deck counts exactly as locked above; total exactly 108; ≥ 60 distinct
  variant faces.
- Same code → same deck order; different code → different order.
- Targeted edge cases: Hot Hand triple / cold / surviving a non-shot;
  Buckets ladder 1–5+; vote tie splits; rings all-tie → 0; timeout chain.
- Mass sims: 3,000 bot games across 2–5 players; every game completes;
  every total recomputes from round scores + swing; timeout chains,
  hot-hand triples, hot-hand cold cases, and rings all-tie games must all
  occur (a missing edge is a failing build, not a rare event).
- Live: production URL returns 200 and serves the new bytes, cache-busted.

## v1.1 seams (structure so the next pass lands cleanly)

- **Engine is UI-free** (`createGame`, `pickOne`, `scoreRound`,
  `autoPlayGame`). The spectate bot-tournament mode drives this engine
  with all-bot seats and a timer — no engine changes needed.
- **Bots are pure pick functions** (`pickBot`). A tournament is a
  round-robin over these functions plus the existing runner.
- **Motion is one standalone timeline** (`Motion.play`). New scenes plug
  in as step lists.
- **Title is one constant** (`CONFIG.TITLE`). Rebrand = one line.
- **Report card + seed code** make any reported game reproducible:
  the fix loop (user plays, reports, builder fixes fast) runs on these.

## Stack

GitHub (public repo, one owner) + Vercel (production). No host switch on
a video's say-so. No photos, logos, or licensed assets without clearance.
