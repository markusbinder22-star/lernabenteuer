// Aufruf: aus www/ einen Webserver auf Port 8765 starten, dann: node tools/test/levelcheck.js [1-1,1-2] (STAGE=ei für Drachenei)
// Spielt jedes Level automatisch ab: läuft zu jedem Tor/Brücke/Hort, beantwortet die Aufgabe, prüft das Öffnen, läuft ins Ziel
const { chromium } = require('playwright');
const levels = process.argv[2] ? process.argv[2].split(',') : ['1-1','1-2','1-3','2-1','2-2','2-3','3-1','3-2','3-3','4-1','4-2','4-3','5-1','5-2','5-3','6-1','6-2','6-3','7-1','7-2','7-3'];
const stage = process.env.STAGE || 'jung';
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const id of levels) {
    const pg = await b.newPage({ viewport: { width: 1280, height: 720 } });
    const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.addInitScript(([id, stage]) => {
      const ch = +id[0]; const order = ['fire', 'double', 'melt', 'climb', 'fly', 'bigfire'];
      const p = { id: 'pt', name: 'T', stage, color: 'blau', hat: null, created: 1, seen: { prolog: true }, levels: {}, coins: 0 };
      order.slice(0, ch - 1).forEach(k => p.seen['skill_' + k] = true);
      if (+id[2] > 1 && ch <= 6) p.seen['skill_' + order[ch - 1]] = true;
      localStorage.setItem('kivalu.save.v1', JSON.stringify({ profiles: [p], current: 'pt', settings: { music: 0, sfx: 0, voice: false, rate: 1 } }));
    }, [id, stage]);
    await pg.goto('http://localhost:8765/index.html');
    await pg.waitForFunction(() => window.K && K.game && K.game.scene.isActive('Profiles'), null, { timeout: 60000 });
    await pg.evaluate((id) => { const g = K.game; g.loop.blur = () => {}; g.loop.inFocus = true; g.loop._coolDown = 0; g.scene.stop('Profiles'); g.scene.start('Level', { id }); }, id);
    await pg.waitForTimeout(1500);
    const res = await pg.evaluate(async () => {
      const G = K.game, L = G.scene.getScene('Level'), log = [];
      const sleep = (ms) => new Promise(r => setTimeout(r, ms));
      L.hurt = () => {}; // Test: keine Schäden
      let hold = { right: true };
      L.readInput = function () { this.prev = this.inp; this.inp = Object.assign({ left: false, right: false, up: false, down: false, jump: false, fire: false }, hold); this.inp.jumpP = this.inp.jump && !this.prev.jump; this.inp.fireP = false; };
      const ground = (cx) => { for (let y = 1; y < 12; y++) if (L.solidAt(cx, y) && !L.solidAt(cx, y - 1)) return y * 64 - 2; return null; };
      const place = (x, yHint) => { if (L.mode === 'fly') return L.pl.body.reset(x, yHint || 360); let cx = Math.floor(x / 64); for (let k = 0; k < 6; k++) { const y = ground(cx - k); if (y != null && L.ch(cx - k, Math.floor(y / 64) + 1) !== 'L') { L.pl.body.reset((cx - k) * 64 + 32, y - 4); return; } } L.pl.body.reset(x, 300); };
      const waitFor = async (fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (fn()) return true; await sleep(100); } return false; };
      // Hort
      for (const t of L.triggers.filter(t => t.type === 'shrine')) {
        place(t.x - 4 * 64); const ok = await waitFor(() => L.busy || t.used && t.known, 8000);
        log.push(`Hort ${t.known ? '(bekannt)' : ''}: ${ok ? 'ok' : 'NICHT ausgelöst'} px=${Math.round(L.pl.x)} tx=${t.x}`);
        if (L.busy) { await sleep(300); L.physics.resume(); L.busy = false; G.scene.getScene('Level').children.list.filter(o => o.type === 'Container' && o.depth === 4500).forEach(o => o.destroy()); }
      }
      // Tore
      for (const g of L.gates) {
        const fly = L.mode === 'fly'; let yh = 360;
        if (fly) { for (let y = 2; y < 11; y++) if (!L.solidAt(g.cx - 3, y) && !L.solidAt(g.cx - 2, y) && !L.solidAt(g.cx - 1, y)) { yh = y * 64 + 32; break; } }
        place(g.x - 4 * 64, yh);
        const ok = await waitFor(() => G.scene.isActive('Task'), 10000);
        if (!ok) { log.push(`${g.bridge ? 'Brücke' : 'Tor'} ${g.info.cat} @${g.cx}: NICHT ausgelöst px=${Math.round(L.pl.x)} py=${Math.round(L.pl.y)} gx=${g.x}`); g.open = true; for (let k = 0; k < 12; k++) if (L.ch(g.cx, k) !== '#') L.block(g.cx, k, false); continue; }
        const T = G.scene.getScene('Task'); await sleep(300); const kind = T.task.kind; T.answer(true, null);
        const opened = await waitFor(() => g.open && !G.scene.isActive('Task'), 6000);
        log.push(`${g.bridge ? 'Brücke' : 'Tor'} ${g.info.cat} (${kind}): ${opened ? 'ok' : 'öffnet NICHT'}`);
        await sleep(900);
        if (g.bridge) { // über die Brücke laufen
          const far = g.bridge[g.bridge.length - 1][0] * 64 + 120; const crossed = await waitFor(() => L.pl.x > far, 6000);
          log.push(`  Brücke überquert: ${crossed ? 'ok' : 'NEIN'} y=${Math.round(L.pl.y)}`);
        }
      }
      // Ziel / Endgegner
      if (L.mode === 'boss') {
        place(L.arena.x1 - K.W + 200); await waitFor(() => !!L.boss, 5000);
        hold = { right: false };
        let hits = 0;
        for (let i = 0; i < 8 && L.boss && L.boss.state !== 'dead'; i++) {
          L.boss.state = 'open'; L.boss.onFire(); const ok = await waitFor(() => G.scene.isActive('Task'), 4000);
          if (!ok) break; await sleep(200); G.scene.getScene('Task').answer(true, null); await waitFor(() => !G.scene.isActive('Task'), 5000); hits++; await sleep(500);
        }
        log.push(`Endgegner: ${hits} Treffer, ${L.boss && L.boss.state === 'dead' ? 'besiegt' : 'NICHT besiegt'}`);
        const done = await waitFor(() => G.scene.isActive('LevelDone'), 12000); log.push(`Ziel: ${done ? 'ok' : 'NICHT erreicht'}`);
      } else {
        hold = { right: true };
        if (L.finish) { place(L.finish.x - 5 * 64, L.mode === 'fly' ? L.finish.y + 150 : undefined); const done = await waitFor(() => G.scene.isActive('LevelDone') || L.won, 12000); log.push(`Ziel: ${done ? 'ok' : 'NICHT erreicht px=' + Math.round(L.pl.x) + ' fx=' + L.finish.x}`); }
        else log.push('Ziel: FEHLT');
      }
      return log;
    });
    console.log(`== ${id}\n  ` + res.join('\n  ') + (errs.length ? '\n  FEHLER: ' + errs.join(' | ') : ''));
    await pg.close();
  }
  await b.close();
})();
