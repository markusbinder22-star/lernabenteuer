/* Aufgaben-Motor: Aufgabenserie mit Vorlesen, Hilfe in drei Stufen, Radiergummi und Lernstand. */
(function (PT) {
  'use strict';
  const el = (...a) => PT.el(...a);
  const NS = 'http://www.w3.org/2000/svg';

  // ---------- SVG-Hilfen ----------
  function svg(tag, attrs, children) {
    const e = document.createElementNS(NS, tag);
    for (const k in (attrs || {})) {
      if (k.startsWith('on') && typeof attrs[k] === 'function') e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    }
    (children || []).forEach(c => c && e.appendChild(c));
    return e;
  }
  function svgBox(w, h, children, cls) {
    return svg('svg', { viewBox: `0 0 ${w} ${h}`, class: cls || '' }, children);
  }
  const STROKE = '#3b2f2a';
  const ART = {
    plank: (x, y, w, h, fill) => svg('rect', { x, y, width: w, height: h, rx: 3, fill: fill || '#c08a55', stroke: '#7a4a2a', 'stroke-width': 2 }),
    chicken: (x, y, s) => svg('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, [
      svg('ellipse', { cx: 0, cy: 0, rx: 16, ry: 12, fill: '#fffaf0', stroke: '#b9a88a', 'stroke-width': 2 }),
      svg('circle', { cx: 12, cy: -12, r: 8, fill: '#fffaf0', stroke: '#b9a88a', 'stroke-width': 2 }),
      svg('path', { d: 'M8 -21 a3 3 0 0 1 6 0 a3 3 0 0 1 4 2 L10 -18 Z', fill: '#e04b3c' }),
      svg('path', { d: 'M19 -13 L26 -11 L19 -9 Z', fill: '#f0a830' }),
      svg('circle', { cx: 14, cy: -13, r: 1.8, fill: STROKE }),
      svg('path', { d: 'M-4 12 L-5 20 M4 12 L5 20', stroke: '#e0a020', 'stroke-width': 2.5 }),
    ]),
    egg: (x, y, s, ghost) => svg('ellipse', { cx: x, cy: y, rx: 11 * (s || 1), ry: 14 * (s || 1), fill: ghost ? 'none' : '#fff3df', stroke: ghost ? '#c9b48d' : '#c9a77a', 'stroke-width': 2.5, 'stroke-dasharray': ghost ? '4 4' : null }),
    tomato: (x, y, s) => svg('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, [
      svg('circle', { cx: 0, cy: 0, r: 18, fill: '#e04b3c', stroke: '#9c2c22', 'stroke-width': 2 }),
      svg('path', { d: 'M-8 -15 L0 -10 L8 -15 L4 -19 L0 -16 L-4 -19 Z', fill: '#5aa246', stroke: '#3f7a32', 'stroke-width': 1.5 }),
    ]),
    knopf: (x, y, r) => svg('g', { transform: `translate(${x},${y})` }, [
      svg('circle', { r, fill: '#e39b4b', stroke: '#9c6324', 'stroke-width': 2 }),
      svg('circle', { r: r * 0.7, fill: 'none', stroke: '#b9772f', 'stroke-width': 1.5 }),
      ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => svg('circle', { cx: a * r * 0.25, cy: b * r * 0.25, r: r * 0.11, fill: '#6e4214' })),
    ]),
    cent: (x, y, v) => {
      const r = { 1: 15, 2: 17, 5: 20, 10: 19 }[v] || 18;
      const fill = v >= 10 ? '#e8c35a' : '#cf8a4f';
      return svg('g', { transform: `translate(${x},${y})` }, [
        svg('circle', { r, fill, stroke: PT.draw.shade(fill, -0.4), 'stroke-width': 2.5 }),
        svg('circle', { r: r - 4, fill: 'none', stroke: PT.draw.shade(fill, -0.2), 'stroke-width': 1.2 }),
        svg('text', { x: 0, y: 6, 'text-anchor': 'middle', 'font-size': r * 0.95, 'font-weight': 900, fill: STROKE, 'font-family': 'sans-serif' }, [document.createTextNode(String(v))]),
      ]);
    },
    sack: (x, y, w, fill) => svg('g', { transform: `translate(${x},${y})` }, [
      svg('path', { d: `M${-w * 0.42} ${w * 0.45} Q${-w * 0.5} ${-w * 0.1} ${-w * 0.22} ${-w * 0.32} L${-w * 0.1} ${-w * 0.45} L${w * 0.1} ${-w * 0.45} L${w * 0.22} ${-w * 0.32} Q${w * 0.5} ${-w * 0.1} ${w * 0.42} ${w * 0.45} Z`, fill, stroke: PT.draw.shade(fill, -0.4), 'stroke-width': 2 }),
      svg('path', { d: `M${-w * 0.16} ${-w * 0.3} L${w * 0.16} ${-w * 0.3}`, stroke: PT.draw.shade(fill, -0.4), 'stroke-width': 2 }),
    ]),
    bead: (x, y, r, kind) => {
      const k = BEADS[kind];
      let shape;
      if (k.shape === 'circle') shape = svg('circle', { cx: 0, cy: 0, r, fill: k.c, stroke: PT.draw.shade(k.c, -0.4), 'stroke-width': 2.5 });
      else if (k.shape === 'square') shape = svg('rect', { x: -r * 0.85, y: -r * 0.85, width: r * 1.7, height: r * 1.7, rx: 4, fill: k.c, stroke: PT.draw.shade(k.c, -0.4), 'stroke-width': 2.5 });
      else if (k.shape === 'tri') shape = svg('path', { d: `M0 ${-r} L${r} ${r * 0.8} L${-r} ${r * 0.8} Z`, fill: k.c, stroke: PT.draw.shade(k.c, -0.4), 'stroke-width': 2.5, 'stroke-linejoin': 'round' });
      else shape = svg('path', { d: starPath(r), fill: k.c, stroke: PT.draw.shade(k.c, -0.4), 'stroke-width': 2.5, 'stroke-linejoin': 'round' });
      return svg('g', { transform: `translate(${x},${y})` }, [shape, svg('circle', { r: 2.5, fill: '#fff' })]);
    },
    hand: n => {
      // Hand mit n ausgestreckten Fingern: Zeigefinger zuerst (so zählen Kinder), Daumen zuletzt
      const fingers = [
        { x: -18, y: -8, rot: -8, len: 40 }, { x: -6, y: -10, rot: -2, len: 46 }, { x: 6, y: -10, rot: 3, len: 42 },
        { x: 18, y: -8, rot: 9, len: 34 }, { x: -26, y: 12, rot: -58, len: 30 },
      ];
      const kids = fingers.map((f, i) => {
        const len = i < n ? f.len : 9;
        return svg('rect', { x: -6, y: -len, width: 12, height: len + 8, rx: 6, fill: '#f0c9a6', stroke: '#a8794f', 'stroke-width': 2.5, transform: `translate(${f.x},${f.y}) rotate(${f.rot})` });
      });
      kids.push(svg('rect', { x: -26, y: -14, width: 52, height: 46, rx: 16, fill: '#f0c9a6', stroke: '#a8794f', 'stroke-width': 2.5 }));
      return svgBox(100, 110, [svg('g', { transform: 'translate(52,70)' }, kids)]);
    },
  };
  function starPath(r) {
    let d = '';
    for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.45 : r * 1.1, a = i / 10 * Math.PI * 2 - Math.PI / 2; d += (i ? 'L' : 'M') + (Math.cos(a) * rr).toFixed(1) + ' ' + (Math.sin(a) * rr).toFixed(1); }
    return d + 'Z';
  }
  const BEADS = {
    rot: { c: '#d9534f', shape: 'circle', name: 'rot' },
    blau: { c: '#3f7ab0', shape: 'square', name: 'blau' },
    gelb: { c: '#f2c14e', shape: 'tri', name: 'gelb' },
    gruen: { c: '#5aa246', shape: 'star', name: 'grün' },
  };

  function tiles(options, onPick, render) {
    const wrap = el('div', { class: 'tiles' });
    options.forEach(o => {
      const b = el('button', { class: 'tile', 'data-v': String(o) });
      if (render) b.appendChild(render(o)); else b.textContent = String(o);
      b.addEventListener('click', () => onPick(o, b));
      wrap.appendChild(b);
    });
    return wrap;
  }

  // ---------- Serie ausführen ----------
  const PRAISE = ['ranzl.richtig1', 'ranzl.richtig2', 'ranzl.richtig3', 'ranzl.richtig4', 'ranzl.richtig5'];

  /**
   * cfg: { title, skill, count, make(level, profile), intro?: [lines] }
   * Gibt Promise<{completed, stars, total}> zurück.
   */
  function runSeries(cfg) {
    return new Promise(resolve => {
      const profile = PT.game.profile;
      const g = profile.game;
      let index = 0;
      let total = cfg.count;
      let extraAdded = false;
      let stars = 0;
      let closed = false;

      const dots = el('div', { class: 'task-progress' });
      const promptEl = el('div', { class: 'task-prompt' });
      const stage = el('div', { class: 'task-stage' });
      let currentPrompt = null;
      const node = el('div', { class: 'task-screen' }, [
        el('div', { class: 'topbar' }, [
          PT.ui.roundBtn('close', 'Aufhören', () => finish(false)),
          el('div', { class: 'title' }, [cfg.title, dots]),
          PT.ui.speakerBtn(() => currentPrompt),
        ]),
        promptEl, stage,
      ]);
      const close = PT.ui.screen(node);

      function drawDots() {
        dots.innerHTML = '';
        for (let i = 0; i < total; i++) dots.appendChild(el('span', { class: i < index ? 'done' : i === index ? 'now' : '' }));
      }

      function finish(completed) {
        if (closed) return;
        closed = true;
        PT.speech.stop();
        close();
        PT.store.save();
        resolve({ completed, stars, total });
      }

      async function nextTask() {
        if (closed) return;
        if (index >= total) { finish(true); return; }
        drawDots();
        const level = PT.learn.level(profile, cfg.skill);
        const task = cfg.make(level, profile);
        let errors = 0, starErrors = 0, eraserUsed = false, busy = false, solved = false;
        stage.innerHTML = '';
        currentPrompt = task.prompt;
        promptEl.textContent = task.prompt.text;

        const api = {
          async answer(ok, wrongLine) {
            if (busy || solved || closed) return;
            busy = true;
            if (ok) {
              solved = true;
              PT.sound.right();
              PT.learn.record(profile, cfg.skill, errors === 0);
              if (starErrors === 0) stars++;
              if (task.onSolved) task.onSolved();
              await PT.speech.say(PT.pick(PRAISE), { noRemember: true });
              await PT.wait(400);
              index++;
              if (errors >= 3 && !extraAdded) { total++; extraAdded = true; }
              busy = false;
              nextTask();
              return;
            }
            PT.sound.soft();
            if (wrongLine) await PT.speech.say(wrongLine, { noRemember: true });
            if (g.radiergummi > 0 && !eraserUsed && starErrors === 0) {
              eraserUsed = true;
              g.radiergummi--;
              PT.store.save();
              errors++;
              PT.ui.toast('Radiergummi benutzt (' + g.radiergummi + ' übrig)', PT.items.itemCanvas('radiergummi', 88));
              if (task.reset) task.reset();
              await PT.speech.say('ranzl.radiergummi', { noRemember: true });
              busy = false;
              return;
            }
            errors++; starErrors++;
            if (errors === 1) {
              await PT.speech.say(task.hint1 || 'ranzl.nochmal');
            } else if (errors === 2) {
              await PT.speech.say('ranzl.zeigen', { noRemember: true });
              if (task.help2) await task.help2();
            } else {
              await PT.speech.say('ranzl.gemeinsam', { noRemember: true });
              if (task.solve) await task.solve();
            }
            if (task.reset && errors < 3) task.reset();
            busy = false;
          },
          get errors() { return errors; },
          get busy() { return busy; },
        };

        task.mount(stage, api);
        if (task.intro) { busy = true; await task.intro(); busy = false; }
        else await PT.speech.say(task.prompt);
        if (task.afterPrompt) task.afterPrompt();
      }

      (async () => {
        if (cfg.intro && cfg.intro.length) { await PT.ui.dialog(cfg.intro); }
        nextTask();
      })();
    });
  }

  PT.tasks = { svg, svgBox, ART, BEADS, tiles, runSeries };
})(window.PT);
