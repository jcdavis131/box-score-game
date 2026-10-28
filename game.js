/* =====================================================================
   The Box Score — game engine + UI.
   Sections (keep them in this order so a later pass lands cleanly):
     1. CONFIG      — the name lives here, one line, for a rebrand.
     2. RNG + SEED  — 5-letter deck codes, same code = same deck.
     3. DECK        — locked 108-card counts + variant faces (names only).
     4. ENGINE      — pure state: deal, pick, pass, score, swing, report.
                      UI-free on purpose: the v1.1 spectate mode drives
                      this same engine with all-bot seats + a timer.
     5. BOTS        — Marv / Dex / Prudence, pure pick functions.
     6. MOTION      — one rAF timeline per scene. Picks stay instant.
     7. UI          — render, pack ritual, binder, stamps, PNG, share.
     8. BOOT        — wire the page. Guarded so node can require the file.
   SPEC.md is the wiki. Deviations from it are flagged there, never
   silently reinterpreted.
   ===================================================================== */
'use strict';
var BS = (function () {
  /* ---------------- 1. CONFIG ---------------- */
  var CONFIG = {
    TITLE: 'The Box Score',          // <-- rebrand = change this one line
    ROUNDS: 4,
    HAND_SIZE: { 2: 10, 3: 9, 4: 6, 5: 5 },
    BUCKET_POINTS: { 0: 0, 1: 1, 2: 3, 3: 6, 4: 10 },
    VOTE_FIRST: 6, VOTE_SECOND: 3, RING_FIRST: 6, RING_LAST: -6
  };

  /* ---------------- 2. RNG + SEED ---------------- */
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function codeToSeed(code) {
    var s = 0;
    for (var i = 0; i < code.length; i++) s = (s * 26 + (code.charCodeAt(i) - 65)) >>> 0;
    return (s ^ 0x9E3779B9) >>> 0;
  }
  function randomCode(rng) {
    var out = '';
    for (var i = 0; i < 5; i++) out += String.fromCharCode(65 + Math.floor(rng() * 26));
    return out;
  }
  function shuffle(arr, rng) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  /* ---------------- 3. DECK ---------------- */
  // V = variant face: name, team, era, position, one-line flavor. Names +
  // facts only: no photos, no logos, no league affiliation.
  function V(n, t, e, p, f) { return { name: n, team: t, era: e, pos: p, flavor: f }; }
  var FACES = {
    'Alley-Oop': [
      V('Vince Carter', 'Toronto Raptors', '2000s', 'Guard/Forward', 'Half-Man, Half-Amazing — the dunk contest never recovered.'),
      V('Blake Griffin', 'LA Clippers', '2010s', 'Forward', 'Jumped over a car. The rim filed a complaint.'),
      V('Shawn Kemp', 'Seattle SuperSonics', '1990s', 'Forward', 'The Reign Man — thunder in high-tops.'),
      V('Michael Jordan', 'Chicago Bulls', '1990s', 'Guard', 'Took flight from the free-throw line and never really landed.'),
      V('Dominique Wilkins', 'Atlanta Hawks', '1980s', 'Forward', 'The Human Highlight Film, nightly.'),
      V('Julius Erving', 'Philadelphia 76ers', '1980s', 'Forward', 'The Doctor wrote the prescription for flight.'),
      V('Clyde Drexler', 'Portland Trail Blazers', '1990s', 'Guard', 'Glide path: cleared for takeoff.'),
      V('James Worthy', 'LA Lakers', '1980s', 'Forward', 'Big Game James, bigger above the rim.'),
      V('Scottie Pippen', 'Chicago Bulls', '1990s', 'Forward', 'The second star who flew first class.'),
      V('John Stockton', 'Utah Jazz', '1990s', 'Guard', 'Threw the lob; kept the receipt.')
    ],
    'Triple-Double': [
      V('Oscar Robertson', 'Cincinnati Royals', '1960s', 'Guard', 'Averaged a triple-double before it was a stat.'),
      V('Russell Westbrook', 'Oklahoma City Thunder', '2010s', 'Guard', 'Triple-doubles by the dozen, motor always on.'),
      V('Magic Johnson', 'LA Lakers', '1980s', 'Guard', 'The smile ran the fast break.'),
      V('LeBron James', 'Cleveland Cavaliers', '2010s', 'Forward', 'Fills every column, then the next one.'),
      V('Jason Kidd', 'New Jersey Nets', '2000s', 'Guard', 'Saw the pass three plays early.'),
      V('Luka Doncic', 'Dallas Mavericks', '2020s', 'Guard', 'Slow step, full stat sheet.'),
      V('Nikola Jokic', 'Denver Nuggets', '2020s', 'Center', 'Passes like a guard, boards like a center.'),
      V('Rajon Rondo', 'Boston Celtics', '2000s', 'Guard', 'Fourteen assists and a grin.'),
      V('Draymond Green', 'Golden State Warriors', '2010s', 'Forward', 'Defense, dimes, and a running commentary.'),
      V('Wilt Chamberlain', 'Philadelphia Warriors', '1960s', 'Center', 'The record book needed a second volume.'),
      V('Larry Bird', 'Boston Celtics', '1980s', 'Forward', 'Trash talk, then the triple.'),
      V('Ben Simmons', 'Philadelphia 76ers', '2010s', 'Guard/Forward', 'Size of a forward, vision of a point guard.')
    ],
    'Buckets': [
      V('Kobe Bryant', 'LA Lakers', '2000s', 'Guard', '81 points. The bucket had no bottom.'),
      V('Kevin Durant', 'Oklahoma City Thunder', '2010s', 'Forward', 'Seven feet of pure jumper.'),
      V('Carmelo Anthony', 'Denver Nuggets', '2000s', 'Forward', 'The jab step was a legal move.'),
      V('Allen Iverson', 'Philadelphia 76ers', '2000s', 'Guard', 'Crossed over the whole league.'),
      V('James Harden', 'Houston Rockets', '2010s', 'Guard', 'Step-back, whistle, three.'),
      V('Dirk Nowitzki', 'Dallas Mavericks', '2000s', 'Forward', 'One leg, one fadeaway, one ring.'),
      V('Paul Pierce', 'Boston Celtics', '2000s', 'Forward', 'The Truth, and the clock agreed.'),
      V('Tracy McGrady', 'Orlando Magic', '2000s', 'Guard/Forward', '13 points in 33 seconds. Look it up.'),
      V('Damian Lillard', 'Portland Trail Blazers', '2020s', 'Guard', 'Dame Time runs late for defenses.'),
      V('Kyrie Irving', 'Cleveland Cavaliers', '2010s', 'Guard', 'Handles like a rumor — unguardable.')
    ],
    'All-Star Votes': [
      V('Michael Jordan', 'Chicago Bulls', '1990s', 'Guard', 'The ballot box was a formality.'),
      V('LeBron James', 'Cleveland Cavaliers', '2010s', 'Forward', 'Every ballot, every year.'),
      V('Kobe Bryant', 'LA Lakers', '2000s', 'Guard', 'The fans voted; the defense objected.'),
      V('Stephen Curry', 'Golden State Warriors', '2010s', 'Guard', 'The vote went global.'),
      V('Kevin Durant', 'Oklahoma City Thunder', '2010s', 'Forward', 'Tallied like points.'),
      V('Giannis Antetokounmpo', 'Milwaukee Bucks', '2020s', 'Forward', 'From Athens to the top of the ballot.'),
      V('Luka Doncic', 'Dallas Mavericks', '2020s', 'Guard', 'Two countries, one ballot box.'),
      V('Joel Embiid', 'Philadelphia 76ers', '2020s', 'Center', 'Trust the process — and the vote.'),
      V('Jayson Tatum', 'Boston Celtics', '2020s', 'Forward', 'The next ballot already has his name.'),
      V('Nikola Jokic', 'Denver Nuggets', '2020s', 'Center', 'Quietly won the vote. Twice.'),
      V('Damian Lillard', 'Portland Trail Blazers', '2020s', 'Guard', 'Logo range, logo votes.'),
      V('Trae Young', 'Atlanta Hawks', '2020s', 'Guard', 'Ice in the veins, fire on the ballot.')
    ],
    'Free Throw': [
      V('Steve Nash', 'Phoenix Suns', '2000s', 'Guard', '90 percent from the line, 100 percent cool.'),
      V('Rick Barry', 'Golden State Warriors', '1970s', 'Forward', 'Underhanded — and nearly automatic.'),
      V('José Calderón', 'Toronto Raptors', '2000s', 'Guard', 'The quietest 98 percent ever.'),
      V('Mark Price', 'Cleveland Cavaliers', '1990s', 'Guard', 'The line was a layup.'),
      V('Calvin Murphy', 'Houston Rockets', '1970s', 'Guard', 'Small guard, enormous free-throw percentage.')
    ],
    'Layup': [
      V('Tony Parker', 'San Antonio Spurs', '2000s', 'Guard', 'The teardrop fell like rain.'),
      V('Derrick Rose', 'Chicago Bulls', '2010s', 'Guard', 'Exploded to the rim, MVP at 22.'),
      V('Ja Morant', 'Memphis Grizzlies', '2020s', 'Guard', 'Bounces like the floor is a trampoline.'),
      V('Dwyane Wade', 'Miami Heat', '2000s', 'Guard', 'Flash to the cup, poster optional.'),
      V('Chris Paul', 'New Orleans Hornets', '2000s', 'Guard', 'The floater is a layup with manners.'),
      V("De'Aaron Fox", 'Sacramento Kings', '2020s', 'Guard', 'Fastest first step in the West.'),
      V('Donovan Mitchell', 'Utah Jazz', '2010s', 'Guard', 'Spida hangs, then finishes.'),
      V('Kyrie Irving', 'Cleveland Cavaliers', '2010s', 'Guard', 'English off the glass, every angle covered.')
    ],
    'Deep Three': [
      V('Stephen Curry', 'Golden State Warriors', '2010s', 'Guard', 'Changed the geometry of the court.'),
      V('Ray Allen', 'Boston Celtics', '2000s', 'Guard', 'The purest release ever filmed.'),
      V('Reggie Miller', 'Indiana Pacers', '1990s', 'Guard', 'Eight points, nine seconds, one Garden.'),
      V('Larry Bird', 'Boston Celtics', '1980s', 'Forward', 'Called it, then made it.'),
      V('Klay Thompson', 'Golden State Warriors', '2010s', 'Guard', '37 in a quarter. Warm up the bus.')
    ],
    'Hot Hand': [
      V('Jamal Murray', 'Denver Nuggets', '2020s', 'Guard', 'Bubble Murray could not miss.'),
      V('J.R. Smith', 'Cleveland Cavaliers', '2010s', 'Guard', 'Heat-check from the parking lot.'),
      V('Lou Williams', 'LA Clippers', '2010s', 'Guard', 'Sixth man, first option.'),
      V('Vinnie Johnson', 'Detroit Pistons', '1980s', 'Guard', 'The Microwave — instant heat.'),
      V('Jamal Crawford', 'LA Clippers', '2010s', 'Guard', 'Shake, bake, and the bench erupts.'),
      V('Klay Thompson', 'Golden State Warriors', '2010s', 'Guard', 'When Klay gets hot, bring a fire extinguisher.')
    ],
    'Timeout': [
      V('Phil Jackson', 'Chicago Bulls', '1990s', 'Coach', 'Eleven rings, one triangle.'),
      V('Gregg Popovich', 'San Antonio Spurs', '2010s', 'Coach', 'Called time, poured wine, adjusted.'),
      V('Pat Riley', 'LA Lakers', '1980s', 'Coach', 'Slicked hair, iron clipboard.'),
      V('Steve Kerr', 'Golden State Warriors', '2010s', 'Coach', 'Five as a player, four as a coach — and counting.')
    ],
    'Rings': [
      V('Bill Russell', 'Boston Celtics', '1960s', 'Center', 'Eleven rings. The standard.'),
      V('Michael Jordan', 'Chicago Bulls', '1990s', 'Guard', 'Six for six on the biggest stage.'),
      V('Kareem Abdul-Jabbar', 'LA Lakers', '1980s', 'Center', 'Sky hook, six rings.'),
      V('Tim Duncan', 'San Antonio Spurs', '2000s', 'Forward/Center', 'The Big Fundamental, five banners.'),
      V('Robert Horry', 'Houston Rockets', '1990s', 'Forward', 'Big Shot Rob — seven rings, seven teams’ nightmares.'),
      V('John Havlicek', 'Boston Celtics', '1970s', 'Forward', 'Havlicek stole the ball — and eight titles.'),
      V('Sam Jones', 'Boston Celtics', '1960s', 'Guard', 'Ten rings, one bank shot.'),
      V('Tom Heinsohn', 'Boston Celtics', '1960s', 'Forward', 'Eight as a player, two more from the bench.')
    ]
  };
  var TYPE_COLOR = {
    'Alley-Oop': '#e67e22', 'Triple-Double': '#1abc9c', 'Buckets': '#c0392b',
    'Rings': '#d4a017', 'Deep Three': '#8e44ad', 'Hot Hand': '#e75480',
    'All-Star Votes': '#2e86c1', 'Free Throw': '#27ae60', 'Layup': '#27ae60',
    'Timeout': '#7f8c8d'
  };
  var TYPE_EMBLEM = {
    'Alley-Oop': 'AO', 'Triple-Double': 'TD', 'Buckets': 'BK', 'Rings': 'RG',
    'Deep Three': '3PT', 'Hot Hand': 'HH', 'All-Star Votes': 'AS',
    'Free Throw': 'FT', 'Layup': 'LP', 'Timeout': 'TO'
  };
  var SHOT_POINTS = { 'Free Throw': 1, 'Layup': 2, 'Deep Three': 3 };

  function buildDeck() {
    var cards = [], id = 0;
    function add(type, count, stars) {
      var faces = FACES[type];
      for (var i = 0; i < count; i++) {
        var face = faces[i % faces.length];
        cards.push({ id: id++, type: type, stars: stars || 0, face: face });
      }
    }
    add('Alley-Oop', 14);
    add('Triple-Double', 14);
    add('Buckets', 14);
    add('All-Star Votes', 6, 1);
    add('All-Star Votes', 12, 2);
    add('All-Star Votes', 8, 3);
    add('Free Throw', 5);
    add('Layup', 10);
    add('Deep Three', 5);
    add('Hot Hand', 6);
    add('Timeout', 4);
    add('Rings', 10);
    return cards;
  }
  function deckCounts(deck) {
    var c = {};
    deck.forEach(function (card) {
      var k = card.type + (card.type === 'All-Star Votes' ? ':' + card.stars + '★' : '');
      c[k] = (c[k] || 0) + 1;
    });
    return c;
  }

  /* ---------------- 4. ENGINE ---------------- */
  // A pick record keeps pick order (matters for Hot Hand) and whether the
  // shot was tripled. Scoring is derived from the pick log every time —
  // no hidden state — so a sim can recompute any score independently.
  function newPlayer(name, isBot, botId) {
    return {
      name: name, isBot: !!isBot, botId: botId || null,
      hand: [], picks: [], rings: 0, roundScores: [], total: 0,
      hotCold: 0, timeoutChains: 0, hotTriples: 0
    };
  }

  function createGame(opts) {
    opts = opts || {};
    var code = (opts.code || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5);
    var rng = mulberry32(opts.seed != null ? opts.seed : Math.floor(Math.random() * 1e9));
    if (!code) code = randomCode(rng);
    var seed = codeToSeed(code);
    var deckRng = mulberry32(seed);
    var botRng = mulberry32(seed ^ 0x51ED);
    var players;
    if (opts.botOnly) {
      var n = opts.playerCount || 4;
      players = [];
      var ids = ['marv', 'dex', 'prudence', 'marv', 'dex'];
      var names = ['Marv the Collector', 'Dex the Gunner', 'Prudence the Ledger'];
      for (var i = 0; i < n; i++) players.push(newPlayer(names[i % 3] + (i >= 3 ? ' II' : ''), true, ids[i]));
    } else if (opts.mode === 'duo') {
      players = [newPlayer('Player 1', false), newPlayer('Player 2', false), newPlayer('Marv the Collector', true, 'marv')];
    } else {
      players = [newPlayer('You', false), newPlayer('Marv the Collector', true, 'marv'),
        newPlayer('Dex the Gunner', true, 'dex'), newPlayer('Prudence the Ledger', true, 'prudence')];
    }
    var g = {
      code: code, rng: rng, deckRng: deckRng, botRng: botRng,
      deck: shuffle(buildDeck(), deckRng), deckPos: 0,
      players: players, round: 1, phase: 'play',
      turnPickCount: 0, roundResults: [], swing: null, champion: null,
      log: []
    };
    dealRound(g);
    return g;
  }

  function dealRound(g) {
    var size = CONFIG.HAND_SIZE[g.players.length];
    g.players.forEach(function (p) {
      p.hand = []; p.picks = [];
      for (var i = 0; i < size; i++) p.hand.push(g.deck[g.deckPos++]);
    });
    g.turnPickCount = 0;
    g.log.push('round ' + g.round + ' dealt ' + size + ' each, deckPos ' + g.deckPos);
  }

  function passDirection(g) { return g.round % 2 === 1 ? 1 : -1; }

  // Pick one card for player pi. Returns 'timeout' when the pick grants
  // another pick from the same hand (chainable), else 'ok'.
  function pickOne(g, pi, cardId) {
    var p = g.players[pi];
    var idx = -1;
    for (var i = 0; i < p.hand.length; i++) if (p.hand[i].id === cardId) { idx = i; break; }
    if (idx < 0) throw new Error('card not in hand');
    var card = p.hand.splice(idx, 1)[0];
    var rec = { card: card, tripled: false };
    p.picks.push(rec);
    if (card.type === 'Rings') p.rings++;
    if (card.type === 'Timeout') { p.timeoutChains++; return 'timeout'; }
    return 'ok';
  }

  // After every player has picked (chains resolved), rotate hands.
  function rotateHands(g) {
    var dir = passDirection(g);
    var hands = g.players.map(function (p) { return p.hand; });
    g.players.forEach(function (p, i) {
      var from = (i - dir + g.players.length) % g.players.length;
      p.hand = hands[from];
    });
    g.turnPickCount = 0;
  }

  function handsEmpty(g) {
    return g.players.every(function (p) { return p.hand.length === 0; });
  }

  function scorePicks(picks) {
    var pts = 0, counts = {}, stars = 0, pendingHot = false, detail = {};
    picks.forEach(function (rec) {
      var t = rec.card.type;
      if (t === 'Hot Hand') { pendingHot = true; return; }
      if (SHOT_POINTS[t] != null) {
        var v = SHOT_POINTS[t];
        if (pendingHot) { v = v * 3; rec.tripled = true; pendingHot = false; }
        pts += v; return;
      }
      counts[t] = (counts[t] || 0) + 1;
      if (t === 'All-Star Votes') stars += rec.card.stars;
    });
    var ao = counts['Alley-Oop'] || 0, td = counts['Triple-Double'] || 0, bk = counts['Buckets'] || 0;
    var setPts = Math.floor(ao / 2) * 5 + Math.floor(td / 3) * 10 +
      (bk >= 5 ? 15 : (CONFIG.BUCKET_POINTS[bk] || 0));
    detail = { pairs: Math.floor(ao / 2), sets: Math.floor(td / 3), buckets: bk, stars: stars };
    return { shotPts: pts, setPts: setPts, stars: stars, detail: detail, hotCold: pendingHot ? 1 : 0 };
  }

  function scoreRound(g) {
    var scored = g.players.map(function (p) { return scorePicks(p.picks); });
    var maxStars = Math.max.apply(null, scored.map(function (s) { return s.stars; }));
    var votePts = g.players.map(function () { return 0; });
    if (maxStars > 0) {
      var top = [], second = [], secondStars = -1;
      scored.forEach(function (s, i) {
        if (s.stars === maxStars) top.push(i);
        else if (s.stars > secondStars) { second = [i]; secondStars = s.stars; }
        else if (s.stars === secondStars) second.push(i);
      });
      top.forEach(function (i) { votePts[i] = CONFIG.VOTE_FIRST / top.length; });
      if (top.length === 1 && secondStars > 0) {
        second.forEach(function (i) { votePts[i] = CONFIG.VOTE_SECOND / second.length; });
      }
    }
    var result = g.players.map(function (p, i) {
      var s = scored[i];
      var total = s.shotPts + s.setPts + votePts[i];
      p.roundScores.push(total);
      p.total += total;
      p.hotCold += s.hotCold;
      return { name: p.name, shotPts: s.shotPts, setPts: s.setPts, votePts: votePts[i],
        total: total, detail: s.detail, rings: p.rings };
    });
    g.roundResults.push(result);
    return result;
  }

  function ringsSwing(g) {
    var counts = g.players.map(function (p) { return p.rings; });
    var mx = Math.max.apply(null, counts), mn = Math.min.apply(null, counts);
    var swing = g.players.map(function () { return 0; });
    if (mx !== mn) {
      var top = [], bot = [];
      counts.forEach(function (c, i) { if (c === mx) top.push(i); if (c === mn) bot.push(i); });
      top.forEach(function (i) { swing[i] = CONFIG.RING_FIRST / top.length; });
      bot.forEach(function (i) { swing[i] = CONFIG.RING_LAST / bot.length; });
    }
    g.swing = swing;
    g.players.forEach(function (p, i) { p.total += swing[i]; });
    var best = Math.max.apply(null, g.players.map(function (p) { return p.total; }));
    g.champion = g.players.filter(function (p) { return p.total === best; }).map(function (p) { return p.name; });
    g.phase = 'gameEnd';
    return swing;
  }

  function endRound(g) {
    var result = scoreRound(g);
    if (g.round >= CONFIG.ROUNDS) {
      ringsSwing(g);
      return { done: true, result: result, swing: g.swing };
    }
    g.round++;
    dealRound(g);
    return { done: false, result: result };
  }

  function gradeFor(score, best) {
    if (best <= 0) return '—';
    var r = score / best;
    if (r >= 0.95) return 'A+';
    if (r >= 0.85) return 'A';
    if (r >= 0.75) return 'B';
    if (r >= 0.60) return 'C';
    if (r >= 0.40) return 'D';
    return 'F';
  }

  function reportCard(g) {
    var best = Math.max.apply(null, g.players.map(function (p) { return p.total; }));
    return g.players.map(function (p, i) {
      var notes = [];
      var pairs = 0, sets = 0;
      g.roundResults.forEach(function (r) { pairs += r[i].detail.pairs; sets += r[i].detail.sets; });
      if (pairs) notes.push(pairs + ' Alley-Oop pair' + (pairs > 1 ? 's' : '') + ' finished');
      if (sets) notes.push(sets + ' Triple-Double set' + (sets > 1 ? 's' : '') + ' finished');
      if (p.hotCold) notes.push(p.hotCold + ' Hot Hand' + (p.hotCold > 1 ? 's' : '') + ' went cold (no shot followed)');
      if (p.timeoutChains) notes.push(p.timeoutChains + ' Timeout chain' + (p.timeoutChains > 1 ? 's' : '') + ' played');
      notes.push(p.rings + ' Ring' + (p.rings !== 1 ? 's' : '') + ' kept');
      return { name: p.name, total: p.total, grade: gradeFor(p.total, best),
        notes: notes, isChampion: g.champion.indexOf(p.name) >= 0 };
    });
  }

  // Headless full-game runner (sims + the v1.1 spectate engine).
  // humanPick: optional fn(g, pi, hand) for human seats; default = random.
  function autoPlayGame(g, humanPick) {
    var stats = { timeoutChains: 0, hotTriples: 0, hotCold: 0, ringsAllTie: false };
    while (g.phase !== 'gameEnd') {
      // One turn: every player picks (chains inline), then hands rotate.
      g.players.forEach(function (p, pi) {
        if (p.hand.length === 0) return;
        var again = true, guard = 0, chainLen = 0;
        while (again && p.hand.length > 0 && guard++ < 12) {
          var cardId = p.isBot ? pickBot(g, pi, p.hand) : (humanPick ? humanPick(g, pi, p.hand) : p.hand[Math.floor(g.botRng() * p.hand.length)].id);
          var r = pickOne(g, pi, cardId);
          if (r === 'timeout') { chainLen++; again = true; }
          else again = false;
        }
        if (chainLen >= 2) stats.timeoutChains++;
      });
      // Tally tripled shots BEFORE endRound clears the pick logs.
      // scorePicks derives flags from the pick log (idempotent), so run
      // it here to set rec.tripled, then endRound recomputes identically.
      g.players.forEach(function (p) {
        scorePicks(p.picks);
        p.picks.forEach(function (rec) { if (rec.tripled) stats.hotTriples++; });
      });
      if (handsEmpty(g)) endRound(g);
      else rotateHands(g);
    }
    g.players.forEach(function (p) { stats.hotCold += p.hotCold; });
    var counts = g.players.map(function (p) { return p.rings; });
    stats.ringsAllTie = counts.every(function (c) { return c === counts[0]; });
    stats.totals = g.players.map(function (p) { return p.total; });
    return stats;
  }

  // Stepwise full-turn runner for the v1.1 spectate mode. One call =
  // one turn: every seat picks (chains inline), then hands rotate or
  // the round ends. Same turn order as autoPlayGame, so a stepTurn
  // loop reaches the same totals for the same game (proven, not
  // claimed, in verify.js).
  function stepTurn(g) {
    if (g.phase === 'gameEnd') return { done: true, events: [], roundResult: null, swing: g.swing };
    var events = [];
    g.players.forEach(function (p, pi) {
      if (p.hand.length === 0) return;
      var again = true, guard = 0;
      while (again && p.hand.length > 0 && guard++ < 12) {
        var cardId = pickBot(g, pi, p.hand);
        var card = null;
        p.hand.forEach(function (c) { if (c.id === cardId) card = c; });
        var r = pickOne(g, pi, cardId);
        events.push({ pi: pi, name: p.name, card: card, timeout: r === 'timeout' });
        again = (r === 'timeout');
      }
    });
    var roundResult = null, done = false;
    if (handsEmpty(g)) {
      var out = endRound(g);
      roundResult = out.result; done = out.done;
    } else rotateHands(g);
    return { done: done, events: events, roundResult: roundResult, swing: done ? g.swing : null };
  }

  // Tournament game codes: deterministic per-game deck codes derived
  // from one 5-letter tournament code, so the same tournament code
  // replays the same games (same decks, same seeded bot tie-breaks).
  function tourneyGameCode(base, i) {
    var clean = (base || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5);
    if (clean.length !== 5) return null;
    var seed = (codeToSeed(clean) ^ ((i + 1) * 0x9E3779B9)) >>> 0;
    return randomCode(mulberry32(seed));
  }

  /* ---------------- 5. BOTS ---------------- */
  // Pure pick functions: (game, playerIndex, hand) -> cardId.
  // No DOM, no hidden state — the sims and the v1.1 spectate mode call
  // exactly these. Tiny seeded jitter breaks value ties reproducibly.
  function countType(picks, type) {
    var n = 0;
    picks.forEach(function (r) { if (r.card.type === type) n++; });
    return n;
  }
  function hasShotInHand(hand) {
    return hand.some(function (c) { return SHOT_POINTS[c.type] != null; });
  }
  function botValue(g, pi, card) {
    var p = g.players[pi], t = card.type;
    var handLeft = p.hand.length;
    if (t === 'Timeout') return 2.5 + Math.min(handLeft, 6) * 0.4;
    if (t === 'Rings') return 4.5;
    // A live Hot Hand makes the next shot the best card in the hand.
    // (Sims found bots otherwise let Hot Hands go cold almost always.)
    var hotBonus = (SHOT_POINTS[t] != null && pendingHot(p.picks)) ? 6 : 0;
    if (p.botId === 'marv') {
      if (t === 'Alley-Oop') return countType(p.picks, t) % 2 === 1 ? 9 : 5;
      if (t === 'Triple-Double') { var c = countType(p.picks, t) % 3; return c === 2 ? 10 : (c === 1 ? 6 : 4); }
      if (t === 'Buckets') { var b = countType(p.picks, t); return b >= 5 ? 3 : (5 + b); }
      if (t === 'All-Star Votes') return 2 + card.stars;
      if (t === 'Hot Hand') return 1.5;
      if (SHOT_POINTS[t] != null) return 2 + SHOT_POINTS[t] * 0.5 + hotBonus;
    }
    if (p.botId === 'dex') {
      if (SHOT_POINTS[t] != null) return 5 + SHOT_POINTS[t] * 1.5 + hotBonus;
      if (t === 'Hot Hand') return hasShotInHand(p.hand) ? 8 : 3;
      if (t === 'Buckets') return 3;
      if (t === 'Alley-Oop' || t === 'Triple-Double') return 2.5;
      if (t === 'All-Star Votes') return 1 + card.stars * 0.5;
    }
    // Prudence the Ledger: votes + rings + face value, no gambles.
    if (t === 'All-Star Votes') return 5 + card.stars * 1.5;
    if (SHOT_POINTS[t] != null) return 3 + SHOT_POINTS[t] + hotBonus;
    if (t === 'Hot Hand') return hasShotInHand(p.hand) ? 6 : 2;
    if (t === 'Alley-Oop') return countType(p.picks, t) % 2 === 1 ? 6 : 3;
    if (t === 'Triple-Double') return countType(p.picks, t) % 3 === 2 ? 7 : 3;
    if (t === 'Buckets') { var b2 = countType(p.picks, t); return b2 >= 4 ? 5 : (3 + b2 * 0.5); }
    return 2;
  }
  function pickBot(g, pi, hand) {
    var best = null, bestV = -1e9;
    hand.forEach(function (card) {
      var v = botValue(g, pi, card) + g.botRng() * 0.01;
      if (v > bestV) { bestV = v; best = card; }
    });
    return best.id;
  }

  /* ---------------- 6. MOTION ---------------- */
  // One rAF timeline per scene. Steps animate transform/opacity only.
  // Picks are never gated on animation: state changes first, the
  // timeline is visual. Reduced motion applies final states instantly.
  var Motion = {
    reduced: (typeof window !== 'undefined' && window.matchMedia) ?
      window.matchMedia('(prefers-reduced-motion: reduce)').matches : false,
    play: function (steps, done) {
      if (this.reduced || !steps.length) {
        steps.forEach(function (s) { if (s.apply) s.apply(1); });
        if (done) done();
        return;
      }
      var start = null;
      var total = Math.max.apply(null, steps.map(function (s) { return (s.delay || 0) + s.dur; }));
      function ease(t, kind) {
        if (kind === 'back') { var c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
        if (kind === 'out') return 1 - Math.pow(1 - t, 5);
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }
      function frame(ts) {
        if (start === null) start = ts;
        var el = ts - start;
        steps.forEach(function (s) {
          var t = Math.min(1, Math.max(0, (el - (s.delay || 0)) / s.dur));
          if (s.apply) s.apply(ease(t, s.ease));
        });
        if (el < total) requestAnimationFrame(frame);
        else if (done) done();
      }
      requestAnimationFrame(frame);
    }
  };

  /* ---------------- 7. UI ---------------- */
  function $(id) { return document.getElementById(id); }
  function fmt(n) {
    if (n == null) return '0';
    var r = Math.round(n * 10) / 10;
    return (r % 1 === 0) ? String(r) : r.toFixed(1);
  }
  function pendingHot(picks) {
    var pending = false;
    picks.forEach(function (r) {
      if (r.card.type === 'Hot Hand') pending = true;
      else if (SHOT_POINTS[r.card.type] != null) pending = false;
    });
    return pending;
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function cardEl(card, opts) {
    opts = opts || {};
    var color = TYPE_COLOR[card.type];
    var d = document.createElement('div');
    d.className = 'card' + (opts.pickable ? ' pickable' : '') + (opts.dim ? ' dim' : '');
    d.dataset.cardId = card.id;
    var stars = card.type === 'All-Star Votes' ?
      '<span class="card-stars">' + '★'.repeat(card.stars) + '</span>' : '';
    d.innerHTML =
      '<div class="card-inner">' +
      '<div class="card-face" style="--tc:' + color + '">' +
        '<div class="card-band"></div>' +
        '<div class="card-emblem"><span>' + TYPE_EMBLEM[card.type] + '</span>' + stars + '</div>' +
        '<div class="card-type">' + esc(card.type) + '</div>' +
        '<div class="card-name">' + esc(card.face.name) + '</div>' +
        '<div class="card-meta">' + esc(card.face.team) + ' · ' + esc(card.face.era) + ' · ' + esc(card.face.pos) + '</div>' +
        '<div class="card-flavor">' + esc(card.face.flavor) + '</div>' +
      '</div>' +
      '<div class="card-face card-back-face"><div class="seal">BS</div></div>' +
      '</div>';
    if (opts.pickable) {
      d.tabIndex = 0;
      d.addEventListener('click', function () { if (opts.onPick) opts.onPick(card.id); });
      d.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (opts.onPick) opts.onPick(card.id); }
      });
    }
    return d;
  }

  // ---- session state (UI layer only; the engine stays UI-free) ----
  var S = null; // { g, mode, queue, binder, lastPick, humanIdx }
  function humanIndices(g) {
    var out = [];
    g.players.forEach(function (p, i) { if (!p.isBot) out.push(i); });
    return out;
  }
  function show(id, on) { $(id).classList.toggle('hidden', !on); }
  function openModal(id) { $(id).classList.remove('hidden'); }
  function closeModal(id) { $(id).classList.add('hidden'); }

  function renderScores() {
    $('roundBadge').textContent = 'ROUND ' + S.g.round + ' / ' + CONFIG.ROUNDS;
    $('scores').innerHTML = S.g.players.map(function (p) {
      return '<span class="score-chip">' + esc(p.name) + ' <b>' + fmt(p.total) + '</b></span>';
    }).join('');
    $('deckLeft').textContent = (108 - S.g.deckPos) + ' cards left in deck';
    $('deckCode').textContent = 'Deck ' + S.g.code;
    $('footCode').textContent = 'Deck ' + S.g.code;
  }

  function renderOpponents() {
    // Every non-active player gets a panel around the isometric table.
    var panels = S.g.players.map(function (p, i) {
      if (S.currentHumanPlayer() === p) return '';
      var backs = '';
      for (var k = 0; k < p.hand.length; k++) backs += '<span class="mini-back"></span>';
      var last = S.lastPick[i] ? ('Drafted ' + esc(S.lastPick[i].type) + ' — ' + esc(S.lastPick[i].name)) : 'Waiting for the draft…';
      return '<div class="opp"><div class="who">' + esc(p.name) + '</div>' +
        '<div class="opp-cards">' + backs + '</div>' +
        '<div class="last">' + last + '</div>' +
        '<div class="small">Rings ' + p.rings + ' · ' + fmt(p.total) + ' pts</div></div>';
    }).join('');
    $('opponents').innerHTML = panels;
  }

  function renderTableau() {
    var p = S.currentHumanPlayer();
    var groups = {};
    p.picks.forEach(function (r) {
      var t = r.card.type;
      if (!groups[t]) groups[t] = [];
      groups[t].push(r);
    });
    var order = ['Alley-Oop', 'Triple-Double', 'Buckets', 'All-Star Votes', 'Free Throw', 'Layup', 'Deep Three', 'Hot Hand', 'Timeout', 'Rings'];
    var html = '';
    order.forEach(function (t) {
      if (!groups[t]) return;
      var recs = groups[t];
      var names = recs.map(function (r) {
        var extra = r.tripled ? ' (×3!)' : (t === 'All-Star Votes' ? ' (' + r.card.stars + '★)' : '');
        return '<li>' + esc(r.card.face.name) + extra + '</li>';
      }).join('');
      html += '<div class="tgroup"><h4><i style="--tc:' + TYPE_COLOR[t] + '"></i>' + esc(t) +
        '<span class="pts">' + recs.length + '</span></h4><ul>' + names + '</ul></div>';
    });
    $('tableauGroups').innerHTML = html || '<p class="small">Nothing in the books yet this round.</p>';
    var sc = scorePicks(p.picks);
    $('roundScoreNote').textContent = '— shots ' + fmt(sc.shotPts) + ' · sets ' + fmt(sc.setPts) +
      ' · stars ' + sc.stars + (pendingHot(p.picks) ? ' · HOT HAND LIVE' : '');
  }

  function renderHand() {
    var p = S.currentHumanPlayer();
    var handEl = $('hand');
    handEl.innerHTML = '';
    var hot = pendingHot(p.picks);
    var active = S.queue.length && S.queue[0] === S.g.players.indexOf(p);
    $('handTitle').textContent = p.name + "'s hand";
    $('handHint').textContent = active ?
      (hot ? 'Hot Hand is live — your next shot scores triple. Pick a shot!' : 'Tap a card to draft it. Timeout drafts a second card.') :
      'Waiting for the other seats…';
    $('turnBanner').textContent = active ? (p.name === 'You' ? 'Your pick' : p.name + ', pick') : 'Drafting…';
    p.hand.forEach(function (card) {
      var isShot = SHOT_POINTS[card.type] != null;
      var el = cardEl(card, { pickable: !!active, dim: !active, onPick: onHumanPick });
      if (hot && isShot) el.classList.add('hot-glow');
      handEl.appendChild(el);
    });
    // Deal-in animation: staggered rise, visual only.
    if (!Motion.reduced) {
      var kids = Array.prototype.slice.call(handEl.children);
      Motion.play(kids.map(function (el, i) {
        return { delay: i * 45, dur: 380, ease: 'out', apply: function (t) {
          el.style.opacity = t;
          el.style.transform = 'translateY(' + ((1 - t) * 26) + 'px)';
        }};
      }));
    }
  }

  function renderAll() {
    renderScores();
    renderOpponents();
    renderTableau();
    renderHand();
  }

  /* ---- game flow ---- */
  function startGame(mode, code) {
    var g = createGame({ mode: mode, code: code });
    S = {
      g: g, mode: mode, binder: [], lastPick: {},
      queue: humanIndices(g),
      currentHumanPlayer: function () {
        var idx = this.queue.length ? this.queue[0] : humanIndices(this.g)[0];
        return this.g.players[idx];
      }
    };
    $('deckCode').textContent = 'Deck ' + g.code;
    $('footCode').textContent = 'Deck ' + g.code;
    show('setup', false);
    show('packStage', true);
    show('game', false);
    $('packFan').classList.add('hidden');
    $('packFan').innerHTML = '';
    $('pack').classList.remove('tearing');
    $('packMsg').textContent = 'One deck. Four rounds. No mercy.';
  }

  function tearPack() {
    var pack = $('pack');
    if (pack.classList.contains('tearing')) return;
    pack.classList.add('tearing');
    var human = S.g.players[humanIndices(S.g)[0]];
    var fan = $('packFan');
    fan.innerHTML = '';
    human.hand.slice(0, 6).forEach(function (card, i) {
      var m = document.createElement('div');
      m.className = 'mini-card';
      m.style.animationDelay = (0.55 + i * 0.09) + 's';
      m.innerHTML = '<b style="color:' + TYPE_COLOR[card.type] + '">' + TYPE_EMBLEM[card.type] + '</b>' +
        '<span>' + esc(card.face.name) + '</span><span>' + esc(card.type) + '</span>';
      fan.appendChild(m);
    });
    setTimeout(function () {
      pack.classList.add('hidden');
      fan.classList.remove('hidden');
      $('packMsg').innerHTML = 'Your pack is open. <button type="button" class="primary" id="btnDeal">Deal ’em</button>';
      $('btnDeal').addEventListener('click', enterGame);
    }, 620);
  }

  function enterGame() {
    show('packStage', false);
    show('game', true);
    renderAll();
  }

  function notePick(pi, card) {
    S.binder.push(card);
    S.lastPick[pi] = { type: card.type, name: card.face.name };
  }

  function onHumanPick(cardId) {
    var g = S.g;
    var pi = g.players.indexOf(S.currentHumanPlayer());
    if (!S.queue.length || S.queue[0] !== pi) return; // not this seat's turn
    var card = null;
    S.currentHumanPlayer().hand.forEach(function (c) { if (c.id === cardId) card = c; });
    if (!card) return;
    // State first, instantly. The flip is visual only.
    var res = pickOne(g, pi, cardId);
    notePick(pi, card);
    if (res === 'timeout') {
      $('turnBanner').textContent = 'Timeout! Draft again.';
      renderAll();
      return; // same seat picks again — the chain continues
    }
    S.queue.shift();
    advanceTurn();
  }

  function botPickStep(pi) {
    var g = S.g, p = g.players[pi];
    var again = true, guard = 0;
    while (again && p.hand.length > 0 && guard++ < 12) {
      var cardId = pickBot(g, pi, p.hand);
      var card = null;
      p.hand.forEach(function (c) { if (c.id === cardId) card = c; });
      var res = pickOne(g, pi, cardId);
      notePick(pi, card);
      again = (res === 'timeout');
    }
  }

  function advanceTurn() {
    var g = S.g;
    // Bots in the queue pick now (state: instant).
    while (S.queue.length && g.players[S.queue[0]].isBot) {
      botPickStep(S.queue[0]);
      S.queue.shift();
    }
    if (!S.queue.length) {
      if (handsEmpty(g)) {
        var out = endRound(g);
        if (out.done) showFinal(out);
        else showRound(out.result);
        return;
      }
      rotateHands(g);
      S.queue = humanIndices(g);
      // Duo: the next human gets a cover screen so hands stay private.
      if (S.mode === 'duo') {
        var next = g.players[S.queue[0]];
        $('coverTitle').textContent = next.name + ', you’re up';
        $('coverText').textContent = 'Hand the device over — no peeking at the last hand.';
        openModal('cover');
      }
    }
    renderAll();
  }

  function showRound(result) {
    var g = S.g;
    $('roundModalTitle').textContent = 'Round ' + (g.round - 1) + ' — in the books';
    var rows = result.map(function (r) {
      return '<tr><td>' + esc(r.name) + '</td><td>' + fmt(r.shotPts) + '</td><td>' + fmt(r.setPts) +
        '</td><td>' + fmt(r.votePts) + '</td><td>' + fmt(r.total) + '</td><td>' + r.rings + '</td></tr>';
    }).join('');
    $('roundModalBody').innerHTML =
      '<table><tr><th>Seat</th><th>Shots</th><th>Sets</th><th>Votes</th><th>Round</th><th>Rings</th></tr>' +
      rows + '</table>' +
      '<p class="small">Sets reset. Rings carry. The deck keeps dealing.</p>';
    openModal('roundModal');
    renderAll();
  }

  function showFinal(out) {
    var g = S.g;
    var head = '<tr><th>Seat</th><th>R1</th><th>R2</th><th>R3</th><th>R4</th><th class="rings-swing">Rings</th><th>Total</th></tr>';
    var rows = g.players.map(function (p, i) {
      var cells = p.roundScores.map(function (s) { return '<td>' + fmt(s) + '</td>'; }).join('');
      return '<tr' + (g.champion.indexOf(p.name) >= 0 ? ' class="total"' : '') + '><td>' + esc(p.name) + '</td>' +
        cells + '<td class="rings-swing">' + (g.swing[i] > 0 ? '+' : '') + fmt(g.swing[i]) + '</td><td><b>' + fmt(p.total) + '</b></td></tr>';
    }).join('');
    $('finalBody').innerHTML = '<table>' + head + rows + '</table>';
    var rep = reportCard(g);
    $('reportCard').innerHTML = '<h3>Draft report card</h3>' + rep.map(function (r) {
      return '<p><span class="report-grade">' + r.grade + '</span> <b>' + esc(r.name) + '</b> — ' +
        fmt(r.total) + ' pts<br><span class="report-notes">' + r.notes.map(esc).join(' · ') + '</span></p>';
    }).join('');
    var champ = g.champion.join(' & ');
    $('finalTitle').textContent = (g.champion.indexOf('You') >= 0 ? 'YOU TOOK THE NIGHT' : champ.toUpperCase() + ' TOOK THE NIGHT');
    openModal('finalModal');
    renderAll();
    drawChampion(g, rep);
  }

  /* ---- binder ---- */
  function renderBinder() {
    var groups = {};
    S.binder.forEach(function (card) {
      if (!groups[card.type]) groups[card.type] = {};
      var k = card.face.name;
      groups[card.type][k] = (groups[card.type][k] || 0) + 1;
    });
    var html = '';
    Object.keys(groups).sort().forEach(function (t) {
      var items = Object.keys(groups[t]).map(function (n) {
        return '<li>' + esc(n) + (groups[t][n] > 1 ? ' ×' + groups[t][n] : '') + '</li>';
      }).join('');
      html += '<div class="binder-group"><h4>' + esc(t) + '</h4><ul>' + items + '</ul></div>';
    });
    $('binderBody').innerHTML = html || '<p class="small">Nothing drafted yet this session.</p>';
  }

  /* ---- spectate: bots play each other, live ---- */
  // Drives the UI-free engine one turn at a time (stepTurn) on a
  // timer. State changes first, rendering follows. Pause is always
  // one tap away; autoplay never strands the viewer.
  var SP = null; // { tourney, gameIndex, totalGames, g, timer, speed, playing, standings, lastPick }
  var SPEC_GAMES = 5;
  function specSpeedMs() { return SP.speed === 4 ? 250 : (SP.speed === 2 ? 500 : 1000); }
  function startSpectate(tourneyCode) {
    var code = (tourneyCode || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5);
    if (code.length !== 5) code = randomCode(mulberry32(Math.floor(Math.random() * 1e9)));
    SP = { tourney: code, gameIndex: 0, totalGames: SPEC_GAMES, g: null,
      timer: null, speed: 1, playing: false, lastPick: {},
      standings: ['Marv the Collector', 'Dex the Gunner', 'Prudence the Ledger'].map(function (n) {
        return { name: n, wins: 0, pts: 0 };
      }) };
    show('setup', false); show('packStage', false); show('game', false);
    show('spectate', true);
    $('specTourneyCode').textContent = 'Tournament ' + code;
    specStartGame();
    renderStandings();
  }
  function specStartGame() {
    var code = tourneyGameCode(SP.tourney, SP.gameIndex);
    SP.g = createGame({ code: code, botOnly: true, playerCount: 3 });
    SP.lastPick = {};
    $('specFeed').innerHTML = '';
    $('specGameLabel').textContent = 'Game ' + (SP.gameIndex + 1) + ' of ' + SP.totalGames + ' · Deck ' + code;
    $('specNext').disabled = true;
    $('specNext').textContent = 'Next game';
    $('specFinal').innerHTML = '';
    specRender();
  }
  function specRender() {
    var g = SP.g;
    $('specRound').textContent = g.phase === 'gameEnd' ? 'FINAL' : ('ROUND ' + g.round + ' / ' + CONFIG.ROUNDS);
    $('specScores').innerHTML = g.players.map(function (p) {
      return '<span class="score-chip">' + esc(p.name) + ' <b>' + fmt(p.total) + '</b> · ' + p.rings + ' rings</span>';
    }).join('');
    $('specPanels').innerHTML = g.players.map(function (p, i) {
      var lp = SP.lastPick[i] ? esc(SP.lastPick[i].type) + ' — ' + esc(SP.lastPick[i].name) : 'Waiting for the draft…';
      return '<div class="opp"><div class="who">' + esc(p.name) + '</div><div class="last">' + lp +
        '</div><div class="small">Rings ' + p.rings + ' · ' + fmt(p.total) + ' pts</div></div>';
    }).join('');
  }
  function specFeedLine(html) {
    var feed = $('specFeed');
    var d = document.createElement('div');
    d.className = 'spec-line';
    d.innerHTML = html;
    feed.appendChild(d);
    while (feed.children.length > 40) feed.removeChild(feed.firstChild);
    feed.scrollTop = feed.scrollHeight;
  }
  function specStep() {
    var g = SP.g;
    if (!g || g.phase === 'gameEnd') { specPause(); return; }
    var roundBefore = g.round;
    var out = stepTurn(g);
    out.events.forEach(function (ev) {
      SP.lastPick[ev.pi] = { type: ev.card.type, name: ev.card.face.name };
      specFeedLine('<b>' + esc(ev.name) + '</b> drafted ' + esc(ev.card.type) + ' — ' + esc(ev.card.face.name) +
        (ev.timeout ? ' <i>(Timeout — drafts again)</i>' : ''));
    });
    if (out.roundResult) {
      var rows = out.roundResult.map(function (r) {
        return esc(r.name) + ' ' + fmt(r.total);
      }).join(' · ');
      specFeedLine('<span class="spec-stamp">IN THE BOOKS — Round ' + roundBefore + ':</span> ' + rows);
    }
    if (out.done) specFinishGame();
    specRender();
  }
  function specFinishGame() {
    specPause();
    var g = SP.g;
    g.players.forEach(function (p) {
      var st = null;
      SP.standings.forEach(function (s) { if (s.name === p.name) st = s; });
      if (st) { st.pts += p.total; if (g.champion.indexOf(p.name) >= 0) st.wins++; }
    });
    var champ = g.champion.join(' & ');
    $('specFinal').innerHTML = '<h3>' + esc(champ.toUpperCase()) + ' TOOK GAME ' + (SP.gameIndex + 1) + '</h3>' +
      '<p>' + g.players.map(function (p) { return esc(p.name) + ' ' + fmt(p.total); }).join(' · ') +
      ' · Rings swing ' + g.swing.map(fmt).join(' / ') + '</p>';
    renderStandings();
    $('specNext').disabled = false;
    if (SP.gameIndex + 1 >= SP.totalGames) $('specNext').textContent = 'See tournament final';
    specRender();
  }
  function renderStandings() {
    var rows = SP.standings.slice().sort(function (a, b) { return (b.wins - a.wins) || (b.pts - a.pts); }).map(function (s) {
      return '<tr><td>' + esc(s.name) + '</td><td>' + s.wins + '</td><td>' + fmt(s.pts) + '</td></tr>';
    }).join('');
    $('specStandings').innerHTML = '<table><tr><th>Bot</th><th>Titles</th><th>Points</th></tr>' + rows + '</table>';
  }
  function specPlay() {
    if (!SP || !SP.g || SP.g.phase === 'gameEnd') return;
    specPause();
    SP.playing = true;
    $('specPlay').textContent = 'Pause';
    SP.timer = setInterval(specStep, specSpeedMs());
  }
  function specPause() {
    if (SP && SP.timer) { clearInterval(SP.timer); SP.timer = null; }
    if (SP) SP.playing = false;
    if ($('specPlay')) $('specPlay').textContent = 'Play';
  }
  function specFinishNow() {
    if (!SP || !SP.g) return;
    specPause();
    while (SP.g.phase !== 'gameEnd') specStep();
  }
  function specNextGame() {
    if (SP.gameIndex + 1 < SP.totalGames) {
      SP.gameIndex++;
      specStartGame();
      return;
    }
    var top = SP.standings.slice().sort(function (a, b) { return (b.wins - a.wins) || (b.pts - a.pts); })[0];
    $('specFinal').innerHTML = '<h3>TOURNAMENT FINAL — ' + esc(top.name.toUpperCase()) + ' TAKES IT</h3>' +
      '<p>' + SP.standings.map(function (s) { return esc(s.name) + ': ' + s.wins + ' titles, ' + fmt(s.pts) + ' pts'; }).join(' · ') + '</p>' +
      '<p class="small">Replay the whole tournament: code ' + SP.tourney + '.</p>';
    $('specNext').disabled = true;
  }
  function tourneyShareText() {
    var url = (typeof location !== 'undefined') ? location.href.split('?')[0] : '';
    var top = SP.standings.slice().sort(function (a, b) { return (b.wins - a.wins) || (b.pts - a.pts); })[0];
    var story = top ? (' ' + top.name + ' leads with ' + top.wins + ' titles.') : '';
    return 'I watched ' + CONFIG.TITLE + ' bots battle it out!' + story +
      ' Watch the same tournament: ' + url + '?mode=spectate&tourney=' + SP.tourney + ' — code ' + SP.tourney + '.';
  }

  /* ---- share + champion PNG ---- */
  function challengeText() {
    var url = (typeof location !== 'undefined') ? location.href.split('?')[0] : '';
    var score = '';
    if (S && S.g && S.g.phase === 'gameEnd') {
      var me = S.g.players[0];
      score = ' I scored ' + fmt(me.total) + ' pts.';
    }
    return 'I played ' + CONFIG.TITLE + '! Deck ' + (S ? S.g.code : '') + '.' + score +
      ' Beat my deck: ' + url + '?code=' + (S ? S.g.code : '') + ' — enter code ' + (S ? S.g.code : '') + '.';
  }
  function copyText(t, noteEl) {
    function done() { if (noteEl) noteEl.classList.remove('hidden'); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(done, function () { fallbackCopy(t); done(); });
    } else { fallbackCopy(t); done(); }
  }
  function fallbackCopy(t) {
    var ta = document.createElement('textarea');
    ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) { /* clipboard unavailable */ }
    document.body.removeChild(ta);
  }

  function drawChampion(g, rep) {
    var cv = $('champCanvas');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    var champ = rep.filter(function (r) { return r.isChampion; })[0] || rep[0];
    ctx.fillStyle = '#f6f1e7'; ctx.fillRect(0, 0, 900, 1200);
    ctx.strokeStyle = '#222'; ctx.lineWidth = 10; ctx.strokeRect(20, 20, 860, 1160);
    ctx.fillStyle = '#c0392b'; ctx.fillRect(20, 20, 860, 14);
    var colors = ['#e67e22', '#1abc9c', '#c0392b', '#d4a017', '#8e44ad', '#e75480', '#2e86c1', '#27ae60', '#7f8c8d'];
    colors.forEach(function (c, i) { ctx.fillStyle = c; ctx.fillRect(20 + i * 96, 120, 96, 18); });
    ctx.fillStyle = '#222'; ctx.textAlign = 'center';
    ctx.font = 'bold 84px Georgia'; ctx.fillText(CONFIG.TITLE.toUpperCase(), 450, 260);
    ctx.font = 'italic 34px Georgia'; ctx.fillStyle = '#555';
    ctx.fillText('CHAMPION CARD', 450, 320);
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.arc(450, 500, 110, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#222'; ctx.font = 'bold 44px Georgia';
    ctx.fillText(champ.grade, 450, 515);
    ctx.font = 'bold 56px Georgia'; ctx.fillText(champ.name.toUpperCase(), 450, 680);
    ctx.font = '44px Georgia'; ctx.fillText(fmt(champ.total) + ' PTS', 450, 750);
    ctx.font = 'italic 30px Georgia'; ctx.fillStyle = '#555';
    var verdict = champ.isChampion ? (champ.name === 'You' ? 'YOU TOOK THE NIGHT' : champ.name.toUpperCase() + ' TOOK THE NIGHT') : 'IN THE BOOKS';
    ctx.fillText(verdict, 450, 830);
    ctx.font = '28px Georgia';
    champ.notes.slice(0, 4).forEach(function (n, i) { ctx.fillText(n, 450, 900 + i * 40); });
    ctx.fillText('Deck ' + g.code + ' · ' + CONFIG.TITLE, 450, 1100);
  }
  function downloadChampion() {
    var cv = $('champCanvas');
    var a = document.createElement('a');
    a.download = 'box-score-champion.png';
    a.href = cv.toDataURL('image/png');
    a.click();
  }

  /* ---- boot ---- */
  function boot() {
    document.title = CONFIG.TITLE + ' — a card game of draft night';
    $('gameTitle').textContent = CONFIG.TITLE;
    $('footTitle').textContent = CONFIG.TITLE;
    $('btnOpenPack').addEventListener('click', function () {
      var mode = $('modeSelect').value;
      var code = $('seedInput').value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5);
      if (code && code.length !== 5) { $('seedInput').focus(); return; }
      if (mode === 'spectate') { startSpectate(code); return; }
      startGame(mode, code);
    });
    $('modeSelect').addEventListener('change', function () {
      if ($('modeSelect').value === 'spectate') {
        $('btnOpenPack').textContent = 'Watch the tournament';
        $('seedNote').textContent = 'Tournament code? Type it in and you\'ll watch the exact same tournament.';
      } else {
        $('btnOpenPack').textContent = 'Tear open the wax pack';
        $('seedNote').textContent = 'Have a friend\'s code? Type it in and you\'ll play their exact deck.';
      }
    });
    $('specPlay').addEventListener('click', function () { if (SP.playing) specPause(); else specPlay(); });
    $('specSpeed').addEventListener('change', function () {
      if (SP) SP.speed = parseInt($('specSpeed').value, 10) || 1;
      if (SP && SP.playing) specPlay();
    });
    $('specFinish').addEventListener('click', specFinishNow);
    $('specNext').addEventListener('click', specNextGame);
    $('specCopy').addEventListener('click', function () { copyText(tourneyShareText(), $('specCopyNote')); });
    $('specBack').addEventListener('click', function () {
      specPause();
      show('spectate', false); show('setup', true);
    });
    // Deep links: ?code=XXXXX pre-fills the deck; ?mode=spectate&tourney=XXXXX starts that tournament.
    try {
      var qs = new URLSearchParams(window.location.search);
      var qcode = (qs.get('code') || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5);
      if (qcode.length === 5) $('seedInput').value = qcode;
      if (qs.get('mode') === 'spectate') {
        var tq = (qs.get('tourney') || qcode || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5);
        if (tq.length === 5) startSpectate(tq);
      }
    } catch (e) { /* deep links are a convenience, never a blocker */ }
    $('btnRandomCode').addEventListener('click', function () {
      $('seedInput').value = randomCode(mulberry32(Math.floor(Math.random() * 1e9)));
    });
    $('seedInput').addEventListener('input', function (e) {
      e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5);
    });
    $('pack').addEventListener('click', tearPack);
    $('pack').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tearPack(); }
    });
    $('btnCoverReady').addEventListener('click', function () { closeModal('cover'); renderAll(); });
    $('btnNextRound').addEventListener('click', function () { closeModal('roundModal'); renderAll(); });
    $('btnPlayAgain').addEventListener('click', function () {
      closeModal('finalModal');
      show('game', false); show('setup', true);
    });
    $('btnQuit').addEventListener('click', function () {
      show('game', false); show('setup', true);
    });
    $('btnNew').addEventListener('click', function () {
      show('game', false); show('packStage', false); show('setup', true);
    });
    $('btnRules').addEventListener('click', function () { openModal('rulesModal'); });
    $('btnRulesClose').addEventListener('click', function () { closeModal('rulesModal'); });
    $('btnBinder').addEventListener('click', function () { if (S) renderBinder(); openModal('binderModal'); });
    $('btnBinder2').addEventListener('click', function () { if (S) renderBinder(); openModal('binderModal'); });
    $('btnBinderClose').addEventListener('click', function () { closeModal('binderModal'); });
    $('btnShare').addEventListener('click', function () { copyText(challengeText(), $('shareNote')); });
    $('btnCopyFinal').addEventListener('click', function () { copyText(challengeText(), null); });
    $('btnDownloadChamp').addEventListener('click', downloadChampion);
    document.querySelectorAll('.modal').forEach(function (m) {
      m.addEventListener('click', function (e) { if (e.target === m) m.classList.add('hidden'); });
    });
  }

  return {
    CONFIG: CONFIG, buildDeck: buildDeck, deckCounts: deckCounts,
    createGame: createGame, pickOne: pickOne, rotateHands: rotateHands,
    handsEmpty: handsEmpty, scorePicks: scorePicks, scoreRound: scoreRound,
    ringsSwing: ringsSwing, endRound: endRound, reportCard: reportCard,
    autoPlayGame: autoPlayGame, pickBot: pickBot, codeToSeed: codeToSeed,
    stepTurn: stepTurn, tourneyGameCode: tourneyGameCode,
    randomCode: randomCode, mulberry32: mulberry32, FACES: FACES,
    TYPE_COLOR: TYPE_COLOR, TYPE_EMBLEM: TYPE_EMBLEM, SHOT_POINTS: SHOT_POINTS,
    boot: boot
  };
})();

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', BS.boot);
  else BS.boot();
}
if (typeof module !== 'undefined' && module.exports) module.exports = BS;
