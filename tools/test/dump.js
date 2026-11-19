const { chromium } = require('playwright');
(async () => {
  const [id, a, b] = process.argv.slice(2);
  const br = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const pg = await br.newPage({ viewport: { width: 1280, height: 720 } });
  await pg.addInitScript(([id]) => { const ch = +id[0]; const order = ['fire', 'double', 'melt', 'climb', 'fly', 'bigfire'];
    const p = { id: 'pt', name: 'T', stage: 'jung', color: 'blau', hat: null, created: 1, seen: { prolog: true }, levels: {}, coins: 0 };
    order.slice(0, ch).forEach(k => p.seen['skill_' + k] = true);
    localStorage.setItem('kivalu.save.v1', JSON.stringify({ profiles: [p], current: 'pt', settings: { music: 0, sfx: 0, voice: false, rate: 1 } })); }, [id]);
  await pg.goto('http://localhost:8765/index.html');
  await pg.waitForFunction(() => window.K && K.game && K.game.scene.isActive('Profiles'), null, { timeout: 60000 });
  const out = await pg.evaluate(([id, a, b]) => { const L = K.Levels.build(id, K.Save.cur()); return L.grid.map((r, i) => String(i).padStart(2) + ' ' + r.slice(a, b).join('')).join('\n'); }, [id, +a, +b]);
  console.log(out); await br.close();
})();
