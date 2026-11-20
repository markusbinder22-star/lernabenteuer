// Touch-Test im Handy-Browser (Chromium mit Handy-Emulation, echte Touch-Ereignisse, auch mehrere Finger gleichzeitig)
// Aufruf: aus www/ einen Webserver auf Port 8765 starten, dann node tools/test/touchcheck.js
const { chromium, devices } = require('playwright');
const DEV = process.env.DEV || 'Pixel 7 landscape';
(async () => {
  const br = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=user-gesture-required'] });
  const ctx = await br.newContext({ ...devices[DEV] });
  const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  const cdp = await ctx.newCDPSession(pg);
  const log = (ok, msg) => console.log(`${ok ? '✓' : '✗'} ${msg}`);
  let fails = 0; const check = (ok, msg) => { if (!ok) fails++; log(ok, msg); };
  await pg.goto('http://localhost:8765/index.html');
  await pg.waitForFunction(() => window.K && K.game && K.game.scene.isActive('Profiles'), null, { timeout: 60000 });
  await pg.evaluate(() => { const g = K.game; g.loop.blur = () => {}; g.loop.inFocus = true; g.loop._coolDown = 0; });
  // Spielkoordinaten → Bildschirm
  const map = async (gx, gy) => pg.evaluate(([gx, gy]) => { const r = K.game.canvas.getBoundingClientRect(); return [r.left + gx * r.width / K.W, r.top + gy * r.height / K.H]; }, [gx, gy]);
  const tap = async (gx, gy) => { const [x, y] = await map(gx, gy); await pg.touchscreen.tap(x, y); await pg.waitForTimeout(350); };
  const touch = async (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: await Promise.all(pts.map(async ([gx, gy, id]) => { const [x, y] = await map(gx, gy); return { x, y, id }; })) });
  const scenes = () => pg.evaluate(() => K.game.scene.getScenes(true).map(s => s.scene.key).join(','));
  const vp = pg.viewportSize(); log(true, `Gerät: ${DEV} ${vp.width}×${vp.height}`);

  // 1. Profil anlegen nur per Finger
  await tap(1280 * 0.34, 0); // nichts
  const btnY = await pg.evaluate(() => { const s = K.game.scene.getScene('Profiles'); const b = s.children.list.find(o => o.list && o.list.some(t => t.text === '+ Neues Kind')); return b ? [b.x, b.y] : null; });
  check(!!btnY, 'Knopf „+ Neues Kind“ da');
  await tap(btnY[0], btnY[1]);
  const box = await pg.$('#kq'); check(!!box, 'Namensfeld geht per Tippen auf');
  if (box) { await box.fill('Test'); const ok = await pg.$('#ko'); const bb = await ok.boundingBox(); await pg.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(400); }
  await tap(1280 / 2 + 230, 380); // Jungdrache
  await pg.waitForTimeout(800);
  check((await scenes()).includes('Cutscene'), 'Stufe gewählt, Vorgeschichte startet');
  // Vorgeschichte per Tippen weiter
  for (let i = 0; i < 40 && (await scenes()).includes('Cutscene'); i++) await tap(640, 400);
  await pg.waitForTimeout(800);
  check((await scenes()).includes('Map'), 'Vorgeschichte per Tippen durch, Karte da');
  // 2. Level 1-1 auf der Karte antippen
  const node = await pg.evaluate(() => { const M = K.game.scene.getScene('Map'); return [M.cont.x + 260, M.cont.y + 560]; });
  if (node) await tap(node[0], node[1]);
  for (let i = 0; i < 30 && !(await scenes()).includes('Level'); i++) { if ((await scenes()).includes('Cutscene')) await tap(640, 400); else await pg.waitForTimeout(300); }
  await pg.waitForTimeout(1500);
  check((await scenes()).includes('Level'), 'Level per Tippen auf der Karte gestartet');
  const L = () => pg.evaluate(() => { const L = K.game.scene.getScene('Level'); return { x: Math.round(L.pl.x), y: Math.round(L.pl.y), vy: Math.round(L.pl.body.velocity.y), touch: L.showTouch, btn: L.touch.map(t => [t.name, t.x, t.y, t.c.visible]) }; });
  let s0 = await L(); check(s0.touch, 'Touch-Knöpfe werden angezeigt');
  const btn = Object.fromEntries(s0.btn.map(([n, x, y]) => [n, [x, y]]));
  // 3. Rechts halten
  await touch('touchStart', [[...btn.right, 1]]); await pg.waitForTimeout(1200);
  let s1 = await L(); check(s1.x > s0.x + 150, `Rechts-Knopf halten: Kivalu läuft (${s0.x} → ${s1.x})`);
  // 4. Zweiter Finger springt, während der erste rechts hält
  await touch('touchStart', [[...btn.right, 1], [...btn.jump, 2]]);
  let minY = s1.y; for (let i = 0; i < 8; i++) { await pg.waitForTimeout(60); minY = Math.min(minY, (await L()).y); }
  await touch('touchEnd', [[...btn.right, 1]]); // Sprungfinger loslassen, rechts bleibt
  await pg.waitForTimeout(600);
  let s2 = await L(); check(s1.y - minY > 80, `Springen mit zweitem Finger beim Laufen (${s1.y - minY} px hoch)`);
  check(s2.x > s1.x + 100, 'Laufen geht während des Sprungs weiter');
  await touch('touchEnd', []); await pg.waitForTimeout(400);
  // 5. Links
  const s3 = await L(); await touch('touchStart', [[...btn.left, 3]]); await pg.waitForTimeout(800); await touch('touchEnd', []);
  const s4 = await L(); check(s4.x < s3.x - 100, `Links-Knopf (${s3.x} → ${s4.x})`);
  // 6. Pause-Knopf antippen und wieder weiter
  await tap(1280 - 54, 50); const paused = await pg.evaluate(() => K.game.scene.getScene('Level').paused);
  check(paused, 'Pause per Tippen');
  const cont = await pg.evaluate(() => { const L = K.game.scene.getScene('Level'); const b = L.pauseC && L.pauseC.list.find(o => o.list && o.list.some(t => /Weiter/.test(t.text || ''))); return b ? [b.x + L.pauseC.x, b.y + L.pauseC.y] : null; });
  if (cont) await tap(cont[0], cont[1]); else await tap(1280 - 54, 50);
  check(!(await pg.evaluate(() => K.game.scene.getScene('Level').paused)), 'Weiterspielen nach Pause per Tippen');
  // 7. Zum ersten Tor laufen und die Aufgabe per Finger lösen
  await pg.evaluate(() => { const L = K.game.scene.getScene('Level'); const g = L.gates[0]; L.pl.body.reset(g.x - 5 * 64, 9 * 64 - 4); });
  await touch('touchStart', [[...btn.right, 1]]);
  for (let i = 0; i < 30 && !(await scenes()).includes('Task'); i++) await pg.waitForTimeout(200);
  await touch('touchEnd', []);
  check((await scenes()).includes('Task'), 'Rätseltor öffnet die Aufgabe');
  await pg.waitForTimeout(800);
  const ans = await pg.evaluate(() => {
    const T = K.game.scene.getScene('Task'), t = T.task; const all = []; const walk = (o, ox, oy) => { (o.list || []).forEach(c => { if (c.list) walk(c, ox + c.x, oy + c.y); if (c.input && c.list) all.push({ c, x: ox + c.x, y: oy + c.y }); }); };
    walk(T.root, T.root.x, T.root.y);
    const txt = (c) => c.list.map(x => x.text || '').join('');
    return { kind: t.kind, answer: String(t.answer), btns: all.map(b => [txt(b.c), b.x, b.y]) };
  });
  if (process.env.DEBUG) console.log(JSON.stringify(ans));
  if (ans.kind === 'choice') { const b = ans.btns.find(b => b[0].trim() === ans.answer.trim()) || ans.btns[0]; await tap(b[1], b[2]); }
  else if (ans.kind === 'keypad') { for (const ch of ans.answer) { const b = ans.btns.find(b => b[0] === ch && b[2] > 300); if (b) await tap(b[1], b[2]); } const ok = ans.btns.find(b => /OK|✓|✔/.test(b[0])); if (ok) await tap(ok[1], ok[2]); }
  else { await pg.evaluate(() => K.game.scene.getScene('Task').answer(true, null)); log(true, `(Aufgabentyp ${ans.kind}: per Code beantwortet)`); }
  for (let i = 0; i < 20 && (await scenes()).includes('Task'); i++) await pg.waitForTimeout(250);
  check(!(await scenes()).includes('Task'), `Aufgabe (${ans.kind}) per Finger gelöst, zurück im Level`);
  // 8. Hochformat: Hinweis zum Drehen
  await pg.setViewportSize({ width: vp.height, height: vp.width }); await pg.waitForTimeout(600);
  const rot = await pg.evaluate(() => { const e = document.getElementById('rotate'); return !!e && getComputedStyle(e).display !== 'none'; });
  check(rot, 'Hochformat: Hinweis „Bitte quer halten“ sichtbar');
  await pg.setViewportSize(vp); await pg.waitForTimeout(400);
  const rot2 = await pg.evaluate(() => { const e = document.getElementById('rotate'); return !!e && getComputedStyle(e).display !== 'none'; });
  check(!rot2, 'Querformat: Hinweis wieder weg');
  await pg.screenshot({ path: process.env.SHOT || '/tmp/touch.png' });
  check(!errs.length, 'keine JavaScript-Fehler' + (errs.length ? ': ' + errs.join(' | ') : ''));
  console.log(fails ? `${fails} Prüfungen fehlgeschlagen` : 'Alles ok');
  await br.close(); process.exit(fails ? 1 : 0);
})();
