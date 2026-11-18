/* Die Spielwelt: seitlich scrollendes Jump'n'Run von Dorf über den Weg bis zum Mühlberg. */
(function (PT) {
  'use strict';
  const d = () => PT.draw;

  const VIEW_H = 540;
  const GROUND = 440;
  const WORLD_W = 6400;
  const PLACES = { dorf: 560, weg: 2060, muehlberg: 4120 };

  const PIT = { x1: 2300, x2: 2430 };
  const RIVER = { x1: 4400, x2: 4680 };
  const LEDGE = { x: 3120, y: GROUND - 230, w: 150 };
  const SILBEN_X = 2620;

  // Plattformen (von unten durchspringbar)
  const PLATFORMS = [
    { x: 740, y: GROUND - 90, w: 130 },   // Prolog-Knöpfe
    { x: 900, y: GROUND - 175, w: 120 },
    { x: 2020, y: GROUND - 100, w: 150 },
    { x: 2500, y: GROUND - 95, w: 90 },
    { x: 3400, y: GROUND - 110, w: 140 },
    { x: 5150, y: GROUND - 100, w: 120 },
    LEDGE,
  ];

  // Knopf-Taler in der Welt (id, x, y, Wert)
  const COINS = [];
  (function makeCoins() {
    const add = (x, y, v) => COINS.push({ id: 'c' + COINS.length, x, y, v: v || 1 });
    for (let x = 1990; x < 2280; x += 45) add(x, GROUND - 40);
    [2050, 2095, 2140].forEach(x => add(x, GROUND - 140));
    for (let x = 2450; x < 2580; x += 45) add(x, GROUND - 40);
    add(2545, GROUND - 135);
    for (let x = 2950; x < 3100; x += 45) add(x, GROUND - 40);
    [3420, 3465, 3510].forEach(x => add(x, GROUND - 150));
    for (let x = 3600; x < 3780; x += 45) add(x, GROUND - 40);
    for (let x = 4720; x < 4800; x += 40) add(x, GROUND - 40);
    [5170, 5210, 5250].forEach(x => add(x, GROUND - 140));
    add(2365, GROUND - 170, 10); // über der Grube: goldener Knopf
    add(5880, GROUND - 40); add(5920, GROUND - 40);
  })();
  const TUTORIAL_BUTTONS = [
    { id: 't1', x: 640, y: GROUND - 40 },
    { id: 't2', x: 805, y: GROUND - 130 },
    { id: 't3', x: 960, y: GROUND - 215 },
  ];

  // ---------- Zustand ----------
  let canvas, ctx, dpr = 1, scale = 1, viewW = 960;
  let running = false, raf = 0, lastT = 0, time = 0;
  let camX = 0;
  const pl = { x: 160, y: GROUND, vx: 0, vy: 0, onGround: true, facing: 1, coyote: 0, airJumps: 0, walk: 0, cheer: 0 };
  const input = { left: false, right: false, jumpQueued: false, target: null };
  let busy = false;           // während Dialog/Aufgabe
  let near = null;            // nahes Interaktions-Objekt
  let saveTimer = 0, sessionSeconds = 0, tiredShown = false;
  let bus = { x: -9999, v: 0 };
  let silben = null;          // laufendes Silbenspringen
  let fallCooldown = 0;

  const g = () => PT.game.profile.game;
  const prof = () => PT.game.profile;

  // ---------- Hilfen ----------
  function solids() {
    const s = [
      { x: -100, y: -1000, w: 100, h: 2000 },
      { x: WORLD_W, y: -1000, w: 100, h: 2000 },
      { x: 0, y: GROUND, w: PIT.x1, h: 400 },
      { x: PIT.x2, y: GROUND, w: RIVER.x1 - PIT.x2, h: 400 },
      { x: RIVER.x2, y: GROUND, w: WORLD_W - RIVER.x2, h: 400 },
    ];
    if (g().stations.bruecke) s.push({ x: RIVER.x1, y: GROUND, w: RIVER.x2 - RIVER.x1, h: 18 });
    if (!g().prologDone) s.push({ x: 1880, y: -1000, w: 40, h: 2000 });
    return s;
  }

  function overlaps(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
  function box() { return { x: pl.x - 17, y: pl.y - 90, w: 34, h: 90 }; }

  function remember(key) {
    const s = g().seen;
    if (s.includes(key)) return false;
    s.push(key); return true;
  }

  // ---------- Interaktionen ----------
  function interactables() {
    const G = g();
    const list = [
      { id: 'pfeffer', x: 520, w: 120, y: GROUND - 120, when: () => G.prologDone, run: talkPfeffer },
      { id: 'spiegel', x: 330, w: 110, y: GROUND - 150, when: () => G.prologDone, run: async () => { await PT.editor.open(prof(), { canCancel: true }); } },
      { id: 'laden', x: 1180, w: 160, y: GROUND - 170, when: () => G.prologDone, run: async () => { PT.menus.shop(); await waitMenu(); } },
      { id: 'baumhaus', x: 1450, w: 140, y: GROUND - 120, when: () => G.prologDone, run: async () => { PT.menus.baumhaus(); await waitMenu(); } },
      { id: 'pavillon', x: 1650, w: 110, y: GROUND - 150, when: () => G.instruments.includes('tuba'), run: async () => { PT.sound.fest(); await PT.ui.dialog(['fest.4']); } },
      { id: 'bank1', x: 1760, w: 90, y: GROUND - 60, when: () => G.prologDone, run: restBench },
      { id: 'silben', x: SILBEN_X, w: 120, y: GROUND - 80, when: () => !silben, run: startSilben },
      { id: 'truhe', x: LEDGE.x + 75, w: 120, y: LEDGE.y - 60, when: () => !G.chestOpened && pl.y < GROUND - 150, run: openChest },
      { id: 'raetsel', x: 3560, w: 110, y: GROUND - 110, when: () => true, run: raetselstein },
      { id: 'bank2', x: 3820, w: 90, y: GROUND - 60, when: () => true, run: restBench },
      { id: 'resi', x: 4180, w: 120, y: GROUND - 130, when: () => !allRepaired(), run: talkResi },
      { id: 'bruecke', x: 4320, w: 110, y: GROUND - 130, when: () => true, run: () => station('bruecke') },
      { id: 'huehner', x: 4930, w: 140, y: GROUND - 170, when: () => true, run: () => station('huehner') },
      { id: 'markt', x: 5340, w: 140, y: GROUND - 150, when: () => true, run: () => station('markt') },
      { id: 'muehle', x: 5660, w: 140, y: GROUND - 160, when: () => true, run: () => station('muehle') },
      { id: 'bank3', x: 5960, w: 90, y: GROUND - 60, when: () => true, run: restBench },
      { id: 'fest', x: 6150, w: 160, y: GROUND - 140, when: () => allRepaired(), run: festplatz },
    ];
    return list.filter(i => i.when());
  }
  function allRepaired() { return PT.stations.ORDER.every(k => g().stations[k]); }
  function waitMenu() { return new Promise(r => { const h = () => { if (!PT.ui.anyScreen()) { r(); } else setTimeout(h, 200); }; setTimeout(h, 200); }); }

  async function act(it) {
    if (busy) return;
    busy = true;
    input.left = input.right = false; input.target = null;
    pl.vx = 0;
    PT.sound.tap();
    try { await it.run(); } catch (e) { console.error(e); }
    PT.store.save();
    PT.emit('taler');
    busy = false;
  }

  async function talkPfeffer() {
    const G = g();
    if (G.festDone) await PT.ui.dialog(['pfeffer.fertig']);
    else await PT.ui.dialog(G.chestOpened ? ['pfeffer.wieder'] : ['pfeffer.wieder', 'pfeffer.truhe']);
  }
  async function talkResi() {
    if (remember('resi')) {
      await PT.ui.dialog(['resi.hallo']);
      PT.game.giveSticker('resi');
      PT.game.giveSticker('hansi');
      await PT.ui.dialog(['resi.wieder']);
    } else await PT.ui.dialog(['resi.wieder']);
  }
  async function station(id) {
    const ok = await PT.stations.play(id);
    if (ok) pl.cheer = 1.5;
  }
  async function festplatz() {
    if (!g().festDone) { await PT.menus.fest(); pl.cheer = 2; }
    else { PT.sound.fest(); await PT.ui.dialog([{ who: 'resi', text: 'Danke nochmal! Der Mühlberg ist so schön wie noch nie.' }]); }
  }
  let benchStory = 0;
  async function restBench() {
    PT.store.save();
    PT.sound.save();
    PT.ui.toast('Gespeichert!', PT.draw.makeIcon('save', 88));
    pl.sitting = true;
    await PT.ui.dialog(['ranzl.gemerkt', 'bank.' + (benchStory % 3 + 1)]);
    benchStory++;
    pl.sitting = false;
  }
  async function openChest() {
    const G = g();
    G.chestOpened = true;
    if (!G.owned.includes('pirat')) G.owned.push('pirat');
    G.hat = 'pirat';
    PT.sound.reward();
    PT.ui.toast('Piratenhut!', PT.items.itemCanvas('pirat', 88), 2600);
    pl.cheer = 2;
    await PT.ui.dialog(['ranzl.truhe.auf']);
  }
  async function raetselstein() {
    const G = g();
    if (G.raetselDate === PT.today()) { await PT.ui.dialog(['raetsel.schlaeft']); return; }
    await PT.ui.dialog(['raetsel.intro']);
    const ok = await PT.stations.raetsel();
    if (!ok) return;
    G.raetselDate = PT.today();
    G.taler += 10;
    PT.sound.reward();
    PT.ui.toast('+10 Knöpfe', PT.draw.makeIcon('knopf', 88, 'gold'));
    await PT.ui.dialog(['raetsel.geschafft']);
    PT.game.giveSticker('raetselstein');
  }

  // ---------- Silbenspringen ----------
  async function startSilben() {
    const G = g();
    if (G.silbenDate !== PT.today()) { G.silbenDate = PT.today(); G.silbenToday = 0; }
    if (G.silbenToday >= 5) { await PT.ui.dialog(['silben.genug']); return; }
    if (remember('silben')) await PT.ui.dialog(['silben.intro']);
    else await PT.speech.say('silben.intro');
    const words = PT.shuffle(PT.stations.SILBEN[prof().stage]).slice(0, 3);
    silben = { words, i: 0, count: 0, idle: 0, firstTry: true, lit: 0, listening: false, done: 0 };
    nextSilbenWord();
  }
  async function nextSilbenWord() {
    const s = silben; if (!s) return;
    s.count = 0; s.idle = 0; s.firstTry = true; s.listening = false;
    const w = s.words[s.i];
    await PT.wait(300);
    await PT.speech.say({ text: w.join(''), who: 'ranzl' });
    if (silben === s) s.listening = true;
  }
  async function evaluateSilben() {
    const s = silben; if (!s) return;
    s.listening = false;
    const w = s.words[s.i];
    if (s.count === w.length) {
      PT.learn.record(prof(), 'silben', s.firstTry);
      PT.sound.right(); pl.cheer = 1;
      g().taler += 3; PT.emit('taler');
      await PT.speech.say(PT.pick(['ranzl.richtig1', 'ranzl.richtig2', 'ranzl.richtig3']), { noRemember: true });
      await PT.speech.sayParts(w, 'ranzl', 250);
      s.i++;
      if (s.i >= s.words.length) {
        g().silbenToday++;
        g().taler += 5; PT.emit('taler');
        PT.ui.toast('Silbenspringen geschafft! +14 Knöpfe', PT.draw.makeIcon('knopf', 88));
        PT.sound.reward();
        silben = null;
        PT.store.save();
        return;
      }
      nextSilbenWord();
    } else {
      if (s.firstTry) PT.learn.record(prof(), 'silben', false);
      s.firstTry = false;
      PT.sound.soft();
      await PT.speech.say('silben.nochmal', { noRemember: true });
      for (const part of w) { PT.sound.plank(); await PT.speech.say({ text: part, who: 'ranzl' }, { noRemember: true }); await PT.wait(200); }
      await PT.wait(300);
      s.count = 0; s.idle = 0;
      await PT.speech.say({ text: 'Jetzt du: ' + w.join(''), who: 'ranzl' });
      if (silben === s) s.listening = true;
    }
  }

  // ---------- Physik ----------
  function update(dt) {
    const G = g();
    const st = prof().stage;
    const SPEED = st === 'spatz' ? 260 : 290;
    const GRAV = 2300;
    const JUMP = 860;
    const frozen = busy || PT.ui.anyScreen() || PT.ui.dialogBusy;

    // Eingabe
    let dir = 0;
    if (!frozen) {
      if (input.left) dir -= 1;
      if (input.right) dir += 1;
      if (input.target !== null && dir === 0) {
        const dx = input.target - pl.x;
        if (Math.abs(dx) < 10) input.target = null; else dir = Math.sign(dx);
      }
    }
    if (pl.sitting) dir = 0;
    pl.vx += (dir * SPEED - pl.vx) * Math.min(1, dt * (pl.onGround ? 14 : 7));
    if (dir) pl.facing = dir;

    // Tipp-dorthin: automatisch springen vor Gruben und Kanten
    if (!frozen && input.target !== null && pl.onGround && dir) {
      const ahead = pl.x + dir * 34;
      const groundAhead = solids().some(s => ahead >= s.x && ahead <= s.x + s.w && Math.abs(s.y - GROUND) < 2);
      const plats = PLATFORMS.some(p => Math.abs(input.target - (p.x + p.w / 2)) < p.w / 2 + 20 && p.y < pl.y - 10 && Math.abs(pl.x - (p.x + p.w / 2)) < p.w / 2 + 60);
      if (!groundAhead || plats) input.jumpQueued = true;
    }

    // Springen
    pl.coyote = pl.onGround ? (st === 'spatz' ? 0.16 : 0.1) : pl.coyote - dt;
    if (input.jumpQueued && !frozen && !pl.sitting) {
      if (pl.onGround || pl.coyote > 0) { pl.vy = -JUMP; pl.onGround = false; pl.coyote = 0; pl.airJumps = G.springfedern ? 1 : 0; PT.sound.jump(); }
      else if (pl.airJumps > 0) { pl.vy = -JUMP * 0.88; pl.airJumps--; PT.sound.jump(); }
    }
    input.jumpQueued = false;

    pl.vy = Math.min(pl.vy + GRAV * dt, 1400);
    const S = solids();

    // horizontal
    pl.x += pl.vx * dt;
    let b = box();
    for (const s of S) if (overlaps(b, s)) {
      if (pl.vx > 0) pl.x = s.x - 17 - 0.01; else if (pl.vx < 0) pl.x = s.x + s.w + 17 + 0.01;
      pl.vx = 0; b = box();
    }
    // vertikal
    const prevY = pl.y;
    pl.y += pl.vy * dt;
    const wasGround = pl.onGround;
    pl.onGround = false;
    b = box();
    for (const s of S) if (overlaps(b, s)) {
      if (pl.vy > 0) { pl.y = s.y; pl.onGround = true; } else { pl.y = s.y + s.h + 90; }
      pl.vy = 0; b = box();
    }
    if (pl.vy >= 0) {
      for (const p of PLATFORMS) {
        if (pl.x + 12 > p.x && pl.x - 12 < p.x + p.w && prevY <= p.y + 1 && pl.y >= p.y) { pl.y = p.y; pl.vy = 0; pl.onGround = true; }
      }
    }
    if (pl.onGround && !wasGround) {
      PT.sound.land();
      if (silben && silben.listening && Math.abs(pl.x - SILBEN_X - 120) < 220) { silben.count++; silben.idle = 0; }
    }

    // Grube oder Fluss
    fallCooldown -= dt;
    if (pl.y > GROUND + 220) {
      const gap = pl.x < (PIT.x2 + RIVER.x1) / 2 ? PIT : RIVER;
      const fromLeft = pl.x < (gap.x1 + gap.x2) / 2;
      pl.x = fromLeft ? gap.x1 - 50 : gap.x2 + 50;
      pl.y = GROUND - 140; pl.vy = 0; pl.vx = 0;
      input.target = null;
      PT.sound.pull();
      if (fallCooldown <= 0) {
        fallCooldown = 4;
        const river = gap === RIVER && !G.stations.bruecke;
        if (river || remember('grube')) PT.ui.dialog([river ? 'ranzl.fluss' : 'ranzl.grube']);
      }
    }

    pl.walk = pl.onGround ? Math.min(1, Math.abs(pl.vx) / 200) : 0;
    pl.cheer = Math.max(0, pl.cheer - dt);

    // Münzen
    COINS.forEach(c => {
      if (G.coins.includes(c.id)) return;
      if (Math.abs(c.x - pl.x) < 30 && c.y > pl.y - 100 && c.y < pl.y + 10) {
        G.coins.push(c.id); G.taler += c.v; PT.sound.coin(); PT.emit('taler');
      }
    });
    // Prolog-Knöpfe
    if (G.hasRanzl && !G.prologDone) {
      TUTORIAL_BUTTONS.forEach(tb => {
        if (G.tutorialButtons.includes(tb.id)) return;
        if (Math.abs(tb.x - pl.x) < 34 && tb.y > pl.y - 105 && tb.y < pl.y + 10) {
          G.tutorialButtons.push(tb.id); PT.sound.coin(); pl.cheer = 0.8;
          PT.ui.toast(G.tutorialButtons.length + ' von 3 Knöpfen', PT.draw.makeIcon('knopf', 88, 'gold'));
          if (G.tutorialButtons.length === 3) finishTutorial();
        }
      });
    }

    // Orte entdecken (nur wenn gerade nichts anderes offen ist)
    if (frozen) { /* nichts */ } else {
    if (pl.x > 1950 && !G.discovered.includes('weg')) { G.discovered.push('weg'); PT.ui.dialog(['ranzl.weg']); }
    if (pl.x > 4000 && !G.discovered.includes('muehlberg')) { G.discovered.push('muehlberg'); PT.ui.dialog(['ranzl.muehlberg']); }
    if (!G.springfedern && !G.chestOpened && Math.abs(pl.x - (LEDGE.x + 75)) < 120 && remember('truhe')) PT.ui.dialog(['ranzl.truhe.zu']);
    if (!G.prologDone && pl.x > 1700 && G.hasRanzl && remember('erstknoepfe')) PT.ui.dialog([{ who: 'pfeffer', text: 'Halt! Zuerst die drei Knöpfe bei meiner Werkstatt, bitte.' }]);
    }

    // Silben: Ende eines Wortes erkennen
    if (silben) {
      if (Math.abs(pl.x - SILBEN_X - 120) > 330) { silben = null; }
      else if (silben.listening && silben.count > 0 && pl.onGround) {
        silben.idle += dt;
        if (silben.idle > 1.5) evaluateSilben();
      }
    }

    // nahes Objekt
    near = null;
    if (!frozen) {
      for (const it of interactables()) {
        if (Math.abs(pl.x - it.x) < it.w / 2 + 10 && Math.abs((pl.y - 45) - it.y) < 170) { near = it; break; }
      }
    }
    PT.$('#ctl-act').classList.toggle('hidden', !near);
    if (near && prof().stage === 'spatz' && remember('hand')) PT.ui.dialog(['ranzl.hand']);

    // Bus
    if (bus.v) { bus.x += bus.v * dt; if (bus.x > camX + viewW + 400) { bus.v = 0; bus.x = -9999; } }

    // Speichern und Spielzeit
    if (!frozen) {
      G.playSeconds = (G.playSeconds || 0) + dt;
      sessionSeconds += dt;
    }
    G.pos = { x: pl.x, y: Math.min(pl.y, GROUND) };
    saveTimer += dt;
    if (saveTimer > 30) { saveTimer = 0; PT.store.save(); }
    const mins = PT.store.settings.playMinutes;
    if (mins > 0 && sessionSeconds > mins * 60 && !tiredShown && !frozen) { tiredShown = true; tired(); }
  }

  async function tired() {
    busy = true;
    await PT.ui.dialog(['ranzl.muede']);
    PT.store.save();
    const r = await PT.menus.sleepScreen();
    busy = false;
    if (r === 'home') PT.game.exit();
    else { sessionSeconds = 0; tiredShown = false; }
  }

  // ---------- Zeichnen ----------
  function drawBackdrop(c, w, h, off) {
    const k = h / VIEW_H;
    c.save(); c.scale(k, k);
    const W = w / k;
    const sky = c.createLinearGradient(0, 0, 0, VIEW_H);
    sky.addColorStop(0, '#9fd3ee'); sky.addColorStop(1, '#e8f5e0');
    c.fillStyle = sky; c.fillRect(0, 0, W, VIEW_H);
    c.fillStyle = '#fff3c4'; c.beginPath(); c.arc(W - 120, 90, 46, 0, 7); c.fill();
    // Wolken
    c.fillStyle = 'rgba(255,255,255,.85)';
    for (let i = 0; i < 6; i++) {
      const x = ((i * 420 - off * 0.08) % (W + 400) + W + 400) % (W + 400) - 200;
      const y = 60 + (i % 3) * 40;
      c.beginPath(); c.arc(x, y, 26, 0, 7); c.arc(x + 30, y - 12, 32, 0, 7); c.arc(x + 64, y, 24, 0, 7); c.fill();
    }
    // Berge (Traunstein-artig, aber eigener Look)
    c.fillStyle = '#9db8c9';
    c.beginPath(); c.moveTo(0, 340);
    for (let x = 0; x <= W + 200; x += 100) {
      const wx = x + off * 0.15;
      c.lineTo(x, 230 + Math.sin(wx * 0.004) * 60 + Math.sin(wx * 0.011) * 25);
    }
    c.lineTo(W, 400); c.lineTo(0, 400); c.closePath(); c.fill();
    c.fillStyle = '#f4f8fb';
    // Hügel
    c.fillStyle = '#a8d38a';
    c.beginPath(); c.moveTo(0, 400);
    for (let x = 0; x <= W + 60; x += 40) { const wx = x + off * 0.4; c.lineTo(x, 330 + Math.sin(wx * 0.006) * 30 + Math.sin(wx * 0.017) * 10); }
    c.lineTo(W, 440); c.lineTo(0, 440); c.closePath(); c.fill();
    // Bäume auf den Hügeln
    for (let i = -1; i < W / 160 + 2; i++) {
      const base = Math.floor(off * 0.4 / 160) + i;
      const x = base * 160 - off * 0.4 + ((base * 73) % 50);
      const y = 345 + Math.sin((x + off * 0.4) * 0.006) * 30;
      c.fillStyle = '#7a5a3a'; c.fillRect(x - 3, y, 6, 20);
      c.fillStyle = (base % 3) ? '#5f9e48' : '#4f8a3d'; c.beginPath(); c.moveTo(x - 18, y + 6); c.lineTo(x, y - 40); c.lineTo(x + 18, y + 6); c.closePath(); c.fill();
    }
    c.restore();
  }

  function label(c, text, x, y, size, fill, bg) {
    c.font = `800 ${size || 20}px ui-rounded, Nunito, "Trebuchet MS", sans-serif`;
    c.textAlign = 'center';
    if (bg) {
      const w = c.measureText(text).width + 24;
      d().rr(c, x - w / 2, y - (size || 20) - 4, w, (size || 20) + 16, 8); d().paper(c, bg, 2.5);
    }
    c.fillStyle = fill || '#3b2f2a'; c.fillText(text, x, y + 2);
  }

  function house(c, x, w, h, wall, roof) {
    const D = d();
    D.rr(c, x, GROUND - h, w, h, 6); D.paper(c, wall, 2.5);
    c.beginPath(); c.moveTo(x - 20, GROUND - h + 4); c.lineTo(x + w / 2, GROUND - h - 70); c.lineTo(x + w + 20, GROUND - h + 4); c.closePath(); D.paper(c, roof, 2.5);
  }

  function drawWorld(c) {
    const D = d(), G = g();
    const t = time;

    // ----- Dorf -----
    // Bushaltestelle
    D.rr(c, 90, GROUND - 120, 8, 120, 2); D.paper(c, '#6d5a4f');
    c.beginPath(); c.arc(94, GROUND - 130, 18, 0, 7); D.paper(c, '#f2c14e', 2.5);
    label(c, 'H', 94, GROUND - 125, 20);
    // Bus
    if (bus.x > -2000) {
      D.rr(c, bus.x - 130, GROUND - 120, 260, 104, 22); D.paper(c, '#f2c14e', 3);
      for (let i = 0; i < 4; i++) { D.rr(c, bus.x - 110 + i * 56, GROUND - 106, 44, 36, 6); D.paper(c, '#cfeaf6', 2); }
      D.circle(c, bus.x - 70, GROUND - 14, 18, '#3b2f2a'); D.circle(c, bus.x + 70, GROUND - 14, 18, '#3b2f2a');
    }
    // Werkstatt mit Spiegel
    house(c, 220, 240, 170, '#e9dcc0', '#a0523d');
    label(c, 'Flickerei', 340, GROUND - 190, 22, '#3b2f2a', '#fff8e6');
    D.rr(c, 300, GROUND - 130, 60, 130, 30); D.paper(c, '#9a6b3f', 3);
    c.fillStyle = '#cfeaf6'; D.rr(c, 308, GROUND - 122, 44, 110, 22); c.fill();
    c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(316, GROUND - 110, 6, 60);
    D.rr(c, 400, GROUND - 120, 44, 40, 4); D.paper(c, '#cfeaf6', 2);
    // Pfeffer
    if (G.hasRanzl || !G.prologDone) D.pfeffer(c, 520, GROUND, 1.15, t, -1);
    // Bäckerei (Hintergrund) mit vertauschtem Schild
    c.save(); c.globalAlpha = 0.9;
    house(c, 600, 190, 140, '#f6e7cf', '#c46a4a');
    label(c, 'BÄKCER', 695, GROUND - 160, 22, '#d9534f', '#fff8e6');
    D.rr(c, 670, GROUND - 80, 50, 80, 6); D.paper(c, '#8a5a3c', 2);
    c.restore();
    // Knopfladen
    house(c, 1100, 170, 150, '#f3d9e6', '#7b5ea7');
    D.knopf(c, 1185, GROUND - 230, 30, 'gold');
    label(c, 'Knopfladen', 1185, GROUND - 160, 20, '#3b2f2a', '#fff8e6');
    D.rr(c, 1160, GROUND - 90, 50, 90, 6); D.paper(c, '#5c4a6b', 2);
    // Baumhaus
    D.rr(c, 1430, GROUND - 240, 40, 240, 8); D.paper(c, '#8a5a3c', 2.5);
    c.fillStyle = '#5f9e48'; c.beginPath(); c.arc(1450, GROUND - 300, 110, 0, 7); c.fill();
    c.fillStyle = '#4f8a3d'; c.beginPath(); c.arc(1390, GROUND - 270, 60, 0, 7); c.arc(1520, GROUND - 280, 65, 0, 7); c.fill();
    D.rr(c, 1395, GROUND - 260, 110, 80, 8); D.paper(c, '#c08a55', 2.5);
    D.rr(c, 1430, GROUND - 240, 36, 36, 4); D.paper(c, '#cfeaf6', 2);
    for (let i = 0; i < 6; i++) { D.rr(c, 1474, GROUND - 175 + i * 28, 30, 6, 2); D.paper(c, '#c08a55', 1.5); }
    D.rr(c, 1470, GROUND - 180, 5, 180, 2); D.paper(c, '#8a5a3c', 1); D.rr(c, 1503, GROUND - 180, 5, 180, 2); D.paper(c, '#8a5a3c', 1);
    // Musikpavillon
    D.rr(c, 1600, GROUND - 120, 10, 120, 2); D.paper(c, '#fff8e6'); D.rr(c, 1690, GROUND - 120, 10, 120, 2); D.paper(c, '#fff8e6');
    c.beginPath(); c.moveTo(1585, GROUND - 120); c.lineTo(1650, GROUND - 175); c.lineTo(1715, GROUND - 120); c.closePath(); D.paper(c, '#5aa246', 2.5);
    D.rr(c, 1595, GROUND - 14, 110, 14, 3); D.paper(c, '#c08a55', 2);
    if (G.instruments.includes('tuba')) { const tc = PT.items.itemCanvas('tuba', 80); c.drawImage(tc, 1612, GROUND - 98, 80, 80); }
    // Rastbank
    bench(c, 1760);
    // Wegweiser
    D.rr(c, 1846, GROUND - 120, 10, 120, 2); D.paper(c, '#8a5a3c');
    c.beginPath(); c.moveTo(1800, GROUND - 120); c.lineTo(1900, GROUND - 120); c.lineTo(1920, GROUND - 105); c.lineTo(1900, GROUND - 90); c.lineTo(1800, GROUND - 90); c.closePath(); D.paper(c, '#f2c14e', 2);
    label(c, 'Mühlberg', 1856, GROUND - 98, 15);

    // Prolog-Knöpfe
    if (G.hasRanzl && !G.prologDone) TUTORIAL_BUTTONS.forEach(tb => {
      if (G.tutorialButtons.includes(tb.id)) return;
      c.fillStyle = 'rgba(242,193,78,.35)'; c.beginPath(); c.arc(tb.x, tb.y + Math.sin(t * 3) * 4, 30, 0, 7); c.fill();
      D.knopf(c, tb.x, tb.y + Math.sin(t * 3) * 4, 18, 'gold');
    });

    // ----- Weg -----
    // Grube
    c.fillStyle = '#5b3d28'; c.fillRect(PIT.x1, GROUND, PIT.x2 - PIT.x1, VIEW_H - GROUND);
    // Silbensteine
    label(c, 'Silbensteine', SILBEN_X, GROUND - 120, 17, '#3b2f2a', '#fff8e6');
    D.rr(c, SILBEN_X - 5, GROUND - 100, 10, 100, 2); D.paper(c, '#8a5a3c');
    const nW = silben ? silben.words[silben.i].length : 0;
    for (let i = 0; i < 5; i++) {
      const lit = silben && i < silben.count;
      c.save(); c.translate(SILBEN_X + 60 + i * 50, GROUND - 4); c.scale(1, 0.4);
      D.circle(c, 0, 0, 22, lit ? '#f2c14e' : (i < nW ? '#d8d2c6' : '#b9b3a8'), 3);
      c.restore();
    }
    if (silben && silben.listening) {
      const w = silben.words[silben.i];
      label(c, prof().stage === 'fuchs' ? w.join('') : '♪', SILBEN_X + 160, GROUND - 170, 30, '#3b2f2a', '#ffffff');
    }
    // Felsen mit Truhe
    c.beginPath(); c.moveTo(LEDGE.x - 20, GROUND); c.lineTo(LEDGE.x + 10, LEDGE.y + 20); c.lineTo(LEDGE.x + 60, LEDGE.y); c.lineTo(LEDGE.x + LEDGE.w, LEDGE.y + 10); c.lineTo(LEDGE.x + LEDGE.w + 40, GROUND); c.closePath();
    D.paper(c, '#a59d92', 3);
    c.fillStyle = '#7fb06a'; c.fillRect(LEDGE.x, LEDGE.y - 4, LEDGE.w, 10);
    chest(c, LEDGE.x + 75, LEDGE.y, G.chestOpened);
    // Rätselstein mit Höhle
    c.fillStyle = '#4a3b33'; c.beginPath(); c.arc(3600, GROUND, 60, Math.PI, 0); c.fill();
    PT.items.raetselstein(c, G.raetselDate === PT.today() ? 3640 : 3560, GROUND, 1.1, t, G.raetselDate === PT.today());
    bench(c, 3820);

    // ----- Mühlberg -----
    D.rr(c, 3996, GROUND - 120, 10, 120, 2); D.paper(c, '#8a5a3c');
    label(c, 'Mühlberg', 4001, GROUND - 118, 20, '#3b2f2a', '#fff8e6');
    // Resi und Hansi
    if (!allRepaired()) { D.resi(c, 4190, GROUND, 1.15, t, 1); D.hansi(c, 4100, GROUND, 0.95, t, 1); }
    // Fluss und Brücke
    c.fillStyle = '#5aa0d8'; c.fillRect(RIVER.x1, GROUND + 30, RIVER.x2 - RIVER.x1, VIEW_H - GROUND - 30);
    c.strokeStyle = '#b9e1f3'; c.lineWidth = 3;
    for (let i = 0; i < 4; i++) { c.beginPath(); const yy = GROUND + 50 + i * 18; for (let x = RIVER.x1; x <= RIVER.x2; x += 20) c.lineTo(x, yy + Math.sin(x * 0.05 + t * 3 + i) * 3); c.stroke(); }
    D.rr(c, RIVER.x1 - 6, GROUND - 60, 12, 120, 3); D.paper(c, '#7a4a2a'); D.rr(c, RIVER.x2 - 6, GROUND - 60, 12, 120, 3); D.paper(c, '#7a4a2a');
    const nPl = 14, plW = (RIVER.x2 - RIVER.x1) / nPl;
    for (let i = 0; i < nPl; i++) {
      const present = G.stations.bruecke || [0, 1, 4, 8, 12, 13].includes(i);
      if (present) { D.rr(c, RIVER.x1 + i * plW + 1, GROUND, plW - 2, 16, 3); D.paper(c, '#c08a55', 2); }
    }
    c.strokeStyle = '#8a5a3c'; c.lineWidth = 4; c.beginPath(); c.moveTo(RIVER.x1, GROUND - 50); c.lineTo(RIVER.x2, GROUND - 50); c.stroke();
    stationMarker(c, 4320, GROUND - 160, 'bruecke');
    // Hühnerhof
    house(c, 4840, 180, 130, '#f6e7cf', '#b5523b');
    D.rr(c, 4900, GROUND - 80, 60, 80, 4); D.paper(c, '#8a5a3c', 2);
    for (let x = 5030; x < 5120; x += 22) { D.rr(c, x, GROUND - 50, 12, 50, 3); D.paper(c, '#c9925a', 1.5); }
    const repairedH = G.stations.huehner;
    for (let i = 0; i < 4; i++) {
      if (repairedH) D.chicken(c, 5040 + i * 26, GROUND, 1, t + i, i % 2 ? 1 : -1);
      else D.chicken(c, 4870 + i * 38, GROUND - 210 + Math.abs(Math.sin(t * 5 + i)) * -6 - (i % 2) * 20, 1, 0, i % 2 ? 1 : -1);
    }
    stationMarker(c, 4930, GROUND - 290, 'huehner');
    // Marktstand
    D.rr(c, 5270, GROUND - 70, 150, 70, 4); D.paper(c, '#b07a48', 2.5);
    D.rr(c, 5272, GROUND - 160, 8, 90, 2); D.paper(c, '#8a5a3c'); D.rr(c, 5410, GROUND - 160, 8, 90, 2); D.paper(c, '#8a5a3c');
    c.beginPath(); c.moveTo(5255, GROUND - 150); c.lineTo(5435, GROUND - 150); c.lineTo(5420, GROUND - 180); c.lineTo(5270, GROUND - 180); c.closePath(); D.paper(c, '#d9534f', 2.5);
    if (G.stations.markt) {
      [5300, 5330, 5360, 5390].forEach(x => D.circle(c, x, GROUND - 80, 11, '#e04b3c', 1.5));
      label(c, '7 ct', 5345, GROUND - 110, 16, '#3b2f2a', '#fff8e6');
    } else {
      [5250, 5440, 5470, 5300].forEach((x, i) => D.circle(c, x, GROUND - 10, 11, '#e04b3c', 1.5));
      c.save(); c.translate(5340, GROUND - 40); c.rotate(0.5); D.rr(c, -30, -10, 60, 20, 3); D.paper(c, '#fff8e6', 2); c.restore();
    }
    stationMarker(c, 5340, GROUND - 230, 'markt');
    // Mühle
    D.rr(c, 5610, GROUND - 200, 110, 200, 8); D.paper(c, '#e9dcc0', 2.5);
    c.beginPath(); c.moveTo(5595, GROUND - 196); c.lineTo(5665, GROUND - 270); c.lineTo(5735, GROUND - 196); c.closePath(); D.paper(c, '#a0523d', 2.5);
    D.rr(c, 5645, GROUND - 70, 40, 70, 4); D.paper(c, '#8a5a3c', 2);
    const rot = G.stations.muehle ? t * 1.2 : 0.35;
    for (let i = 0; i < 4; i++) { c.save(); c.translate(5665, GROUND - 230); c.rotate(rot + i * Math.PI / 2); D.rr(c, -9, -110, 18, 100, 3); D.paper(c, '#f6f0e0', 2); c.restore(); }
    D.circle(c, 5665, GROUND - 230, 10, '#7a4a2a', 2);
    if (!G.stations.muehle) { ['#e8d3a8', '#e8d3a8', '#e8d3a8'].forEach((col, i) => { c.save(); c.translate(5560 + i * 26, GROUND - 14); c.rotate(i - 1); D.rr(c, -12, -14, 24, 28, 8); D.paper(c, col, 2); c.restore(); }); }
    stationMarker(c, 5665, GROUND - 360, 'muehle');
    bench(c, 5960);
    // Festplatz
    for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(6040 + i * 30, GROUND - 160); c.lineTo(6064 + i * 30, GROUND - 160); c.lineTo(6052 + i * 30, GROUND - 136); c.closePath(); D.paper(c, allRepaired() ? ['#d9534f', '#f2c14e', '#3f7ab0', '#5aa246'][i % 4] : '#cfc6b8', 1.5); }
    D.rr(c, 6030, GROUND - 165, 8, 165, 2); D.paper(c, '#8a5a3c'); D.rr(c, 6280, GROUND - 165, 8, 165, 2); D.paper(c, '#8a5a3c');
    label(c, 'Festplatz', 6160, GROUND - 175, 18, '#3b2f2a', '#fff8e6');
    if (allRepaired()) { D.resi(c, 6150, GROUND, 1.15, t, -1); D.hansi(c, 6230, GROUND, 0.95, t, -1); if (!G.festDone) bubble(c, 6150, GROUND - 160); }

    // Plattformen
    PLATFORMS.forEach(p => {
      if (p === LEDGE) return;
      D.rr(c, p.x, p.y, p.w, 18, 6); D.paper(c, '#b07a48', 2.5);
      c.fillStyle = '#7fb06a'; D.rr(c, p.x, p.y - 4, p.w, 8, 4); c.fill();
    });
    // Münzen
    COINS.forEach(co => { if (!G.coins.includes(co.id)) D.knopf(c, co.x, co.y + Math.sin(t * 3 + co.x) * 3, co.v > 1 ? 15 : 11, co.v > 1 ? 'gold' : 'normal'); });
  }

  function bench(c, x) {
    const D = d();
    D.rr(c, x - 40, GROUND - 40, 80, 10, 3); D.paper(c, '#b07a48', 2);
    D.rr(c, x - 40, GROUND - 62, 80, 10, 3); D.paper(c, '#b07a48', 2);
    D.rr(c, x - 34, GROUND - 32, 8, 32, 2); D.paper(c, '#7a4a2a'); D.rr(c, x + 26, GROUND - 32, 8, 32, 2); D.paper(c, '#7a4a2a');
  }
  function chest(c, x, y, open) {
    const D = d();
    D.rr(c, x - 26, y - 36, 52, 36, 5); D.paper(c, '#a0673a', 2.5);
    if (open) { D.rr(c, x - 26, y - 56, 52, 14, 5); D.paper(c, '#8a5a3c', 2.5); }
    else { c.beginPath(); c.moveTo(x - 26, y - 34); c.quadraticCurveTo(x, y - 54, x + 26, y - 34); c.closePath(); D.paper(c, '#8a5a3c', 2.5); }
    D.rr(c, x - 5, y - 28, 10, 12, 2); D.paper(c, '#f2c14e', 1.5);
    if (!open) { c.fillStyle = `rgba(242,193,78,${0.25 + Math.sin(time * 3) * 0.15})`; c.beginPath(); c.arc(x, y - 30, 40, 0, 7); c.fill(); }
  }
  function bubble(c, x, y) {
    const D = d();
    const bob = Math.sin(time * 4) * 4;
    c.beginPath(); c.arc(x, y + bob, 20, 0, 7); D.paper(c, '#fff', 2.5);
    label(c, '!', x, y + bob + 7, 26, '#d9534f');
  }
  function stationMarker(c, x, y, id) {
    if (g().stations[id]) {
      const D = d();
      c.beginPath(); c.arc(x, y, 16, 0, 7); D.paper(c, '#8fd16f', 2);
      c.strokeStyle = '#2f6b25'; c.lineWidth = 4; c.beginPath(); c.moveTo(x - 7, y); c.lineTo(x - 2, y + 6); c.lineTo(x + 8, y - 6); c.stroke();
    } else bubble(c, x, y);
  }

  function render() {
    const W = canvas.width, H = canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    drawBackdrop(ctx, W, H, camX);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.translate(-camX, 0);
    // Boden
    const D = d();
    const segs = [[0, PIT.x1], [PIT.x2, RIVER.x1], [RIVER.x2, WORLD_W]];
    segs.forEach(([a, b]) => {
      ctx.fillStyle = '#9b6a3e'; ctx.fillRect(a, GROUND, b - a, VIEW_H - GROUND + 200);
      ctx.fillStyle = '#7fb06a'; ctx.fillRect(a, GROUND - 6, b - a, 16);
      ctx.fillStyle = '#6a9c58'; for (let x = a + 8; x < b - 8; x += 26) { ctx.beginPath(); ctx.moveTo(x, GROUND - 6); ctx.lineTo(x + 5, GROUND - 14); ctx.lineTo(x + 10, GROUND - 6); ctx.fill(); }
    });
    drawWorld(ctx);
    // Avatar
    const G = g();
    if (!G.hasRanzl && !G.prologDone && bus.v) { /* steigt gerade aus */ }
    PT.avatar.drawAvatar(ctx, prof().avatar, pl.x, pl.y, 1.0, {
      t: time, walk: pl.walk, air: !pl.onGround, facing: pl.facing, hat: G.hat, charm: G.charm,
      ranzl: G.hasRanzl, cheer: pl.cheer > 0,
    });
    // Hinweisblase über nahem Objekt
    if (near) {
      const bob = Math.sin(time * 5) * 3;
      ctx.beginPath(); ctx.arc(pl.x, pl.y - 130 + bob, 20, 0, 7); D.paper(ctx, '#8fd16f', 2.5);
      ctx.save(); ctx.translate(pl.x - 13, pl.y - 145 + bob); ctx.scale(0.65, 0.65);
      ctx.strokeStyle = '#2f6b25'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(14, 30); ctx.lineTo(14, 14); ctx.arc(17, 14, 3, Math.PI, 0); ctx.lineTo(20, 22); ctx.moveTo(20, 18); ctx.arc(23, 18, 3, Math.PI, 0); ctx.lineTo(26, 22); ctx.moveTo(26, 20); ctx.arc(29, 20, 3, Math.PI, 0); ctx.lineTo(32, 32); ctx.stroke();
      ctx.restore();
    }
  }

  function loop(ts) {
    if (!running) return;
    const dt = Math.min(0.05, (ts - lastT) / 1000 || 0.016);
    lastT = ts;
    time += dt;
    update(dt);
    const target = PT.clamp(pl.x - viewW * 0.4, 0, WORLD_W - viewW);
    camX += (target - camX) * Math.min(1, dt * 6);
    render();
    raf = requestAnimationFrame(loop);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    scale = canvas.height / VIEW_H;
    viewW = canvas.width / scale;
  }

  // ---------- Eingabe ----------
  function bindInput() {
    const hold = (id, key) => {
      const b = PT.$(id);
      const on = e => { e.preventDefault(); input[key] = true; input.target = null; b.classList.add('pressed'); };
      const off = e => { e.preventDefault(); input[key] = false; b.classList.remove('pressed'); };
      b.addEventListener('pointerdown', on);
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => b.addEventListener(ev, off));
    };
    hold('#ctl-left', 'left');
    hold('#ctl-right', 'right');
    const jb = PT.$('#ctl-jump');
    jb.addEventListener('pointerdown', e => { e.preventDefault(); input.jumpQueued = true; jb.classList.add('pressed'); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => jb.addEventListener(ev, () => jb.classList.remove('pressed')));
    PT.$('#ctl-act').addEventListener('pointerdown', e => { e.preventDefault(); if (near) act(near); });

    window.addEventListener('keydown', e => {
      if (!running || PT.ui.anyScreen()) return;
      if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') { input.left = true; input.target = null; }
      if (e.key === 'ArrowRight' || e.key === 'd') { input.right = true; input.target = null; }
      if ((e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') && !e.repeat) { input.jumpQueued = true; e.preventDefault(); }
      if ((e.key === 'Enter' || e.key === 'e') && near) act(near);
    });
    window.addEventListener('keyup', e => {
      if (e.key === 'ArrowLeft' || e.key === 'a') input.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') input.right = false;
    });
    // Tippen auf die Welt: Objekt benutzen oder (Tipp-dorthin) hinlaufen
    canvas.addEventListener('pointerdown', e => {
      if (!running || busy || PT.ui.anyScreen() || PT.ui.dialogBusy) return;
      const wx = e.clientX * dpr / scale + camX;
      const wy = e.clientY * dpr / scale;
      if (near && Math.abs(wx - near.x) < near.w / 2 + 40 && Math.abs(wy - near.y) < 180) { act(near); return; }
      if (PT.store.settings.control === 'tap') {
        input.target = PT.clamp(wx, 20, WORLD_W - 20);
        if (wy < pl.y - 150 * 1) input.jumpQueued = true;
      }
    });
  }

  // ---------- Prolog ----------
  async function storybook() {
    const c = PT.el('canvas', { width: 1120, height: 630, style: { width: '100%', maxHeight: '64vh', height: 'auto', display: 'block', margin: '0 auto', borderRadius: '22px' } });
    const node = PT.el('div', {}, [c]);
    const close = PT.ui.screen(node);
    const cx = c.getContext('2d');
    let page = 1, t = 0, rafS;
    function frame() {
      t += 1 / 60;
      cx.clearRect(0, 0, 1120, 630);
      drawBackdrop(cx, 1120, 630, t * 10);
      const D = d();
      cx.save(); cx.translate(0, 70);
      if (page === 1 || page === 2) {
        // Sortiermaschine Gustl
        D.rr(cx, 420, 260, 280, 250, 20); D.paper(cx, '#c9925a', 4);
        for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { D.rr(cx, 440 + i * 64, 280 + j * 56, 54, 44, 6); D.paper(cx, '#fff8e6', 2); }
        D.circle(cx, 500, 470, 18, '#f2c14e', 3); D.circle(cx, 620, 470, 18, '#f2c14e', 3);
        if (page === 2) {
          D.zausel(cx, 260 + Math.sin(t * 2) * 30, 200, 2.4, t);
          const letters = 'ABC123BÄKCER';
          cx.font = '900 40px sans-serif'; cx.fillStyle = '#3b2f2a';
          for (let i = 0; i < letters.length; i++) { const a = t * 2 + i; cx.fillText(letters[i], 560 + Math.cos(a) * (120 + i * 12), 200 + Math.sin(a * 1.3) * 90); }
        }
      } else if (page === 3) {
        house(cx, 0, 0, 0, '#fff', '#fff');
        cx.save(); cx.translate(-180, 0);
        house(cx, 420, 300, 230, '#f6e7cf', '#c46a4a');
        cx.restore();
        label(cx, 'BÄKCER', 390, 210, 54, '#d9534f', '#fff8e6');
        for (let i = 0; i < 3; i++) D.chicken(cx, 760 + i * 70, 300 - Math.abs(Math.sin(t * 4 + i)) * 10, 2, t, -1);
        D.rr(cx, 700, 310, 300, 30, 6); D.paper(cx, '#b5523b', 3);
      } else {
        D.rr(cx, 300 + Math.max(0, 3 - t) * 200, 330, 520, 200, 40); D.paper(cx, '#f2c14e', 4);
        for (let i = 0; i < 4; i++) { D.rr(cx, 340 + Math.max(0, 3 - t) * 200 + i * 116, 360, 90, 70, 10); D.paper(cx, '#cfeaf6', 3); }
        PT.avatar.drawAvatar(cx, prof().avatar, 560, 560, 2.6, { t, front: true, cheer: t > 3.4 });
      }
      cx.restore();
      rafS = requestAnimationFrame(frame);
    }
    frame();
    await PT.ui.dialog(['prolog.1']); page = 2; t = 0;
    await PT.ui.dialog(['prolog.2']); page = 3; t = 0;
    await PT.ui.dialog(['prolog.3']); page = 4; t = 0;
    await PT.ui.dialog(['prolog.4']);
    cancelAnimationFrame(rafS);
    close();
  }

  async function prolog() {
    const G = g();
    busy = true;
    if (!G.hasRanzl) {
      await storybook();
      pl.x = 150; pl.y = GROUND; camX = 0;
      bus.x = 150; bus.v = 0;
      await PT.wait(400);
      bus.v = 260;
      await PT.wait(800);
      await PT.ui.dialog(['pfeffer.hallo', 'pfeffer.ruecken', 'pfeffer.ranzl']);
      G.hasRanzl = true;
      PT.sound.reward();
      pl.cheer = 1.5;
      PT.store.save();
      await PT.ui.dialog(['ranzl.hallo', 'ranzl.tipp']);
      PT.game.giveSticker('pfeffer');
      PT.game.giveSticker('ranzl');
      await PT.ui.dialog(['pfeffer.knoepfe']);
    } else {
      await PT.ui.dialog(['pfeffer.knoepfe']);
    }
    busy = false;
  }
  async function finishTutorial() {
    busy = true;
    await PT.wait(400);
    await PT.ui.dialog(['pfeffer.knoepfe.fertig']);
    const G = g();
    G.taler += 5;
    G.prologDone = true;
    PT.emit('taler');
    PT.store.save();
    await PT.ui.dialog(['pfeffer.spiegel', 'pfeffer.auftrag', 'pfeffer.truhe']);
    busy = false;
  }

  // ---------- Start/Stopp ----------
  let inputBound = false;
  function start() {
    canvas = PT.$('#game');
    ctx = canvas.getContext('2d');
    if (!inputBound) { bindInput(); window.addEventListener('resize', resize); inputBound = true; }
    resize();
    const G = g();
    Object.assign(pl, { x: 160, y: GROUND, vx: 0, vy: 0, onGround: true, facing: 1, cheer: 0, sitting: false });
    if (G.pos && G.prologDone) { pl.x = PT.clamp(G.pos.x, 40, WORLD_W - 40); pl.y = GROUND - 200; }
    camX = PT.clamp(pl.x - viewW * 0.4, 0, WORLD_W - viewW);
    sessionSeconds = 0; tiredShown = false; silben = null; busy = false; bus = { x: -9999, v: 0 };
    input.left = input.right = false; input.target = null;
    running = true; lastT = performance.now();
    raf = requestAnimationFrame(loop);
    document.body.classList.toggle('tapmode', PT.store.settings.control === 'tap');
    if (!G.prologDone) prolog();
    else PT.speech.say({ text: `Servus ${prof().name}! Schön, dass du wieder da bist.`, who: 'ranzl' });
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    silben = null;
    PT.store.save();
  }
  function teleport(x) { pl.x = x; pl.y = GROUND - 100; pl.vy = 0; input.target = null; camX = PT.clamp(x - viewW * 0.4, 0, WORLD_W - viewW); }

  PT.world = { start, stop, teleport, drawBackdrop, PLACES, get running() { return running; }, get player() { return pl; }, _act: id => { const it = interactables().find(i => i.id === id); if (it) return act(it); } };
})(window.PT);
