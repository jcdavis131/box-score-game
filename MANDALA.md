# The Box Score — Harada Mandala (v1.1: spectate + viral polish)

Status: DRAFTED TOP-DOWN, one layer at a time. Each layer below was
reviewed by the simulated panel BEFORE the next layer was fleshed out.
Nothing in this file is a claim that any real person participated,
reviewed, or endorsed anything — every "panel" note below is a
simulated lens, written by the coordinator from public positions.

Locked product spec lives in SPEC.md (the wiki). This mandala is the
goal record: it says WHY each piece exists and WHAT judges it. If this
file and SPEC.md ever disagree about the game, SPEC.md wins and this
file gets corrected — never the reverse.

Working title: The Box Score (CONFIG.TITLE, one-line rebrand).
Deploy note: no live URL exists yet. The Vercel deploy is blocked on a
team-scope grant only Cameron can make. A push is not a launch.

---

## Panel roster (SIMULATED lenses — no real contact, no endorsement)

Grounding rule used throughout: each lens is primed from that
researcher's REAL public work and positions, as verified from public
summaries read during this build. No paper title, citation, or "latest
paper" claim is made for any lens — positions are described, not cited,
unless the work named is a widely known book/framework confirmed in
those summaries.

1. **Game-design lens (Schell lens).** Primed from Jesse Schell's
   publicly known design approach: evaluate a game through many
   "lenses" (questions/perspectives), judge mechanics by the dynamics
   they create and the experience they deliver, iterate with empathy
   for the player, balance challenge and reward. Asks: what does the
   player FEEL, moment to moment?
2. **Player-motivation lens (Bartle lens).** Primed from Richard
   Bartle's publicly known player taxonomy: four broad motivations —
   achieving (mastery, points, completion), exploring (discovery,
   systems), socializing (relationships, shared talk), competing
   (measuring against others) — originally observed in text multi-user
   dungeons, on two axes (players vs world, acting vs interacting).
   Bartle himself cautioned against applying the taxonomy outside its
   original context; this lens carries that caution with it.
3. **HCI/UX lens (Norman lens).** Primed from Don Norman's publicly
   known human-centered design principles: affordances and signifiers
   (a control must look like what it does), feedback for every action,
   conceptual models the player can actually hold, natural mapping,
   constraints that prevent error, and the two gulfs — execution
   (knowing how to act) and evaluation (knowing what happened).
4. **Graphics + performance lens (Lewis lens).** Primed from Paul
   Lewis's publicly known web-animation work: the FLIP technique
   (First, Last, Invert, Play) and the rule that only transform and
   opacity are cheap to animate — animating layout properties causes
   jank. Asks: is every animation transform/opacity-only, and does the
   page stay fast on a phone?
5. **Viral-growth lens (Berger lens).** Primed from Jonah Berger's
   publicly known STEPPS framework for why things spread: Social
   Currency (sharing makes the sharer look good), Triggers (top of
   mind = tip of tongue), Emotion (high-arousal feelings drive
   sharing), Public (visible use advertises itself), Practical Value
   (useful to the receiver), Stories (the message rides inside a
   narrative people want to retell). "Valuable virality": the product
   must be embedded in the story, not bolted beside it.
6. **Bot-opponent lens (Togelius lens).** Primed from Julian
   Togelius's publicly known research program: AI and games, player
   modelling, procedural content generation, and fair benchmarking of
   game AI through competitions. Asks: are the bots legible (can a
   watcher tell WHY a bot picked that card?), are matchups fair and
   comparable (same decks, seeded, reproducible), and do the bots
   differ in a way a spectator can actually see?

---

## LAYER 0 — North star goal (panel-reviewed, then agreed)

**North star: a viral standalone card-game webapp people share
unprompted — they play it, talk about it, and send it to friends
without being asked.**

Panel review of this layer — AGREED, with dissent recorded:
- Schell lens: agreed, but warned the north star must be felt in a
  single session (one funny swing, one "you had to see it" moment),
  not only in aggregate sharing stats.
- Bartle lens: agreed, with a caution — do not slice the audience
  into rigid types; use motivations loosely (mastery, discovery,
  talk, rivalry) or the design will chase segments that do not exist
  for a card game.
- Berger lens: agreed — this wording already IS the viral goal
  (sharing unprompted), and insisted the share must carry the game
  itself (a playable deck code), not just a screenshot.
- Norman lens: agreed, provided "viral" never means growth hacks that
  confuse the player (popups, forced shares). Sharing stays one tap,
  always the player's choice.
- Lewis lens: agreed, provided virality never costs speed — a shared
  link that loads slowly is a dead link.
- Togelius lens: agreed, provided "viral" does not mean rigged
  spectacles — bot matchups stay seeded and fair, or the stories
  people share are fiction.
- DISSENT KEPT: the Bartle lens dissents from any numeric viral
  target being set by the panel. No numbers below are targets unless
  Cameron sets them.

**North-star metrics (directional only, set by Cameron's stated
intent — a viral standalone game people share):**
- Direction: shares happen without prompting; shared links get played
  (not just clicked); players return and bring friends.
- Candidate measures (PANEL-PROPOSED, not targets — they become
  targets only on Cameron's word): share taps per session, shared-link
  plays, return sessions. No thresholds are claimed here.

Layer 0 agreed → Layer 1 fleshed out.

---

## LAYER 1 — Long-term goals (panel-reviewed, then agreed)

**LT1 — Spectate + viral kit shipped on the standalone site.**
The site is not just playable, it is watchable and sendable: bot
tournaments you can watch live, links that open the exact game or
tournament they promise.
Metric: spectate mode + share kit exist on the site and pass the
evidence contract (see Layer 5/6). Judged by acceptance criteria, not
by activity counts.

**LT2 — A game people return to and bring friends to.**
One session must create the next: a memorable finish, a reason to
rematch the same deck, a reason to send a tournament to a friend.
Metric: every session ends with a shareable artifact (challenge,
champion card, tournament result) and a one-tap rematch path.

**LT3 — The game stays honest and reproducible as it grows.**
Locked 108-card deck and scoring never drift; every shared game is
replayable from its code; every reported game is reproducible from
its report card. No feature may break this.
Metric: verify.js green on every change; any spec deviation is
flagged in SPEC.md, never silent.

Panel review of this layer — AGREED, with dissent recorded:
- Togelius lens: agreed LT3 first — without reproducibility, LT1's
  spectacles are untrustworthy. Demanded seeded tournament codes.
- Berger lens: dissented from LT2's breadth — "return AND bring
  friends" is two goals; agreed to keep them paired ONLY because the
  share artifact is the bridge (a shared deck IS the return path).
- Norman lens: agreed, provided LT1's watch mode never strands a
  newcomer (a first-time spectator must understand what happened
  within one round — hence the event feed, Layer 4).
- Schell lens: agreed, but insisted LT2's "memorable finish" be a
  designed moment (Rings swing reveal), not an accident.
- Lewis lens: agreed, provided LT1 adds no heavy assets (no video,
  no image payloads).
- Bartle lens: agreed, noting LT2 serves achievers (report card),
  explorers (binder, variants), socializers (pass-and-play, shared
  decks), and rivals (tournaments) without building four games.

Layer 1 agreed → Layer 2 fleshed out.

---

## LAYER 2 — Medium-term milestones (panel-reviewed, then agreed)

**M1 — Spectate bot-tournament watchable end to end.**
Bots play each other live in the UI with a running box score; a
viewer can follow a whole game without touching anything, pause it,
and finish it instantly.
Parent: LT1. Metric: a full bot game completes in spectate; scores,
rings, and last picks are visible at every step.

**M2 — Share kit: deep links + previews + one-tap copies.**
A game link opens that deck; a tournament link opens that
tournament; link previews carry the title and description; every
share is one tap.
Parent: LT1 + LT2. Metric: ?code= and ?mode=spectate&tourney= links
resolve to the promised content; copy actions succeed via clipboard
with fallback.

**M3 — Performance + UX pass.**
Instant play, no login, transform/opacity-only animation,
reduced-motion respected, mobile-first layout, no heavy frameworks.
Parent: LT1 + LT3. Metric: no new assets beyond the existing page
weight class (HTML/CSS/JS + one small SVG); node --check clean;
animation remains rAF transform/opacity only.

**M4 — Bot personalities legible in spectate.**
A watcher can tell Marv (collects sets), Dex (shoots), and Prudence
(plays the ledger) apart from their picks alone, and the feed says
what each pick was.
Parent: LT1 + LT2. Metric: each bot's last pick + rings + total are
visible every turn; the feed names every pick's type and face.

Panel review of this layer — AGREED, with dissent recorded:
- Norman lens: dissented from M1 as first stated ("watchable"
  without a control spec) — forced the addition of play/pause,
  speed, finish-now, and next-game controls. Agreed after controls
  were named.
- Lewis lens: agreed M3, but demanded the spectate feed be capped
  (DOM growth is a performance bug in a long tournament) — feed
  capped at 40 lines.
- Togelius lens: agreed M1/M4, but demanded tournament games use
  derived seeded codes (same tournament code = same games), not
  random draws — otherwise standings are not comparable.
- Berger lens: agreed M2, but warned a deep link that opens the
  WRONG content is worse than no deep link — hence the resolve
  metric (link must open the promised content).
- Schell lens: agreed, noting M4 is the drama engine: without
  legible personalities, spectate is just numbers ticking.

Layer 2 agreed → Layer 3 fleshed out.

---

## LAYER 3 — Short-term goals (panel-reviewed, then agreed)

**S1 — Spectate a single bot game (3 bots, live).**
Marv vs Dex vs Prudence, step-by-step with a timer, scores and last
picks visible. Parent: M1.
**S2 — Tournament standings across a series + replayable code.**
A fixed series of seeded games, a standings table (wins, total
points), and one tournament code that reproduces the whole series.
Parent: M1 + M4.
**S3 — Deep-link share flows for games and tournaments.**
?code= for games; ?mode=spectate&tourney= for tournaments; share
texts carry the playable link. Parent: M2.
**S4 — Spectate legibility: feed, stamps, finals.**
Per-turn event feed, round stamps, per-game finals, tournament
final. A newcomer can follow one round and know who is winning and
why. Parent: M1 + M4.
**S5 — Verification suite extended.**
stepTurn equivalence, tournament determinism, and the full existing
contract stay green. Parent: LT3 + M3.

Panel review of this layer — AGREED, with dissent recorded:
- Togelius lens: dissented from S2's series length being arbitrary
  — agreed on 5 games as a fixed, reviewable default (odd, so no
  tie for first on wins alone is forced; short enough to watch),
  recorded as a panel default, not a Cameron-set number. Cameron may
  change it.
- Norman lens: agreed S4 only with the feed capped and pause
  prominent — autoplay without an obvious pause is a gulf of
  evaluation (the viewer cannot catch up).
- Berger lens: agreed S3, noting the tournament share text must
  name the storyline (who won, by what) — a bare code is not a
  story.
- Lewis lens: agreed, provided spectate reuses existing styles and
  adds no framework.
- Schell lens + Bartle lens: agreed — S1 serves curiosity
  (explorers) and rivalry (competitors) at once.

Layer 3 agreed → Layer 4 fleshed out.

---

## LAYER 4 — Higher-order tasks (panel-reviewed, then agreed)

**T1 — Engine step runner (stepTurn).** A UI-free function that
advances one full turn (every seat picks with chains, then rotate or
end round) and returns the turn's events. Spectate drives it on a
timer; sims drive it in a loop. Parent: S1 + S5.
Acceptance: stepTurn-loop totals equal autoPlayGame totals for the
same code and seats (proven in verify.js, not asserted by hand).

**T2 — Tournament code derivation.** A deterministic function from
one 5-letter tournament code to per-game deck codes, so the same
tournament code reproduces the same games. Parent: S2 + S5.
Acceptance: same base + index = same game code; different index =
different code; all codes valid 5-letter A–Z.

**T3 — Spectate UI (watch, control, standings).** Setup entry,
live score + last-pick panels, event feed, play/pause/speed/
finish-now/next-game controls, standings table, tournament final.
Parent: S1 + S2 + S4.
Acceptance: a full tournament (5 games) can be watched, paused,
finished instantly, and shared, without touching the human game flow.

**T4 — Share + deep-link upgrade.** Game challenge text carries a
playable ?code= link; tournament share carries a ?mode=spectate&
tourney= link with the storyline; boot resolves deep links on load.
Parent: S3.
Acceptance: pasting a game link pre-fills the deck code; pasting a
tournament link starts that tournament.

**T5 — Viral polish pass.** Link-preview meta (twitter:image,
theme-color), share copy that names the story, no-login instant
play unchanged, no new heavy assets. Parent: S3 + M3.
Acceptance: node --check clean; verify.js green; no photos, no
logos, CONFIG.TITLE still the single rebrand point.

**T6 — SPEC + verification updates.** SPEC.md gains the v1.1
section (spectate format, deep links, stepTurn equivalence);
verify.js gains stepTurn, equivalence, and tournament-determinism
checks. Parent: S5 + LT3.
Acceptance: verify.js exits 0; SPEC.md describes exactly what
shipped, including flagged interpretations.

Panel review of this layer — AGREED, with dissent recorded:
- Lewis lens: dissented from any plan that re-rendered the whole
  page per spectate step — agreed only on targeted DOM updates
  (scores, panels, feed append) with transform/opacity animation.
- Norman lens: agreed T3 only with controls labeled in plain words
  (Play/Pause, Finish now, Next game) — no icon-only controls.
- Togelius lens: agreed T1/T2, demanding the equivalence proof
  (T1 acceptance) rather than a code review claim.
- Berger lens: agreed T4/T5, noting share copy without a story
  (winner + margin) fails its own test.
- Schell lens: agreed, noting T3's round stamps carry the drama
  (a round ending must FEEL like an ending).

Layer 4 agreed → Layer 5 fleshed out.

---

## LAYER 5 — Discrete actions (panel-reviewed, then agreed)

Each action has one verifiable outcome. Panel sign-off per action is
recorded as A (agreed) with any dissent inline.

- A1: Add stepTurn(g) to the engine + export it. (T1)
- A2: Add tourneyGameCode(base, i) + export it. (T2)
- A3: Add spectate mode to setup (mode option + watch entry). (T3)
- A4: Add spectate section markup (scores, panels, feed, controls,
  standings, final). (T3)
- A5: Add spectate controller (timer, play/pause/speed, finish-now,
  next-game, standings updates). (T3)
- A6: Upgrade challengeText with a playable ?code= link. (T4)
- A7: Add tournament share text with storyline + deep link. (T4)
- A8: Add boot deep-link resolution (?code, ?mode=spectate&tourney).
  (T4)
- A9: Add link-preview meta (twitter:image, theme-color). (T5)
- A10: Add spectate styles (reuse existing classes where possible).
  (T3 + M3)
- A11: Add verify.js checks (stepTurn completion, equivalence,
  tournament determinism). (T6)
- A12: Update SPEC.md with the v1.1 section + interpretations. (T6)
- A13: Update README.md (spectate + mandala pointer). (T6)

Panel review of this layer — AGREED. Dissent kept: the Lewis lens
objected to A4/A10 growing the page — agreed only because spectate
reuses the existing panel/table/score-chip styles and adds no
framework or image payload. The Norman lens objected to A8
auto-starting spectate from a link without an obvious exit — agreed
only with a visible "Back to setup" control in the spectate section.

Layer 5 agreed → Layer 6 fleshed out.

---

## LAYER 6 — Todo items (no orphans; every todo names its parent)

Format: [ ] todo — parent action → task → short goal → milestone →
long goal → north star. Evidence = the file/function/check that proves
it done. A todo is done only with its evidence path.

- [ ] stepTurn implemented + exported — A1 → T1 → S1 → M1 → LT1 →
  north star. Evidence: game.js stepTurn + verify.js stepTurn checks.
- [ ] stepTurn-loop totals equal autoPlayGame totals, same code —
  A1 → T1 → S5 → LT3 → north star. Evidence: verify.js equivalence
  check, exit 0.
- [ ] tourneyGameCode deterministic + valid — A2 → T2 → S2 → M1 →
  LT1 → north star. Evidence: verify.js determinism check.
- [ ] Spectate setup entry (mode option) — A3 → T3 → S1 → M1 → LT1 →
  north star. Evidence: index.html modeSelect option.
- [ ] Spectate section markup (scores, panels, feed, controls,
  standings, final) — A4 → T3 → S1/S4 → M1/M4 → LT1 → north star.
  Evidence: index.html #spectate section.
- [ ] Spectate controller (timer, play/pause/speed, finish-now,
  next-game, standings) — A5 → T3 → S1/S2 → M1 → LT1 → north star.
  Evidence: game.js spectate controller + manual step-through (feed
  + scores update per step).
- [ ] Feed capped at 40 lines — A5 → T3 → S4 → M3 → LT1 → north
  star. Evidence: game.js feed cap code.
- [ ] Game share text carries playable ?code= link — A6 → T4 → S3 →
  M2 → LT2 → north star. Evidence: game.js challengeText.
- [ ] Tournament share text carries storyline + deep link — A7 → T4
  → S3 → M2 → LT2 → north star. Evidence: game.js tourney share
  function.
- [ ] Boot resolves ?code and ?mode=spectate&tourney — A8 → T4 →
  S3 → M2 → LT2 → north star. Evidence: game.js boot deep-link
  code.
- [ ] Link-preview meta added — A9 → T5 → S3 → M2 → LT1 → north
  star. Evidence: index.html head meta lines.
- [ ] Spectate styles added, no framework — A10 → T3 → S1 → M3 →
  LT1 → north star. Evidence: style.css spectate classes.
- [ ] verify.js extended (stepTurn, equivalence, determinism) —
  A11 → T6 → S5 → LT3 → north star. Evidence: verify.js new
  section, exit 0.
- [ ] SPEC.md v1.1 section written — A12 → T6 → S5 → LT3 → north
  star. Evidence: SPEC.md v1.1 section.
- [ ] README.md updated — A13 → T6 → S5 → LT3 → north star.
  Evidence: README.md spectate + mandala lines.
- [ ] Locked deck/scoring untouched — all actions → LT3 → north
  star. Evidence: verify.js full run, exit 0 (108 counts + sims).
- [ ] No photos/logos; CONFIG.TITLE still single rebrand point —
  all actions → LT3 → north star. Evidence: grep (no new img
  assets); CONFIG.TITLE unchanged in shape.
- [ ] Push to main of box-score-game only — all actions → LT1 →
  north star. Evidence: git log on origin/main; no other repo
  touched. NOTE: push is not launch — no live URL exists until the
  Vercel team-scope grant lands.

---

## Guardrails (bind every layer)

- Locked 108-card deck and scoring never change in this pass.
- Text-only faces: no photos, no team logos, no league affiliation.
- CONFIG.TITLE stays the one-line rebrand.
- No host switch. No live URL claimed from a push alone.
- verify.js must exit 0 before any push. A failing check blocks the
  push, not the report.
- Disagreements above are part of the record, not defects to erase.
