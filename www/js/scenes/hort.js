// Kivalus Hort: gefundene Schätze und der Laden für Hüte und Schuppenfarben
'use strict';
class HortScene extends Phaser.Scene {
  constructor() { super('Hort'); }
  create() {
    const p = this.p = K.Save.cur(); if (!p) return this.scene.start('Profiles');
    this.cameras.main.fadeIn(300);
    const bg = K.bgScene(this, 4); this.bgObjs = bg; this.camX = 0;
    K.particlesFor(this, 4, 5);
    this.add.rectangle(0, 0, K.W, K.H, 0x1a0c04, 0.35).setOrigin(0);
    K.Audio.music('hort'); K.Audio.ambient(null);
    this.add.text(330, 52, 'Kivalus Hort', K.title(56)).setOrigin(0.5);
    this.hud = K.UI.hud(this, p, K.W - 400, 18);
    K.UI.roundBtn(this, 50, 50, 32, 'ic_back', () => this.leave(), { style: 'stone' });
    this.backH = () => this.leave(); K.events.on('back', this.backH); this.events.once('shutdown', () => K.events.off('back', this.backH));
    this.shelf();
    this.tab = 'hats'; this.buildShop();
  }
  leave() { this.cameras.main.fadeOut(250); this.time.delayedCall(260, () => this.scene.start('Map')); }

  // Schatzregal: 20 Fächer
  shelf() {
    const x0 = 70, y0 = 120, cw = 112, chh = 112;
    this.add.nineslice(330, 380, 'ui_panel', null, 620, 540, 36, 36, 36, 36).setAlpha(0.92);
    const n = K.TREASURES.length, found = K.TREASURES.filter(t => this.p.hort.includes(t.key)).length;
    this.add.text(330, 138, `${found} von ${n} Schätzen gefunden`, K.txt(24, '#ffe9c4')).setOrigin(0.5);
    K.TREASURES.forEach((t, i) => {
      const c = i % 5, r = Math.floor(i / 5); const x = 330 + (c - 2) * cw, y = y0 + 90 + r * chh;
      this.add.image(x, y, 'ui_round_stone').setDisplaySize(96, 96).setAlpha(0.8);
      const have = this.p.hort.includes(t.key);
      if (!this.textures.exists(t.key)) return;
      const im = this.add.image(x, y, t.key); im.setScale(74 / Math.max(im.height, im.width));
      if (!have) { im.setTint(0x000000).setAlpha(0.45); }
      else {
        const gl = this.add.image(x, y, 'p_glow').setScale(1.8).setTint(0xffd060).setBlendMode('ADD').setAlpha(0.35); gl.setDepth(-0.5); im.setDepth(1);
        im.setInteractive({ useHandCursor: true }).on('pointerup', () => { K.Audio.sfx('sparkle', { vol: 0.5 }); K.UI.toast(this, `${t.name} (Level ${t.lv})`, { size: 30, y: 680 }); K.Speech.say(t.name); this.tweens.add({ targets: im, scale: im.scale * 1.25, duration: 120, yoyo: true }); });
      }
    });
  }

  // Laden
  buildShop() {
    if (this.shop) this.shop.destroy(true);
    const S = this.shop = this.add.container(0, 0);
    const p = this.p, cx = 960;
    S.add(this.add.nineslice(cx, 400, 'ui_panel', null, 600, 600, 36, 36, 36, 36).setAlpha(0.92));
    S.add(this.add.image(cx, 300, 'p_glow').setScale(6).setTint(0xffb060).setBlendMode('ADD').setAlpha(0.25));
    const prevColor = this.preview || p.color, prevHat = this.previewHat !== undefined ? this.previewHat : p.hat;
    const k = K.makeKivalu(this, cx, 350, { color: prevColor, hat: prevHat }, 0.95); k.playAnim('idle'); S.add(k); if (k.hat) S.add(k.hat);
    const tabs = [['hats', 'Hüte'], ['colors', 'Farben']];
    tabs.forEach(([id, name], i) => { const b = K.UI.button(this, cx - 120 + i * 240, 410, 210, 58, name, () => { this.tab = id; this.preview = null; this.previewHat = undefined; this.buildShop(); }, { style: this.tab === id ? 'gold' : 'stone', size: 26 }); S.add(b); });
    const list = this.tab === 'hats' ? [[null, { name: 'Ohne Hut', price: 0 }], ...Object.entries(K.HATS)] : Object.entries(K.COLORS);
    list.forEach(([id, it], i) => {
      const c = i % 4, r = Math.floor(i / 4); const x = cx - 210 + c * 140, y = 500 + r * 128;
      const owned = this.tab === 'hats' ? (id === null || p.owned.hats.includes(id)) : (id === 'blau' || p.owned.colors.includes(id));
      const worn = this.tab === 'hats' ? p.hat === id : p.color === id;
      const card = this.add.container(x, y); S.add(card);
      card.add(this.add.nineslice(0, 0, worn ? 'ui_btn_green' : owned ? 'ui_btn_white' : 'ui_btn_stone', null, 126, 116, 24, 24, 24, 24));
      if (this.tab === 'hats') {
        if (id) { const bb = this.hatBox(id), fr = this.add.image(0, -8, 'hatsheet_' + id, '0'); const sc = Math.min(96 / bb.w, 64 / bb.h); fr.setScale(sc).setOrigin((bb.x + bb.w / 2) / K.kivaluMeta.fw, (bb.y + bb.h / 2) / K.kivaluMeta.fh); card.add(fr); }
        else card.add(this.add.text(0, -6, '—', K.txt(40, '#6a4020', { strokeThickness: 0 })).setOrigin(0.5));
      } else {
        const col = id === 'blau' ? 0x3a9af0 : Phaser.Display.Color.HSLToColor((it.hue || 0) / 360, Math.min(1, 0.75 * (it.sat || 1)), Math.min(0.75, 0.5 * (it.light || 1))).color;
        card.add(this.add.circle(0, -8, 30, col).setStrokeStyle(4, 0xffffff, 0.8));
      }
      card.add(this.add.text(0, 40, owned ? (worn ? 'trägt er' : it.name) : `💎 ${it.price}`, K.txt(owned ? 16 : 22, owned ? '#3a1a00' : '#ffe28a', { strokeThickness: owned ? 0 : 3 })).setOrigin(0.5));
      card.setSize(126, 116).setInteractive({ useHandCursor: true });
      card.on('pointerup', () => this.pick(id, it, owned));
    });
    S.add(this.add.text(cx, 700 - 0, 'Tippe auf ein Teil: anprobieren, kaufen oder anziehen.', K.txt(18, '#e8d8c0')).setOrigin(0.5));
  }
  // sichtbarer Bereich eines Huts im ersten Bild (für die Vorschaukarten)
  hatBox(id) {
    K.hatBoxes = K.hatBoxes || {}; if (K.hatBoxes[id]) return K.hatBoxes[id];
    const m = K.kivaluMeta, src = this.textures.get('hatsheet_' + id).getSourceImage();
    const cv = document.createElement('canvas'); cv.width = m.fw; cv.height = m.fh; const g = cv.getContext('2d'); g.drawImage(src, 0, 0, m.fw, m.fh, 0, 0, m.fw, m.fh);
    const d = g.getImageData(0, 0, m.fw, m.fh).data; let x0 = m.fw, y0 = m.fh, x1 = 0, y1 = 0;
    for (let y = 0; y < m.fh; y++) for (let x = 0; x < m.fw; x++) if (d[(y * m.fw + x) * 4 + 3] > 20) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    return (K.hatBoxes[id] = x1 > x0 ? { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 } : { x: 0, y: 0, w: m.fw, h: m.fh });
  }
  pick(id, it, owned) {
    const p = this.p, hats = this.tab === 'hats';
    K.Audio.sfx('tap', { vol: 0.5 });
    if (owned) {
      if (hats) p.hat = id; else p.color = id;
      K.Save.persist(); this.preview = null; this.previewHat = undefined; K.Audio.sfx('sparkle', { vol: 0.5 });
      return this.buildShop();
    }
    // erst anprobieren, beim zweiten Tippen kaufen
    const isPreview = hats ? this.previewHat === id : this.preview === id;
    if (!isPreview) { if (hats) this.previewHat = id; else this.preview = id; this.buildShop(); K.UI.toast(this, `${it.name}: ${it.price} Glutsteine. Nochmal tippen zum Kaufen.`, { size: 26, y: 680 }); return; }
    if (p.coins < it.price) { K.Audio.sfx('wrong', { vol: 0.4 }); K.UI.toast(this, `Dir fehlen noch ${it.price - p.coins} Glutsteine.`, { size: 28, y: 680 }); return; }
    p.coins -= it.price; (hats ? p.owned.hats : p.owned.colors).push(id); if (hats) p.hat = id; else p.color = id;
    K.Save.persist(); this.hud.refresh(); K.Audio.sfx('gems', { vol: 0.6 }); K.Audio.sfx('j_treasure', { vol: 0.6, delay: 0.2 });
    this.preview = null; this.previewHat = undefined; this.buildShop();
    K.UI.toast(this, `${it.name} gehört jetzt Kivalu!`, { size: 32, y: 680 });
  }
  update(t, dt) { this.camX += dt * 0.01; this.bgObjs.update(this.camX); }
}
