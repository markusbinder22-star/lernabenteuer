/* Der Zauberspiegel: Avatar-Editor ohne Lesen. Tippen auf das Spiegelbild ändert den Bereich. */
(function (PT) {
  'use strict';
  const el = (...a) => PT.el(...a);
  const O = () => PT.avatar.OPTIONS;

  function open(profile, opts) {
    opts = opts || {};
    return new Promise(resolve => {
      const a = Object.assign({}, profile.avatar);
      let part = 'hair';
      let t = 0, raf = 0, cheer = 0;

      const mirrorCanvas = el('canvas', { width: 600, height: 800 });
      const mirror = el('div', { class: 'mirror' }, [mirrorCanvas]);
      const tabs = el('div', { class: 'part-tabs' });
      const panel = el('div', { class: 'options-panel' });

      const PARTS = [
        { id: 'hair', icon: 'hair', say: 'Haare' },
        { id: 'face', icon: 'face', say: 'Gesicht' },
        { id: 'top', icon: 'top', say: 'Oberteil' },
        { id: 'bottom', icon: 'bottom', say: 'Hose oder Rock' },
      ];
      PARTS.forEach(pt => {
        const b = PT.ui.roundBtn(pt.icon, pt.say, () => { PT.sound.tap(); part = pt.id; build(); PT.speech.say({ text: pt.say, who: 'ranzl' }, { noRemember: true }); });
        b.dataset.part = pt.id;
        tabs.appendChild(b);
      });

      function sayName(text) { PT.speech.say({ text, who: 'ranzl' }, { noRemember: true }); }
      function change(fn, name) { fn(); PT.sound.tap(); cheer = 0.6; build(); if (name) sayName(name); }

      function optCanvas(draw) {
        const c = el('canvas', { width: 120, height: 120 });
        draw(c.getContext('2d'));
        return c;
      }
      function opt(selected, child, onclick, extraClass, style) {
        const b = el('button', { class: 'opt ' + (extraClass || '') + (selected ? ' sel' : ''), onclick, style });
        if (child) b.appendChild(child);
        return b;
      }
      function swatches(list, current, onPick) {
        return el('div', { class: 'opt-row' }, list.map((c, i) => {
          const color = typeof c === 'string' ? c : c.c;
          return opt(i === current, null, () => onPick(i, c), 'swatch', { background: color });
        }));
      }

      function build() {
        PT.$$('.round-btn', tabs).forEach(b => b.classList.toggle('sel', b.dataset.part === part));
        panel.innerHTML = '';
        if (part === 'hair') {
          panel.appendChild(el('div', { class: 'opt-row' }, O().hair.map((h, i) => opt(a.hair === i,
            optCanvas(ctx => PT.avatar.drawHead(ctx, Object.assign({}, a, { hair: i }), 60, 64, 1.9)),
            () => change(() => { a.hair = i; }, h.name)))));
          panel.appendChild(swatches(O().hairColor, a.hairColor, (i, c) => change(() => { a.hairColor = i; }, c.name)));
        } else if (part === 'face') {
          panel.appendChild(el('div', { class: 'opt-row' }, [
            ...O().base.map(bs => opt(a.base === bs.id, optCanvas(ctx => PT.avatar.drawHead(ctx, Object.assign({}, a, { base: bs.id }), 60, 64, 1.9)), () => change(() => { a.base = bs.id; }, bs.name))),
            opt(!a.glasses, optCanvas(ctx => PT.avatar.drawHead(ctx, Object.assign({}, a, { glasses: false }), 60, 64, 1.9)), () => change(() => { a.glasses = false; }, 'ohne Brille')),
            opt(a.glasses, optCanvas(ctx => PT.avatar.drawHead(ctx, Object.assign({}, a, { glasses: true }), 60, 64, 1.9)), () => change(() => { a.glasses = true; }, 'mit Brille')),
          ]));
          panel.appendChild(swatches(O().skin, a.skin, i => change(() => { a.skin = i; })));
        } else if (part === 'top') {
          panel.appendChild(el('div', { class: 'opt-row' }, O().top.map((tp, i) => opt(a.top === i,
            optCanvas(ctx => PT.avatar.drawAvatar(ctx, Object.assign({}, a, { top: i }), 60, 176, 1.45, { front: true, noShadow: true })),
            () => change(() => { a.top = i; }, tp.name)))));
          panel.appendChild(swatches(O().colors, a.topColor, (i, c) => change(() => { a.topColor = i; }, c.name)));
        } else {
          panel.appendChild(el('div', { class: 'opt-row' }, O().bottom.map((bt, i) => opt(a.bottom === i,
            optCanvas(ctx => PT.avatar.drawAvatar(ctx, Object.assign({}, a, { bottom: i }), 60, 116, 1.35, { front: true, noShadow: true })),
            () => change(() => { a.bottom = i; }, bt.name)))));
          panel.appendChild(swatches(O().colors, a.bottomColor, (i, c) => change(() => { a.bottomColor = i; }, c.name)));
        }
      }

      // Tippen auf das Spiegelbild
      mirrorCanvas.addEventListener('click', e => {
        const r = mirrorCanvas.getBoundingClientRect();
        const y = (e.clientY - r.top) / r.height; // 0..1
        if (y < 0.27) { part = 'hair'; change(() => { a.hair = (a.hair + 1) % O().hair.length; }, O().hair[(a.hair + 1) % O().hair.length].name); }
        else if (y < 0.42) { part = 'face'; change(() => { a.skin = (a.skin + 1) % O().skin.length; }); }
        else if (y < 0.66) { part = 'top'; change(() => { a.topColor = (a.topColor + 1) % 4; }, O().colors[(a.topColor + 1) % 4].name); }
        else { part = 'bottom'; change(() => { a.bottomColor = (a.bottomColor + 1) % 4; }, O().colors[(a.bottomColor + 1) % 4].name); }
      });

      function frame() {
        t += 1 / 60;
        cheer = Math.max(0, cheer - 1 / 60);
        const ctx = mirrorCanvas.getContext('2d');
        ctx.clearRect(0, 0, 600, 800);
        // Glanz
        ctx.fillStyle = 'rgba(255,255,255,.35)';
        ctx.beginPath(); ctx.moveTo(60, 120); ctx.lineTo(160, 60); ctx.lineTo(90, 420); ctx.lineTo(40, 460); ctx.closePath(); ctx.fill();
        PT.avatar.drawAvatar(ctx, a, 300, 740, 6, { t, front: true, cheer: cheer > 0, facing: 1, hat: profile.game.hat, ranzl: false });
        raf = requestAnimationFrame(frame);
      }

      const done = PT.ui.roundBtn('check', 'Fertig', () => {
        PT.sound.right();
        cancelAnimationFrame(raf);
        profile.avatar = a;
        PT.store.save();
        close();
        resolve(true);
      }, 'go');
      const dice = PT.ui.roundBtn('dice', 'Zufall', () => { Object.assign(a, PT.avatar.randomAvatar()); PT.sound.whoosh(); cheer = 0.8; build(); });

      const node = el('div', {}, [
        el('div', { class: 'topbar' }, [
          opts.canCancel ? PT.ui.roundBtn('close', 'Abbrechen', () => { cancelAnimationFrame(raf); close(); resolve(false); }) : el('div', { style: { width: '64px' } }),
          el('div', { class: 'title', text: 'Der Zauberspiegel' }),
          done,
        ]),
        el('div', { class: 'mirror-wrap' }, [tabs, mirror, el('div', { class: 'part-tabs' }, [dice])]),
        panel,
      ]);
      const close = PT.ui.screen(node);
      build();
      frame();
      PT.speech.say({ text: 'Das ist der Zauberspiegel. Tipp auf deine Haare, dein Gesicht, dein Oberteil oder deine Hose. Wenn du fertig bist, tipp auf den grünen Haken.', who: 'ranzl' });
    });
  }

  PT.editor = { open };
})(window.PT);
