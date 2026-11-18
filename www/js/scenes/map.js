// Weltkarte: ein Kapitel pro Bildschirm, nach links/rechts blättern
'use strict';
class MapScene extends Phaser.Scene {
  constructor() { super('Map'); }
  init(data) { this.focus = data && data.focus; }
  create() {
    this.p = K.Save.cur(); if (!this.p) return this.scene.start('Profiles');
    K.Speech.stop();
    const all = K.Story.allLevels;
    const firstOpen = [...all].reverse().find(l => K.Story.unlocked(this.p, l.id)) || all[0];
    this.ch = this.focus ? K.Story.level(this.focus).ch : firstOpen.ch;
    this.cameras.main.fadeIn(300);
    this.build();
    this.hud = K.UI.hud(this, this.p);
    K.UI.roundBtn(this, K.W - 60, 50, 36, 'ic_hort', () => this.go('Hort'), { style: 'gold' }).setDepth(50);
    K.UI.roundBtn(this, K.W - 145, 50, 36, 'ic_home', () => this.go('Profiles'), { style: 'stone' }).setDepth(50);
    this.add.text(K.W - 60, 96, 'Hort', K.txt(18)).setOrigin(0.5).setDepth(50);
    this.input.keyboard.on('keydown-LEFT', () => this.switch(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.switch(1));
    this.backH = () => this.go('Profiles'); K.events.on('back', this.backH); this.events.once('shutdown', () => K.events.off('back', this.backH));
    // Wischen
    this.input.on('pointerdown', (pt) => this.sx = pt.x);
    this.input.on('pointerup', (pt) => { if (this.sx != null && Math.abs(pt.x - this.sx) > 120) this.switch(pt.x < this.sx ? 1 : -1); this.sx = null; });
  }
  go(scene) { this.cameras.main.fadeOut(250); this.time.delayedCall(260, () => this.scene.start(scene)); }
  chapterOpen(n) { const c = K.Story.chapter(n); return c && K.Story.unlocked(this.p, c.levels[0].id); }
  switch(d) {
    const n = this.ch + d; if (n < 1 || n > 7) return;
    if (!this.chapterOpen(n) && d > 0 && !this.chapterOpen(n - 1)) return;
    this.ch = n; K.Audio.sfx('whoosh', { vol: 0.5 });
    this.cont.destroy(); this.build();
  }
  build() {
    const c = K.Story.chapter(this.ch), open = this.chapterOpen(this.ch);
    this.cont = this.add.container(0, 0);
    const bg = K.bgScene(this, c.n); bg.forEach(o => this.cont.add(o)); this.bgObjs = bg; this.camX = 0;
    const pe = K.particlesFor(this, c.n, 5); if (pe) this.cont.add(pe);
    K.Audio.music(open ? 'map' : 'map'); K.Audio.ambient(null);
    // Boden-Pfad
    const g = this.add.graphics(); this.cont.add(g);
    const pts = [[260, 560], [640, 500], [1020, 560]];
    g.fillStyle(0x000000, 0.35); g.fillEllipse(640, 600, 1180, 150);
    g.lineStyle(14, 0xffe0a0, 0.55); for (let i = 0; i < 2; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[i + 1]; for (let k = 0; k < 10; k++) { const t = k / 10; g.lineBetween(K.lerp(x1, x2, t), K.lerp(y1, y2, t) - Math.sin(t * Math.PI) * 30, K.lerp(x1, x2, t + 0.05), K.lerp(y1, y2, t + 0.05) - Math.sin((t + 0.05) * Math.PI) * 30); } }
    // Titel
    this.cont.add(this.add.text(K.W / 2, 150, `Kapitel ${c.n}`, K.txt(30, '#ffe9c4')).setOrigin(0.5));
    this.cont.add(this.add.text(K.W / 2, 205, c.name, K.title(76)).setOrigin(0.5));
    this.cont.add(this.add.text(K.W / 2, 262, c.sub, K.txt(26, '#fff3dd')).setOrigin(0.5));
    // Level-Steine
    let cur = null;
    c.levels.forEach((lv, i) => {
      const [x, y] = pts[i]; const un = K.Story.unlocked(this.p, lv.id), done = K.Save.levelDone(this.p, lv.id);
      const node = this.add.container(x, y); this.cont.add(node);
      const base = this.add.image(0, 0, done ? 'ui_round_gold' : un ? 'ui_round_red' : 'ui_round_stone').setDisplaySize(110, 110); node.add(base);
      node.add(this.add.text(0, -2, un ? String(i + 1) : '', K.txt(44, '#3a1a00', { strokeThickness: 0 })).setOrigin(0.5));
      if (!un) node.add(this.add.image(0, 0, 'ic_lock').setDisplaySize(56, 56));
      node.add(this.add.text(0, 78, lv.name, K.txt(22, un ? '#fff6e0' : '#b8a8b0')).setOrigin(0.5));
      if (done) { const L = this.p.levels[lv.id]; node.add(this.add.text(0, 106, `💎 ${L.gems}/${L.max || '?'}`, K.txt(18, '#ffd27a')).setOrigin(0.5)); }
      if (un) {
        node.setSize(120, 120).setInteractive({ useHandCursor: true });
        node.on('pointerup', () => { if (Math.abs((this.sx ?? 0) - this.input.activePointer.x) > 40) return; K.Audio.sfx('tap'); this.startLevel(lv.id); });
        if (!done && !cur) { cur = node; this.tweens.add({ targets: base, scale: base.scale * 1.08, duration: 700, yoyo: true, repeat: -1 }); }
      }
    });
    // Kivalu steht am aktuellen Level
    const at = cur || this.cont.list.find(o => o.type === 'Container');
    if (open && at) { const k = K.makeKivalu(this, at.x - 70, at.y - 10, this.p, 0.42); k.playAnim('idle'); this.cont.add(k); if (k.hat) this.cont.add(k.hat); }
    if (!open) {
      this.cont.add(this.add.rectangle(0, 0, K.W, K.H, 0x000000, 0.45).setOrigin(0));
      this.cont.add(this.add.text(K.W / 2, 420, 'Noch verschlossen', K.txt(44)).setOrigin(0.5));
      this.cont.add(this.add.image(K.W / 2, 340, 'ic_lock').setDisplaySize(90, 90));
    }
    // Pfeile
    if (this.ch > 1) { const b = K.UI.roundBtn(this, 60, K.H / 2, 40, 'ic_back', () => this.switch(-1)); this.cont.add(b); }
    if (this.ch < 7 && (this.chapterOpen(this.ch + 1) || open)) { const b = K.UI.roundBtn(this, K.W - 60, K.H / 2, 40, 'ic_back', () => this.switch(1)); b.icon.setFlipX(true); this.cont.add(b); }
    // Punkte unten
    for (let i = 1; i <= 7; i++) this.cont.add(this.add.circle(K.W / 2 + (i - 4) * 28, K.H - 30, i === this.ch ? 9 : 6, this.chapterOpen(i) ? 0xffd27a : 0x6a5a70));
    this.cont.setDepth(0);
  }
  startLevel(id) {
    const lv = K.Story.level(id); const pre = K.Story.before(id);
    this.cameras.main.fadeOut(300);
    this.time.delayedCall(320, () => {
      if (pre && !this.p.seen[pre]) this.scene.start('Cutscene', { id: pre, next: { scene: 'Level', data: { id } } });
      else this.scene.start('Level', { id });
    });
  }
  update(t, dt) { if (this.bgObjs) { this.camX += dt * 0.015; this.bgObjs.update(this.camX); } }
}
