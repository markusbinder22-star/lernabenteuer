// Echter Durchlauf: ein Testspieler läuft und springt mit normaler Steuerung durch die Level,
// löst die Aufgaben, schließt Fenster per Mausklick, geht über „Weiter“ zur Karte und startet das nächste Level.
// Aufruf: aus www/ einen Webserver auf Port 8765 starten, dann
//   node tools/test/playthrough.js [von-Level] [bis-Level]      z. B. 1-1 7-3   (STAGE=ei für Drachenei)
// Ohne Angaben: frisches Profil, 1-1 bis 7-3 am Stück.
const { chromium } = require('playwright');
const from = process.argv[2] || '1-1', to = process.argv[3] || '7-3', stage = process.env.STAGE || 'jung';
const LEVEL_MS = +(process.env.LEVEL_MS || 240000);

// läuft im Browser: steuert Kivalu nur über die Eingaben (links, rechts, springen, Feuer, hoch, runter)
function installBot() {
  const L = K.game.scene.getScene('Level'), T = 64, R = L.reach();
  const st = { i: 0, mode: 'ground', jumpT: 0, fireT: 0, dbl: false, wait: 0, dunks: 0, hurts: 0, lastX: 0, lastMove: Date.now(), tgt: null };
  window.BOT = st;
  L.__hurt0 = L.__hurt0 || L.hurt; L.__dunk0 = L.__dunk0 || L.dunk; L.hurt = function () { st.hurts++; }; // Schaden zählen, aber nicht sterben lassen
  const od = L.__dunk0.bind(L); L.dunk = function (h) { if (!this.dunking) { st.dunks++; if (window.DEBUG) console.log(`DUNK x=${Math.round(this.pl.x)} i=${st.i} path=${JSON.stringify(st.path.slice(st.i, st.i + 6))}`); } return od(h); };
  // Ziel-Standfläche
  let goal = null;
  if (L.finish) { const fx = Math.floor(L.finish.x / T); for (let y = Math.floor(L.finish.y / T); y < L.rows && !goal; y++) for (const x of [fx, fx - 1, fx + 1]) if (R.has(x, y)) { goal = [x, y]; break; } }
  if (L.arena) { const ax = Math.floor((L.arena.x1 - 4 * T) / T); for (let y = 2; y < L.rows && !goal; y++) if (R.has(ax, y)) goal = [ax, y]; }
  st.path = goal ? R.path(goal[0], goal[1]) : null;
  st.goal = goal;
  const path = st.path || [];
  const walkable = (a, b) => a[1] === b[1] && (() => { const s = Math.sign(b[0] - a[0]); for (let x = a[0]; x !== b[0] + s; x += s) if (!R.stand(x, a[1]) || R.mv(x, a[1])) return false; return true; })();
  const breakAhead = (dir) => L.breaks.some(o => o.img && o.img.active && (o.cx * T + 32 - L.pl.x) * dir > -20 && (o.cx * T + 32 - L.pl.x) * dir < 4 * T && Math.abs(o.cy * T + 32 - (L.pl.y - 44)) < 2 * T)
    || L.knights.some(k => k.img && k.img.active && k.state === 'walk' && (k.img.x - L.pl.x) * dir > 0 && (k.img.x - L.pl.x) * dir < 5 * T && Math.abs(k.img.y - L.pl.y) < 100);
  L.readInput = function () {
    this.prev = this.inp || {};
    const pl = this.pl, b = pl.body, now = Date.now();
    const I = { left: false, right: false, up: false, down: false, jump: false, fire: false };
    const on = b.blocked.down || b.touching.down;
    if (Math.abs(pl.x - st.lastX) > 24) { st.lastX = pl.x; st.lastMove = now; }
    const press = (dir) => { if (dir > 0) I.right = true; else if (dir < 0) I.left = true; };
    if (this.mode === 'fly') { // freie Flugbahn suchen
      const cx = Math.floor(pl.x / T), cy = Math.floor((pl.y - 40) / T);
      const free = (y) => { for (let x = cx; x <= cx + 4; x++) for (const yy of [y - 1, y, y + 1]) { const c = this.ch(x, yy); if (c === '#' || c === 'L' || yy < 0 || yy > 11) return false; } return true; };
      let best = cy; for (let d = 0; d < 12; d++) { if (free(cy + d)) { best = cy + d; break; } if (free(cy - d)) { best = cy - d; break; } }
      if (this.finish && pl.x > this.finish.x - 6 * T) best = Math.floor((this.finish.y + 150) / T);
      I.right = true; if (best * T + 32 < pl.y - 50) I.up = true; else if (best * T + 32 > pl.y - 30) I.down = true;
      I.fire = (now % 500) < 250;
    } else if (this.mode === 'boss' && this.boss && this.boss.state !== 'dead') {
      const B = this.boss; // im Kampf: zum Kern schauen, bei offenem Kern Feuer, Bomben überspringen
      const want = B.gx - 420; press(Math.abs(pl.x - want) > 30 ? Math.sign(want - pl.x) : 0);
      if (Math.abs(pl.x - want) <= 30 && pl.dir < 0) I.right = true;
      if (B.state === 'open') I.fire = (now % 400) < 200;
      if (on && B.bombs.some(o => Math.abs(o.img.x - pl.x) < 140 && o.img.y > B.gy - 120)) I.jump = true;
    } else {
      // Position auf dem Weg bestimmen
      const cx = Math.floor(pl.x / T), cy = Math.floor((b.bottom + 2) / T);
      const me = [cx, cy], riding = on && this.movers.find(m => Math.abs(m.img.x - pl.x) < 110 && Math.abs(m.img.y - 12 - b.bottom) < 24);
      if (on && !riding) for (let k = Math.min(path.length - 1, st.i + 40); k >= 0; k--) if ((path[k][0] === cx && path[k][1] === cy) || walkable(me, path[k])) { st.i = k; break; }
      if (riding) for (let k = Math.min(path.length - 1, st.i + 20); k >= st.i; k--) if (R.mv(path[k][0], path[k][1]) && path[k][1] === cy) { st.i = k; break; }
      const cur = riding ? path[st.i] : me;
      let w = st.i; while (w + 1 < path.length && walkable(cur, path[w + 1])) w++;
      const nxt = path[w + 1], take = path[w];
      if (!path.length || (!nxt && this.finish)) { press(1); }
      else if (st.mode === 'air' && !on) {
        const sd = Math.sign(st.tgt[0] * T + 32 - st.fromX);
        if (st.aimFor !== st.tgt) { // Landestelle: nahe Kante der Zielfläche plus ein Feld, nicht ihr fernes Ende
          let nx = st.tgt[0]; while (Math.abs(nx - st.tgt[0]) < 8 && R.stand(nx - sd, st.tgt[1]) && !R.mv(nx - sd, st.tgt[1]) && (nx - sd) * T + 32 - st.fromX !== 0 && Math.sign((nx - sd) * T + 32 - st.fromX) === sd) nx -= sd;
          st.aim = (Math.abs(nx - st.tgt[0]) >= 1 ? nx + sd : nx) * T + 32; st.aimFor = st.tgt; }
        const tx = st.ride ? st.ride.img.x : st.aim, d = tx - pl.x;
        press(Math.abs(d) > 10 ? Math.sign(d) : 0);
        I.jump = b.velocity.y < 0 || (this.ab.fly && Math.abs(d) > 40); // voll hochspringen, mit Flügeln gleiten
        if (this.ab.double && !pl.dbl && b.velocity.y > -60 && (b.bottom > st.tgt[1] * T - 4 || Math.abs(d) > 2.2 * T)) { I.jump = !this.prev.jump; }
        if (this.ab.climb && (b.blocked.left || b.blocked.right) && st.tgt[1] * T < b.bottom - 8) { press(b.blocked.left ? -1 : 1); }
      } else {
        st.mode = 'ground'; st.ride = null;
        const onMover = !!riding;
        const toMover = nxt && R.mv(nxt[0], nxt[1]) && !onMover;
        const s = nxt ? Math.sign(nxt[0] - take[0]) : 1;
        const edgeX = take[0] * T + 32 + s * 22;
        const gap = nxt && (nxt[1] < take[1] || Math.abs(nxt[0] - take[0]) > 1 || !R.stand(take[0] + s, take[1]) || nxt[1] > take[1] && Math.abs(nxt[0] - take[0]) > 3);
        if (onMover) { // auf der Plattform mitfahren, bis das nächste Stück nah ist
          let k = st.i; while (k < path.length && R.mv(path[k][0], path[k][1])) k++;
          const land = path[k]; if (land) { const lx = land[0] * T + 32, dir = Math.sign(lx - pl.x), m = riding;
            const atEnd = dir > 0 ? m.img.x > m.x1 - 24 : m.img.x < m.x0 + 24;
            if (atEnd) { press(dir); I.jump = !this.prev.jump; if (window.DEBUG && I.jump) console.log(`mover-off x=${Math.round(pl.x)} m=${Math.round(m.img.x)} land=${land}`); } }
          if (I.jump) { st.mode = 'air'; st.tgt = land; st.fromX = pl.x; }
        } else if (toMover) {
          const m = this.movers.find(m => Math.abs(m.img.y - (nxt[1] * T + 12)) < 40 && Math.abs(m.img.x - pl.x) < 12 * T);
          if ((pl.x - edgeX) * s < 0) press(s);
          else if (m && (s > 0 ? m.img.x < m.x0 + 50 : m.img.x > m.x1 - 50) && m.img.body.velocity.x * s <= 0) { I.jump = !this.prev.jump; press(s); st.mode = 'air'; st.tgt = [Math.floor((m.img.x + s * 30) / T), nxt[1]]; st.fromX = pl.x; st.ride = m; if (window.DEBUG) console.log(`mover-on x=${Math.round(pl.x)} m=${Math.round(m.img.x)} tgt=${st.tgt}`); }
        } else if (!nxt) press(1);
        else if (!gap) press(s || 1);
        else {
          const up = nxt[1] < take[1];
          const at = up && Math.abs(nxt[0] - take[0]) <= 1 ? (pl.x - (take[0] * T + 32)) * (s || 1) >= -8 : (pl.x - edgeX) * s >= 0;
          if (!at) press(s || Math.sign(take[0] * T + 32 - pl.x));
          else if (on) { I.jump = !this.prev.jump; press(s); st.mode = 'air'; st.tgt = nxt; st.fromX = pl.x; if (window.DEBUG) console.log(`jump from ${take} to ${nxt} at x=${Math.round(pl.x)} cur=${cur} i=${st.i}`); }
        }
      }
      if (this.ab.fire && breakAhead(pl.dir || 1)) I.fire = (now % 300) < 150;
    }
    // festgefahren? kleiner Hüpfer
    if (now - st.lastMove > 2500 && !this.busy && this.mode !== 'boss') { I.jump = (now % 600) < 300; if (now - st.lastMove > 5000) I.right = !I.left; }
    this.inp = I; this.inp.jumpP = I.jump && !this.prev.jump; this.inp.fireP = I.fire && !this.prev.fire;
  };
  return { goal, path: path.length };
}

(async () => {
  const br = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const pg = await br.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); if (process.env.DEBUG) { pg.on('console', m => console.log('  ·', m.text())); pg.addInitScript(() => { window.DEBUG = 1; }); }
  await pg.addInitScript(([from, stage]) => {
    const ch = +from[0], order = ['fire', 'double', 'melt', 'climb', 'fly', 'bigfire'];
    const p = { id: 'pt', name: 'Test', stage, color: 'blau', hat: null, created: 1, seen: { prolog: true }, levels: {}, coins: 0 };
    if (!localStorage.getItem('kivalu.save.v1')) {
      // für einen Start mitten im Spiel: alle Level davor als geschafft markieren
      for (let c = 1; c <= 7; c++) for (let i = 1; i <= 3; i++) { const id = c + '-' + i; if (c < ch || (c === ch && i < +from[2])) p.levels[id] = { done: true, gems: 0, max: 0, treasures: [] }; }
      for (let c = 1; c < ch; c++) { p.seen['skill_' + order[c - 1]] = true; }
      localStorage.setItem('kivalu.save.v1', JSON.stringify({ profiles: [p], current: 'pt', settings: { music: 0, sfx: 0, voice: false, rate: 1 } }));
    }
  }, [from, stage]);
  await pg.goto('http://localhost:8765/index.html');
  await pg.waitForFunction(() => window.K && K.game && K.game.scene.isActive('Profiles'), null, { timeout: 60000 });
  await pg.evaluate(() => { const g = K.game; g.loop.blur = () => {}; g.loop.inFocus = true; g.loop._coolDown = 0; });
  // wie ein Kind: Profil antippen geht zur Karte, Karte startet das Level
  await pg.evaluate((id) => { const g = K.game; g.scene.stop('Profiles'); g.scene.start('Map', { focus: id }); }, from);
  await pg.waitForFunction(() => K.game.scene.isActive('Map'), null, { timeout: 20000 });
  let id = from; const results = [];
  const active = () => pg.evaluate(() => K.game.scene.getScenes(true).map(s => s.scene.key));
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  while (id) {
    errs.length = 0;
    await pg.evaluate((id) => K.game.scene.getScene('Map').startLevel(id), id);
    // Vorgeschichte (Cutscene) per Enter durchklicken
    let t0 = Date.now();
    while (Date.now() - t0 < 60000) { const a = await active(); if (a.includes('Level')) break; if (a.includes('Cutscene')) await pg.keyboard.press('Enter'); await sleep(400); }
    try { await pg.waitForFunction(() => { const L = K.game.scene.getScene('Level'); return L && L.pl && L.sys.isActive(); }, null, { timeout: 30000 }); }
    catch (e) { console.log(`== ${id}: Level startet NICHT (aktiv: ${await active()}) ${errs.join(' | ')}`); results.push({ ok: false }); break; }
    await sleep(600);
    const info = await pg.evaluate(installBot);
    const res = { id, tasks: 0, popups: 0, ok: false, note: '' };
    if (!info.goal) res.note = 'kein Weg zum Ziel gefunden';
    t0 = Date.now(); let lastTask = 0;
    while (Date.now() - t0 < LEVEL_MS) {
      const a = await active();
      if (a.includes('LevelDone')) { res.ok = true; break; }
      if (a.includes('Task') && Date.now() - lastTask > 800) {
        await sleep(500); await pg.evaluate(() => { const T = K.game.scene.getScene('Task'); if (T.sys.isActive() && !T.locked) T.answer(true, null); }); res.tasks++; lastTask = Date.now(); await sleep(1200); continue;
      }
      const pop = await pg.evaluate(() => { const L = K.game.scene.getScene('Level'); return L.sys.isActive() && L.busy && !L.won && !K.game.scene.isActive('Task') && L.children.list.some(o => o.type === 'Container' && o.depth === 4500 && o.active); });
      if (pop) { await sleep(800); await pg.mouse.click(640 + 90, 360 + 220); res.popups++; await sleep(500); continue; }
      const st = await pg.evaluate(() => ({ stuck: Date.now() - BOT.lastMove, x: Math.round(K.game.scene.getScene('Level').pl.x), y: Math.round(K.game.scene.getScene('Level').pl.y), busy: K.game.scene.getScene('Level').busy }));
      if (process.env.DEBUG == 2 && Date.now() % 3000 < 260) console.log('  pos', JSON.stringify(st), await pg.evaluate(() => JSON.stringify({ i: BOT.i, mode: BOT.mode, cur: BOT.path[BOT.i], tgt: BOT.tgt })));
      if (st.stuck > 15000 && !st.busy) { res.note = `steckt fest bei x=${st.x} (Feld ${Math.floor(st.x / 64)}), y=${st.y}`; break; }
      await sleep(250);
    }
    const bot = await pg.evaluate(() => ({ dunks: BOT.dunks, hurts: BOT.hurts, secs: Math.round((Date.now() - BOT.lastMove) / 1000) }));
    if (!res.ok && !res.note) res.note = 'Zeit abgelaufen';
    res.dunks = bot.dunks; res.hurts = bot.hurts; res.errs = errs.slice();
    console.log(`== ${id}: ${res.ok ? 'Ziel erreicht' : 'NICHT geschafft: ' + res.note} · Aufgaben ${res.tasks} · Fenster ${res.popups} · in Lava/Wasser gefallen ${res.dunks} · getroffen ${res.hurts}${res.errs.length ? ' · FEHLER ' + res.errs.join(' | ') : ''}`);
    results.push(res);
    if (!res.ok) break;
    if (id === to) break;
    // „Weiter“ wie ein Kind: Enter auf dem Ergebnisbild, Geschichte durchklicken, Karte muss das nächste Level zeigen
    await sleep(1500); await pg.keyboard.press('Enter');
    t0 = Date.now(); let a = [];
    while (Date.now() - t0 < 60000) { a = await active(); if (a.includes('Map')) break; if (a.includes('Cutscene')) await pg.keyboard.press('Enter'); await sleep(400); }
    if (!a.includes('Map')) { console.log(`   Levelwechsel: Karte kam NICHT (aktiv: ${a})`); break; }
    const next = await pg.evaluate(() => { const M = K.game.scene.getScene('Map'); return M.focus || null; });
    const open = next && await pg.evaluate((n) => K.Story.unlocked(K.Save.cur(), n), next);
    console.log(`   Levelwechsel: Karte ok, nächstes Level ${next} ${open ? 'freigeschaltet' : 'NICHT freigeschaltet'}`);
    if (!open) break;
    id = next; await sleep(800);
  }
  await br.close();
  process.exit(results.every(r => r.ok) ? 0 : 1);
})();
