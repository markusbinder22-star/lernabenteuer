/* Start des Spiels, HUD und Ablauf zwischen Profilen und Welt. */
(function (PT) {
  'use strict';

  const game = {
    profile: null,
    start(p) {
      this.profile = p;
      PT.ui.closeAll();
      PT.$('#hud').classList.remove('hidden');
      PT.$('#controls').classList.remove('hidden');
      updateHud();
      PT.world.start();
    },
    exit() {
      PT.world.stop();
      PT.speech.stop();
      PT.$('#hud').classList.add('hidden');
      PT.$('#controls').classList.add('hidden');
      PT.$('#dialog').classList.add('hidden');
      this.profile = null;
      PT.menus.profiles();
    },
    giveSticker(id) {
      const g = this.profile.game;
      if (g.stickers.includes(id)) return;
      g.stickers.push(id);
      PT.store.save();
      const s = PT.items.STICKERS.find(x => x.id === id);
      PT.ui.toast('Neuer Sticker: ' + (s ? s.name : id), PT.items.stickerCanvas(id, 88), 2600);
      PT.sound.reward();
    },
  };
  PT.game = game;

  // ---------- HUD ----------
  function setupHud() {
    const icon = (sel, name) => { const b = PT.$(sel); b.innerHTML = ''; b.appendChild(PT.draw.makeIcon(name, 100)); };
    icon('#btn-home', 'home');
    icon('#btn-ranzl', 'ranzl');
    icon('#btn-bag', 'bag');
    icon('#btn-map', 'map');
    icon('#btn-save', 'save');
    PT.$('#btn-home').onclick = () => { PT.sound.tap(); PT.store.save(); game.exit(); };
    PT.$('#btn-ranzl').onclick = () => { PT.sound.tap(); if (PT.speech.last) PT.speech.repeat(); else PT.speech.say({ text: 'Lauf herum und schau, wo eine grüne Hand erscheint!', who: 'ranzl' }); };
    PT.$('#btn-bag').onclick = () => { if (PT.ui.anyScreen()) return; PT.sound.tap(); PT.menus.bag(); };
    PT.$('#btn-map').onclick = () => { if (PT.ui.anyScreen() || PT.ui.dialogBusy) return; PT.sound.tap(); PT.menus.map(); };
    PT.$('#btn-save').onclick = () => {
      PT.store.save();
      PT.sound.save();
      PT.ui.toast('Gespeichert!', PT.draw.makeIcon('save', 88));
      PT.speech.say('ranzl.gemerkt', { noRemember: true });
    };
    PT.on('taler', updateHud);
    PT.on('screens', n => {
      // Steuerung ausblenden, solange ein Bildschirm offen ist
      const inGame = !!game.profile;
      PT.$('#controls').classList.toggle('hidden', !inGame || n > 0);
      PT.$('#hud').classList.toggle('hidden', !inGame || n > 0);
      if (inGame && n === 0) updateHud();
    });
  }

  function updateHud() {
    const p = game.profile;
    if (!p) return;
    const g = p.game;
    PT.$('#taler-num').textContent = String(g.taler);
    const jar = PT.$('#wish-jar');
    if (g.wish && PT.items.ITEMS[g.wish]) {
      jar.classList.remove('hidden');
      const it = PT.items.ITEMS[g.wish];
      PT.$('.jar-fill', jar).style.height = Math.min(100, Math.round(g.taler / it.price * 100)) + '%';
      const ic = PT.$('.jar-icon', jar);
      PT.items.drawItem(ic, g.wish);
    } else jar.classList.add('hidden');
    document.body.classList.toggle('tapmode', PT.store.settings.control === 'tap');
  }

  // ---------- Android-Zurück-Taste (nur in der App) ----------
  function setupNative() {
    if (!PT.isNativeApp()) return;
    try {
      const App = window.Capacitor.registerPlugin('App');
      App.addListener('backButton', () => {
        const screens = PT.$$('#screens > .screen');
        if (screens.length) {
          const closeBtn = PT.$('.topbar .round-btn', screens[screens.length - 1]);
          if (closeBtn) closeBtn.click();
          return;
        }
        if (game.profile) { PT.store.save(); game.exit(); }
      });
      App.addListener('pause', () => PT.store.save());
    } catch (e) { console.warn(e); }
  }

  // ---------- Offline (nur Web-Version) ----------
  function setupServiceWorker() {
    if (PT.isNativeApp()) return;
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(e => console.warn('Kein Offline-Modus', e));
    }
  }

  document.addEventListener('visibilitychange', () => { if (document.hidden) PT.store.save(); });
  window.addEventListener('pagehide', () => PT.store.save());

  async function boot() {
    PT.store.load();
    setupHud();
    setupNative();
    setupServiceWorker();
    await PT.speech.init();
    await PT.menus.splash();
    PT.menus.profiles();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.PT);
