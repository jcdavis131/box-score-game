/* Verification for The Box Score. Run: node verify.js
   Exits non-zero on any failure. No eyeballing: counts, sims, and edge
   cases are all asserted in code. */
'use strict';
const BS = require('./game.js');
let failures = 0;
function ok(cond, label) {
  if (cond) console.log('PASS ' + label);
  else { failures++; console.log('FAIL ' + label); }
}
function card(type, stars) {
  return { id: -1, type, stars: stars || 0, face: { name: 'Test', team: '', era: '', pos: '', flavor: '' } };
}

/* 1. Deck counts — locked spec, exactly 108. */
const deck = BS.buildDeck();
const counts = BS.deckCounts(deck);
const expected = {
  'Alley-Oop': 14, 'Triple-Double': 14, 'Buckets': 14,
  'All-Star Votes:1★': 6, 'All-Star Votes:2★': 12, 'All-Star Votes:3★': 8,
  'Free Throw': 5, 'Layup': 10, 'Deep Three': 5, 'Hot Hand': 6,
  'Timeout': 4, 'Rings': 10
};
let total = 0;
for (const k of Object.keys(expected)) { ok(counts[k] === expected[k], `deck ${k} = ${expected[k]} (got ${counts[k]})`); total += expected[k]; }
ok(deck.length === 108, `deck total 108 (got ${deck.length})`);
ok(total === 108, 'expected counts sum to 108');
const faces = new Set();
deck.forEach(c => faces.add(c.face.name));
ok(faces.size >= 60, `distinct variant faces >= 60 (got ${faces.size})`);

/* 2. Same code = same deck; different code = different deck. */
const g1 = BS.createGame({ code: 'ABCDE', botOnly: true, playerCount: 4 });
const g2 = BS.createGame({ code: 'ABCDE', botOnly: true, playerCount: 4 });
ok(JSON.stringify(g1.deck.map(c => c.id)) === JSON.stringify(g2.deck.map(c => c.id)), 'same code -> same deck order');
const g3 = BS.createGame({ code: 'FGHIJ', botOnly: true, playerCount: 4 });
ok(JSON.stringify(g1.deck.map(c => c.id)) !== JSON.stringify(g3.deck.map(c => c.id)), 'different code -> different deck order');

/* 3. Targeted edge cases. */
// Hot Hand triples the next shot only; survives non-shot picks; cold = 0.
let s = BS.scorePicks([{ card: card('Hot Hand') }, { card: card('Free Throw') }]);
ok(s.shotPts === 3, 'Hot Hand + Free Throw = 3');
s = BS.scorePicks([{ card: card('Hot Hand') }, { card: card('Buckets') }, { card: card('Layup') }]);
ok(s.shotPts === 6, 'Hot Hand survives a non-shot pick, Layup triples to 6');
s = BS.scorePicks([{ card: card('Hot Hand') }]);
ok(s.shotPts === 0 && s.hotCold === 1, 'Hot Hand with no shot = 0 and flagged cold');
// Buckets ladder.
for (const [n, pts] of [[1, 1], [2, 3], [3, 6], [4, 10], [5, 15], [7, 15]]) {
  const picks = [];
  for (let i = 0; i < n; i++) picks.push({ card: card('Buckets') });
  ok(BS.scorePicks(picks).setPts === pts, `Buckets x${n} = ${pts}`);
}
// Vote ties split; second place only when a lone leader and second stars > 0.
function voteGame(starLists) {
  const g = { players: starLists.map(() => ({ picks: [], roundScores: [], total: 0, hotCold: 0, rings: 0 })), roundResults: [] };
  starLists.forEach((stars, i) => { stars.forEach(st => g.players[i].picks.push({ card: card('All-Star Votes', st) })); });
  return BS.scoreRound(g);
}
let vr = voteGame([[3, 2], [3, 2], [3], []]);
ok(vr[0].votePts === 3 && vr[1].votePts === 3 && vr[2].votePts === 0, 'vote tie for first splits 6, no second place');
vr = voteGame([[3, 2], [3], [3], []]);
ok(vr[0].votePts === 6 && vr[1].votePts === 1.5 && vr[2].votePts === 1.5, 'lone leader 6, second tie splits 3');
// Rings all-tie -> zero swing; else most +6 / fewest -6 split.
function swingGame(rings) {
  const g = { players: rings.map(r => ({ rings: r, total: 10 })) };
  return BS.ringsSwing(g);
}
let sw = swingGame([2, 2, 2, 2]);
ok(sw.every(v => v === 0), 'rings all-tie -> swing 0');
sw = swingGame([3, 1, 1, 0]);
ok(sw[0] === 6 && sw[3] === -6 && sw[1] === 0 && sw[2] === 0, 'rings most +6, fewest -6');
// Timeout chain: two consecutive Timeout picks both grant another pick.
const tg = BS.createGame({ code: 'ZZZZZ', botOnly: true, playerCount: 4 });
const tp = tg.players[0];
tp.hand = [card('Timeout'), card('Timeout'), card('Buckets')];
tp.hand.forEach((c, i) => { c.id = 1000 + i; });
ok(BS.pickOne(tg, 0, 1000) === 'timeout', 'timeout pick 1 grants another');
ok(BS.pickOne(tg, 0, 1001) === 'timeout', 'timeout pick 2 chains');
ok(BS.pickOne(tg, 0, 1002) === 'ok', 'chain ends on a non-timeout pick');
ok(tp.hand.length === 0, 'chain consumed the whole hand');

/* 4. Mass sims: 3000 bot games, 2-5 players, invariants + edge occurrence. */
let foundChain = 0, foundTriple = 0, foundCold = 0, foundRingsTie = 0, games = 0;
function codeFor(n) {
  let s = '';
  for (let i = 0; i < 5; i++) { s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26); }
  return s;
}
for (let n = 0; n < 3000; n++) {
  const pc = 2 + (n % 4); // cycles 2,3,4,5
  const code = codeFor(n);
  const g = BS.createGame({ code, botOnly: true, playerCount: pc });
  const stats = BS.autoPlayGame(g);
  games++;
  if (g.phase !== 'gameEnd') { ok(false, `game ${n} completed`); break; }
  // Invariant: totals = round scores + swing.
  g.players.forEach((p, i) => {
    const sum = p.roundScores.reduce((a, b) => a + b, 0) + g.swing[i];
    if (Math.abs(sum - p.total) > 1e-9) { ok(false, `game ${n} total recomputes (player ${i})`); }
  });
  if (g.deckPos > 108) ok(false, `game ${n} deckPos within deck`);
  if (stats.timeoutChains > 0) foundChain++;
  if (stats.hotTriples > 0) foundTriple++;
  if (stats.hotCold > 0) foundCold++;
  if (stats.ringsAllTie) {
    foundRingsTie++;
    if (!g.swing.every(v => v === 0)) ok(false, `game ${n} rings all-tie has zero swing`);
  }
}
ok(games === 3000, '3000 sim games completed');
ok(foundChain > 0, `timeout chains occurred in sims (${foundChain} games)`);
ok(foundTriple > 0, `hot-hand triples occurred in sims (${foundTriple} games)`);
ok(foundCold > 0, `hot-hand cold cases occurred in sims (${foundCold} games)`);
ok(foundRingsTie > 0, `rings all-tie games occurred in sims (${foundRingsTie} games)`);

/* 5. One full solo-shaped game (human seat random) with a readable line. */
const solo = BS.createGame({ code: 'SOLOA', botOnly: true, playerCount: 4 });
const sstats = BS.autoPlayGame(solo);
console.log('SOLO-SHAPE GAME code SOLOA totals:', solo.players.map(p => p.total).join(', '),
  '| champion:', solo.champion.join(' & '), '| swing:', solo.swing.join(', '));

/* 6. v1.1 spectate: stepTurn completes games, equals autoPlayGame, tournaments are deterministic. */
function stepGame(code, pc) {
  const g = BS.createGame({ code, botOnly: true, playerCount: pc });
  let steps = 0;
  while (g.phase !== 'gameEnd' && steps < 1000) { BS.stepTurn(g); steps++; }
  return g;
}
for (const pc of [3, 4]) {
  const g = stepGame('STEPA', pc);
  ok(g.phase === 'gameEnd', `stepTurn ${pc}-bot game completes`);
  ok(g.champion && g.champion.length > 0, `stepTurn ${pc}-bot game has a champion`);
  g.players.forEach((p, i) => {
    const sum = p.roundScores.reduce((a, b) => a + b, 0) + g.swing[i];
    if (Math.abs(sum - p.total) > 1e-9) ok(false, `stepTurn ${pc}-bot totals recompute (player ${i})`);
  });
}
// Equivalence: same code + seats -> stepTurn loop totals == autoPlayGame totals.
for (const [code, pc] of [['EQAAA', 3], ['EQBBB', 4], ['EQCCC', 5]]) {
  const a = BS.createGame({ code, botOnly: true, playerCount: pc });
  BS.autoPlayGame(a);
  const b = stepGame(code, pc);
  ok(JSON.stringify(a.players.map(p => p.total)) === JSON.stringify(b.players.map(p => p.total)),
    `stepTurn == autoPlayGame totals for ${code}/${pc} bots`);
  ok(JSON.stringify(a.champion) === JSON.stringify(b.champion), `stepTurn == autoPlayGame champion for ${code}`);
}
// Tournament codes: deterministic, valid, distinct per index.
ok(BS.tourneyGameCode('ABCDE', 0) === BS.tourneyGameCode('ABCDE', 0), 'tourney code deterministic');
ok(/^[A-Z]{5}$/.test(BS.tourneyGameCode('ABCDE', 2)), 'tourney game code is 5 letters');
ok(BS.tourneyGameCode('ABCDE', 0) !== BS.tourneyGameCode('ABCDE', 1), 'tourney game codes differ per index');
ok(BS.tourneyGameCode('abc', 0) === null, 'tourney code rejects short base');
// Tournament determinism: same tourney code -> same champions across a 5-game series, run twice.
function tourneyRun(base) {
  const out = [];
  for (let i = 0; i < 5; i++) {
    const g = stepGame(BS.tourneyGameCode(base, i), 3);
    out.push({ champ: g.champion.slice().sort().join('&'), totals: g.players.map(p => p.total) });
  }
  return out;
}
ok(JSON.stringify(tourneyRun('TRNYA')) === JSON.stringify(tourneyRun('TRNYA')), 'same tourney code -> same tournament');
ok(JSON.stringify(tourneyRun('TRNYA')) !== JSON.stringify(tourneyRun('TRNYB')), 'different tourney code -> different tournament');

console.log(failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECKS FAILED');
process.exit(failures === 0 ? 0 : 1);
