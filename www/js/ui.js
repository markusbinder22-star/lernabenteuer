// UI-Bausteine: Knöpfe, Tafeln, Anzeigen
'use strict';
K.UI = (() => {
  function panel(scene, x, y, w, h, style = 'panel') {
    const p = scene.add.nineslice(x, y, 'ui_' + style, null, w, h, 36, 36, 36, 36);
    return p;
  }
  // Großer, gut tippbarer Knopf
  function button(scene, x, y, w, h, label, onClick, opt = {}) {
    const c = scene.add.container(x, y);
    const style = opt.style || 'gold';
    const bg = scene.add.nineslice(0, 0, 'ui_btn_' + style, null, w, h, 28, 28, 28, 28);
    c.add(bg);
    let iconObj = null;
    if (opt.icon) {
      iconObj = opt.icon.length <= 3 && !scene.textures.exists(opt.icon)
        ? scene.add.text(0, 0, opt.icon, { fontSize: Math.round(h * 0.5) + 'px' }).setOrigin(0.5)
        : scene.add.image(0, 0, opt.icon).setDisplaySize(h * 0.62, h * 0.62);
      c.add(iconObj);
    }
    const t = scene.add.text(0, 0, label || '', K.txt(opt.size || Math.round(Math.min(h * 0.42, 40)), opt.color || (style === 'stone' ? '#fff3dd' : '#3a1a00'), { stroke: style === 'stone' ? '#1a0e06' : '#fff3c0', strokeThickness: style === 'stone' ? 4 : 0 })).setOrigin(0.5);
    c.add(t);
    if (iconObj && label) { iconObj.x = -w / 2 + h * 0.5; t.x = h * 0.25; }
    c.setSize(w, h);
    c.setInteractive({ useHandCursor: true });
    c.on('pointerdown', () => { c.setScale(0.94); K.Audio.sfx('click', { vol: 0.6 }); });
    c.on('pointerout', () => c.setScale(1));
    c.on('pointerup', () => { c.setScale(1); if (!c.disabled) onClick && onClick(); });
    c.on('pointerover', () => { scene.tweens.add({ targets: c, scale: 1.04, duration: 90, yoyo: true }); });
    c.label = t; c.bg = bg; c.icon = iconObj;
    c.setDisabled = (d) => { c.disabled = d; c.setAlpha(d ? 0.45 : 1); };
    return c;
  }
  function roundBtn(scene, x, y, r, icon, onClick, opt = {}) {
    const c = scene.add.container(x, y);
    const bg = scene.add.image(0, 0, 'ui_round_' + (opt.style || 'gold')).setDisplaySize(r * 2, r * 2);
    c.add(bg);
    const ic = scene.textures.exists(icon) ? scene.add.image(0, 0, icon).setDisplaySize(r * 1.2, r * 1.2) : scene.add.text(0, 2, icon, { fontSize: Math.round(r * 0.95) + 'px', fontFamily: K.FONT, color: '#3a1a00' }).setOrigin(0.5);
    c.add(ic); c.icon = ic;
    c.setSize(r * 2, r * 2); c.setInteractive(new Phaser.Geom.Circle(r, r, r * 1.1), Phaser.Geom.Circle.Contains);
    c.on('pointerdown', () => { c.setScale(0.9); K.Audio.sfx('click', { vol: 0.6 }); });
    c.on('pointerout', () => c.setScale(1));
    c.on('pointerup', () => { c.setScale(1); onClick && onClick(); });
    return c;
  }
  function toast(scene, text, opt = {}) {
    const t = scene.add.text(K.W / 2, opt.y || 110, text, K.txt(opt.size || 34, opt.color || '#fff3c0')).setOrigin(0.5).setDepth(5000).setScrollFactor(0).setAlpha(0);
    scene.tweens.add({ targets: t, alpha: 1, y: t.y - 10, duration: 250 });
    scene.tweens.add({ targets: t, alpha: 0, delay: opt.ms || 1800, duration: 400, onComplete: () => t.destroy() });
    return t;
  }
  // Glutstein-/Feder-/Augen-Anzeige
  function hud(scene, p, x = 20, y = 18) {
    const c = scene.add.container(x, y).setScrollFactor(0).setDepth(4000);
    const bg = scene.add.nineslice(0, 0, 'ui_hud', null, 360, 64, 24, 24, 24, 24).setOrigin(0, 0);
    c.add(bg);
    const items = [['ic_gem', 'coins'], ['ic_feather', 'feathers'], ['ic_eye', 'eyes']];
    c.vals = {};
    items.forEach(([ic, key], i) => {
      const ix = 18 + i * 116;
      c.add(scene.add.image(ix + 20, 32, ic).setDisplaySize(40, 40));
      const t = scene.add.text(ix + 46, 32, String(p[key] || 0), K.txt(30)).setOrigin(0, 0.5);
      c.add(t); c.vals[key] = t;
    });
    c.refresh = () => items.forEach(([, key]) => c.vals[key].setText(String(p[key] || 0)));
    c.bump = (key) => { c.refresh(); const t = c.vals[key]; scene.tweens.add({ targets: t, scale: 1.4, duration: 110, yoyo: true }); };
    return c;
  }
  // Text mit Sprecher-Knopf
  function speakBtn(scene, x, y, getText, opt = {}) {
    return roundBtn(scene, x, y, opt.r || 34, 'ic_speak', () => K.Speech.say(typeof getText === 'function' ? getText() : getText, opt), { style: opt.style || 'gold' });
  }
  // Vollbild-Knopf (nur im Browser, nicht in der App; auf dem iPhone gibt es kein Vollbild für Webseiten)
  function fullBtn(scene, x, y) {
    if (K.isApp || !document.fullscreenEnabled) return null;
    return roundBtn(scene, x, y, 34, 'ic_full', () => {
      try { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen({ navigationUI: 'hide' }).then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) {} }).catch(() => {}); } catch (e) {}
    }, { style: 'stone' }).setDepth(50);
  }
  return { panel, button, roundBtn, toast, hud, speakBtn, fullBtn };
})();
