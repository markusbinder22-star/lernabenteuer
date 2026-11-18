/* Die vier Reparatur-Stationen am Mühlberg – je eine Variante für Spatzen (4–5) und Füchse (6–7).
   Mathe-Aufgaben werden automatisch erzeugt, es gehen nie die Aufgaben aus. */
(function (PT) {
  'use strict';
  const el = (...a) => PT.el(...a);
  const T = () => PT.tasks;
  const svg = (...a) => PT.tasks.svg(...a);

  function range(levelTable, level) { const r = levelTable[PT.clamp(level, 1, levelTable.length) - 1]; return PT.rand(r[0], r[1]); }
  function say(text, who) { return PT.speech.say({ text, who: who || 'ranzl' }); }
  function highlightTile(stage, v) { const b = stage.querySelector(`.tile[data-v="${v}"]`); if (b) b.classList.add('hl'); }
  function tilePick(api, correct) {
    return (v, b) => {
      if (api.busy) return;
      PT.sound.tap();
      if (v === correct) { b.classList.add('right'); api.answer(true); }
      else { b.classList.add('wrong'); setTimeout(() => b.classList.remove('wrong'), 450); api.answer(false); }
    };
  }

  // =====================================================================
  // BRÜCKE
  // =====================================================================
  function brueckeSpatz(level) {
    const n = range([[2, 3], [3, 5], [4, 6], [5, 8], [6, 10]], level);
    const total = Math.min(13, n + PT.rand(2, 4));
    const gaps = PT.shuffle([...Array(total).keys()]).slice(0, n).sort((a, b) => a - b);
    let carried = 0;
    let scene, tray, goBtn, slotEls = {}, labelEls = [];
    const W = 700, slotW = 640 / total;

    function drawTray() {
      tray.innerHTML = '';
      for (let i = 0; i < carried; i++) {
        const it = el('button', { class: 'item', 'aria-label': 'Brett zurücklegen' });
        it.appendChild(T().svgBox(56, 56, [T().ART.plank(4, 20, 48, 16)]));
        it.addEventListener('click', () => { if (carried > 0) { carried--; PT.sound.tap(); drawTray(); } });
        tray.appendChild(it);
      }
      if (!carried) tray.appendChild(el('span', { class: 'note', text: 'Ranzls Bretter' }));
    }

    const task = {
      prompt: PT.line('bruecke.s.frage'),
      hint1: 'bruecke.s.hilfe1',
      mount(stage, api) {
        const kids = [
          svg('rect', { x: 0, y: 160, width: W, height: 100, fill: '#7fc3e6' }),
          svg('path', { d: 'M0 190 Q 60 180 120 190 T 240 190 T 360 190 T 480 190 T 600 190 T 720 190', stroke: '#b9e1f3', 'stroke-width': 4, fill: 'none' }),
          svg('rect', { x: 10, y: 80, width: 14, height: 120, fill: '#7a4a2a' }),
          svg('rect', { x: W - 24, y: 80, width: 14, height: 120, fill: '#7a4a2a' }),
          svg('rect', { x: 20, y: 96, width: W - 40, height: 6, fill: '#9b6a3e' }),
        ];
        for (let i = 0; i < total; i++) {
          const x = 30 + i * slotW;
          if (gaps.includes(i)) {
            const r = svg('rect', { x: x + 2, y: 120, width: slotW - 4, height: 26, rx: 3, fill: 'rgba(40,90,120,.25)', stroke: '#3b2f2a', 'stroke-width': 2.5, 'stroke-dasharray': '6 5' });
            slotEls[i] = r; kids.push(r);
          } else kids.push(T().ART.plank(x + 2, 120, slotW - 4, 26));
        }
        scene = T().svgBox(W, 260, kids, 'scene');
        tray = el('div', { class: 'tray' });
        const pile = el('button', { class: 'pile', 'aria-label': 'Bretterstapel' }, [
          T().svgBox(84, 84, [T().ART.plank(8, 50, 68, 14), T().ART.plank(12, 36, 64, 14), T().ART.plank(6, 22, 70, 14)]),
        ]);
        pile.addEventListener('click', () => { if (carried < 14 && !api.busy) { carried++; PT.sound.plank(); drawTray(); } });
        goBtn = el('button', { class: 'round-btn go', 'aria-label': 'Los' }); goBtn.appendChild(PT.draw.makeIcon('check', 108));
        goBtn.addEventListener('click', async () => {
          if (api.busy || carried === 0) return;
          goBtn.classList.remove('hl');
          // Bretter einlegen
          const k = Math.min(carried, n);
          for (let i = 0; i < k; i++) {
            const r = slotEls[gaps[i]];
            r.setAttribute('fill', '#c08a55'); r.setAttribute('stroke', '#7a4a2a'); r.removeAttribute('stroke-dasharray');
            PT.sound.plank();
            await PT.wait(220);
          }
          if (carried < n) {
            for (let i = k; i < n; i++) slotEls[gaps[i]].setAttribute('stroke', '#d9534f');
            api.answer(false, 'bruecke.zuwenig');
          } else if (carried > n) {
            tray.classList.add('shake'); setTimeout(() => tray.classList.remove('shake'), 1100);
            api.answer(false, 'bruecke.zuviel');
          } else api.answer(true);
        });
        drawTray();
        stage.append(scene, el('div', { class: 'pile-row' }, [pile, tray, goBtn]));
      },
      reset() {
        gaps.forEach(i => { const r = slotEls[i]; r.setAttribute('fill', 'rgba(40,90,120,.25)'); r.setAttribute('stroke', '#3b2f2a'); r.setAttribute('stroke-dasharray', '6 5'); });
      },
      async help2() {
        labelEls.forEach(l => l.remove()); labelEls = [];
        for (let i = 0; i < n; i++) {
          const x = 30 + gaps[i] * slotW + slotW / 2;
          const t = svg('text', { x, y: 112, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 900, fill: '#d9534f' }, [document.createTextNode(String(i + 1))]);
          scene.appendChild(t); labelEls.push(t);
          slotEls[gaps[i]].setAttribute('fill', 'rgba(242,169,59,.5)');
          await say(PT.zahlwort(i + 1));
        }
      },
      async solve() {
        this.reset();
        carried = n; drawTray();
        goBtn.classList.add('hl');
      },
    };
    return task;
  }

  function brueckeFuchs(level) {
    const T0 = range([[5, 10], [8, 12], [10, 15], [12, 20], [14, 20]], level);
    const minMissing = level >= 5 ? 4 : 1;
    const H = PT.rand(1, T0 - minMissing);
    const missing = T0 - H;
    let fog, scene, stageEl;
    const W = 700, slotW = 640 / T0;
    return {
      prompt: { text: `Die Brücke braucht ${T0} Bretter. ${H === 1 ? 'Eins liegt' : H + ' liegen'} schon drauf. Wie viele fehlen noch?`, who: 'ranzl' },
      hint1: 'bruecke.f.hilfe1',
      mount(stage, api) {
        stageEl = stage;
        const kids = [
          svg('rect', { x: 0, y: 160, width: W, height: 100, fill: '#7fc3e6' }),
          svg('rect', { x: 10, y: 80, width: 14, height: 120, fill: '#7a4a2a' }),
          svg('rect', { x: W - 24, y: 80, width: 14, height: 120, fill: '#7a4a2a' }),
        ];
        for (let i = 0; i < T0; i++) {
          const x = 30 + i * slotW;
          if (i < H) kids.push(T().ART.plank(x + 1.5, 120, slotW - 3, 26));
          else kids.push(svg('rect', { x: x + 1.5, y: 120, width: slotW - 3, height: 26, rx: 3, fill: 'none', stroke: '#3b2f2a', 'stroke-width': 2, 'stroke-dasharray': '5 4' }));
        }
        const fx = 30 + H * slotW, fw = missing * slotW;
        fog = svg('g', {}, [
          svg('ellipse', { cx: fx + fw / 2, cy: 132, rx: fw / 2 + 24, ry: 52, fill: '#f4f1ec', stroke: '#cfc6b8', 'stroke-width': 3 }),
          svg('text', { x: fx + fw / 2, y: 148, 'text-anchor': 'middle', 'font-size': 48, 'font-weight': 900, fill: '#9a8f80' }, [document.createTextNode('?')]),
        ]);
        kids.push(fog);
        scene = T().svgBox(W, 260, kids, 'scene');
        const eq = el('div', { class: 'equation', html: `${H} + <span class="q">?</span> = ${T0}` });
        stage.append(scene, eq, T().tiles(PT.numberOptions(missing, 4, 1, 20), tilePick(api, missing)));
      },
      async help2() {
        fog.remove();
        for (let i = H; i < T0; i++) {
          const x = 30 + i * slotW + slotW / 2;
          scene.appendChild(svg('text', { x, y: 112, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 900, fill: '#d9534f' }, [document.createTextNode(String(i + 1))]));
        }
        await say(`Zähl weiter: ${PT.zahlwort(H)} und dann ${PT.zahlwort(H + 1)}, und so weiter bis ${PT.zahlwort(T0)}.`);
      },
      async solve() { highlightTile(stageEl, missing); },
    };
  }

  // =====================================================================
  // HÜHNER-BLITZ (Spatzen) / SCHÜTTELKISTE (Füchse)
  // =====================================================================
  const DICE = {
    1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  };
  let lastChickens = 0;
  function huehnerSpatz(level) {
    const cfg = [[3, 3000], [4, 2500], [5, 2000], [5, 1500], [5, 1200]][PT.clamp(level, 1, 5) - 1];
    let n; do { n = PT.rand(1, cfg[0]); } while (n === lastChickens && cfg[0] > 1);
    lastChickens = n;
    const scatter = level >= 4;
    let scene, group, tilesEl, stageEl;
    const W = 600, H = 300;

    function positions(dice) {
      if (dice || !scatter) return DICE[n].map(([a, b]) => [W / 2 + a * 90, 150 + b * 70]);
      const pts = [];
      let guard = 0;
      while (pts.length < n && guard++ < 200) {
        const p = [PT.rand(110, W - 110), PT.rand(90, 220)];
        if (pts.every(q => Math.hypot(p[0] - q[0], p[1] - q[1]) > 80)) pts.push(p);
      }
      return pts;
    }
    function showChickens(dice) {
      if (group) group.remove();
      group = svg('g', { style: 'transition: transform .6s, opacity .6s' }, positions(dice).map(([x, y]) => T().ART.chicken(x, y, 1.6)));
      scene.appendChild(group);
    }
    function flyAway() {
      if (!group) return;
      group.style.transform = 'translateY(-260px)'; group.style.opacity = '0';
      PT.sound.whoosh();
    }

    return {
      prompt: PT.line('huehner.wieviele'),
      hint1: 'huehner.hilfe1',
      mount(stage, api) {
        stageEl = stage;
        const fence = [];
        for (let x = 10; x < W; x += 40) fence.push(svg('rect', { x, y: 200, width: 18, height: 80, rx: 4, fill: '#c9925a', stroke: '#7a4a2a', 'stroke-width': 2 }));
        scene = T().svgBox(W, H, [
          svg('rect', { x: 0, y: 0, width: W, height: H, fill: '#dff1f8', rx: 20 }),
          svg('rect', { x: 0, y: 240, width: W, height: 60, fill: '#9dd07c' }),
          svg('rect', { x: 0, y: 222, width: W, height: 12, fill: '#b07a48' }),
          svg('rect', { x: 0, y: 252, width: W, height: 12, fill: '#b07a48' }),
          ...fence,
        ], 'scene');
        tilesEl = T().tiles([1, 2, 3, 4, 5], tilePick(api, n), v => T().ART.hand(v));
        tilesEl.querySelectorAll('.tile').forEach(t => t.classList.add('hand'));
        tilesEl.style.visibility = 'hidden';
        stage.append(scene, tilesEl);
      },
      async intro() {
        await PT.speech.say('huehner.frage', { noRemember: true });
        await PT.wait(300);
        showChickens(false);
        await PT.wait(cfg[1]);
        flyAway();
        await PT.wait(500);
        tilesEl.style.visibility = 'visible';
        await PT.speech.say(this.prompt);
      },
      async help2() {
        showChickens(true);
        const nodes = Array.from(group.children);
        for (let i = 0; i < nodes.length; i++) {
          nodes[i].setAttribute('opacity', '0.4');
        }
        for (let i = 0; i < nodes.length; i++) { nodes[i].setAttribute('opacity', '1'); await say(PT.zahlwort(i + 1)); }
        await PT.wait(500);
        flyAway();
      },
      async solve() { showChickens(true); highlightTile(stageEl, n); },
    };
  }

  function schuettelFuchs(level) {
    const total = range([[4, 5], [5, 7], [6, 10], [8, 15], [10, 20]], level);
    const left = PT.rand(1, total - 1);
    const right = total - left;
    let box, lid, ghosts, stageEl;
    const W = 640, H = 280;
    function eggGrid(n, x0, ghost) {
      const cols = 5, out = [];
      for (let i = 0; i < n; i++) out.push(T().ART.egg(x0 + 34 + (i % cols) * 50, 70 + Math.floor(i / cols) * 50, 1.2, ghost));
      return out;
    }
    return {
      prompt: { text: `In der Kiste sind ${total} Eier. Links ${left === 1 ? 'liegt eins' : 'liegen ' + left}. Wie viele liegen rechts?`, who: 'ranzl' },
      hint1: 'schuettel.hilfe1',
      mount(stage, api) {
        stageEl = stage;
        ghosts = svg('g', { opacity: 0 }, eggGrid(right, 340, true));
        lid = svg('g', {}, [
          svg('rect', { x: 330, y: 30, width: 280, height: 220, rx: 14, fill: '#d6a46b', stroke: '#8a5a3c', 'stroke-width': 4 }),
          svg('text', { x: 470, y: 165, 'text-anchor': 'middle', 'font-size': 90, 'font-weight': 900, fill: '#8a5a3c' }, [document.createTextNode('?')]),
        ]);
        box = T().svgBox(W, H, [
          svg('rect', { x: 20, y: 20, width: 600, height: 240, rx: 18, fill: '#e9c79a', stroke: '#8a5a3c', 'stroke-width': 5 }),
          svg('rect', { x: 316, y: 20, width: 8, height: 240, fill: '#8a5a3c' }),
          ...eggGrid(left, 40, false), ghosts, lid,
        ], 'scene');
        const eq = el('div', { class: 'equation', html: `${left} + <span class="q">?</span> = ${total}` });
        stage.append(box, eq, T().tiles(PT.numberOptions(right, 4, 0, 20), tilePick(api, right)));
      },
      async intro() {
        box.classList.add('shake'); PT.sound.whoosh();
        await PT.wait(1100);
        box.classList.remove('shake');
        await PT.speech.say(this.prompt);
      },
      async help2() {
        lid.setAttribute('opacity', '0.35'); ghosts.setAttribute('opacity', '1');
        await say(`Es fehlen noch Eier bis ${PT.zahlwort(total)}. Zähl die gestrichelten Eier.`);
      },
      async solve() { lid.setAttribute('opacity', '0.15'); ghosts.setAttribute('opacity', '1'); highlightTile(stageEl, right); },
    };
  }

  // =====================================================================
  // MARKTSTAND
  // =====================================================================
  function marktSpatz(level) {
    const p = range([[1, 3], [2, 5], [3, 6], [4, 8], [5, 10]], level);
    let paid = 0, tray, payBtn, showSlots = false;
    const goods = PT.pick(['Paradeiser', 'Apfel', 'Ei']);

    function drawTray() {
      tray.innerHTML = '';
      const slots = showSlots ? Math.max(p, paid) : paid;
      for (let i = 0; i < slots; i++) {
        const filled = i < paid;
        const it = el('button', { class: 'item', 'aria-label': 'Knopf zurücknehmen' });
        it.appendChild(T().svgBox(56, 56, [filled ? T().ART.knopf(28, 28, 22) : svg('circle', { cx: 28, cy: 28, r: 21, fill: 'none', stroke: '#c9b48d', 'stroke-width': 3, 'stroke-dasharray': '5 4' })]));
        if (filled) it.addEventListener('click', () => { paid--; PT.sound.tap(); drawTray(); });
        tray.appendChild(it);
      }
      if (!slots) tray.appendChild(el('span', { class: 'note', text: 'Hier hinlegen' }));
    }

    return {
      prompt: { text: `Ein ${goods} kostet so viele Knöpfe, wie Punkte auf dem Schild sind. Leg die Knöpfe hin und tipp auf Bezahlen.`, who: 'ranzl' },
      hint1: 'markt.s.hilfe1',
      mount(stage, api) {
        const dots = [];
        const cols = Math.min(p, 5);
        for (let i = 0; i < p; i++) dots.push(svg('circle', { cx: 300 + ((i % 5) - (cols - 1) / 2) * 30, cy: 70 + Math.floor(i / 5) * 30, r: 11, fill: '#3b2f2a' }));
        const good = goods === 'Paradeiser' ? T().ART.tomato(130, 120, 2.4) : goods === 'Apfel'
          ? svg('g', { transform: 'translate(130,120) scale(2.4)' }, [svg('circle', { r: 18, fill: '#7cc14f', stroke: '#467a2a', 'stroke-width': 2 }), svg('path', { d: 'M0 -16 Q 4 -26 10 -26', stroke: '#6b4123', 'stroke-width': 3, fill: 'none' })])
          : T().ART.egg(130, 120, 3.2);
        const scene = T().svgBox(600, 210, [
          svg('rect', { x: 200, y: 30, width: 200, height: 40 + Math.ceil(p / 5) * 30, rx: 12, fill: '#fff8e6', stroke: '#b07a48', 'stroke-width': 4 }),
          svg('path', { d: 'M200 50 L170 40', stroke: '#b07a48', 'stroke-width': 3 }),
          ...dots, good,
          svg('text', { x: 300, y: 196, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, fill: '#9a8f80' }, [document.createTextNode(String(p))]),
        ], 'scene');
        tray = el('div', { class: 'tray' });
        const pile = el('button', { class: 'pile', 'aria-label': 'Knopf nehmen' }, [T().svgBox(84, 84, [T().ART.knopf(30, 52, 22), T().ART.knopf(54, 50, 22), T().ART.knopf(42, 30, 22)])]);
        pile.addEventListener('click', () => { if (paid < 14 && !api.busy) { paid++; PT.sound.coin(); drawTray(); } });
        payBtn = el('button', { class: 'btn green', text: 'Bezahlen' });
        payBtn.addEventListener('click', () => {
          if (api.busy || paid === 0) return;
          payBtn.classList.remove('hl');
          if (paid < p) api.answer(false, 'markt.zuwenig');
          else if (paid > p) api.answer(false, 'markt.zuviel');
          else api.answer(true);
        });
        drawTray();
        stage.append(scene, el('div', { class: 'pile-row' }, [pile, tray]), payBtn);
      },
      async help2() { showSlots = true; drawTray(); await say('Ich hab dir für jeden Punkt einen Platz gemacht. Füll alle Plätze.'); },
      async solve() { showSlots = true; paid = p; drawTray(); payBtn.classList.add('hl'); },
    };
  }

  function marktFuchs(level) {
    const cfg = [[3, 9, [1, 2, 5]], [5, 12, [1, 2, 5, 10]], [8, 20, [1, 2, 5, 10]], [11, 20, [1, 2, 5, 10]], [12, 20, [1, 2, 5, 10]]][PT.clamp(level, 1, 5) - 1];
    const price = PT.rand(cfg[0], cfg[1]);
    const values = cfg[2];
    let coins = [], tray, sumEl, showSum = false, payBtn;
    const goods = PT.pick([['Paradeiser', 'kostet'], ['Sackerl Äpfel', 'kostet'], ['Glas Honig', 'kostet']]);
    const goodArt = goods[0] === 'Paradeiser' ? T().ART.tomato(160, 95, 2.2)
      : goods[0] === 'Glas Honig' ? svg('g', { transform: 'translate(160,95)' }, [svg('rect', { x: -30, y: -32, width: 60, height: 70, rx: 12, fill: '#f2b33d', stroke: '#a8741a', 'stroke-width': 3 }), svg('rect', { x: -34, y: -46, width: 68, height: 18, rx: 6, fill: '#d9534f', stroke: '#9c2c22', 'stroke-width': 3 })])
      : svg('g', { transform: 'translate(160,95)' }, [svg('path', { d: 'M-38 -20 L38 -20 L32 44 L-32 44 Z', fill: '#e9d3a8', stroke: '#a88a5a', 'stroke-width': 3 }), svg('circle', { cx: -14, cy: -24, r: 16, fill: '#7cc14f', stroke: '#467a2a', 'stroke-width': 2 }), svg('circle', { cx: 14, cy: -26, r: 16, fill: '#e04b3c', stroke: '#9c2c22', 'stroke-width': 2 })]);
    const sum = () => coins.reduce((a, b) => a + b, 0);
    function drawTray() {
      tray.innerHTML = '';
      coins.forEach((v, i) => {
        const it = el('button', { class: 'item', 'aria-label': v + ' Cent zurücknehmen' });
        it.appendChild(T().svgBox(56, 56, [T().ART.cent(28, 28, v)]));
        it.addEventListener('click', () => { coins.splice(i, 1); PT.sound.tap(); drawTray(); });
        tray.appendChild(it);
      });
      if (!coins.length) tray.appendChild(el('span', { class: 'note', text: 'Hier hinlegen' }));
      sumEl.textContent = showSum ? `Du hast schon ${sum()} Cent hingelegt.` : '';
    }
    return {
      prompt: { text: `Ein ${goods[0]} ${goods[1]} ${price} Cent. Leg genau ${price} Cent hin.`, who: 'ranzl' },
      hint1: 'markt.f.hilfe1',
      mount(stage, api) {
        const scene = T().svgBox(600, 170, [
          goodArt,
          svg('rect', { x: 260, y: 40, width: 230, height: 100, rx: 14, fill: '#fff8e6', stroke: '#b07a48', 'stroke-width': 4 }),
          svg('text', { x: 375, y: 110, 'text-anchor': 'middle', 'font-size': 56, 'font-weight': 900, fill: '#3b2f2a' }, [document.createTextNode(price + ' Cent')]),
        ], 'scene');
        tray = el('div', { class: 'tray' });
        sumEl = el('div', { class: 'sum-hint' });
        const coinRow = el('div', { class: 'pile-row' }, values.map(v => {
          const b = el('button', { class: 'pile', 'aria-label': v + ' Cent' }, [T().svgBox(84, 84, [T().ART.cent(42, 42, v)])]);
          b.addEventListener('click', () => { if (coins.length < 14 && !api.busy) { coins.push(v); coins.sort((a, b) => b - a); PT.sound.coin(); drawTray(); } });
          return b;
        }));
        payBtn = el('button', { class: 'btn green', text: 'Bezahlen' });
        payBtn.addEventListener('click', () => {
          if (api.busy || !coins.length) return;
          payBtn.classList.remove('hl');
          const s = sum();
          if (s < price) api.answer(false, 'markt.zuwenig');
          else if (s > price) api.answer(false, 'markt.zuviel');
          else api.answer(true);
        });
        drawTray();
        stage.append(scene, coinRow, tray, sumEl, payBtn);
      },
      async help2() { showSum = true; drawTray(); await say(`Ich zähl für dich mit. Du hast ${sum()} Cent hingelegt. Du brauchst ${price}.`); },
      async solve() {
        coins = []; let rest = price;
        [10, 5, 2, 1].filter(v => values.includes(v)).forEach(v => { while (rest >= v) { coins.push(v); rest -= v; } });
        showSum = true; drawTray(); payBtn.classList.add('hl');
      },
    };
  }

  // =====================================================================
  // MÜHLE: KETTENMUSTER (Spatzen) / ZWANZIGERFELD (Füchse)
  // =====================================================================
  function musterSpatz(level) {
    const pats = [['AB'], ['AB', 'AAB'], ['ABC', 'AAB'], ['ABB', 'AABB', 'ABC'], ['AABB', 'ABCB', 'ABBC']][PT.clamp(level, 1, 5) - 1];
    const pat = PT.pick(pats);
    const letters = Array.from(new Set(pat.split('')));
    const kinds = PT.shuffle(Object.keys(T().BEADS)).slice(0, Math.max(3, letters.length));
    const map = {}; letters.forEach((l, i) => { map[l] = kinds[i]; });
    const u = pat.length;
    const L = Math.min(9, u * 2 + PT.rand(0, u - 1));
    const seq = []; for (let i = 0; i < L; i++) seq.push(map[pat[i % u]]);
    const answer = map[pat[L % u]];
    const options = PT.shuffle(Array.from(new Set([answer, ...kinds])).slice(0, 3));
    let beadEls = [], stageEl;
    const W = 60 * (L + 1) + 40;
    return {
      prompt: PT.line('muster.frage'),
      hint1: 'muster.hilfe1',
      mount(stage, api) {
        stageEl = stage;
        const kids = [svg('path', { d: `M10 60 Q ${W / 2} 90 ${W - 10} 60`, stroke: '#8a5a3c', 'stroke-width': 4, fill: 'none' })];
        seq.forEach((k, i) => { const b = T().ART.bead(40 + i * 60, 66, 22, k); beadEls.push(b); kids.push(b); });
        kids.push(svg('circle', { cx: 40 + L * 60, cy: 66, r: 24, fill: '#fff', stroke: '#3b2f2a', 'stroke-width': 3, 'stroke-dasharray': '6 5' }));
        kids.push(svg('text', { x: 40 + L * 60, y: 78, 'text-anchor': 'middle', 'font-size': 32, 'font-weight': 900, fill: '#9a8f80' }, [document.createTextNode('?')]));
        stage.append(T().svgBox(W, 130, kids, 'scene'));
        stage.append(T().tiles(options, tilePick(api, answer), k => T().svgBox(80, 80, [T().ART.bead(40, 40, 28, k)])));
      },
      async help2() {
        for (let i = 0; i < seq.length; i++) {
          beadEls[i].setAttribute('transform', beadEls[i].getAttribute('transform') + ' scale(1.25)');
          await say(T().BEADS[seq[i]].name);
        }
        await say('und dann?');
      },
      async solve() { highlightTile(stageEl, answer); },
    };
  }

  function zwanzigerFuchs(level) {
    let a, b;
    if (level <= 1) { a = PT.rand(2, 6); b = PT.rand(1, 10 - a); }
    else if (level === 2) { a = PT.rand(11, 15); b = PT.rand(1, 19 - a); if ((a % 10) + b > 9) b = 9 - (a % 10); if (b < 1) { a = 12; b = 3; } }
    else if (level === 3) { a = 9; b = PT.rand(2, 9); }
    else if (level === 4) { a = PT.rand(6, 9); b = PT.rand(11 - a, 9); }
    else { a = PT.rand(5, 9); b = PT.rand(Math.max(5, 11 - a), 9); }
    const sum = a + b;
    let placed = 0, cells = [], tilesEl, stageEl, scene, tensBox, warned = false;
    const W = 680, H = 190, cw = 60;
    function cellXY(i) { const row = Math.floor(i / 10), col = i % 10; return [40 + col * cw + (col >= 5 ? 20 : 0), 30 + row * 75]; }
    function drawSacks() {
      cells.forEach(c => c.remove()); cells = [];
      for (let i = 0; i < a + placed && i < 20; i++) {
        const [x, y] = cellXY(i);
        const isNew = i >= a;
        const s = T().ART.sack(x + cw / 2 - 2, y + 34, 48, isNew ? '#7fb0d6' : '#e8d3a8');
        if (isNew && i === a + placed - 1) { s.style.cursor = 'pointer'; s.addEventListener('click', () => { if (placed > 0) { placed--; PT.sound.tap(); drawSacks(); updateTiles(); } }); }
        scene.appendChild(s); cells.push(s);
      }
    }
    function updateTiles() {
      tilesEl.style.visibility = placed === b ? 'visible' : 'hidden';
      if (placed === b && !tilesEl.dataset.said) { tilesEl.dataset.said = '1'; PT.speech.say('zwanziger.wieviele'); }
      if (placed > b && !warned) { warned = true; say('Das sind zu viele Säcke. Tipp auf den letzten blauen Sack, um ihn wegzunehmen.'); }
    }
    return {
      prompt: { text: `Rechne ${a} plus ${b}. Stell ${b} blaue Säcke dazu.`, who: 'ranzl' },
      hint1: 'zwanziger.hilfe1',
      mount(stage, api) {
        stageEl = stage;
        const grid = [];
        for (let i = 0; i < 20; i++) { const [x, y] = cellXY(i); grid.push(svg('rect', { x, y, width: cw - 4, height: 68, rx: 8, fill: '#fffaf0', stroke: '#c9b48d', 'stroke-width': 2 })); }
        tensBox = svg('rect', { x: 32, y: 22, width: 10 * cw + 30, height: 84, rx: 12, fill: 'none', stroke: '#f2a93b', 'stroke-width': 6, opacity: 0 });
        scene = T().svgBox(W, H, [...grid, tensBox], 'scene');
        const eq = el('div', { class: 'equation', html: `${a} + ${b} = <span class="q">?</span>` });
        const pile = el('button', { class: 'pile', 'aria-label': 'Sack dazustellen' }, [T().svgBox(84, 84, [T().ART.sack(42, 46, 56, '#7fb0d6')]), el('div', { class: 'lbl', text: '+1' })]);
        pile.addEventListener('click', () => { if (a + placed < 20 && !api.busy) { placed++; PT.sound.plank(); drawSacks(); updateTiles(); } });
        tilesEl = T().tiles(PT.numberOptions(sum, 4, 1, 20), tilePick(api, sum));
        tilesEl.style.visibility = 'hidden';
        stage.append(eq, scene, pile, tilesEl);
        drawSacks();
      },
      async help2() {
        if (sum >= 10) { tensBox.setAttribute('opacity', 1); await say(`Die obere Reihe ist voll. Das sind zehn. Und unten sind noch ${PT.zahlwort(sum - 10)}.`); }
        else await say('Zähl alle Säcke zusammen.');
      },
      async solve() { placed = b; drawSacks(); updateTiles(); highlightTile(stageEl, sum); },
    };
  }

  // =====================================================================
  // Stationen
  // =====================================================================
  const STATIONS = {
    bruecke: { name: 'Brücke', sticker: 'bruecke', intro: { spatz: 'bruecke.intro', fuchs: 'bruecke.intro' }, outro: 'bruecke.fertig',
      spatz: { skill: 'zaehlen', make: brueckeSpatz }, fuchs: { skill: 'ergaenzen', make: brueckeFuchs } },
    huehner: { name: 'Hühnerhof', sticker: 'gretl', intro: { spatz: 'huehner.intro', fuchs: 'schuettel.intro' }, outro: 'huehner.fertig',
      spatz: { skill: 'simultan', make: huehnerSpatz }, fuchs: { skill: 'zerlegen', make: schuettelFuchs } },
    markt: { name: 'Marktstand', sticker: 'markt', intro: { spatz: 'markt.intro', fuchs: 'markt.intro' }, outro: 'markt.fertig',
      spatz: { skill: 'geld_s', make: marktSpatz }, fuchs: { skill: 'geld_f', make: marktFuchs } },
    muehle: { name: 'Mühle', sticker: 'muehle', intro: { spatz: 'muehle.intro', fuchs: 'muehle.intro' }, outro: 'muehle.fertig',
      spatz: { skill: 'muster', make: musterSpatz }, fuchs: { skill: 'plus20', make: zwanzigerFuchs } },
  };
  const ORDER = ['bruecke', 'huehner', 'markt', 'muehle'];

  async function play(id) {
    const p = PT.game.profile, g = p.game;
    const st = STATIONS[id];
    const v = st[p.stage];
    const first = !g.stations[id];
    const res = await PT.tasks.runSeries({
      title: st.name, skill: v.skill, count: 4, make: v.make,
      intro: first ? [st.intro[p.stage]] : [],
    });
    if (!res.completed) return false;
    let reward = first ? 15 : 5;
    const allStars = res.stars >= res.total;
    if (allStars) reward += 5;
    g.taler += reward;
    g.stars[id] = Math.max(g.stars[id] || 0, res.stars);
    PT.sound.reward();
    PT.ui.toast(`+${reward} Knöpfe` + (allStars ? '  ★ Bonus-Stern!' : ''), PT.draw.makeIcon('knopf', 88), 2600);
    if (first) {
      g.stations[id] = true;
      PT.store.save();
      PT.emit('repaired', id);
      await PT.ui.dialog([st.outro]);
      PT.game.giveSticker(st.sticker);
      if (ORDER.every(k => g.stations[k]) && !g.festDone) await PT.ui.dialog(['resi.fest']);
    }
    PT.store.save();
    PT.emit('taler');
    return true;
  }

  /** Rätselstein: eine Aufgabe aus einer Fähigkeit der eigenen Stufe */
  async function raetsel() {
    const p = PT.game.profile;
    const id = PT.pick(ORDER);
    const v = STATIONS[id][p.stage];
    const res = await PT.tasks.runSeries({ title: 'Rätselstein', skill: v.skill, count: 1, make: v.make });
    return res.completed;
  }

  // ---------- Silbenwörter ----------
  const SILBEN = {
    spatz: [['Ball'], ['Hund'], ['Bär'], ['Ma', 'ma'], ['Au', 'to'], ['Ho', 'se'], ['Kat', 'ze'], ['Son', 'ne'], ['Ap', 'fel'], ['E', 'sel'],
      ['Ba', 'na', 'ne'], ['To', 'ma', 'te'], ['Ra', 'ke', 'te'], ['Schmet', 'ter', 'ling'], ['Te', 'le', 'fon'], ['Do', 'mi', 'no']],
    fuchs: [['Tisch'], ['Ba', 'na', 'ne'], ['Ka', 'rot', 'te'], ['Hub', 'schrau', 'ber'], ['Him', 'bee', 're'], ['Sa', 'la', 'mi'], ['Kro', 'ko', 'dil'],
      ['Pa', 'ra', 'dei', 'ser'], ['Wa', 'ckel', 'pud', 'ding'], ['Ba', 'de', 'wan', 'ne'], ['Schul', 'ta', 'sche'], ['Ge', 'burts', 'tag'], ['Fe', 'der', 'ball'],
      ['Me', 'lo', 'ne'], ['Ma', 'ri', 'en', 'kä', 'fer'], ['Lo', 'ko', 'mo', 'ti', 've']],
  };

  PT.stations = { STATIONS, ORDER, play, raetsel, SILBEN };
})(window.PT);
