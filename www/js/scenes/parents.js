// Elternbereich: Lautstärke, Vorlesen, Stufe und Lernstand je Kind, Profil löschen
'use strict';
class ParentsScene extends Phaser.Scene {
  constructor() { super('Parents'); }
  create() {
    this.cameras.main.fadeIn(250);
    this.add.rectangle(0, 0, K.W, K.H, 0x1a1020).setOrigin(0);
    const bg = K.bgScene(this, 7); bg.forEach(o => o.setAlpha(0.35));
    this.backH = () => this.leave(); K.events.on('back', this.backH); this.events.once('shutdown', () => K.events.off('back', this.backH));
    K.UI.roundBtn(this, 50, 50, 32, 'ic_back', () => this.leave(), { style: 'stone' });
    if (!K.parentsOk) return this.gate();
    this.sel = (K.Save.cur() || K.Save.data.profiles[0] || {}).id;
    this.build();
  }
  leave() { this.scene.start('Profiles'); }
  gate() {
    const a = K.irnd(6, 9), b = K.irnd(12, 19);
    this.add.text(K.W / 2, 260, 'Elternbereich', K.title(60)).setOrigin(0.5);
    this.add.text(K.W / 2, 340, 'Bitte eine Rechenaufgabe für Erwachsene lösen.', K.txt(28)).setOrigin(0.5);
    K.UI.button(this, K.W / 2, 450, 360, 84, `${a} × ${b} = ?`, () => K.askText(`${a} × ${b} = ?`, '', (v) => {
      if (v && Number(v) === a * b) { K.parentsOk = true; this.scene.restart(); } else if (v != null) K.UI.toast(this, 'Leider falsch.', { size: 30 });
    }), { style: 'gold', size: 34 });
  }
  build() {
    if (this.c) this.c.destroy(true);
    const c = this.c = this.add.container(0, 0);
    const S = K.Save.settings, ps = K.Save.data.profiles;
    c.add(this.add.text(K.W / 2, 46, 'Elternbereich', K.title(48)).setOrigin(0.5));
    // Einstellungen links
    c.add(this.add.nineslice(320, 390, 'ui_panel', null, 560, 600, 36, 36, 36, 36));
    c.add(this.add.text(320, 120, 'Ton und Sprache', K.txt(30, '#ffd27a')).setOrigin(0.5));
    const row = (y, label, val, dec, inc) => {
      c.add(this.add.text(80, y, label, K.txt(26)).setOrigin(0, 0.5));
      c.add(K.UI.button(this, 380, y, 64, 56, '−', dec, { style: 'stone', size: 32 }));
      c.add(this.add.text(460, y, val, K.txt(26)).setOrigin(0.5));
      c.add(K.UI.button(this, 540, y, 64, 56, '+', inc, { style: 'stone', size: 32 }));
    };
    const pct = (v) => Math.round(v * 100) + ' %';
    const ch = (k, d, lo, hi) => () => { S[k] = Math.round(K.clamp(S[k] + d, lo, hi) * 10) / 10; K.Save.persist(); K.Audio.applyVolumes(); K.Audio.sfx('gem', { vol: 0.6 }); this.build(); };
    row(190, 'Musik', pct(S.music), ch('music', -0.1, 0, 1), ch('music', 0.1, 0, 1));
    row(260, 'Geräusche', pct(S.sfx), ch('sfx', -0.1, 0, 1), ch('sfx', 0.1, 0, 1));
    row(330, 'Sprechtempo', S.rate.toFixed(1), ch('rate', -0.1, 0.6, 1.4), ch('rate', 0.1, 0.6, 1.4));
    c.add(K.UI.button(this, 320, 410, 440, 62, S.voice ? 'Vorlesen: an' : 'Vorlesen: aus', () => { S.voice = !S.voice; K.Save.persist(); if (S.voice) K.Speech.say('So klingt die Vorlesestimme.'); this.build(); }, { style: S.voice ? 'green' : 'stone', size: 26, icon: 'ic_speak' }));
    c.add(K.UI.button(this, 320, 490, 440, 62, 'Stimme testen', () => K.Speech.say('Hallo! Ich bin Kivalu. Wie viel ist sieben mal acht?', { force: true }), { style: 'blue', size: 24 }));
    c.add(this.add.text(320, 570, 'Tipp: Unter Android stellt man die Stimme in\nEinstellungen › System › Sprachen › Sprachausgabe ein.', K.txt(17, '#e8d8c0', { align: 'center' })).setOrigin(0.5));
    c.add(this.add.text(320, 640, 'Spielstände bleiben nur auf diesem Gerät.', K.txt(17, '#c8b8a8')).setOrigin(0.5));
    // Kinder rechts
    c.add(this.add.nineslice(930, 390, 'ui_panel', null, 640, 600, 36, 36, 36, 36));
    if (!ps.length) { c.add(this.add.text(930, 380, 'Noch kein Kinderprofil angelegt.', K.txt(26)).setOrigin(0.5)); return; }
    ps.forEach((p, i) => c.add(K.UI.button(this, 720 + i * 145, 130, 135, 54, p.name.slice(0, 9), () => { this.sel = p.id; this.build(); }, { style: p.id === this.sel ? 'gold' : 'stone', size: 22 })));
    const p = ps.find(x => x.id === this.sel) || ps[0]; this.sel = p.id;
    c.add(K.UI.button(this, 930, 205, 560, 58, `Stufe: ${p.stage === 'jung' ? 'Jungdrache (6–9 J.)' : 'Drachenei (4–5 J.)'}  ⇄`, () => {
      p.stage = p.stage === 'jung' ? 'ei' : 'jung'; K.Save.CATS.forEach(k => p.skill[k] = p.stage === 'jung' ? Math.max(3, p.skill[k]) : Math.min(p.skill[k], 4)); K.Save.persist(); this.build();
    }, { style: 'blue', size: 22 }));
    c.add(this.add.text(650, 262, 'Lernstand (1 leicht … 10 schwer), richtig / falsch', K.txt(18, '#e8d8c0')).setOrigin(0, 0.5));
    K.Save.CATS.forEach((k, i) => {
      const y = 300 + i * 58, st = p.stats.cat[k] || { right: 0, wrong: 0 };
      c.add(this.add.text(650, y, K.Tasks.CAT_NAMES[k], K.txt(24)).setOrigin(0, 0.5));
      c.add(K.UI.button(this, 840, y, 52, 46, '−', () => { p.skill[k] = Math.max(1, p.skill[k] - 1); K.Save.persist(); this.build(); }, { style: 'stone', size: 28 }));
      c.add(this.add.text(900, y, String(p.skill[k]), K.txt(28, '#ffd27a')).setOrigin(0.5));
      c.add(K.UI.button(this, 960, y, 52, 46, '+', () => { p.skill[k] = Math.min(10, p.skill[k] + 1); K.Save.persist(); this.build(); }, { style: 'stone', size: 28 }));
      c.add(this.add.text(1020, y, `✔ ${st.right}   ✘ ${st.wrong}`, K.txt(22, '#e8f0d8')).setOrigin(0, 0.5));
    });
    const done = K.Story.allLevels.filter(l => K.Save.levelDone(p, l.id)).length;
    c.add(this.add.text(930, 600, `${done} von ${K.Story.allLevels.length} Levels · ${p.hort.length} Schätze · ${p.coins} Glutsteine`, K.txt(20, '#e8d8c0')).setOrigin(0.5));
    c.add(K.UI.button(this, 790, 655, 280, 54, p.unlockAll ? 'Alle Level offen ✔' : 'Alle Level öffnen', () => { p.unlockAll = !p.unlockAll; K.Save.persist(); this.build(); }, { style: 'gold', size: 20 }));
    c.add(K.UI.button(this, 1080, 655, 260, 54, this.delAsk ? 'Wirklich löschen?' : 'Profil löschen', () => {
      if (!this.delAsk) { this.delAsk = true; this.build(); this.time.delayedCall(3000, () => { this.delAsk = false; if (this.c.active) this.build(); }); return; }
      this.delAsk = false; K.Save.remove(p.id); this.sel = null; this.build();
    }, { style: 'red', size: 20 }));
  }
}
