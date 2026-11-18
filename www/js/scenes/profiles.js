// Titelbild und Auswahl des Kinder-Profils
'use strict';
K.bgScene = (scene, w, opt = {}) => {
  const bg = K.Art.makeBackground(scene, w);
  const objs = [];
  objs.push(scene.add.image(0, 0, bg.sky).setOrigin(0).setDisplaySize(K.W, K.H).setScrollFactor(0));
  const ts = (key, sf, y = 0) => { const t = scene.add.tileSprite(0, y, K.W, K.H, key).setOrigin(0).setScrollFactor(0); t.sf = sf; objs.push(t); return t; };
  ts(bg.deco, 0.05); ts(bg.far, 0.15); ts(bg.mid, 0.35); ts(bg.fog, 0.5); ts(bg.near, 0.6);
  objs.update = (camX) => objs.forEach(o => { if (o.sf != null) o.tilePositionX = camX * o.sf; });
  return objs;
};
K.particlesFor = (scene, w, depth = 50) => {
  const cfg = {
    1: { tex: 'p_ember', speedY: { min: -60, max: -20 }, speedX: { min: -20, max: 20 }, scale: { start: 1.2, end: 0.2 }, alpha: { start: 1, end: 0 }, lifespan: 5000, freq: 120, blend: 'ADD', y: K.H + 10 },
    2: { tex: 'p_spore', speedY: { min: -10, max: 10 }, speedX: { min: 5, max: 25 }, scale: { start: 0.9, end: 0.3 }, alpha: { start: 0.8, end: 0 }, lifespan: 7000, freq: 260, blend: 'ADD', y: 'any' },
    3: { tex: 'p_snow', speedY: { min: 40, max: 90 }, speedX: { min: -30, max: 10 }, scale: { min: 0.3, max: 0.8 }, alpha: { start: 0.9, end: 0.6 }, lifespan: 9000, freq: 60, y: -10 },
    4: { tex: 'p_dust', speedY: { min: -5, max: 15 }, speedX: { min: -10, max: 10 }, scale: { start: 0.8, end: 0.2 }, alpha: { start: 0.6, end: 0 }, lifespan: 6000, freq: 200, blend: 'ADD', y: 'any' },
    5: { tex: 'p_rain', speedY: { min: 700, max: 900 }, speedX: { min: -160, max: -120 }, scale: 1, alpha: 0.5, lifespan: 1200, freq: 12, y: -30 },
    6: { tex: 'p_steam', speedY: { min: -40, max: -15 }, speedX: { min: 5, max: 20 }, scale: { start: 0.6, end: 2.2 }, alpha: { start: 0.25, end: 0 }, lifespan: 6000, freq: 300, y: K.H + 20 },
    7: { tex: 'p_steam', speedY: { min: -6, max: 6 }, speedX: { min: -70, max: -40 }, scale: { start: 2.4, end: 3.5 }, alpha: { start: 0.18, end: 0 }, lifespan: 9000, freq: 260, y: 'any' },
  }[w];
  if (!cfg) return null;
  const e = scene.add.particles(0, 0, cfg.tex, {
    x: { min: -50, max: K.W + 150 }, y: cfg.y === 'any' ? { min: 0, max: K.H } : cfg.y, speedX: cfg.speedX, speedY: cfg.speedY, scale: cfg.scale, alpha: cfg.alpha,
    lifespan: cfg.lifespan, frequency: cfg.freq, blendMode: cfg.blend || 'NORMAL', rotate: w === 5 ? 10 : 0,
  }).setScrollFactor(0).setDepth(depth);
  return e;
};

class ProfilesScene extends Phaser.Scene {
  constructor() { super('Profiles'); }
  create() {
    K.Speech.stop();
    const bg = K.bgScene(this, 1); this.bgObjs = bg; this.camX = 0;
    K.particlesFor(this, 1, 5);
    K.Audio.music('title');
    // Titel
    this.add.image(K.W * 0.78, K.H - 40, 'pt_kivalu_proud').setOrigin(0.5, 1).setScale(1.25).setDepth(6);
    this.add.text(K.W * 0.34, 92, 'Kivalu', K.logo(104)).setOrigin(0.5).setDepth(7);
    this.add.text(K.W * 0.34, 172, 'und die gestohlene Herzglut', K.txt(34, '#ffe9c4')).setOrigin(0.5).setDepth(7);
    // Profilkarten
    const ps = K.Save.data.profiles;
    const y0 = 270;
    this.add.text(K.W * 0.34, y0 - 34, ps.length ? 'Wer spielt?' : 'Willkommen! Wer spielt?', K.txt(30, '#fff3c0')).setOrigin(0.5).setDepth(7);
    ps.slice(0, 4).forEach((p, i) => this.card(p, K.W * 0.34, y0 + 30 + i * 96));
    if (ps.length < 4) K.UI.button(this, K.W * 0.34, y0 + 30 + ps.length * 96, 420, 80, '+ Neues Kind', () => this.newProfile(), { style: 'green', size: 32 }).setDepth(7);
    K.UI.roundBtn(this, K.W - 54, 52, 34, 'ic_gear', () => this.scene.start('Parents'), { style: 'stone' }).setDepth(8);
    this.add.text(16, K.H - 26, 'Für Eltern: Zahnrad oben rechts', K.txt(16, '#d8c0a0', { strokeThickness: 3 })).setDepth(8).setAlpha(0.8);
  }
  card(p, x, y) {
    const c = this.add.container(x, y).setDepth(7);
    const bg = this.add.nineslice(0, 0, 'ui_panel', null, 420, 84, 30, 30, 30, 30); c.add(bg);
    const k = K.makeKivalu(this, -170, 36, p, 0.32); c.add(k); if (k.hat) c.add(k.hat); k.playAnim('idle');
    c.add(this.add.text(-120, -14, p.name, K.txt(32)).setOrigin(0, 0.5));
    const ch = K.Story.progressLabel(p);
    c.add(this.add.text(-120, 20, (p.stage === 'jung' ? 'Jungdrache' : 'Drachenei') + ' · ' + ch, K.txt(18, '#f0d8a8', { strokeThickness: 3 })).setOrigin(0, 0.5));
    c.add(this.add.image(150, 0, 'ic_gem').setDisplaySize(34, 34));
    c.add(this.add.text(172, 0, String(p.coins), K.txt(24)).setOrigin(0, 0.5));
    c.setSize(420, 84).setInteractive({ useHandCursor: true });
    c.on('pointerdown', () => c.setScale(0.96));
    c.on('pointerout', () => c.setScale(1));
    c.on('pointerup', () => { c.setScale(1); K.Audio.sfx('tap'); K.Save.select(p.id); this.startGame(p); });
  }
  startGame(p) {
    K.Audio.ensure();
    if (!p.seen.prolog) { this.scene.start('Cutscene', { id: 'prolog', next: { scene: 'Map' } }); }
    else this.scene.start('Map');
  }
  newProfile() {
    K.askText('Wie heißt das Kind?', '', (name) => {
      if (!name) return;
      this.chooseStage(name.trim().slice(0, 14));
    });
  }
  chooseStage(name) {
    const ov = this.add.container(0, 0).setDepth(100);
    ov.add(this.add.rectangle(0, 0, K.W, K.H, 0x000000, 0.65).setOrigin(0).setInteractive());
    ov.add(K.UI.panel(this, K.W / 2, K.H / 2, 980, 520));
    ov.add(this.add.text(K.W / 2, 150, `Welche Stufe passt für ${name}?`, K.txt(38)).setOrigin(0.5));
    const opt = (x, title, emoji, lines, stage) => {
      const b = K.UI.button(this, x, 380, 420, 300, '', () => { const p = K.Save.create(name, stage); ov.destroy(); this.startGame(p); }, { style: stage === 'jung' ? 'blue' : 'gold' });
      b.add(this.add.text(0, -100, emoji, { fontSize: '72px' }).setOrigin(0.5));
      b.add(this.add.text(0, -30, title, K.txt(36, '#3a1a00', { strokeThickness: 0 })).setOrigin(0.5));
      b.add(this.add.text(0, 50, lines, K.txt(21, '#3a1a00', { strokeThickness: 0, align: 'center', wordWrap: { width: 380 } })).setOrigin(0.5));
      ov.add(b);
    };
    opt(K.W / 2 - 230, 'Drachenei', '🥚', '4 bis 5 Jahre\nZählen, Buchstaben finden, Reime, erste englische Wörter. Alles wird vorgelesen.', 'ei');
    opt(K.W / 2 + 230, 'Jungdrache', '🐉', '6 bis 9 Jahre\nPlus, Minus, Einmaleins, Diktat, Texte lesen, Englisch und Logik. Wird schwerer, je besser es klappt.', 'jung');
    ov.add(this.add.text(K.W / 2, 600, 'Später im Elternbereich änderbar', K.txt(20, '#e8d0a0')).setOrigin(0.5));
  }
  update(t, dt) { this.camX += dt * 0.02; this.bgObjs.update(this.camX); }
}

// Einfaches Texteingabefeld (für Namen) als HTML über dem Spiel
K.askText = (label, value, cb) => {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:20;font-family:Fredoka,Arial,sans-serif';
  wrap.innerHTML = `<div style="background:#2b1a30;border:4px solid #e8b25a;border-radius:24px;padding:28px 32px;min-width:300px;max-width:90vw;text-align:center;color:#fff3dd">
    <div style="font-size:26px;font-weight:600;margin-bottom:16px">${label}</div>
    <input id="kq" maxlength="14" autocomplete="off" style="font-size:30px;padding:10px 14px;border-radius:12px;border:3px solid #e8b25a;width:80%;text-align:center;font-family:inherit" value="${value || ''}">
    <div style="margin-top:20px;display:flex;gap:14px;justify-content:center">
      <button id="kc" style="font-size:22px;padding:10px 22px;border-radius:14px;border:0;background:#6d5a72;color:#fff;font-family:inherit">Abbrechen</button>
      <button id="ko" style="font-size:22px;padding:10px 26px;border-radius:14px;border:0;background:#f0a92c;color:#3a1a00;font-weight:700;font-family:inherit">OK</button></div></div>`;
  document.body.appendChild(wrap);
  const inp = wrap.querySelector('#kq'); setTimeout(() => inp.focus(), 50);
  const done = (v) => { wrap.remove(); cb(v); };
  wrap.querySelector('#ko').onclick = () => done(inp.value.trim());
  wrap.querySelector('#kc').onclick = () => done(null);
  inp.onkeydown = (e) => { if (e.key === 'Enter') done(inp.value.trim()); };
};
