// Level geschafft: Glutsteine zählen, Schatz zeigen, weiter zur Geschichte
'use strict';
class LevelDoneScene extends Phaser.Scene {
  constructor() { super('LevelDone'); }
  init(d) { this.d = d; }
  create() {
    const d = this.d, p = this.p = K.Save.cur(); const lv = K.Story.level(d.id);
    const wasDone = K.Save.levelDone(p, d.id);
    K.Save.finishLevel(p, d.id, { gems: d.gems, maxGems: d.maxGems, treasures: d.treasures });
    this.cameras.main.fadeIn(400);
    const bg = K.bgScene(this, lv.ch); this.bgObjs = bg; this.camX = 0;
    K.particlesFor(this, lv.ch, 5);
    this.add.rectangle(0, 0, K.W, K.H, 0x000000, 0.35).setOrigin(0);
    K.Audio.music('map');
    const k = K.makeKivalu(this, 300, 640, p, 1.25); k.playAnim('cheer');
    this.add.image(300, 470, 'p_glow').setScale(9).setTint(0xffa040).setBlendMode('ADD').setAlpha(0.25).setDepth(-1);
    const px = 840;
    this.add.nineslice(px, 360, 'ui_parch', null, 700, 560, 40, 40, 40, 40);
    this.add.text(px, 130, 'Geschafft!', K.title(76, '#c2400a', { stroke: '#fff0c8', strokeThickness: 6 })).setOrigin(0.5);
    this.add.text(px, 200, `${lv.id}  ${lv.name}`, K.txt(30, '#4a2a10', { strokeThickness: 0 })).setOrigin(0.5);
    // Glutsteine hochzählen
    this.add.image(px - 120, 290, 'gem').setDisplaySize(70, 70);
    const gt = this.add.text(px - 70, 290, '0', K.txt(54, '#8a3a00', { strokeThickness: 0 })).setOrigin(0, 0.5);
    const total = d.gems; let shown = 0;
    if (total > 0) this.time.addEvent({ delay: 40, repeat: total - 1, callback: () => { shown++; gt.setText(`${shown}`); if (shown % 2) K.Audio.sfx('gem', { vol: 0.25, rate: 1 + shown / 200 }); } });
    this.add.text(px - 70, 336, `von ${d.maxGems} im Level  ·  Hort: ${p.coins} 💎`, K.txt(22, '#6a4020', { strokeThickness: 0 })).setOrigin(0, 0.5);
    // Schatz
    const tr = K.treasureFor(d.id);
    if (tr && d.treasures && d.treasures.includes(tr.key)) {
      const im = this.add.image(px - 170, 440, tr.key); im.setScale(90 / im.height);
      this.add.image(im.x, im.y, 'p_glow').setScale(3).setTint(0xffd060).setBlendMode('ADD').setAlpha(0.5);
      this.add.text(px - 100, 440, `Schatz: ${tr.name}`, K.txt(28, '#2a6a10', { strokeThickness: 0 })).setOrigin(0, 0.5);
    } else if (tr) {
      const has = p.hort.includes(tr.key);
      this.add.text(px, 440, has ? `${tr.name} ist schon in deinem Hort.` : 'Ein Schatz ist noch versteckt …', K.txt(26, '#6a4020', { strokeThickness: 0 })).setOrigin(0.5);
    }
    if (!wasDone) K.Audio.sfx('levelup', { vol: 0.6, delay: 0.3 });
    // Weiter
    const next = K.Story.nextLevel(d.id); const cut = K.Story.after(d.id);
    const goNext = () => {
      const tgt = next ? { scene: 'Map', data: { focus: next.id } } : { scene: 'Map', data: {} };
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(320, () => { if (cut && !p.seen[cut]) this.scene.start('Cutscene', { id: cut, next: tgt }); else this.scene.start(tgt.scene, tgt.data); });
    };
    K.UI.button(this, px + 140, 560, 300, 84, 'Weiter', goNext, { style: 'green', icon: 'ic_play', size: 34 });
    K.UI.button(this, px - 160, 560, 240, 84, 'Nochmal', () => this.scene.start('Level', { id: d.id }), { style: 'gold', size: 30 });
    this.input.keyboard.once('keydown-ENTER', goNext);
    K.Speech.say(`Geschafft! Du hast ${total} Glutsteine gesammelt.`);
  }
  update(t, dt) { this.camX += dt * 0.02; this.bgObjs.update(this.camX); }
}
