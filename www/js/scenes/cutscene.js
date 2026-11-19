// Zwischensequenzen: gemalte Kulisse, gerenderte Figuren, Text mit Vorlesestimme
'use strict';
class CutsceneScene extends Phaser.Scene {
  constructor() { super('Cutscene'); }
  init(data) { this.id = data.id; this.next = data.next || { scene: 'Map' }; this.panels = K.Story.CUTS[data.id] || []; this.i = -1; this.done = false; this.busy = false; this.layer = null; }
  create() {
    this.p = K.Save.cur();
    this.cameras.main.fadeIn(400, 0, 0, 0);
    this.layer = this.add.container(0, 0);
    this.fx = this.add.container(0, 0).setDepth(20);
    // Textkasten
    this.box = this.add.container(0, K.H - 150).setDepth(30);
    this.box.add(this.add.nineslice(K.W / 2, 74, 'ui_panel', null, K.W - 60, 168, 30, 30, 30, 30));
    this.who = this.add.text(70, 10, '', K.txt(24, '#ffd27a')).setOrigin(0, 0.5);
    this.text = this.add.text(70, 40, '', K.txt(27, '#fff6e0', { wordWrap: { width: K.W - 230 }, lineSpacing: 4, strokeThickness: 4 }));
    this.box.add([this.who, this.text]);
    this.nextBtn = K.UI.roundBtn(this, K.W - 90, 74, 40, 'ic_play', () => this.advance()); this.box.add(this.nextBtn);
    this.tweens.add({ targets: this.nextBtn, scale: 1.08, duration: 600, yoyo: true, repeat: -1 });
    K.UI.button(this, K.W - 110, 44, 170, 58, 'Weiter ⏭', () => this.finish(), { style: 'stone', size: 22 }).setDepth(40);
    K.UI.roundBtn(this, 60, 44, 30, 'ic_speak', () => this.speak(), { style: 'gold' }).setDepth(40);
    this.input.on('pointerup', (p, objs) => { if (!objs.length) this.advance(); });
    this.input.keyboard.on('keydown-SPACE', () => this.advance());
    this.input.keyboard.on('keydown-ENTER', () => this.advance());
    this.bgCache = {};
    this.advance();
  }
  speak() { const pn = this.panels[this.i]; if (pn) K.Speech.say(pn.text.replace(/[„“]/g, '')); }
  advance() {
    if (this.busy) return;
    this.i++;
    if (this.i >= this.panels.length) return this.finish();
    const pn = this.panels[this.i];
    this.busy = true; this.time.delayedCall(350, () => this.busy = false);
    K.Audio.sfx('page', { vol: 0.35 });
    if (pn.music) K.Audio.music(pn.music);
    if (pn.sfx) K.Audio.sfx(pn.sfx);
    if (pn.shake) this.cameras.main.shake(pn.shake, 0.008);
    // Kulisse
    const old = this.layer; this.layer = this.add.container(0, 0).setAlpha(0);
    this.drawBg(pn.bg);
    (pn.chars || []).forEach(([key, x, y, s, flip, fx], idx) => {
      if (!this.textures.exists(key)) return;
      const img = this.add.image(x * K.W, (y > 0.8 ? y - 0.15 : y) * K.H, key).setOrigin(0.5, 1).setFlipX(!!flip);
      const isPt = key.startsWith('pt_');
      const baseH = isPt ? 360 : (K.propsMeta[key] ? K.propsMeta[key].h : 200);
      img.setScale((baseH * (s || 1)) / img.height);
      if (key === 'herzglut') { const gl = this.add.image(img.x, img.y - img.displayHeight / 2, 'p_glow').setScale(img.displayWidth / 18).setTint(0xff8a2a).setBlendMode('ADD').setAlpha(0.8); this.layer.add(gl); this.tweens.add({ targets: gl, alpha: 0.4, duration: 900, yoyo: true, repeat: -1 }); }
      this.layer.add(img);
      // kleine Lebendigkeit
      const by = img.y;
      if (fx === 'float' || fx === 'rise') this.tweens.add({ targets: img, y: by - (fx === 'rise' ? 160 : 14), duration: fx === 'rise' ? 4000 : 2200, yoyo: fx !== 'rise', repeat: fx === 'rise' ? 0 : -1, ease: 'Sine.easeInOut' });
      else if (fx === 'glow') this.tweens.add({ targets: img, scale: img.scale * 1.05, duration: 900, yoyo: true, repeat: -1 });
      else this.tweens.add({ targets: img, scaleY: img.scaleY * 1.015, duration: 1400 + idx * 170, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      if (fx === 'stoneHalf') img.setTint(0xbcb6b0);
      if (fx === 'cage' || fx === 'net') {
        const g = this.add.graphics(); g.lineStyle(6, 0x3a3e46, 1);
        const bx = img.x - img.displayWidth * 0.55, bw = img.displayWidth * 1.1, top = img.y - img.displayHeight * 1.05, bh = img.displayHeight * 1.1;
        if (fx === 'cage') { for (let k = 0; k <= 8; k++) g.lineBetween(bx + k * bw / 8, top, bx + k * bw / 8, top + bh); g.lineStyle(10, 0x5a626e); g.strokeRect(bx, top, bw, bh); g.lineBetween(img.x, top, img.x, 0); }
        else { for (let k = -6; k <= 6; k++) { g.lineBetween(img.x + k * 40 - 200, top, img.x + k * 40 + 200, top + bh); g.lineBetween(img.x + k * 40 + 200, top, img.x + k * 40 - 200, top + bh); } }
        this.layer.add(g);
      }
    });
    this.tweens.add({ targets: this.layer, alpha: 1, duration: 450 });
    if (old) this.tweens.add({ targets: old, alpha: 0, duration: 450, onComplete: () => old.destroy() });
    this.box.setDepth(30);
    this.who.setText(pn.who || '');
    this.text.setText(pn.text);
    this.text.y = pn.who ? 40 : 26;
    this.speak();
    if (this.id === 'prolog' && this.i === 0) K.Audio.ambient(null);
  }
  drawBg(w) {
    if (w === 'dark') { this.layer.add(this.add.rectangle(0, 0, K.W, K.H, 0x0a0610).setOrigin(0)); return; }
    const bg = this.bgCache[w] || (this.bgCache[w] = K.Art.makeBackground(this, w));
    const off = Math.random() * 1500;
    this.layer.add(this.add.image(0, 0, bg.sky).setOrigin(0).setDisplaySize(K.W, K.H));
    [bg.deco, bg.far, bg.mid, bg.fog, bg.near].forEach((k, i) => this.layer.add(this.add.tileSprite(0, 0, K.W, K.H, k).setOrigin(0).setTilePosition(off * (0.2 + i * 0.2), 0)));
    // Boden-Vignette, damit Figuren stehen
    const g = this.add.graphics(); g.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 0.55, 0.55); g.fillRect(0, K.H * 0.55, K.W, K.H * 0.45); this.layer.add(g);
  }
  finish() {
    if (this.done) return; this.done = true;
    K.Speech.stop();
    if (this.p) { this.p.seen[this.id] = true; K.Save.persist(); }
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(420, () => this.scene.start(this.next.scene, this.next.data || {}));
  }
}
