// Aufgaben-Fenster: liegt über dem Level, bis die Aufgabe gelöst ist
'use strict';
const PRAISE = ['Richtig!', 'Super gemacht!', 'Genau so!', 'Drachenstark!', 'Toll!', 'Spitze!', 'Feuerheiß gelöst!', 'Perfekt!'];
const CAT_COL = { mathe: 0xff9a3a, schreiben: 0x7ad06a, lesen: 0x6ab0ff, englisch: 0xd07aff, logik: 0xffd84a };
const CAT_ICON = { mathe: '🔢', schreiben: '✏️', lesen: '📖', englisch: '🇬🇧', logik: '🧩' };

class TaskScene extends Phaser.Scene {
  constructor() { super('Task'); }
  init(data) { this.cat = data.cat; this.why = data.why || ''; this.onDone = data.onDone; this.tries = 0; this.firstTry = true; }
  create() {
    this.p = K.Save.cur();
    this.add.rectangle(0, 0, K.W, K.H, 0x050208, 0.62).setOrigin(0);
    this.root = this.add.container(0, 0);
    K.Audio.sfx('question', { vol: 0.5 });
    // Kivalu schaut zu
    this.kiv = this.add.image(120, K.H + 10, 'pt_kivalu_idle').setOrigin(0.5, 1).setDepth(5); this.kiv.setScale(330 / this.kiv.height);
    this.tweens.add({ targets: this.kiv, y: K.H - 4, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.backH = () => {}; K.events.on('back', this.backH);
    this.events.once('shutdown', () => K.events.off('back', this.backH));
    this.newTask();
  }
  newTask() {
    this.task = K.Tasks.make(this.cat, this.p);
    this.build();
  }
  clear() { this.root.removeAll(true); this.locked = false; }

  build() {
    this.clear();
    const t = this.task, R = this.root;
    const px = 730, pw = 1040;
    const panel = this.add.nineslice(px, K.H / 2 + 6, 'ui_parch', null, pw, 660, 40, 40, 40, 40); R.add(panel);
    panel.setScale(0.9); this.tweens.add({ targets: panel, scale: 1, duration: 220, ease: 'Back.easeOut' });
    // Kopf: Kategorie
    const chip = this.add.nineslice(px - pw / 2 + 120, 58, 'ui_btn_white', null, 190, 46, 20, 20, 20, 20).setTint(CAT_COL[this.cat] || 0xffffff); R.add(chip);
    R.add(this.add.text(chip.x, 58, `${CAT_ICON[this.cat] || ''} ${K.Tasks.CAT_NAMES[this.cat]}`, K.txt(24, '#3a1a00', { strokeThickness: 0 })).setOrigin(0.5));
    if (this.why && !this.tries) R.add(this.add.text(px - pw / 2 + 240, 58, this.why, K.txt(19, '#6a4020', { strokeThickness: 0, wordWrap: { width: 640 } })).setOrigin(0, 0.5));
    // Hilfen
    this.eyeBtn = this.helpBtn(px + pw / 2 - 170, 58, 'ic_eye', this.p.eyes, () => this.useEye());
    this.featherInfo = this.helpBtn(px + pw / 2 - 70, 58, 'ic_feather', this.p.feathers, null);
    // Vorlesen
    R.add(K.UI.roundBtn(this, px - pw / 2 + 60, 128, 32, 'ic_speak', () => this.speakTask(true), { style: 'gold' }));
    // Frage
    const story = t.visual && t.visual.type === 'story';
    const pr = this.add.text(px - pw / 2 + 110, 128, t.prompt, K.txt(t.prompt.length > 90 ? 25 : 30, '#2a1206', { strokeThickness: 0, wordWrap: { width: pw - 180 }, lineSpacing: 2 })).setOrigin(0, 0.5);
    R.add(pr);
    let y = 128 + pr.height / 2 + 20;
    // Bild / Text
    if (t.visual) y = this.drawVisual(t.visual, px, y, pw);
    this.ansTop = Math.max(y + 16, story ? 0 : 330);
    if (t.kind === 'choice') this.buildChoice(px, pw);
    else if (t.kind === 'keypad') this.buildKeypad(px, pw);
    else if (t.kind === 'tiles') this.buildTiles(px, pw);
    else if (t.kind === 'order') this.buildOrder(px, pw);
    this.time.delayedCall(250, () => this.speakTask());
  }
  helpBtn(x, y, icon, n, onClick) {
    const c = this.add.container(x, y); this.root.add(c);
    c.add(this.add.image(0, 0, 'ui_round_glass').setDisplaySize(64, 64));
    c.add(this.add.image(0, 0, icon).setDisplaySize(42, 42));
    const t = this.add.text(22, 20, String(n), K.txt(22)).setOrigin(0.5); c.add(t); c.n = t;
    if (onClick) { c.setSize(64, 64).setInteractive({ useHandCursor: true }); c.on('pointerup', onClick); }
    if (!n) c.setAlpha(0.45);
    return c;
  }
  drawVisual(v, px, y, pw) {
    const R = this.root; const y0g = (yy) => yy + 14;
    if (v.type === 'emoji' && v.text.split(/\s{3,}/).length > 1) {
      // Gruppen (z. B. Truhen mit Schlüsseln) als eigene Kästchen zeigen, damit man sie zählen kann
      const groups = v.text.split(/\s{3,}/); const n = groups.length;
      const maxLen = Math.max(...groups.map(g => [...g].length));
      const size = maxLen > 6 ? 30 : maxLen > 4 ? 36 : 44;
      const texts = groups.map(g => this.add.text(0, 0, g, { fontSize: size + 'px', padding: { top: 6, bottom: 6 } }).setOrigin(0.5));
      const bw = Math.max(90, ...texts.map(t => t.width)) + 30, bh = size + 34;
      const perRow = Math.max(1, Math.min(n, Math.floor((pw - 120) / (bw + 16))));
      const rows = Math.ceil(n / perRow);
      texts.forEach((t, i) => {
        const r = Math.floor(i / perRow), c = i % perRow, inRow = Math.min(perRow, n - r * perRow);
        const gx = px + (c - (inRow - 1) / 2) * (bw + 16), gy = y0g(y) + r * (bh + 14) + bh / 2;
        R.add(this.add.nineslice(gx, gy, 'ui_btn_white', null, bw, bh, 22, 22, 22, 22).setTint(0xffe8c0));
        t.setPosition(gx, gy); R.add(t);
      });
      return y0g(y) + rows * (bh + 14);
    }
    if (v.type === 'emoji') {
      const len = [...v.text].length;
      const size = len > 24 ? 40 : len > 14 ? 50 : len > 6 ? 62 : 84;
      const tx = this.add.text(px, y + 10, v.text, { fontSize: size + 'px', align: 'center', wordWrap: { width: pw - 120 }, lineSpacing: 6, padding: { top: 8, bottom: 8 } }).setOrigin(0.5, 0); R.add(tx);
      return y + 10 + tx.height;
    }
    if (v.type === 'text' || v.type === 'grid') {
      const grid = v.type === 'grid';
      const size = grid ? 46 : v.text.length > 60 ? 30 : v.text.length > 26 ? 38 : 54;
      const tx = this.add.text(px, y + 28, v.text, K.txt(size, '#1a0c04', { strokeThickness: 0, align: 'center', wordWrap: { width: pw - 200 }, lineSpacing: grid ? 10 : 4, padding: { top: 6, bottom: 6 } })).setOrigin(0.5, 0);
      const bw = Math.min(pw - 120, tx.width + 80), bh = tx.height + 34;
      const box = this.add.nineslice(px, y + 28 + tx.height / 2, 'ui_btn_white', null, bw, bh, 24, 24, 24, 24); R.add(box); R.add(tx);
      return y + 28 + bh;
    }
    if (v.type === 'story') {
      const tx = this.add.text(px - pw / 2 + 90, y + 10, v.text, K.txt(25, '#1a0c04', { strokeThickness: 0, wordWrap: { width: pw - 180 }, lineSpacing: 6 })); R.add(tx);
      const q = this.add.text(px - pw / 2 + 90, y + 24 + tx.height, v.question, K.txt(27, '#8a2a00', { strokeThickness: 0, wordWrap: { width: pw - 180 } })); R.add(q);
      return y + 30 + tx.height + q.height;
    }
    return y;
  }
  speakTask(force) {
    const t = this.task; const parts = [];
    if (!t.noSpeak) parts.push(t.speak || t.prompt);
    if (t.visual && !t.noSpeakVisual && !t.speakEnQ && t.visual.type !== 'emoji' && t.visual.type !== 'grid') parts.push(t.visual.text);
    if (t.visual && t.visual.type === 'story' && !t.noSpeakVisual) parts.push(t.visual.question);
    const de = parts.join(' ').replace(/\?\s*$/, '?');
    (async () => {
      if (de) await K.Speech.say(de, { force });
      if (t.speakEn) await K.Speech.say(t.speakEn, { lang: 'en-GB', force });
      if (t.speakEnQ) await K.Speech.say(t.speakEnQ, { lang: 'en-GB', force });
    })();
  }

  // ---------- Antwortformen ----------
  optBtn(x, y, w, h, label, size, onClick) {
    const c = this.add.container(x, y); this.root.add(c);
    c.bg = this.add.nineslice(0, 0, 'ui_btn_white', null, w, h, 26, 26, 26, 26); c.add(c.bg);
    c.t = this.add.text(0, 0, label, Object.assign(K.txt(size, '#2a1206', { strokeThickness: 0, align: 'center', wordWrap: { width: w - 30 } }), { padding: { top: 6, bottom: 6 } })).setOrigin(0.5); c.add(c.t);
    if (c.t.width > w - 20) c.t.setScale((w - 20) / c.t.width);
    c.setSize(w, h).setInteractive({ useHandCursor: true });
    c.on('pointerdown', () => { if (!this.locked && !c.blocked) c.setScale(0.95); });
    c.on('pointerout', () => c.setScale(1));
    c.on('pointerup', () => { c.setScale(1); if (!this.locked && !c.blocked) { K.Audio.sfx('tap', { vol: 0.5 }); onClick(c); } });
    c.paint = (style) => { const nb = this.add.nineslice(0, 0, 'ui_btn_' + style, null, w, h, 26, 26, 26, 26); c.replace(c.bg, nb, true); c.bg = nb; };
    return c;
  }
  buildChoice(px, pw) {
    const t = this.task, n = t.options.length;
    const opts = t.options;
    const maxLen = Math.max(...opts.map(o => [...o].length));
    const isEmoji = t.big || /^[\p{Extended_Pictographic}‍️\s]+$/u.test(opts.join(''));
    let cols = n, w, h, size;
    if (t.small || maxLen > 18) { cols = n > 3 ? 2 : 1; w = cols === 1 ? 820 : 470; h = 74; size = 25; }
    else if (isEmoji) { w = Math.min(230, (pw - 140) / n - 20); h = 150; size = maxLen > 8 ? 30 : maxLen > 4 ? 40 : maxLen > 2 ? 54 : 72; }
    else { w = Math.min(240, (pw - 140) / n - 20); h = 110; size = maxLen > 9 ? 28 : maxLen > 5 ? 36 : 48; }
    const rows = Math.ceil(n / cols);
    const avail = 660 - this.ansTop; const gap = 18;
    h = Math.min(h, (avail - (rows - 1) * gap) / rows);
    this.opts = [];
    opts.forEach((o, i) => {
      const r = Math.floor(i / cols), c = i % cols, inRow = Math.min(cols, n - r * cols);
      const x = px + (c - (inRow - 1) / 2) * (w + 22), y = this.ansTop + h / 2 + r * (h + gap);
      const b = this.optBtn(x, y, w, h, o, size, (btn) => this.answer(o === t.answer, btn));
      b.val = o; this.opts.push(b);
      b.setAlpha(0); this.tweens.add({ targets: b, alpha: 1, duration: 200, delay: 60 * i });
    });
  }
  buildKeypad(px, pw) {
    const t = this.task; this.typed = '';
    const y0 = this.ansTop;
    const disp = this.add.nineslice(px, y0 + 40, 'ui_btn_white', null, 240, 80, 24, 24, 24, 24); this.root.add(disp);
    this.dispT = this.add.text(px, y0 + 40, '?', K.txt(52, '#1a0c04', { strokeThickness: 0 })).setOrigin(0.5); this.root.add(this.dispT);
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '⌫', '✓'];
    const kw = 120, kh = Math.min(86, (660 - (y0 + 100) - 14) / 2);
    keys.forEach((k, i) => {
      const r = Math.floor(i / 6), c = i % 6;
      const x = px + (c - 2.5) * (kw + 14), y = y0 + 100 + kh / 2 + r * (kh + 14);
      const b = this.optBtn(x, y, kw, kh, k, 44, () => {
        if (k === '⌫') this.typed = this.typed.slice(0, -1);
        else if (k === '✓') { if (this.typed) this.answer(Number(this.typed) === Number(t.answer), disp); return; }
        else if (this.typed.length < 4) this.typed += k;
        this.dispT.setText(this.typed || '?');
      });
      if (k === '✓') b.paint('green'); if (k === '⌫') b.paint('gold');
    });
    this.keyH = (e) => { if (this.locked) return; if (/^[0-9]$/.test(e.key) && this.typed.length < 4) this.typed += e.key; else if (e.key === 'Backspace') this.typed = this.typed.slice(0, -1); else if (e.key === 'Enter' && this.typed) return this.answer(Number(this.typed) === Number(t.answer), disp); this.dispT.setText(this.typed || '?'); };
    this.input.keyboard.off('keydown'); this.input.keyboard.on('keydown', this.keyH);
  }
  buildTiles(px, pw) {
    const t = this.task; const ans = String(t.answer); const n = [...ans].length;
    const sw = Math.min(84, (pw - 160) / n - 10), y0 = this.ansTop + 50;
    this.slots = []; this.placed = [];
    for (let i = 0; i < n; i++) {
      const x = px + (i - (n - 1) / 2) * (sw + 10);
      const s = this.add.nineslice(x, y0, 'ui_btn_stone', null, sw, sw + 10, 20, 20, 20, 20).setAlpha(0.6); this.root.add(s);
      if (t.showTarget) this.root.add(this.add.text(x, y0, ans[i], K.txt(40, '#ffffff', { strokeThickness: 0 })).setOrigin(0.5).setAlpha(0.22));
      this.slots.push({ x, y: y0, tile: null });
    }
    const L = t.letters; const tw = Math.min(90, (pw - 120) / L.length - 12);
    this.tiles = L.map((ch, i) => {
      const x = px + (i - (L.length - 1) / 2) * (tw + 12), y = y0 + 150;
      const b = this.optBtn(x, y, tw, tw + 10, ch, 42, (btn) => this.tapTile(btn));
      b.home = { x, y }; b.ch = ch; b.slot = -1; b.paint('gold'); return b;
    });
    const ok = this.optBtn(px, y0 + 270, 220, 70, '✓ Fertig', 30, () => this.checkTiles()); ok.paint('green'); this.okBtn = ok;
  }
  tapTile(b) {
    if (b.slot >= 0) { this.slots[b.slot].tile = null; b.slot = -1; this.tweens.add({ targets: b, x: b.home.x, y: b.home.y, duration: 150 }); return; }
    const i = this.slots.findIndex(s => !s.tile); if (i < 0) return;
    this.slots[i].tile = b; b.slot = i; this.root.bringToTop(b);
    this.tweens.add({ targets: b, x: this.slots[i].x, y: this.slots[i].y, duration: 150 });
    if (this.slots.every(s => s.tile)) this.time.delayedCall(250, () => this.checkTiles());
  }
  checkTiles() {
    if (this.locked || !this.slots.every(s => s.tile)) return;
    const word = this.slots.map(s => s.tile.ch).join('');
    this.answer(word === String(this.task.answer), this.okBtn);
  }
  buildOrder(px, pw) {
    const t = this.task; const items = t.items; const y0 = this.ansTop + 40;
    this.line = []; this.lineY = y0;
    const line = this.add.nineslice(px, y0, 'ui_btn_stone', null, pw - 120, 86, 20, 20, 20, 20).setAlpha(0.5); this.root.add(line);
    const widths = items.map(it => Math.max(100, it.t.length * 19 + 40));
    const total = widths.reduce((a, b) => a + b + 14, -14); let x = px - total / 2;
    this.chips = items.map((it, i) => {
      const w = widths[i]; const b = this.optBtn(x + w / 2, y0 + 140, w, 70, it.t, 30, (btn) => this.tapChip(btn)); x += w + 14;
      b.home = { x: b.x, y: b.y }; b.w = w; b.item = it; b.paint('gold'); b.inLine = false; return b;
    });
  }
  layoutLine(px) {
    const total = this.line.reduce((a, b) => a + b.w + 10, -10); let x = 730 - total / 2;
    this.line.forEach(b => { this.tweens.add({ targets: b, x: x + b.w / 2, y: this.lineY, duration: 150 }); x += b.w + 10; });
  }
  tapChip(b) {
    if (b.inLine) { this.line = this.line.filter(x => x !== b); b.inLine = false; this.tweens.add({ targets: b, x: b.home.x, y: b.home.y, duration: 150 }); this.layoutLine(); return; }
    this.line.push(b); b.inLine = true; this.layoutLine();
    if (this.line.length === this.chips.length) this.time.delayedCall(300, () => this.answer(this.line.map(c => c.item.t).join(' ') === this.task.answer, this.line[this.line.length - 1]));
  }

  // ---------- Hilfen ----------
  useEye() {
    if (this.locked || this.usedEye) return;
    if (!this.p.eyes) { K.UI.toast(this, 'Kein Eulenauge mehr. Sammle neue im Level!', { size: 26, y: 690 }); return; }
    const t = this.task; this.usedEye = true; this.p.eyes--; K.Save.persist(); this.eyeBtn.n.setText(String(this.p.eyes)); if (!this.p.eyes) this.eyeBtn.setAlpha(0.45);
    K.Audio.sfx('shimmer', { vol: 0.5 });
    if (t.kind === 'choice') {
      const wrong = K.shuffle(this.opts.filter(o => o.val !== t.answer)); const k = Math.max(1, Math.floor(wrong.length / 2));
      wrong.slice(0, k).forEach(o => { o.blocked = true; this.tweens.add({ targets: o, alpha: 0.25, duration: 300 }); });
    } else if (t.kind === 'keypad') {
      const a = Number(t.answer), lo = Math.max(0, a - K.irnd(1, 3)), hi = lo + K.irnd(3, 5);
      K.UI.toast(this, `Tipp: Die Zahl liegt zwischen ${lo} und ${hi}.`, { size: 30, y: 690, ms: 4000 }); K.Speech.say(`Die Zahl liegt zwischen ${lo} und ${hi}.`);
    } else if (t.kind === 'tiles') {
      // die ersten richtigen Buchstaben einsetzen
      this.slots.forEach(s => { if (s.tile) this.tapTile(s.tile); });
      const ans = String(t.answer); const k = Math.max(1, Math.floor(ans.length / 2));
      for (let i = 0; i < k; i++) { const b = this.tiles.find(x => x.slot < 0 && x.ch === ans[i]); if (b) { this.tapTile(b); b.blocked = true; } }
    } else if (t.kind === 'order') {
      this.line.slice().forEach(b => this.tapChip(b));
      const first = t.answer.split(' ')[0]; const b = this.chips.find(c => c.item.t === first); if (b) { this.tapChip(b); b.blocked = true; }
    }
  }

  // ---------- Auswertung ----------
  answer(ok, btn) {
    if (this.locked) return; this.locked = true;
    const first = this.firstTry && this.tries === 0;
    K.Save.recordAnswer(this.p, this.cat, ok, first);
    if (ok) return this.right(btn);
    this.tries++; this.firstTry = false;
    K.Audio.sfx('wrong', { vol: 0.5 }); K.Speech.stop();
    if (btn && btn.paint) btn.paint('red');
    this.tweens.add({ targets: btn, x: btn.x + 10, duration: 50, yoyo: true, repeat: 3 });
    this.kiv.setTexture('pt_kivalu_sad'); this.kiv.setScale(330 / this.kiv.height);
    if (this.p.feathers > 0) {
      this.p.feathers--; K.Save.persist(); this.featherInfo.n.setText(String(this.p.feathers)); if (!this.p.feathers) this.featherInfo.setAlpha(0.45);
      const msg = 'Nicht ganz. Die Phönixfeder schenkt dir noch einen Versuch!';
      K.UI.toast(this, '🪶 ' + msg, { size: 28, y: 690, ms: 2400 }); K.Speech.say(msg);
      this.time.delayedCall(900, () => {
        this.locked = false; this.kiv.setTexture('pt_kivalu_idle'); this.kiv.setScale(330 / this.kiv.height);
        const t = this.task;
        if (t.kind === 'choice') { btn.blocked = true; btn.setAlpha(0.3); }
        else if (t.kind === 'keypad') { this.typed = ''; this.dispT.setText('?'); }
        else if (t.kind === 'tiles') { this.slots.forEach(s => { if (s.tile && !s.tile.blocked) this.tapTile(s.tile); }); btn.paint('green'); }
        else if (t.kind === 'order') { this.line.filter(b => !b.blocked).forEach(b => this.tapChip(b)); this.chips.forEach(c => c.paint('gold')); }
      });
    } else this.showSolution();
  }
  showSolution() {
    const t = this.task;
    if (t.kind === 'choice') this.opts.forEach(o => { if (o.val === t.answer) o.paint('green'); });
    const c = this.add.container(730, K.H / 2).setDepth(20).setAlpha(0); this.root.add(c);
    c.add(this.add.rectangle(0, 0, 1040, 660, 0x000000, 0.25));
    c.add(this.add.nineslice(0, 0, 'ui_panel', null, 760, 340, 36, 36, 36, 36));
    c.add(this.add.text(0, -120, 'Schau mal:', K.txt(32, '#ffd27a')).setOrigin(0.5));
    const sol = t.explain || `Die Lösung ist ${t.answer}.`;
    c.add(this.add.text(0, -30, sol, K.txt(30, '#fff6e0', { wordWrap: { width: 680 }, align: 'center' })).setOrigin(0.5));
    c.add(K.UI.button(this, 0, 110, 340, 76, 'Neue Aufgabe', () => this.newTask(), { style: 'green', size: 30 }));
    this.tweens.add({ targets: c, alpha: 1, duration: 300, delay: t.kind === 'choice' ? 700 : 300 });
    this.time.delayedCall(400, () => K.Speech.say('Schau mal. ' + sol + ' Probier eine neue Aufgabe!'));
    this.kiv.setTexture('pt_kivalu_idle'); this.kiv.setScale(330 / this.kiv.height);
  }
  right(btn) {
    K.Audio.sfx('right', { vol: 0.6 }); K.Speech.stop();
    if (btn && btn.paint) btn.paint('green');
    if (this.task.kind === 'tiles') this.slots.forEach(s => s.tile && s.tile.paint('green'));
    if (this.task.kind === 'order') this.line.forEach(b => b.paint('green'));
    const x = btn ? btn.x : 730, y = btn ? btn.y : 400;
    const em = this.add.particles(0, 0, 'p_spark', { speed: { min: 150, max: 450 }, scale: { start: 1.2, end: 0 }, lifespan: 900, gravityY: 300, blendMode: 'ADD', emitting: false }).setDepth(30);
    em.explode(40, x, y);
    const st = this.add.particles(0, 0, 'ic_star', { speed: { min: 120, max: 320 }, scale: { start: 0.45, end: 0.1 }, rotate: { min: 0, max: 360 }, lifespan: 1100, gravityY: 400, emitting: false }).setDepth(30); st.explode(12, x, y);
    const word = K.pick(PRAISE);
    const tx = this.add.text(730, 360, word, K.title(80, '#ffd27a')).setOrigin(0.5).setDepth(31).setScale(0.3);
    this.tweens.add({ targets: tx, scale: 1, duration: 400, ease: 'Back.easeOut' });
    this.kiv.setTexture('pt_kivalu_cheer'); this.kiv.setScale(330 / this.kiv.height);
    this.tweens.add({ targets: this.kiv, y: K.H - 40, duration: 180, yoyo: true, repeat: 1 });
    K.Speech.say(word);
    this.time.delayedCall(1500, () => {
      this.input.keyboard.off('keydown');
      const cb = this.onDone; this.scene.stop(); this.scene.resume('Level');
      cb && cb({ firstTry: this.tries === 0, tries: this.tries });
    });
  }
}
