/* Startbildschirm, Profile, Knopfladen, Rucksack, Baumhaus, Talkarte, Fest. */
(function (PT) {
  'use strict';
  const el = (...a) => PT.el(...a);

  // ---------- Startbild ----------
  function splash() {
    return new Promise(resolve => {
      const c = el('canvas', { width: 1120, height: 630 });
      const node = el('div', { id: 'splash' }, [el('div', {}, [c, el('div', { class: 'tap', text: 'Tippen zum Starten' })])]);
      const close = PT.ui.screen(node);
      let t = 0, raf;
      const ctx = c.getContext('2d');
      function frame() {
        t += 1 / 60;
        ctx.clearRect(0, 0, 1120, 630);
        PT.world.drawBackdrop(ctx, 1120, 630, t * 20);
        ctx.save(); ctx.translate(0, 40);
        PT.draw.pfeffer(ctx, 330, 520, 2.2, t, 1);
        PT.draw.ranzl(ctx, 560, 400, 2.6, { t, wave: true, talking: Math.sin(t * 1.3) > 0.4 });
        PT.draw.resi(ctx, 780, 520, 2.2, t, -1);
        PT.draw.zausel(ctx, 940 + Math.sin(t) * 40, 140 + Math.cos(t * 1.3) * 20, 1.4, t);
        ctx.restore();
        ctx.font = '900 110px ui-rounded, Nunito, "Trebuchet MS", sans-serif';
        ctx.textAlign = 'center';
        ctx.lineWidth = 14; ctx.strokeStyle = '#fbf3e2'; ctx.strokeText('Purzeltal', 560, 140);
        ctx.fillStyle = '#3b2f2a'; ctx.fillText('Purzeltal', 560, 140);
        raf = requestAnimationFrame(frame);
      }
      frame();
      node.addEventListener('click', () => {
        cancelAnimationFrame(raf);
        PT.sound.unlock();
        // iOS/Safari: Sprachausgabe muss in einer Berührung „aufgeweckt“ werden
        try { if ('speechSynthesis' in window) { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; window.speechSynthesis.speak(u); } } catch (e) { /* egal */ }
        close();
        resolve();
      }, { once: true });
    });
  }

  // ---------- Profile ----------
  function stageName(s) { return s === 'spatz' ? 'Spatzen · 4–5 Jahre' : 'Füchse · 6–7 Jahre'; }

  function profiles() {
    PT.ui.closeAll();
    const list = PT.store.profiles();
    const wrap = el('div', { class: 'profiles' });
    let close;
    list.forEach(p => {
      const c = el('canvas', { width: 300, height: 340 });
      PT.avatar.render(c, p);
      const card = el('button', { class: 'profile-card', 'aria-label': p.name }, [c, el('div', { class: 'name', text: p.name }), el('div', { class: 'stage', text: stageName(p.stage) })]);
      card.addEventListener('click', () => {
        PT.sound.right();
        close();
        PT.game.start(p);
      });
      wrap.appendChild(card);
    });
    if (list.length < PT.store.MAX_PROFILES) {
      wrap.appendChild(el('button', { class: 'profile-card add', 'aria-label': 'Neues Kind', onclick: async () => {
        if (!(await PT.ui.adultGate('Ein neues Profil legt ein Erwachsener an.'))) return;
        const p = await newProfileForm();
        if (!p) return;
        close();
        await PT.editor.open(p);
        PT.game.start(p);
      } }, [el('div', { class: 'plus', text: '+' }), el('div', { class: 'stage', text: 'Neues Kind' })]));
    }
    const parentsBtn = el('button', { class: 'btn white small corner-btn', onclick: async () => {
      if (await PT.ui.adultGate()) PT.parents.open(() => { profiles(); });
    } }, [PT.draw.makeIcon('lock', 60), 'Eltern']);
    parentsBtn.querySelector('canvas').style.width = '30px';
    const node = el('div', {}, [
      el('h1', { text: 'Purzeltal' }),
      el('p', { class: 'lead', text: list.length ? 'Wer spielt? Tipp auf dich!' : 'Willkommen! Ein Erwachsener tippt auf das Plus und legt ein Profil an.' }),
      wrap, parentsBtn,
    ]);
    close = PT.ui.screen(node);
    if (list.length) PT.speech.say({ text: 'Wer spielt? Tipp auf dich!', who: 'ranzl' }, { noRemember: true });
  }

  function newProfileForm() {
    return new Promise(resolve => {
      let stage = 'spatz', close;
      const name = el('input', { type: 'text', maxlength: 16, placeholder: 'z. B. Lena', autocomplete: 'off' });
      const bS = el('button', { class: 'btn white sel', text: 'Spatzen (4–5 Jahre)' });
      const bF = el('button', { class: 'btn white', text: 'Füchse (6–7 Jahre)' });
      bS.onclick = () => { stage = 'spatz'; bS.classList.add('sel'); bF.classList.remove('sel'); };
      bF.onclick = () => { stage = 'fuchs'; bF.classList.add('sel'); bS.classList.remove('sel'); };
      const msg = el('p', { class: 'note' });
      const ok = () => {
        const n = name.value.trim();
        if (!n) { msg.textContent = 'Bitte einen Namen eintragen.'; return; }
        const p = PT.store.addProfile(PT.store.newProfile(n, stage));
        close(); resolve(p);
      };
      const node = el('div', {}, [
        el('div', { class: 'topbar' }, [PT.ui.roundBtn('close', 'Abbrechen', () => { close(); resolve(null); }), el('div', { class: 'title', text: 'Neues Kind' }), el('div', { style: { width: '64px' } })]),
        el('div', { class: 'form' }, [
          el('label', {}, ['Name (Ranzl spricht ihn aus)', name]),
          el('div', { class: 'note', text: 'Altersstufe. Das ist nur der Startpunkt: Danach passt sich jede Aufgabe an, wie gut es klappt. Änderbar im Elternbereich.' }),
          el('div', { class: 'choice-row' }, [bS, bF]),
          el('button', { class: 'btn green', text: 'Weiter zum Zauberspiegel', onclick: ok }),
          msg,
        ]),
      ]);
      close = PT.ui.screen(node, { overlay: true });
      setTimeout(() => name.focus(), 50);
    });
  }

  // ---------- Knopfladen ----------
  function shop() {
    const g = PT.game.profile.game;
    let close;
    const grid = el('div', { class: 'grid' });
    const talerEl = el('span', { text: String(g.taler) });
    function build() {
      grid.innerHTML = '';
      talerEl.textContent = String(g.taler);
      PT.items.SHOP_ORDER.forEach(id => {
        const it = PT.items.ITEMS[id];
        const owned = !it.consumable && g.owned.includes(id);
        const canBuy = !owned && g.taler >= it.price;
        const card = el('div', { class: 'card' + (owned ? ' owned' : '') });
        const wish = el('button', { class: 'wish' + (g.wish === id ? ' on' : ''), 'aria-label': 'Wünschen', text: '★' });
        wish.onclick = e => { e.stopPropagation(); g.wish = g.wish === id ? null : id; PT.store.save(); PT.emit('taler'); build(); if (g.wish) PT.speech.say('ranzl.wunsch'); };
        const buy = el('button', { class: 'btn small ' + (canBuy ? 'green' : 'white'), text: owned ? 'Hast du schon' : 'Kaufen', disabled: owned ? true : null });
        buy.onclick = e => {
          e.stopPropagation();
          if (owned) return;
          if (g.taler < it.price) { PT.sound.soft(); PT.speech.say('ranzl.zuwenig'); return; }
          g.taler -= it.price;
          if (it.consumable) g.radiergummi = (g.radiergummi || 0) + 1;
          else g.owned.push(id);
          if (it.kind === 'hat') g.hat = id;
          if (it.kind === 'charm') g.charm = id;
          if (g.wish === id) g.wish = null;
          PT.sound.reward();
          PT.speech.say('ranzl.gekauft');
          PT.store.save(); PT.emit('taler');
          build();
        };
        const price = el('div', { class: 'price' }, [el('span', { class: 'knopf' }), String(it.price)]);
        card.append(wish, PT.items.itemCanvas(id, 200), el('div', { class: 'name', text: it.name + (it.consumable ? ' (' + (g.radiergummi || 0) + ')' : '') }), price, buy);
        card.addEventListener('click', () => PT.speech.say({ text: `${it.name}. Kostet ${it.price} Knöpfe.`, who: 'ranzl' }));
        grid.appendChild(card);
      });
    }
    const node = el('div', {}, [
      el('div', { class: 'topbar' }, [PT.ui.roundBtn('close', 'Schließen', () => { close(); PT.emit('menu-closed'); }), el('div', { class: 'title', text: 'Knopfladen' }), el('div', { class: 'taler-box' }, [el('span', { class: 'knopf' }), talerEl])]),
      el('p', { class: 'lead', text: 'Tipp auf einen Gegenstand, dann sagt Ranzl, was er kostet. Mit dem Stern kommt er ins Spar-Glas.' }),
      grid,
    ]);
    close = PT.ui.screen(node);
    build();
    PT.speech.say('ranzl.laden');
  }

  // ---------- Rucksack ----------
  function bag(startTab) {
    const p = PT.game.profile, g = p.game;
    let tab = startTab || 'sachen', close;
    const content = el('div');
    const tabs = el('div', { class: 'tabs' });
    const T = [['sachen', 'Hüte & Anhänger'], ['werkzeug', 'Werkzeug'], ['album', 'Sticker-Album']];
    function build() {
      tabs.innerHTML = '';
      T.forEach(([id, name]) => tabs.appendChild(el('button', { class: 'btn small white' + (tab === id ? ' sel' : ''), text: name, onclick: () => { tab = id; PT.sound.tap(); build(); } })));
      content.innerHTML = '';
      if (tab === 'sachen') {
        const owned = g.owned.filter(id => PT.items.ITEMS[id] && (PT.items.ITEMS[id].kind === 'hat' || PT.items.ITEMS[id].kind === 'charm'));
        if (!owned.length) content.appendChild(el('p', { class: 'lead', text: 'Noch leer. Im Knopfladen im Dorf kannst du Hüte und Anhänger kaufen.' }));
        const grid = el('div', { class: 'grid' });
        owned.forEach(id => {
          const it = PT.items.ITEMS[id];
          const worn = g.hat === id || g.charm === id;
          const card = el('button', { class: 'card owned' + (worn ? ' worn' : '') }, [PT.items.itemCanvas(id, 200), el('div', { class: 'name', text: it.name }), el('div', { class: 'note', text: worn ? 'Trägst du gerade' : 'Tipp zum Anziehen' })]);
          card.onclick = () => {
            PT.sound.tap();
            if (it.kind === 'hat') g.hat = g.hat === id ? null : id;
            else g.charm = g.charm === id ? null : id;
            PT.store.save(); build();
            PT.speech.say({ text: it.name, who: 'ranzl' }, { noRemember: true });
          };
          grid.appendChild(card);
        });
        content.appendChild(grid);
      } else if (tab === 'werkzeug') {
        const grid = el('div', { class: 'grid' });
        grid.appendChild(el('div', { class: 'card' }, [PT.items.itemCanvas('radiergummi', 200), el('div', { class: 'name', text: 'Radiergummi × ' + (g.radiergummi || 0) }), el('div', { class: 'note', text: 'Putzt bei einer Aufgabe einen Fehler weg. Dann bleibt der Bonus-Stern.' })]));
        grid.appendChild(el('div', { class: 'card' + (g.springfedern ? ' owned' : ' locked') }, [PT.items.itemCanvas('springfedern', 200), el('div', { class: 'name', text: 'Sprungfedern' }), el('div', { class: 'note', text: g.springfedern ? 'In der Luft nochmal springen!' : 'Bekommst du am Mühlberg.' })]));
        grid.appendChild(el('div', { class: 'card' + (g.instruments.includes('tuba') ? ' owned' : ' locked') }, [PT.items.itemCanvas('tuba', 200), el('div', { class: 'name', text: 'Tuba' }), el('div', { class: 'note', text: g.instruments.includes('tuba') ? 'Steht im Musikpavillon.' : 'Gibt es beim Fest.' })]));
        content.appendChild(grid);
      } else {
        content.appendChild(el('p', { class: 'lead', text: `${g.stickers.length} von ${PT.items.STICKERS.length} Stickern. Tipp drauf, dann erzählt Ranzl davon.` }));
        const grid = el('div', { class: 'sticker-grid' });
        PT.items.STICKERS.forEach(s => {
          const got = g.stickers.includes(s.id);
          const b = el('button', { class: 'sticker' + (got ? ' got' : ''), 'aria-label': got ? s.name : 'Noch nicht gefunden' });
          if (got) { b.appendChild(PT.items.stickerCanvas(s.id, 200)); b.onclick = () => PT.speech.say({ text: s.name + '. ' + s.info, who: 'ranzl' }); }
          else b.appendChild(el('span', { text: '?', style: { fontSize: '44px', color: '#d8c6a3', fontWeight: 900 } }));
          grid.appendChild(b);
        });
        content.appendChild(grid);
      }
    }
    const node = el('div', {}, [
      el('div', { class: 'topbar' }, [PT.ui.roundBtn('close', 'Schließen', () => { close(); PT.emit('menu-closed'); }), el('div', { class: 'title', text: 'Ranzl, offen' }), el('div', { style: { width: '64px' } })]),
      tabs, content,
    ]);
    close = PT.ui.screen(node);
    build();
  }

  // ---------- Baumhaus ----------
  function baumhaus() {
    const p = PT.game.profile, g = p.game;
    let close, raf, t = 0;
    const c = el('canvas', { width: 1000, height: 600, style: { width: '100%', maxWidth: '1000px', height: 'auto', display: 'block', margin: '0 auto', borderRadius: '22px' } });
    const ctx = c.getContext('2d');
    const d = PT.draw;
    function frame() {
      t += 1 / 60;
      ctx.fillStyle = '#e9c79a'; ctx.fillRect(0, 0, 1000, 600);
      ctx.fillStyle = '#d9b07a'; for (let x = 0; x < 1000; x += 70) ctx.fillRect(x, 0, 4, 470);
      ctx.fillStyle = '#b07a48'; ctx.fillRect(0, 470, 1000, 130);
      // Fenster
      d.rr(ctx, 380, 70, 240, 170, 20); d.paper(ctx, '#a9d8ef', 6);
      ctx.strokeStyle = '#8a5a3c'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(500, 70); ctx.lineTo(500, 240); ctx.moveTo(380, 155); ctx.lineTo(620, 155); ctx.stroke();
      // Bett
      d.rr(ctx, 60, 340, 260, 130, 14); d.paper(ctx, '#8a5a3c', 3);
      d.rr(ctx, 70, 330, 240, 50, 18); d.paper(ctx, '#3f7ab0', 3);
      d.rr(ctx, 80, 312, 80, 36, 14); d.paper(ctx, '#fff8ea', 2);
      if (g.owned.includes('teppich')) { ctx.save(); ctx.translate(500, 540); ctx.scale(1, 0.35); d.circle(ctx, 0, 0, 180, '#d9534f', 4); d.circle(ctx, 0, 0, 125, '#3f7ab0', 4); d.circle(ctx, 0, 0, 70, '#f2c14e', 4); ctx.restore(); }
      if (g.owned.includes('lampe')) {
        ctx.fillStyle = `rgba(242,193,78,${0.25 + Math.sin(t * 2) * 0.08})`; ctx.beginPath(); ctx.arc(820, 230, 120, 0, 7); ctx.fill();
        d.rr(ctx, 812, 260, 16, 210, 4); d.paper(ctx, '#8a5a3c');
        ctx.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 22 : 50, a = i / 10 * Math.PI * 2 - Math.PI / 2 + t * 0.3; ctx.lineTo(820 + Math.cos(a) * r, 230 + Math.sin(a) * r); } ctx.closePath(); d.paper(ctx, '#f2c14e', 3);
      }
      // Sticker an der Wand
      g.stickers.slice(0, 10).forEach((id, i) => { d.circle(ctx, 680 + (i % 5) * 52, 300 + Math.floor(i / 5) * 52, 22, '#fff8e6', 2); });
      PT.avatar.drawAvatar(ctx, p.avatar, 560, 520, 2.4, { t, facing: -1, hat: g.hat, charm: g.charm, ranzl: g.hasRanzl, walk: 0 });
      raf = requestAnimationFrame(frame);
    }
    const node = el('div', {}, [
      el('div', { class: 'topbar' }, [PT.ui.roundBtn('close', 'Schließen', () => { cancelAnimationFrame(raf); close(); PT.emit('menu-closed'); }), el('div', { class: 'title', text: 'Dein Baumhaus' }), el('div', { style: { width: '64px' } })]),
      c,
      el('p', { class: 'lead', text: g.owned.includes('teppich') || g.owned.includes('lampe') ? 'Alles, was du für dein Baumhaus kaufst, steht hier.' : 'Im Knopfladen gibt es einen Teppich und eine Sternenlampe für dein Baumhaus.' }),
    ]);
    close = PT.ui.screen(node);
    frame();
    PT.speech.say('ranzl.zuhause');
  }

  // ---------- Talkarte ----------
  function map() {
    const g = PT.game.profile.game;
    let close;
    const places = [
      { id: 'dorf', name: 'Dorf', sticker: 'pfeffer', x: PT.world.PLACES.dorf },
      { id: 'weg', name: 'Weg zum Mühlberg', sticker: 'raetselstein', x: PT.world.PLACES.weg },
      { id: 'muehlberg', name: 'Mühlberg', sticker: 'muehle', x: PT.world.PLACES.muehlberg },
    ];
    const grid = el('div', { class: 'grid' });
    places.forEach(pl => {
      const known = g.discovered.includes(pl.id);
      const card = el('button', { class: 'card' + (known ? '' : ' locked') }, [known ? PT.items.stickerCanvas(pl.sticker, 200) : el('div', { text: '?', style: { fontSize: '60px', height: '100px', color: '#d8c6a3' } }), el('div', { class: 'name', text: known ? pl.name : 'Noch nicht entdeckt' })]);
      if (known) card.onclick = () => { PT.sound.whoosh(); close(); PT.world.teleport(pl.x); PT.emit('menu-closed'); PT.speech.say({ text: pl.name, who: 'ranzl' }); };
      grid.appendChild(card);
    });
    const node = el('div', {}, [
      el('div', { class: 'topbar' }, [PT.ui.roundBtn('close', 'Schließen', () => { close(); PT.emit('menu-closed'); }), el('div', { class: 'title', text: 'Talkarte' }), el('div', { style: { width: '64px' } })]),
      el('p', { class: 'lead', text: 'Tipp auf einen Ort, dann fliegst du mit Zausels Wind dorthin.' }),
      grid,
    ]);
    close = PT.ui.screen(node);
  }

  // ---------- Fest ----------
  async function fest() {
    const p = PT.game.profile, g = p.game;
    let close, raf, t = 0;
    const c = el('canvas', { width: 1200, height: 640, style: { width: '100%', height: 'auto', maxHeight: '70vh', display: 'block', margin: '0 auto', borderRadius: '22px' } });
    const ctx = c.getContext('2d');
    const conf = Array.from({ length: 90 }, () => ({ x: Math.random() * 1200, y: Math.random() * -640, v: 60 + Math.random() * 90, c: PT.pick(['#d9534f', '#f2c14e', '#3f7ab0', '#5aa246', '#f29b8f']), r: Math.random() * 6 }));
    function frame() {
      t += 1 / 60;
      PT.world.drawBackdrop(ctx, 1200, 640, 0);
      // Fahnen
      for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.moveTo(40 + i * 82, 60); ctx.lineTo(80 + i * 82, 60); ctx.lineTo(60 + i * 82, 100 + Math.sin(t * 3 + i) * 4); ctx.closePath(); PT.draw.paper(ctx, ['#d9534f', '#f2c14e', '#3f7ab0', '#5aa246'][i % 4]); }
      const jump = k => Math.abs(Math.sin(t * 4 + k)) * -24;
      PT.draw.resi(ctx, 300, 560 + jump(0), 2.2, t, 1);
      PT.draw.hansi(ctx, 160, 570 + jump(1), 1.5, t, 1);
      PT.avatar.drawAvatar(ctx, p.avatar, 600, 570 + jump(2), 2.3, { t, cheer: true, hat: g.hat, charm: g.charm, ranzl: true, front: true });
      PT.draw.pfeffer(ctx, 860, 565 + jump(3), 2.1, t, -1);
      PT.draw.chicken(ctx, 990, 570 + jump(4), 2.2, t, -1);
      PT.draw.chicken(ctx, 1070, 572 + jump(5), 2, t, -1);
      ctx.save(); ctx.translate(980, 300); ctx.rotate(Math.sin(t * 2) * 0.1); ctx.translate(-50, -50); const tc = PT.items.itemCanvas('tuba', 100); ctx.drawImage(tc, 0, 0); ctx.restore();
      conf.forEach(k => { k.y += k.v / 60; if (k.y > 660) k.y = -10; ctx.fillStyle = k.c; ctx.fillRect(k.x + Math.sin(t * 3 + k.r) * 10, k.y, 10, 6); });
      raf = requestAnimationFrame(frame);
    }
    const node = el('div', { class: 'fest' }, [el('h1', { text: 'Fest am Mühlberg!' }), c]);
    close = PT.ui.screen(node);
    frame();
    PT.sound.fest();
    await PT.ui.dialog(['fest.1', 'fest.2']);
    g.springfedern = true;
    PT.ui.toast('Sprungfedern!', PT.items.itemCanvas('springfedern', 88), 2600);
    PT.sound.reward();
    await PT.ui.dialog(['fest.3']);
    PT.game.giveSticker('murmel');
    if (!g.instruments.includes('tuba')) g.instruments.push('tuba');
    await PT.ui.dialog(['fest.4']);
    PT.sound.fest();
    g.festDone = true;
    g.taler += 30;
    PT.store.save(); PT.emit('taler');
    await PT.wait(400);
    cancelAnimationFrame(raf);
    close();
    await PT.ui.dialog(['ranzl.doppelsprung']);
  }

  // ---------- Spielzeit vorbei ----------
  function sleepScreen() {
    return new Promise(resolve => {
      const p = PT.game.profile;
      let close;
      const c = el('canvas', { width: 300, height: 340 });
      PT.avatar.render(c, p);
      const node = el('div', {}, [
        el('h1', { text: 'Pause!' }),
        el('p', { class: 'lead', text: 'Ranzl schläft. Alles ist gespeichert.' }),
        el('div', { style: { display: 'flex', justifyContent: 'center' } }, [c]),
        el('div', { class: 'form' }, [
          el('button', { class: 'btn green', text: 'Zum Startbildschirm', onclick: () => { close(); resolve('home'); } }),
          el('button', { class: 'btn white small', text: 'Weiterspielen (Erwachsene)', onclick: async () => { if (await PT.ui.adultGate('Die eingestellte Spielzeit ist vorbei.')) { close(); resolve('continue'); } } }),
        ]),
      ]);
      close = PT.ui.screen(node);
      PT.speech.say('ranzl.schlaf');
    });
  }

  PT.menus = { splash, profiles, shop, bag, baumhaus, map, fest, sleepScreen, stageName };
})(window.PT);
