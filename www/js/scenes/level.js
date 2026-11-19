// Das eigentliche Jump-and-Run: Kivalu läuft, springt, spuckt Feuer, Tore verlangen Aufgaben
'use strict';
K.TREASURES = [
  ['1-1', 't_rubin', 'Feuerrubin'], ['1-2', 't_muenzen', 'Drachengold'], ['1-3', 't_schluessel', 'Ketterichs Schlüssel'],
  ['2-1', 't_smaragd', 'Waldsmaragd'], ['2-2', 't_flasche', 'Moortrank'], ['2-3', 't_urne', 'Alte Baumurne'],
  ['3-1', 't_saphir', 'Eissaphir'], ['3-2', 't_kugel_silber', 'Frostkugel'], ['3-3', 't_stern', 'Polarstern'],
  ['4-1', 't_laterne', 'Zwergenlaterne'], ['4-2', 't_hammer', 'Zwergenhammer'], ['4-3', 'crystal_red', 'Feuerkristall'],
  ['5-1', 't_amethyst', 'Sturmamethyst'], ['5-2', 't_kugel', 'Blitzkugel'], ['5-3', 't_truhe', 'Piratentruhe'],
  ['6-1', 't_zahnrad', 'Goldenes Zahnrad'], ['6-2', 't_kelch', 'Goldkelch'], ['6-3', 't_herz', 'Herzstein'],
  ['7-1', 't_ei', 'Drachenei'], ['7-2', 't_ei2', 'Goldenes Drachenei'],
].map(([lv, key, name]) => ({ lv, key, name }));
K.treasureFor = (id) => K.TREASURES.find(t => t.lv === id);

K.DECO = {
  1: { back: ['w1_column', 'w1_obelisk', 'w1_rock2', 'w1_rock0'], front: ['w1_rock1', 'w1_rock3', 'w1_rock4', 'w1_rock5', 'w1_skull', 'w1_brazier'] },
  2: { back: ['w2_tree0', 'w2_tree1', 'w2_tree2', 'w2_tree3', 'w2_tree4', 'w2_crooked', 'w2_mushroom_big'], front: ['w2_mushroom_group', 'w2_mushroom_tan', 'w2_stump', 'w2_log', 'w2_bush', 'w2_grass', 'w2_moss'] },
  3: { back: ['w3_pine', 'w3_pine2', 'w3_tree'], front: ['w3_rocks', 'w3_snowpile', 'w3_snowman'] },
  4: { back: ['w4_support', 'w4_structure', 'w4_column'], front: ['w4_barrel', 'w4_rocks', 'w4_anvil', 'w4_pickaxe', 'w4_crates', 'crystal_blue', 'crystal_red'] },
  5: { back: ['w5_palm', 'w5_palm2', 'w5_wreck', 'w5_tower'], front: ['w5_rocks', 'w5_crate', 'w5_barrel', 'w5_cannon'] },
  6: { back: ['w6_crane', 'w6_hopper', 'w6_machine', 'w6_robotarm'], front: ['w6_cog0', 'w6_cog1', 'w6_cog2', 'w6_pipe', 'w6_screen', 'w6_box', 'w6_warning'] },
  7: { back: ['w7_mast', 'w7_flag'], front: ['w7_cannon', 'barrel'] },
};
// Flüssigkeit je Welt (Gefahr „L“)
const LIQ = { 1: 'lava', 2: 'swamp', 3: 'water', 4: 'lava', 5: 'water', 6: 'lava', 7: null };

class LevelScene extends Phaser.Scene {
  constructor() { super('Level'); }
  init(data) { this.lvId = data.id; }
  create() {
    const p = this.p = K.Save.cur(); if (!p) return this.scene.start('Profiles');
    K.Speech.stop();
    const L = this.L = K.Levels.build(this.lvId, p);
    this.lv = L.lv; this.chap = K.Story.chapter(this.lv.ch); this.w = this.lv.ch; this.mode = L.mode;
    this.grid = L.grid; this.rows = 12; this.cols = this.grid[0].length;
    this.WW = this.cols * K.TILE; this.WH = this.rows * K.TILE;
    this.ab = K.Save.abilities(p);
    this.maxHearts = p.stage === 'jung' ? 4 : 5; this.hearts = this.maxHearts;
    this.gems = 0; this.maxGems = 0; this.found = []; this.gateIdx = 0; this.busy = false; this.paused = false;
    this.deaths = 0; this.t0 = Date.now();

    this.cameras.main.setBackgroundColor('#000');
    this.cameras.main.fadeIn(400);
    this.bg = K.bgScene(this, this.w);
    this.bg.forEach(o => o.setDepth(0));
    const pe = K.particlesFor(this, this.w, 30);

    this.physics.world.setBounds(0, -600, this.WW, this.WH + 1200);
    this.physics.world.setBoundsCollision(true, true, false, false);
    this.buildCollision();
    this.terr = new Map();
    this.objects();
    this.decorate();
    this.makePlayer();
    this.controls();
    this.makeHud();

    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.WW, this.WH);
    cam.startFollow(this.pl, true, 0.12, 0.1, -120, 30);
    cam.setDeadzone(80, 120);
    this.updateTerrain(true);

    // Musik
    K.Audio.music(this.mode === 'boss' ? 'boss' : this.chap.music);
    K.Audio.ambient(this.chap.amb || null);
    K.Audio.sfx('j_start', { vol: 0.6 });
    this.banner(`${this.lv.id}  ${this.lv.name}`, this.mode === 'fly' ? 'Fliege mit ▲ ▼ durch den Sturm!' : this.mode === 'cart' ? 'Die Lore rollt von selbst. Spring rechtzeitig!' : this.mode === 'boss' ? 'Besiege die Drachenmaschine!' : this.chap.name);

    this.backH = () => this.togglePause(); K.events.on('back', this.backH);
    this.events.once('shutdown', () => { K.events.off('back', this.backH); this.terr.forEach(t => { t.img.destroy(); this.textures.remove(t.key); }); });
  }

  // ---------- Welt ----------
  ch(cx, cy) { if (cy < 0 || cx < 0 || cx >= this.cols) return ' '; if (cy >= this.rows) return this.grid[this.rows - 1][cx]; return this.grid[cy][cx]; }
  set(cx, cy, v) { if (this.grid[cy]) this.grid[cy][cx] = v; }
  buildCollision() {
    if (!this.textures.exists('tiles_blank')) this.textures.addCanvas('tiles_blank', K.Art.canvas(192, 64));
    const data = this.grid.map(r => r.map(c => '#XIG'.includes(c) ? 1 : c === '=' ? 2 : -1));
    const map = this.make.tilemap({ data, tileWidth: 64, tileHeight: 64 });
    const ts = map.addTilesetImage('tiles_blank', 'tiles_blank', 64, 64, 0, 0, 0);
    this.layer = map.createLayer(0, ts, 0, 0).setVisible(false);
    this.layer.setCollision([1, 2]);
    this.layer.forEachTile(t => { if (t.index === 2) t.setCollision(false, false, true, false, false); });
    this.map = map;
  }
  solidAt(cx, cy) { const t = this.layer.getTileAt(cx, cy); return !!(t && t.index === 1); }
  block(cx, cy, on) { if (on) { if (!this.layer.getTileAt(cx, cy)) this.layer.putTileAt(1, cx, cy); } else this.layer.removeTileAt(cx, cy); }

  // gemalter Fels in 512-px-Stücken, nur in Kameranähe
  updateTerrain(force) {
    const cam = this.cameras.main, CW = 512;
    const a = Math.floor((cam.scrollX - CW) / CW), b = Math.floor((cam.scrollX + K.W + CW) / CW);
    for (let i = Math.max(0, a); i <= b && i * CW < this.WW; i++) {
      if (this.terr.has(i)) continue;
      const r = K.Art.terrainChunk(this, this.w, this.grid, c => c === '#', i * CW, CW);
      if (!r) { this.terr.set(i, { img: this.add.zone(0, 0, 1, 1), key: '__none' }); continue; }
      const img = this.add.image(r.x, r.y, r.key).setOrigin(0).setDepth(10);
      this.terr.set(i, { img, key: r.key });
      if (!force) break; // pro Bild höchstens ein neues Stück
    }
    this.terr.forEach((t, i) => { if (i < a - 1 || i > b + 1) { t.img.destroy(); if (t.key !== '__none') this.textures.remove(t.key); this.terr.delete(i); } });
  }

  // alle Dinge aus dem Raster lesen
  objects() {
    const T = K.TILE, R = K.Art.seeded(7 + this.w * 13);
    this.items = []; this.hazards = []; this.knights = []; this.drones = []; this.gates = []; this.triggers = []; this.breaks = []; this.movers = []; this.bounces = [];
    this.fireballs = []; this.checkpoint = null;
    this.fx = this.add.particles(0, 0, 'p_fire', { emitting: false, speed: { min: 60, max: 260 }, scale: { start: 0.9, end: 0 }, lifespan: 600, blendMode: 'ADD' }).setDepth(25);
    this.sparks = this.add.particles(0, 0, 'p_spark', { emitting: false, speed: { min: 80, max: 300 }, scale: { start: 0.9, end: 0 }, lifespan: 700, gravityY: 400, blendMode: 'ADD' }).setDepth(25);
    this.smoke = this.add.particles(0, 0, 'p_smoke', { emitting: false, speed: { min: 20, max: 90 }, scale: { start: 0.8, end: 2 }, alpha: { start: 0.7, end: 0 }, lifespan: 1200 }).setDepth(24);
    this.steam = this.add.particles(0, 0, 'p_steam', { emitting: false, speedY: { min: -120, max: -40 }, speedX: { min: -40, max: 40 }, scale: { start: 0.6, end: 2 }, alpha: { start: 0.8, end: 0 }, lifespan: 1100 }).setDepth(24);
    const liq = LIQ[this.w];
    let gateNo = 0;
    for (let cy = 0; cy < this.rows; cy++) {
      let run = null;
      for (let cx = 0; cx <= this.cols; cx++) {
        const c = cx < this.cols ? this.grid[cy][cx] : ' ';
        const x = cx * T + T / 2, y = cy * T + T / 2;
        // Flüssigkeit als zusammenhängende Streifen
        if (c === 'L' && this.mode !== 'fly') { if (!run) run = cx; continue; }
        if (run != null) { this.liquid(run, cx - 1, cy, liq); run = null; }
        switch (c) {
          case 'o': { const g = this.add.image(x, y, this.w === 3 ? 'gem_blue' : 'gem').setDisplaySize(40, 40).setDepth(14); this.tweens.add({ targets: g, y: y - 8, duration: 900 + R() * 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: R() * 600 }); this.items.push({ type: 'gem', x, y, img: g, r: 34 }); this.maxGems++; break; }
          case 'P': this.start = { x, y: cy * T + T }; break;
          case '=': this.add.image(cx * T, cy * T - 2, 'plank').setOrigin(0).setDisplaySize(T, 24).setDepth(11); break;
          case '^': { this.add.image(cx * T, cy * T + T, 'spikes').setOrigin(0, 1).setDisplaySize(T, 36).setDepth(12); this.hazards.push({ type: 'spike', x0: cx * T + 6, x1: cx * T + T - 6, y0: cy * T + 36, y1: cy * T + T }); break; }
          case 'L': { // Gewitterwolke (Fluglevel)
            const cl = this.add.container(x, y).setDepth(15);
            for (let k = 0; k < 5; k++) cl.add(this.add.image(K.rnd(-40, 40), K.rnd(-20, 20), 'p_smoke').setScale(K.rnd(2, 3)).setTint(0x2a2840));
            const bolt = this.add.image(0, 10, 'p_glow').setScale(2.4).setTint(0xbfe0ff).setBlendMode('ADD').setAlpha(0); cl.add(bolt);
            this.tweens.add({ targets: bolt, alpha: { from: 0, to: 0.9 }, duration: 90, yoyo: true, repeat: -1, repeatDelay: 900 + R() * 1400 });
            this.hazards.push({ type: 'storm', x0: x - 60, x1: x + 60, y0: y - 45, y1: y + 45 }); break;
          }
          case 'E': this.spawnKnight(x, cy * T + T); break;
          case 'D': this.spawnDrone(x, y); break;
          case 'X': case 'I': case 'G': {
            const key = c === 'X' ? 'cobweb' : c === 'I' ? 'iceblock' : 'grate';
            const img = this.add.image(x, y, key).setDisplaySize(c === 'X' ? 72 : T, c === 'X' ? 70 : T).setDepth(13);
            if (c === 'X') img.setAlpha(0.9);
            this.breaks.push({ cx, cy, c, img }); break;
          }
          case 'B': { const m = this.add.image(x, cy * T + T + 6, 'w2_mushroom_tan').setOrigin(0.5, 1).setDepth(13); m.setScale(110 / m.height).setTint(0xff9a7a); this.bounces.push({ x0: x - 44, x1: x + 44, y: cy * T + T - 70, img: m }); break; }
          case 'M': this.spawnMover(cx, cy); break;
          case 'K': { const b = this.add.image(x, cy * T + T, 'brazier').setOrigin(0.5, 1).setDisplaySize(84, 84).setDepth(12); this.triggers.push({ type: 'check', x, y: cy * T + T, img: b, r: 60 }); break; }
          case '?': this.spawnGate(cx, cy, this.L.gates[gateNo++]); break;
          case 'Z': this.spawnBridge(cx, cy, this.L.gates[gateNo++]); break;
          case 'C': { const img = this.add.image(x, cy * T + T + 2, 'chest').setOrigin(0.5, 1).setDepth(13); img.setScale(80 / img.height); this.triggers.push({ type: 'chest', x, y: cy * T + T, img, r: 60 }); this.maxGems += 8; break; }
          case 'T': this.spawnTreasure(x, y); break;
          case 'S': this.spawnShrine(x, cy * T + T); break;
          case 'H': case 'O': { const ic = c === 'H' ? 'ic_feather' : 'ic_eye'; const gl = this.add.image(x, y, 'p_glow').setScale(1.6).setTint(c === 'H' ? 0xff8a3a : 0x7ad0ff).setBlendMode('ADD').setDepth(13); const img = this.add.image(x, y, ic).setDisplaySize(52, 52).setDepth(14); this.tweens.add({ targets: [img, gl], y: y - 10, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); this.items.push({ type: c === 'H' ? 'feather' : 'eye', x, y, img, gl, r: 40 }); break; }
          case 'F': { const b = this.add.image(x, cy * T + T + 8, 'banner').setOrigin(0.2, 1).setDisplaySize(128, 256).setDepth(12); if (this.mode === 'fly') b.setY(cy * T + 200); this.finish = { x, y: cy * T, img: b }; this.add.image(x + 30, b.y - 160, 'p_glow').setScale(5).setTint(0xffc060).setBlendMode('ADD').setAlpha(0.4).setDepth(11); break; }
          case 'Y': this.arena = { x: cx * T - 6 * T, x1: cx * T + 28 * T, ground: (cy + 1) * T }; break;
        }
      }
    }
    if (!this.start) this.start = { x: 120, y: 9 * T };
  }
  liquid(c0, c1, cy, kind) {
    const T = K.TILE, x = c0 * T, w = (c1 - c0 + 1) * T;
    if (this.ch(c0, cy - 1) === 'L') return; // nur oberste Reihe zeichnen
    let h = 0; while (this.ch(c0, cy + h) === 'L') h++;
    if (kind) {
      const top = cy * T + 14;
      const ts = this.add.tileSprite(x, top, w, h * T - 14 + 4, kind).setOrigin(0).setDepth(9);
      if (this.w === 3) ts.setTint(0xbfe4ff);
      this.tweens.add({ targets: ts, tilePositionX: 256, duration: kind === 'lava' ? 9000 : 6000, repeat: -1 });
      if (kind === 'lava') {
        const gl = this.add.rectangle(x, top - 40, w, 60, 0xff6a10, 0.22).setOrigin(0).setDepth(9).setBlendMode('ADD');
        this.tweens.add({ targets: gl, alpha: 0.5, duration: 1200, yoyo: true, repeat: -1 });
        this.add.particles(0, 0, 'p_ember', { x: { min: x, max: x + w }, y: top + 6, speedY: { min: -140, max: -40 }, speedX: { min: -20, max: 20 }, lifespan: 1400, frequency: 380 / (c1 - c0 + 1), scale: { start: 1.3, end: 0 }, blendMode: 'ADD' }).setDepth(9);
      } else if (kind === 'swamp') {
        this.add.particles(0, 0, 'p_spore', { x: { min: x, max: x + w }, y: top + 8, speedY: { min: -40, max: -15 }, lifespan: 2000, frequency: 600 / (c1 - c0 + 1), scale: { start: 1.4, end: 0.2 } }).setDepth(9);
      }
    }
    this.hazards.push({ type: 'liquid', x0: x + 8, x1: x + w - 8, y0: cy * T + 30, y1: (cy + h) * T + 400 });
  }

  // Dekoration auf freien Bodenflächen
  decorate() {
    const D = K.DECO[this.w]; if (!D) return;
    const R = K.Art.seeded(99 + this.lv.idx * 31 + this.w);
    const T = K.TILE; let next = 4;
    const free = (cx, cy) => { for (let k = -1; k <= 1; k++) { const c = this.ch(cx + k, cy - 1); if (c !== ' ' && c !== 'o') return false; const g = this.ch(cx + k, cy); if (g !== '#') return false; } return true; };
    for (let cx = 4; cx < this.cols - 8; cx++) {
      if (cx < next) continue;
      if (this.arena && cx * T > this.arena.x - 200) break;
      for (let cy = 3; cy < this.rows; cy++) {
        if (this.ch(cx, cy) !== '#' || this.ch(cx, cy - 1) === '#') continue;
        if (!free(cx, cy)) break;
        const back = R() < 0.55;
        const key = back ? D.back[Math.floor(R() * D.back.length)] : D.front[Math.floor(R() * D.front.length)];
        if (!this.textures.exists(key)) break;
        const meta = K.propsMeta[key] || { h: 120 };
        const img = this.add.image(cx * T + R() * T, cy * T + 10, key).setOrigin(0.5, 1).setDepth(back ? 6 : 12).setFlipX(R() < 0.5);
        const s = (meta.h * (back ? K.rnd(0.9, 1.15) : K.rnd(0.75, 1))) / img.height; img.setScale(s);
        if (back) img.setTint(K.Art.mix(0xffffff, this.w === 4 ? 0x2a2020 : 0x6070a0, this.w === 2 ? 0.32 : 0.22));
        else if (key.startsWith('crystal')) { this.add.image(img.x, img.y - img.displayHeight / 2, 'p_glow').setScale(3).setTint(key === 'crystal_red' ? 0xff4a3a : 0x5ad0ff).setBlendMode('ADD').setAlpha(0.5).setDepth(11); }
        next = cx + 3 + Math.floor(R() * 5);
        break;
      }
    }
  }

  // ---------- Figuren ----------
  makePlayer() {
    const pl = this.pl = K.makeKivalu(this, this.start.x, this.start.y, this.p, 0.5);
    pl.setDepth(20);
    this.physics.add.existing(pl);
    const b = pl.body; b.setSize(96, 176).setOffset(68, 54); b.setMaxVelocity(700, 1100);
    b.setCollideWorldBounds(true);
    this.physics.add.collider(pl, this.layer);
    if (this.movers.length) this.physics.add.collider(pl, this.movers.map(m => m.img));
    pl.dir = 1; pl.coyote = 0; pl.buf = 0; pl.dbl = false; pl.inv = 0; pl.fireCd = 0; pl.actT = 0; pl.act = null;
    pl.playAnim('idle');
    this.safe = { x: this.start.x, y: this.start.y };
    if (this.mode === 'fly') { b.setAllowGravity(false); pl.playAnim('fly'); }
    if (this.mode === 'cart') { this.cart = this.add.image(pl.x, pl.y, 'minecart').setDisplaySize(120, 90).setOrigin(0.5, 0.78).setDepth(21); }
    this.respawnAt = { x: this.start.x, y: this.start.y };
  }
  spawnKnight(x, groundY) {
    const img = this.add.image(x, groundY + 4, 'knight_walk0').setOrigin(0.5, 1).setDepth(16);
    img.setScale(110 / img.height);
    if (this.w >= 3) img.setTint(this.w === 3 ? 0xd8e8ff : 0xffffff);
    this.knights.push({ img, x, y: groundY, dir: -1, sp: 70 + this.w * 8, t: Math.random() * 1000, state: 'walk' });
  }
  spawnDrone(x, y) {
    const img = this.add.image(x, y, 'drone0').setDepth(16); img.setScale(80 / img.height);
    const gl = this.add.image(x, y + 10, 'p_glow').setTint(0xff3030).setBlendMode('ADD').setScale(0.6).setDepth(16);
    this.drones.push({ img, gl, x0: x, y0: y, t: Math.random() * 6, state: 'fly' });
  }
  spawnMover(cx, cy) {
    const T = K.TILE; let a = cx, b = cx;
    while (a > 0 && !this.solidAt(a - 1, 9)) a--;
    while (b < this.cols - 1 && !this.solidAt(b + 1, 9)) b++;
    const w = 3 * T, x0 = a * T + w / 2 + 4, x1 = (b + 1) * T - w / 2 - 4, y = cy * T + 12;
    const img = this.add.tileSprite(x0, y, w, 24, 'plank').setDepth(11);
    this.physics.add.existing(img); img.body.setAllowGravity(false).setImmovable(true).checkCollision.down = false; img.body.checkCollision.left = img.body.checkCollision.right = false;
    const chain = this.add.graphics().setDepth(10);
    this.movers.push({ img, x0, x1, sp: 110, chain });
    img.body.setVelocityX(110);
  }
  spawnGate(cx, cy, info) {
    const T = K.TILE, x = cx * T + T / 2, fly = this.mode === 'fly';
    const base = fly ? this.WH : cy * T + T;
    const top = fly ? 0 : 0;
    const g = { cx, cy, info: info || { cat: 'mathe' }, open: false, x, parts: [] };
    if (fly) {
      // Sturmwand aus Ketten und Runen
      const wall = this.add.tileSprite(x, 0, 60, this.WH, 'gatefill').setOrigin(0.5, 0).setDepth(15).setAlpha(0.85); g.parts.push(wall);
      this.tweens.add({ targets: wall, tilePositionY: -200, duration: 2000, repeat: -1 });
      for (let k = 0; k < this.rows; k++) if (!this.solidAt(cx, k)) { this.block(cx, k, true); }
    } else {
      const arch = this.add.image(x, base + 6, 'runegate').setOrigin(0.5, 1).setDisplaySize(160, 256).setDepth(13);
      const fill = this.add.image(x, base, 'gatefill').setOrigin(0.5, 1).setDisplaySize(84, 200).setDepth(12);
      this.tweens.add({ targets: fill, alpha: 0.55, duration: 900, yoyo: true, repeat: -1 });
      g.parts.push(arch, fill); g.fill = fill; g.arch = arch;
      for (let k = 0; k <= cy; k++) this.block(cx, k, true);
    }
    const lbl = this.add.text(x, fly ? 300 : base - 280, K.Tasks.CAT_NAMES[g.info.cat], K.txt(24, '#ffe9a8')).setOrigin(0.5).setDepth(14);
    g.parts.push(lbl); g.lbl = lbl;
    this.gates.push(g);
  }
  spawnBridge(cx, cy, info) {
    const T = K.TILE; const cells = [];
    for (let y = 0; y < this.rows; y++) for (let x = cx; x < Math.min(this.cols, cx + 16); x++) if (this.grid[y][x] === '_') cells.push([x, y]);
    const stone = this.add.image(cx * T + T / 2, cy * T + T + 4, 'w1_obelisk').setOrigin(0.5, 1).setDepth(13); stone.setScale(110 / stone.height).setTint(0x9a8aa0);
    const rune = this.add.text(stone.x, stone.y - 60, 'ᛒ', { fontFamily: 'serif', fontSize: '34px', color: '#ffb347' }).setOrigin(0.5).setDepth(14);
    this.tweens.add({ targets: rune, alpha: 0.4, duration: 700, yoyo: true, repeat: -1 });
    const g = { cx, cy, info: info || { cat: 'mathe' }, open: false, x: cx * T + T / 2, bridge: cells, parts: [], rune };
    const lbl = this.add.text(stone.x, stone.y - 140, 'Zauberbrücke: ' + K.Tasks.CAT_NAMES[g.info.cat], K.txt(22, '#ffe9a8')).setOrigin(0.5).setDepth(14);
    g.parts.push(lbl); g.lbl = lbl;
    this.gates.push(g);
  }
  spawnTreasure(x, y) {
    const tr = K.treasureFor(this.lvId); if (!tr || !this.textures.exists(tr.key)) return;
    const have = this.p.hort.includes(tr.key);
    const gl = this.add.image(x, y, 'p_glow').setScale(3.2).setTint(0xffd060).setBlendMode('ADD').setDepth(13).setAlpha(have ? 0.25 : 0.7);
    const img = this.add.image(x, y, tr.key).setDepth(14); img.setScale(74 / img.height); if (have) img.setAlpha(0.45);
    this.tweens.add({ targets: [img, gl], y: y - 12, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: gl, scale: 3.8, duration: 800, yoyo: true, repeat: -1 });
    this.items.push({ type: 'treasure', x, y, img, gl, r: 50, tr, have });
  }
  spawnShrine(x, groundY) {
    // Drachenhort: Kristall auf einem Steinsockel (bewusst kein Torbogen, damit er nicht wie ein Aufgabentor aussieht)
    const sk = this.chap.skill; const known = !sk || !!(this.p.seen['skill_' + sk] || this.ab[sk]);
    const S = K.Story.SKILLS[sk];
    const base = this.add.image(x, groundY + 6, 'w1_column').setOrigin(0.5, 1).setDepth(7).setTint(0x9a8a9a); base.setScale(110 / base.height);
    const gl = this.add.image(x, groundY - 150, 'p_glow').setScale(5).setTint(0xff8a3a).setBlendMode('ADD').setDepth(8).setAlpha(known ? 0.15 : 0.8);
    const stone = this.add.image(x, groundY - 150, 'crystal_red').setDepth(9); stone.setScale(80 / stone.height);
    if (known) stone.setTint(0x8a7a80).setAlpha(0.7);
    else {
      this.tweens.add({ targets: stone, y: groundY - 172, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); this.tweens.add({ targets: gl, alpha: 0.4, duration: 900, yoyo: true, repeat: -1 });
      this.add.particles(x, groundY - 150, 'p_spark', { speed: { min: 20, max: 60 }, scale: { start: 0.6, end: 0 }, lifespan: 900, frequency: 120, blendMode: 'ADD' }).setDepth(9);
    }
    this.add.text(x, groundY - 240, known ? `Drachenhort (${S ? S.name : 'leer'})` : 'Drachenhort: neue Drachenkunst!', K.txt(22, known ? '#c8b8a8' : '#ffe9a8')).setOrigin(0.5).setDepth(14);
    this.triggers.push({ type: 'shrine', x, y: groundY, r: 70, used: known, known, gl, stone, skill: S });
  }

  // ---------- Steuerung ----------
  controls() {
    const kb = this.input.keyboard;
    this.keys = kb.addKeys({ left: 'LEFT', right: 'RIGHT', up: 'UP', down: 'DOWN', a: 'A', d: 'D', w: 'W', s: 'S', space: 'SPACE', x: 'X', f: 'F', ctrl: 'CTRL', p: 'P', esc: 'ESC' });
    kb.on('keydown-P', () => this.togglePause()); kb.on('keydown-ESC', () => this.togglePause());
    this.touch = [];
    const touchDev = K.isApp || ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    this.showTouch = touchDev;
    const mk = (name, x, y, r, icon, opt = {}) => {
      const c = this.add.container(x, y).setScrollFactor(0).setDepth(4100).setAlpha(touchDev ? 0.78 : 0);
      c.add(this.add.image(0, 0, 'ui_round_glass').setDisplaySize(r * 2, r * 2));
      const ic = this.add.image(0, 0, icon).setDisplaySize(r * 1.1, r * 1.1); if (opt.flipX) ic.setFlipX(true); if (opt.flipY) ic.setFlipY(true); c.add(ic);
      const t = { name, x, y, r, c, down: false }; this.touch.push(t); return t;
    };
    if (this.mode === 'fly') {
      mk('left', 100, K.H - 100, 64, 'ic_back'); mk('right', 250, K.H - 100, 64, 'ic_back', { flipX: true });
      mk('up', K.W - 120, K.H - 230, 64, 'ic_up'); mk('down', K.W - 120, K.H - 90, 64, 'ic_up', { flipY: true });
      this.fireBtn = mk('fire', K.W - 280, K.H - 110, 58, 'ic_fire');
    } else {
      if (this.mode !== 'cart') { mk('left', 100, K.H - 100, 64, 'ic_back'); mk('right', 250, K.H - 100, 64, 'ic_back', { flipX: true }); }
      mk('jump', K.W - 120, K.H - 110, 76, 'ic_jump');
      this.fireBtn = mk('fire', K.W - 290, K.H - 90, 58, 'ic_fire');
    }
    if (!this.ab.fire && this.mode !== 'boss') this.fireBtn.c.setVisible(false);
    this.inp = { left: false, right: false, up: false, down: false, jump: false, fire: false };
    this.prev = Object.assign({}, this.inp);
  }
  readInput() {
    const k = this.keys, ptrs = this.input.manager.pointers;
    this.touch.forEach(t => { t.down = ptrs.some(p => p.isDown && (p.x - t.x) ** 2 + (p.y - t.y) ** 2 < (t.r * 1.3) ** 2); if (t.c.visible && this.showTouch) t.c.setScale(t.down ? 0.9 : 1); });
    const td = (n) => this.touch.some(t => t.name === n && t.down && t.c.visible);
    this.prev = this.inp;
    this.inp = {
      left: k.left.isDown || k.a.isDown || td('left'), right: k.right.isDown || k.d.isDown || td('right'),
      up: k.up.isDown || k.w.isDown || td('up'), down: k.down.isDown || k.s.isDown || td('down'),
      jump: k.space.isDown || k.up.isDown || k.w.isDown || td('jump') || (this.mode === 'fly' && false),
      fire: k.x.isDown || k.f.isDown || k.ctrl.isDown || td('fire'),
    };
    this.inp.jumpP = this.inp.jump && !this.prev.jump; this.inp.fireP = this.inp.fire && !this.prev.fire;
  }

  // ---------- HUD ----------
  makeHud() {
    const c = this.hudC = this.add.container(0, 0).setScrollFactor(0).setDepth(4000);
    c.add(this.add.nineslice(16, 14, 'ui_hud', null, 250 + this.maxHearts * 0, 62, 24, 24, 24, 24).setOrigin(0));
    this.heartImgs = [];
    for (let i = 0; i < this.maxHearts; i++) { const h = this.add.image(48 + i * 46, 45, 'ic_heart').setDisplaySize(42, 42); c.add(h); this.heartImgs.push(h); }
    c.add(this.add.nineslice(16, 84, 'ui_hud', null, 170, 56, 24, 24, 24, 24).setOrigin(0));
    c.add(this.add.image(46, 112, 'gem').setDisplaySize(40, 40));
    this.gemTxt = this.add.text(72, 112, '0', K.txt(28)).setOrigin(0, 0.5); c.add(this.gemTxt);
    this.featherTxt = this.add.text(0, 0, ''); // Platzhalter
    const pb = K.UI.roundBtn(this, K.W - 54, 50, 34, 'ic_pause', () => this.togglePause(), { style: 'stone' }).setScrollFactor(0).setDepth(4100);
    this.pauseBtn = pb;
    this.boostTxt = this.add.text(K.W / 2, 60, '', K.txt(26, '#ffe9a8')).setOrigin(0.5).setScrollFactor(0).setDepth(4000);
    this.refreshHud();
  }
  refreshHud() {
    this.heartImgs.forEach((h, i) => h.setTexture(i < this.hearts ? 'ic_heart' : 'ic_heart_off'));
    this.gemTxt.setText(String(this.gems));
  }
  banner(title, sub) {
    const c = this.add.container(K.W / 2, 200).setScrollFactor(0).setDepth(4200).setAlpha(0);
    c.add(this.add.nineslice(0, 0, 'ui_parch', null, 720, 150, 36, 36, 36, 36));
    c.add(this.add.text(0, -24, title, K.title(48, '#5a1a00', { stroke: '#fff0c8', strokeThickness: 4, shadow: undefined })).setOrigin(0.5));
    c.add(this.add.text(0, 34, sub, K.txt(24, '#4a2a10', { strokeThickness: 0 })).setOrigin(0.5));
    this.tweens.add({ targets: c, alpha: 1, y: 220, duration: 400, ease: 'Back.easeOut' });
    this.tweens.add({ targets: c, alpha: 0, delay: 2600, duration: 500, onComplete: () => c.destroy() });
  }
  floatText(x, y, txt, color = '#ffe28a') {
    const t = this.add.text(x, y, txt, K.txt(30, color)).setOrigin(0.5).setDepth(30);
    this.tweens.add({ targets: t, y: y - 70, alpha: 0, duration: 1000, onComplete: () => t.destroy() });
  }

  // ---------- Spiel-Schleife ----------
  update(time, dtMs) {
    if (!this.pl || this.paused) return;
    const dt = Math.min(dtMs, 40) / 1000;
    this.bg.update(this.cameras.main.scrollX);
    this.updateTerrain(false);
    this.readInput();
    if (this.busy) { this.pl.body.setVelocityX(0); if (this.mode === 'fly') this.pl.body.setVelocityY(0); this.syncCart(); return; }
    if (this.mode === 'fly') this.flyPlayer(dt); else this.movePlayer(dt);
    this.updateFire(dt);
    this.updateEnemies(dt, time);
    this.updateMovers();
    this.checkThings();
    if (this.mode === 'boss') this.updateBoss(dt, time);
    this.syncCart();
  }
  syncCart() { if (this.cart) { this.cart.setPosition(this.pl.x, this.pl.y + 4).setVisible(this.pl.visible); this.cart.rotation = K.clamp(this.pl.body.velocity.y / 3000, -0.2, 0.2); } }

  movePlayer(dt) {
    const pl = this.pl, b = pl.body, I = this.inp, ms = dt * 1000;
    const onGround = b.blocked.down || b.touching.down;
    if (onGround) { if (pl.coyote <= 0 && b.velocity.y >= 0 && pl.wasAir) { K.Audio.sfx('land', { vol: 0.35 }); this.dust(pl.x, pl.y); } pl.coyote = 110; pl.dbl = false; pl.wasAir = false; }
    else { pl.coyote -= ms; pl.wasAir = true; }
    if (I.jumpP) pl.buf = 130; else pl.buf -= ms;
    // laufen
    let dir = (I.right ? 1 : 0) - (I.left ? 1 : 0);
    if (this.mode === 'cart') dir = 1;
    const speed = this.mode === 'cart' ? 400 : 330;
    const target = dir * speed;
    const acc = onGround ? 14 : 8;
    b.setVelocityX(b.velocity.x + (target - b.velocity.x) * Math.min(1, dt * acc));
    if (dir && this.mode !== 'cart') { if (dir !== pl.dir) { pl.dir = dir; pl.setFlipX(dir < 0); b.setOffset(dir > 0 ? 68 : 50, 54); } }
    // springen
    if (pl.buf > 0 && pl.coyote > 0) { b.setVelocityY(-880); pl.coyote = 0; pl.buf = 0; K.Audio.sfx('jump', { vol: 0.45 }); this.dust(pl.x, pl.y); }
    else if (pl.buf > 0 && !onGround && this.ab.double && !pl.dbl && !pl.climbing) { b.setVelocityY(-780); pl.dbl = true; pl.buf = 0; pl.act = 'flutter'; pl.actT = 380; K.Audio.sfx('flutter', { vol: 0.6 }); this.sparks.explode(8, pl.x, pl.y - 40); }
    if (!I.jump && b.velocity.y < -300 && !pl.bounced) b.setVelocityY(b.velocity.y * 0.82);
    if (b.velocity.y >= 0) pl.bounced = false;
    // gleiten
    pl.gliding = false;
    if (this.ab.fly && I.jump && !onGround && b.velocity.y > 120 && (pl.dbl || !this.ab.double || pl.coyote < -250)) { b.setVelocityY(Math.min(b.velocity.y, 130)); pl.gliding = true; }
    // klettern
    pl.climbing = false;
    if (this.ab.climb && !onGround && ((b.blocked.left && I.left) || (b.blocked.right && I.right))) {
      b.setVelocityY(-280); pl.climbing = true; pl.dbl = false;
      if (!pl.climbSnd || this.time.now - pl.climbSnd > 300) { pl.climbSnd = this.time.now; K.Audio.sfx('step', { vol: 0.3 }); }
    } else if (pl.wasClimbing && !onGround && !b.blocked.left && !b.blocked.right && b.velocity.y < 0) { b.setVelocityY(-420); b.setVelocityX(pl.dir * 200); } // über die Kante
    pl.wasClimbing = pl.climbing;
    if (b.velocity.y > 1000) b.setVelocityY(1000);
    // Feuer
    pl.fireCd -= ms;
    if (I.fireP && (this.ab.fire || this.mode === 'boss') && pl.fireCd <= 0) this.spit();
    // Animation
    pl.actT -= ms; if (pl.actT <= 0) pl.act = null;
    let a;
    if (pl.hurtT > 0) { pl.hurtT -= ms; a = 'hurt'; }
    else if (pl.act) a = pl.act;
    else if (pl.climbing) a = 'climb';
    else if (pl.gliding) a = 'fly';
    else if (onGround) a = Math.abs(b.velocity.x) > 40 && this.mode !== 'cart' ? 'run' : 'idle';
    else a = b.velocity.y < 0 ? 'jump' : 'fall';
    pl.playAnim(a, a !== 'fire' && a !== 'hurt');
    pl.animSpeed = a === 'run' ? K.clamp(Math.abs(b.velocity.x) / 330, 0.5, 1.2) : 1;
    if (a === 'run' && pl.animFrame !== pl.lastStep && (pl.animFrame === 1 || pl.animFrame === 5)) { pl.lastStep = pl.animFrame; K.Audio.sfx(this.w === 3 ? 'snowstep' : 'step', { vol: 0.16 }); } else if (a !== 'run') pl.lastStep = -1;
    // Zwischenspeichern einer sicheren Stelle
    if (onGround && !pl.onMover && this.time.now - (this.safeT || 0) > 400) {
      const cx = Math.floor(pl.x / 64), cy = Math.floor((pl.y + 10) / 64);
      if (this.solidAt(cx, cy) && this.solidAt(cx - 1, cy) && this.solidAt(cx + 1, cy) && !this.nearHazard(pl.x, pl.y)) { this.safe = { x: pl.x, y: pl.y - 4 }; this.safeT = this.time.now; }
    }
    // Absturz
    if (pl.y > this.WH + 200) this.fallOut();
    // Unverwundbarkeit
    if (pl.inv > 0) { pl.inv -= ms; pl.setAlpha(Math.floor(pl.inv / 90) % 2 ? 0.4 : 1); if (pl.inv <= 0) pl.setAlpha(1); }
    // Kamera schaut in Laufrichtung
    const cam = this.cameras.main; cam.followOffset.x = K.lerp(cam.followOffset.x, -pl.dir * 150, dt * 2);
  }
  flyPlayer(dt) {
    const pl = this.pl, b = pl.body, I = this.inp, ms = dt * 1000;
    const vx = 170 + ((I.right ? 1 : 0) - (I.left ? 1 : 0)) * 190;
    const vy = ((I.down ? 1 : 0) - (I.up || I.jump ? 1 : 0)) * 330;
    b.setVelocity(b.velocity.x + (vx - b.velocity.x) * Math.min(1, dt * 6), b.velocity.y + (vy - b.velocity.y) * Math.min(1, dt * 7));
    if (pl.y < 120) { pl.y = 120; b.setVelocityY(Math.max(0, b.velocity.y)); }
    if (pl.y > this.WH - 20) { pl.y = this.WH - 20; b.setVelocityY(Math.min(0, b.velocity.y)); }
    pl.rotation = K.clamp(b.velocity.y / 2000, -0.18, 0.18);
    pl.fireCd -= ms;
    if (I.fireP && this.ab.fire && pl.fireCd <= 0) this.spit();
    pl.actT -= ms; if (pl.actT <= 0) pl.act = null;
    pl.playAnim(pl.hurtT > 0 ? 'hurt' : 'fly'); if (pl.hurtT > 0) pl.hurtT -= ms;
    pl.animSpeed = 1 + Math.max(0, -b.velocity.y) / 600;
    if (pl.inv > 0) { pl.inv -= ms; pl.setAlpha(Math.floor(pl.inv / 90) % 2 ? 0.4 : 1); if (pl.inv <= 0) pl.setAlpha(1); }
    if (pl.animFrame === 2 && pl.lastWing !== 2) K.Audio.sfx('flutter', { vol: 0.15 }); pl.lastWing = pl.animFrame;
    this.cameras.main.followOffset.x = K.lerp(this.cameras.main.followOffset.x, -260, dt * 2);
  }
  nearHazard(x, y) { return this.hazards.some(h => x > h.x0 - 90 && x < h.x1 + 90 && y > h.y0 - 200 && y < h.y1); }
  dust(x, y) { this.smoke.setParticleTint(this.w === 3 ? 0xffffff : 0xc0a890); this.smoke.explode(4, x, y - 6); }

  // Feuerball
  mouth() {
    const pl = this.pl, m = K.kivaluMeta.anims[pl.curAnim] || K.kivaluMeta.anims.idle; const mm = m.mouth[pl.animFrame || 0] || m.mouth[0];
    const s = pl.scaleX, mx = pl.flipX ? (K.kivaluMeta.fw - mm[0]) : mm[0];
    return { x: pl.x + (mx - K.kivaluMeta.cx) * s, y: pl.y + (mm[1] - K.kivaluMeta.feet) * s };
  }
  spit() {
    const pl = this.pl; pl.fireCd = 380; pl.act = this.mode === 'fly' ? null : 'fire'; pl.actT = 300;
    const big = this.ab.bigfire; const m = this.mouth();
    const dir = this.mode === 'fly' ? 1 : pl.dir;
    const img = this.add.image(m.x + dir * 10, m.y, 'fireball').setDisplaySize(big ? 70 : 46, big ? 70 : 46).setDepth(22).setBlendMode('ADD');
    const trail = this.add.particles(0, 0, 'p_fire', { follow: img, speed: 30, scale: { start: big ? 1.2 : 0.8, end: 0 }, lifespan: 300, frequency: 16, blendMode: 'ADD' }).setDepth(21);
    this.fireballs.push({ img, trail, vx: dir * 900 + (this.mode === 'fly' ? this.pl.body.velocity.x : 0), life: 0.75, big });
    K.Audio.sfx(big ? 'bigfire' : 'fire', { vol: 0.45, rate: K.rnd(0.95, 1.1) });
  }
  updateFire(dt) {
    for (let i = this.fireballs.length - 1; i >= 0; i--) {
      const f = this.fireballs[i]; f.img.x += f.vx * dt; f.img.rotation += dt * 10; f.life -= dt;
      const cx = Math.floor(f.img.x / 64), cy = Math.floor(f.img.y / 64), c = this.ch(cx, cy);
      let hit = false;
      if ('XIG'.includes(c) && c !== ' ') { this.burn(cx, cy, c); hit = true; }
      else if (this.solidAt(cx, cy)) hit = true;
      // Gegner
      for (const k of this.knights) if (k.state === 'walk' && Math.abs(k.img.x - f.img.x) < 40 && f.img.y > k.y - 115 && f.img.y < k.y) { this.heatKnight(k); hit = true; }
      for (const d of this.drones) if (d.state === 'fly' && Math.abs(d.img.x - f.img.x) < 46 && Math.abs(d.img.y - f.img.y) < 46) { this.killDrone(d); hit = true; }
      if (this.boss && this.boss.hitTest(f.img.x, f.img.y)) { this.boss.onFire(); hit = true; }
      if (hit || f.life <= 0) { this.fx.explode(hit ? 14 : 5, f.img.x, f.img.y); f.trail.stop(); this.time.delayedCall(400, () => f.trail.destroy()); f.img.destroy(); this.fireballs.splice(i, 1); }
    }
  }
  burn(cx, cy, c) {
    const need = c === 'X' ? 'fire' : c === 'I' ? 'melt' : 'bigfire';
    if (!this.ab[need]) {
      if (!this.hintShown) { this.hintShown = true; K.UI.toast(this, c === 'I' ? 'Das Eis ist zu dick. Du brauchst die Eisschmelze.' : 'Das Gitter ist aus Eisen. Dafür brauchst du den Großen Feueratem.', { size: 26 }); }
      K.Audio.sfx('bonk', { vol: 0.4 }); return;
    }
    // zusammenhängende Teile mitnehmen
    const todo = [[cx, cy]], seen = new Set();
    while (todo.length) {
      const [x, y] = todo.pop(); const k = x + ',' + y; if (seen.has(k) || this.ch(x, y) !== c) continue; seen.add(k);
      this.set(x, y, ' '); this.block(x, y, false);
      const br = this.breaks.find(b => b.cx === x && b.cy === y);
      if (br) { const img = br.img; this.tweens.add({ targets: img, alpha: 0, scale: img.scale * (c === 'I' ? 0.6 : 1.2), duration: 400, onComplete: () => img.destroy() }); }
      if (c === 'X') this.fx.explode(10, x * 64 + 32, y * 64 + 32); else this.steam.explode(8, x * 64 + 32, y * 64 + 32);
      todo.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    K.Audio.sfx(c === 'X' ? 'fire' : c === 'I' ? 'splash' : 'metal', { vol: 0.5 });
  }

  updateEnemies(dt, time) {
    const pl = this.pl, b = pl.body;
    for (const k of this.knights) {
      if (k.state !== 'walk') continue;
      if (Math.abs(k.img.x - pl.x) > K.W * 1.2) continue;
      k.t += dt * 1000;
      const nx = k.img.x + k.dir * k.sp * dt;
      const ahead = Math.floor((nx + k.dir * 30) / 64), row = Math.floor((k.y - 10) / 64);
      if (this.solidAt(ahead, row) || !this.solidAt(ahead, row + 1) || 'L^'.includes(this.ch(ahead, row + 1)) || this.ch(ahead, row) === '^') k.dir *= -1;
      else k.img.x = nx;
      k.img.setFlipX(k.dir > 0).setTexture('knight_walk' + (Math.floor(k.t / 140) % 4));
      if (Math.floor(k.t / 280) !== k.lastStep) { k.lastStep = Math.floor(k.t / 280); if (Math.abs(k.img.x - pl.x) < 600) K.Audio.sfx('step', { vol: 0.06, rate: 0.7 }); }
      // Berührung
      if (Math.abs(k.img.x - pl.x) < 50 && pl.y > k.y - 112 && pl.y - 88 < k.y) {
        if (b.velocity.y > 50 && pl.y < k.y - 70) { this.breakKnight(k); b.setVelocityY(-620); pl.bounced = true; }
        else this.hurt(k.img.x);
      }
    }
    for (const d of this.drones) {
      if (d.state !== 'fly') continue;
      d.t += dt;
      const fly = this.mode === 'fly';
      if (fly && Math.abs(d.img.x - pl.x) < 900) d.x0 -= 60 * dt;
      d.img.x = d.x0 + Math.sin(d.t * 0.8) * 110; d.img.y = d.y0 + Math.sin(d.t * 2.1) * 26;
      d.img.setTexture(Math.floor(d.t * 14) % 2 ? 'drone1' : 'drone0'); d.gl.setPosition(d.img.x, d.img.y + 12).setAlpha(0.5 + Math.sin(d.t * 6) * 0.3);
      if (Math.abs(d.img.x - pl.x) < 52 && Math.abs(d.img.y - (pl.y - 44)) < 64) {
        if (!fly && b.velocity.y > 50 && pl.y < d.img.y + 10) { this.killDrone(d); b.setVelocityY(-620); pl.bounced = true; }
        else this.hurt(d.img.x);
      }
    }
  }
  heatKnight(k) {
    k.state = 'hot'; k.img.setTexture('knight_hot'); K.Audio.sfx('metal', { vol: 0.5 });
    const st = this.add.particles(0, 0, 'p_steam', { follow: k.img, followOffset: { y: -80 }, speedY: { min: -120, max: -60 }, speedX: { min: -30, max: 30 }, scale: { start: 0.4, end: 1.4 }, alpha: { start: 0.7, end: 0 }, lifespan: 800, frequency: 60 }).setDepth(24);
    this.tweens.add({ targets: k.img, x: k.img.x + 4, duration: 50, yoyo: true, repeat: 8 });
    this.time.delayedCall(700, () => { st.stop(); this.time.delayedCall(900, () => st.destroy()); this.breakKnight(k); });
  }
  breakKnight(k) {
    if (k.state === 'broken') return; k.state = 'broken';
    k.img.setTexture('knight_broken'); k.img.setScale(110 / k.img.height);
    K.Audio.sfx('metal', { vol: 0.6 }); this.sparks.explode(14, k.img.x, k.y - 50); this.cameras.main.shake(120, 0.004);
    this.tweens.add({ targets: k.img, alpha: 0, delay: 1400, duration: 600, onComplete: () => k.img.destroy() });
    this.addGems(2, k.img.x, k.y - 80);
  }
  killDrone(d) {
    d.state = 'dead'; d.gl.destroy(); K.Audio.sfx('bang', { vol: 0.4 }); this.fx.explode(16, d.img.x, d.img.y); this.smoke.explode(5, d.img.x, d.img.y);
    this.tweens.add({ targets: d.img, y: d.img.y + 500, angle: 300, alpha: 0, duration: 1100, ease: 'Quad.easeIn', onComplete: () => d.img.destroy() });
    this.addGems(2, d.img.x, d.img.y);
  }
  updateMovers() {
    const pl = this.pl; pl.onMover = false;
    for (const m of this.movers) {
      const b = m.img.body;
      if (m.img.x >= m.x1) b.setVelocityX(-m.sp); else if (m.img.x <= m.x0) b.setVelocityX(m.sp);
      if (pl.body.touching.down && Math.abs(pl.x - m.img.x) < 110 && Math.abs(pl.y - m.img.y + 12) < 20) pl.onMover = true;
      m.chain.clear(); m.chain.lineStyle(4, 0x3a2a20, 0.9); m.chain.lineBetween(m.img.x - 80, m.img.y, m.img.x - 80, -20); m.chain.lineBetween(m.img.x + 80, m.img.y, m.img.x + 80, -20);
    }
  }

  checkThings() {
    const pl = this.pl, b = pl.body, px = pl.x, py = pl.y - 44;
    // Sammeln
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      if ((it.x - px) ** 2 + (it.y - py) ** 2 > (it.r + 30) ** 2) continue;
      this.items.splice(i, 1);
      if (it.type === 'gem') { this.addGems(1); this.tweens.add({ targets: it.img, y: it.img.y - 40, alpha: 0, scale: it.img.scale * 1.5, duration: 260, onComplete: () => it.img.destroy() }); this.sparks.explode(5, it.x, it.y); }
      else if (it.type === 'feather' || it.type === 'eye') {
        const key = it.type === 'feather' ? 'feathers' : 'eyes'; this.p[key]++; K.Save.persist();
        K.Audio.sfx('sparkle', { vol: 0.6 }); it.img.destroy(); it.gl.destroy();
        K.UI.toast(this, it.type === 'feather' ? 'Phönixfeder! Damit darfst du bei einer Aufgabe nochmal probieren.' : 'Eulenauge! Es zeigt dir bei einer schweren Aufgabe einen Tipp.', { size: 26, ms: 2600 });
      } else if (it.type === 'treasure') this.getTreasure(it);
    }
    // Gefahren
    for (const h of this.hazards) {
      if (px + 18 < h.x0 || px - 18 > h.x1) continue;
      const bottom = pl.y, top = pl.y - 80;
      if (h.type === 'liquid' && bottom > h.y0) { this.dunk(h); return; }
      if (h.type === 'spike' && bottom > h.y0 && top < h.y1) { this.hurt(px + 30 * -pl.dir, true); }
      if (h.type === 'storm' && py + 30 > h.y0 && py - 30 < h.y1) this.hurt(h.x0 + 60);
    }
    // Sprungpilze
    for (const m of this.bounces) if (b.velocity.y > 0 && px > m.x0 && px < m.x1 && pl.y > m.y && pl.y < m.y + 40) {
      b.setVelocityY(-1180); pl.bounced = true; pl.dbl = false; K.Audio.sfx('spring', { vol: 0.6 });
      this.tweens.add({ targets: m.img, scaleY: m.img.scaleY * 0.7, duration: 90, yoyo: true });
    }
    // Auslöser
    for (const t of this.triggers) {
      if (Math.abs(t.x - px) > t.r || Math.abs(t.y - pl.y) > 140) continue;
      if (t.type === 'check' && !t.lit) {
        t.lit = true; this.respawnAt = { x: t.x, y: t.y - 4 }; K.Audio.sfx('fire', { vol: 0.5 }); K.Audio.sfx('rise', { vol: 0.4 });
        t.fire = this.add.particles(t.x, t.y - 64, 'p_fire', { speedY: { min: -160, max: -80 }, speedX: { min: -20, max: 20 }, scale: { start: 1.1, end: 0 }, lifespan: 600, frequency: 40, blendMode: 'ADD' }).setDepth(13);
        this.add.image(t.x, t.y - 70, 'p_glow').setScale(3).setTint(0xff8a3a).setBlendMode('ADD').setAlpha(0.5).setDepth(11);
        if (this.hearts < this.maxHearts) { this.hearts = this.maxHearts; this.refreshHud(); }
      }
      if (t.type === 'chest' && !t.open) {
        t.open = true; t.img.setTexture('chest_gold'); K.Audio.sfx('unlock', { vol: 0.6 }); K.Audio.sfx('gems', { vol: 0.6, delay: 0.2 });
        this.tweens.add({ targets: t.img, scaleY: t.img.scaleY * 1.15, duration: 120, yoyo: true });
        for (let k = 0; k < 8; k++) { const g = this.add.image(t.x, t.y - 40, 'gem').setDisplaySize(34, 34).setDepth(25); this.tweens.add({ targets: g, x: t.x + K.rnd(-120, 120), y: t.y - K.rnd(120, 220), duration: 400, ease: 'Quad.easeOut', yoyo: false, onComplete: () => this.tweens.add({ targets: g, x: this.cameras.main.scrollX + 46, y: this.cameras.main.scrollY + 112, alpha: 0.2, duration: 500, delay: k * 40, onComplete: () => g.destroy() }) }); }
        this.addGems(8);
      }
      if (t.type === 'shrine' && !t.used) { t.used = true; this.learnSkill(t); }
      if (t.type === 'shrine' && t.known && !t.told) { t.told = true; K.UI.toast(this, t.skill ? `Hier hat Kivalu schon ${t.skill.name} gelernt.` : 'Ein leerer alter Hort.', { size: 28 }); }
    }
    // Tore
    const g = this.gates.find(g => !g.open);
    if (g && !this.busy) {
      const near = this.mode === 'fly' ? px > g.x - 150 : (g.bridge ? px > g.x - 70 && px < g.x + 6 * 64 : px > g.x - 140 && px < g.x + 20 && pl.y > (g.cy - 3) * 64);
      if (near) this.openGate(g);
    }
    // Ziel
    if (this.finish && !this.won && px > this.finish.x - 20) this.win();
  }
  addGems(n, x, y) {
    this.gems += n; this.p.coins += n;
    if (n === 1) K.Audio.sfx('gem', { vol: 0.35, rate: K.rnd(0.95, 1.15) });
    if (x != null) this.floatText(x, y, '+' + n);
    this.gemTxt.setText(String(this.gems)); this.tweens.add({ targets: this.gemTxt, scale: 1.25, duration: 90, yoyo: true });
  }
  getTreasure(it) {
    const tr = it.tr; this.found.push(tr.key);
    K.Audio.sfx('j_treasure', { vol: 0.8 }); K.Audio.duck(true); this.time.delayedCall(2200, () => K.Audio.duck(false));
    this.sparks.explode(30, it.x, it.y);
    this.tweens.add({ targets: it.img, y: it.y - 80, scale: it.img.scale * 1.6, duration: 600, ease: 'Back.easeOut', onComplete: () => this.tweens.add({ targets: [it.img, it.gl], alpha: 0, duration: 500, delay: 600, onComplete: () => { it.img.destroy(); it.gl.destroy(); } }) });
    if (!it.have) { K.Save.addTreasure(this.p, tr.key); K.UI.toast(this, `Schatz gefunden: ${tr.name}!`, { size: 36, ms: 2400 }); K.Speech.say(`Schatz gefunden: ${tr.name}!`); }
    else K.UI.toast(this, `${tr.name} liegt schon in deinem Hort.`, { size: 28 });
  }

  // ---------- Schaden ----------
  hurt(fromX, spike) {
    const pl = this.pl; if (pl.inv > 0 || this.won) return;
    this.hearts--; this.refreshHud(); pl.inv = 1500; pl.hurtT = 350;
    K.Audio.sfx('hurt', { vol: 0.6 }); this.cameras.main.shake(160, 0.006);
    this.tweens.add({ targets: this.heartImgs[this.hearts], scale: this.heartImgs[this.hearts].scale * 1.5, duration: 120, yoyo: true });
    if (this.mode !== 'fly') { pl.body.setVelocity((pl.x < fromX ? -1 : 1) * 380, spike ? -700 : -480); }
    else pl.body.setVelocity(-300, (pl.y < 400 ? 1 : -1) * 200);
    if (this.hearts <= 0) this.exhausted();
  }
  dunk(h) {
    if (this.dunking) return; this.dunking = true;
    const pl = this.pl; const liq = LIQ[this.w];
    K.Audio.sfx(liq === 'lava' ? 'fire' : 'splash', { vol: 0.6 }); (liq === 'lava' ? this.fx : this.steam).explode(18, pl.x, h.y0);
    pl.body.setVelocity(0, 0); pl.body.setAllowGravity(false); pl.setVisible(false);
    this.hearts--; this.refreshHud();
    this.time.delayedCall(600, () => {
      pl.body.setAllowGravity(this.mode !== 'fly'); pl.setVisible(true); this.dunking = false;
      if (this.hearts <= 0) return this.exhausted();
      pl.body.reset(this.safe.x, this.safe.y); pl.inv = 1500; K.Audio.sfx('pop', { vol: 0.5 });
    });
  }
  fallOut() { this.dunk({ y0: this.WH }); }
  exhausted() {
    if (this.exh) return; this.exh = true; this.deaths++;
    const pl = this.pl; this.busy = true; pl.body.setVelocity(0, 0);
    K.Audio.sfx('j_fail', { vol: 0.6 });
    const t = this.add.text(K.W / 2, K.H / 2 - 40, 'Puh, Kivalu ist erschöpft!', K.title(52)).setOrigin(0.5).setScrollFactor(0).setDepth(4300);
    const t2 = this.add.text(K.W / 2, K.H / 2 + 30, 'Er ruht sich am letzten Feuer aus.', K.txt(30)).setOrigin(0.5).setScrollFactor(0).setDepth(4300);
    this.cameras.main.fade(900, 0, 0, 0, false, (c, prog) => {
      if (prog < 1) return;
      t.destroy(); t2.destroy(); pl.body.reset(this.respawnAt.x, this.respawnAt.y); this.safe = Object.assign({}, this.respawnAt);
      this.hearts = this.maxHearts; this.refreshHud(); this.exh = false; this.busy = false; pl.inv = 1500; pl.setVisible(true);
      this.cameras.main.fadeIn(500);
    });
  }

  // ---------- Tore und Aufgaben ----------
  askTask(cat, why, done) {
    this.busy = true; this.physics.pause(); K.Audio.duck(true); this.pauseBtn.setVisible(false);
    this.scene.launch('Task', { cat, why, onDone: (res) => { this.physics.resume(); this.pauseBtn.setVisible(true); K.Audio.duck(false); this.busy = false; done(res); } });
    this.scene.pause();
  }
  openGate(g) {
    const why = g.bridge ? 'Löse die Aufgabe, dann erscheint die Zauberbrücke!' : this.mode === 'fly' ? 'Eine Sturmwand! Löse die Aufgabe, dann lässt sie dich durch.' : 'Das Runentor öffnet sich nur mit der richtigen Antwort.';
    this.askTask(g.info.cat, why, (res) => {
      g.open = true;
      const reward = res.firstTry ? 5 : 2; this.addGems(reward, this.pl.x, this.pl.y - 140);
      K.Audio.sfx('unlock', { vol: 0.7 }); K.Audio.sfx('rise', { vol: 0.5, delay: 0.15 });
      if (g.bridge) {
        g.rune.setColor('#7affc0');
        g.bridge.forEach(([x, y], i) => this.time.delayedCall(i * 90, () => {
          this.block(x, y, true); this.set(x, y, '=');
          const im = this.add.image(x * 64 + 32, y * 64 + 32, 'iceblock').setDisplaySize(64, 64).setTint(0x9affe0).setAlpha(0).setDepth(11);
          this.tweens.add({ targets: im, alpha: 0.9, duration: 250 }); this.sparks.explode(6, x * 64 + 32, y * 64 + 20); K.Audio.sfx('pop', { vol: 0.3, rate: 1 + i * 0.05 });
        }));
        this.hazards = this.hazards.filter(h => !(h.type === 'liquid' && h.x0 < g.bridge[g.bridge.length - 1][0] * 64 && h.x1 > g.bridge[0][0] * 64 && h.y0 > g.bridge[0][1] * 64));
      } else {
        for (let k = 0; k < this.rows; k++) if (this.ch(g.cx, k) !== '#') this.block(g.cx, k, false);
        g.parts.forEach(o => { if (o === g.arch) return; this.tweens.killTweensOf(o); this.tweens.add({ targets: o, alpha: 0, y: o.y - 60, duration: 600, onComplete: () => o.destroy() }); });
        this.sparks.explode(24, g.x, this.mode === 'fly' ? this.pl.y : (g.cy - 1) * 64);
        if (g.arch) g.arch.setTint(0xffe0a0);
      }
    });
  }
  learnSkill(t) {
    const sk = this.chap.skill, S = K.Story.SKILLS[sk]; if (!S) return;
    this.busy = true; this.physics.pause();
    this.p.seen['skill_' + sk] = true; K.Save.persist(); this.ab = K.Save.abilities(this.p);
    if (this.ab.fire && this.fireBtn) this.fireBtn.c.setVisible(true);
    K.Audio.sfx('j_reveal', { vol: 0.8 }); K.Audio.duck(true);
    this.tweens.add({ targets: t.stone, y: t.y - 200, scale: t.stone.scale * 1.4, alpha: 0, duration: 900 });
    this.sparks.explode(40, t.x, t.y - 120); this.fx.explode(30, this.pl.x, this.pl.y - 50);
    const c = this.add.container(K.W / 2, K.H / 2).setScrollFactor(0).setDepth(4500).setAlpha(0);
    const dim = this.add.rectangle(0, 0, K.W, K.H, 0x000000, 0.55); c.add(dim);
    c.add(this.add.nineslice(0, 10, 'ui_parch', null, 980, 520, 40, 40, 40, 40));
    const pt = { fire: 'pt_kivalu_fire', melt: 'pt_kivalu_fire', bigfire: 'pt_kivalu_fire', fly: 'pt_kivalu_fly', double: 'pt_kivalu_cheer', climb: 'pt_kivalu_proud' }[sk];
    const im = this.add.image(-300, 250, pt).setOrigin(0.5, 1); im.setScale(440 / im.height); c.add(im);
    c.add(this.add.text(90, -200, 'Neue Drachenkunst!', K.txt(30, '#8a3a00', { strokeThickness: 0 })).setOrigin(0.5));
    c.add(this.add.text(90, -150, S.name, K.title(62, '#c2400a', { stroke: '#fff0c8', strokeThickness: 5 })).setOrigin(0.5));
    const intro = sk === 'fire' && K.Story.CUTS['k1-fire'] ? K.Story.CUTS['k1-fire'][0].text : S.desc;
    c.add(this.add.text(-80, -90, intro, K.txt(25, '#3a1a08', { strokeThickness: 0, wordWrap: { width: 520 }, lineSpacing: 4 })));
    c.add(this.add.text(-80, 110, '👉 ' + S.how, K.txt(25, '#1a4a10', { strokeThickness: 0, wordWrap: { width: 520 } })));
    const ok = K.UI.button(this, 90, 220, 260, 72, 'Super!', () => close(), { style: 'green', size: 32 }); c.add(ok); c.setScrollFactor(0, 0, true);
    this.tweens.add({ targets: c, alpha: 1, duration: 300 });
    K.Speech.say(S.name + '! ' + intro + ' ' + S.how);
    const close = () => { if (!c.active) return; K.Speech.stop(); K.Audio.duck(false); c.destroy(); this.physics.resume(); this.busy = false; this.pl.act = 'fire'; this.pl.actT = 500; if (sk === 'fire' || sk === 'bigfire' || sk === 'melt') this.spit(); };
  }

  // ---------- Ziel ----------
  win() {
    this.won = true; this.busy = true;
    const pl = this.pl; pl.body.setVelocity(0, pl.body.velocity.y); pl.inv = 0; pl.setAlpha(1);
    K.Audio.music(null); K.Audio.sfx('j_victory', { vol: 0.9 }); K.Audio.sfx('firework', { vol: 0.5, delay: 0.4 });
    pl.playAnim('cheer'); pl.setFlipX(false);
    for (let k = 0; k < 4; k++) this.time.delayedCall(k * 300, () => this.sparks.explode(30, this.finish.x + K.rnd(-200, 200), this.finish.y - K.rnd(100, 300)));
    this.time.delayedCall(2600, () => {
      this.cameras.main.fadeOut(400);
      this.time.delayedCall(420, () => this.scene.start('LevelDone', { id: this.lvId, gems: this.gems, maxGems: this.maxGems, treasures: this.found, secs: Math.round((Date.now() - this.t0) / 1000) }));
    });
  }

  // ---------- Pause ----------
  togglePause() {
    if (this.won || this.busy && !this.paused) return;
    if (this.paused) { this.paused = false; this.physics.resume(); this.tweens.resumeAll(); this.pauseC.destroy(); return; }
    this.paused = true; this.physics.pause(); this.tweens.pauseAll();
    const c = this.pauseC = this.add.container(0, 0).setScrollFactor(0).setDepth(5000);
    c.add(this.add.rectangle(0, 0, K.W, K.H, 0x000000, 0.6).setOrigin(0));
    c.add(this.add.nineslice(K.W / 2, K.H / 2, 'ui_panel', null, 560, 500, 36, 36, 36, 36));
    c.add(this.add.text(K.W / 2, K.H / 2 - 190, 'Pause', K.title(60)).setOrigin(0.5));
    c.add(K.UI.button(this, K.W / 2, K.H / 2 - 80, 380, 78, 'Weiterspielen', () => this.togglePause(), { style: 'green', icon: 'ic_play', size: 30 }));
    c.add(K.UI.button(this, K.W / 2, K.H / 2 + 15, 380, 78, 'Neu starten', () => { this.scene.restart({ id: this.lvId }); }, { style: 'gold', size: 30 }));
    c.add(K.UI.button(this, K.W / 2, K.H / 2 + 110, 380, 78, 'Zur Karte', () => { this.scene.start('Map', { focus: this.lvId }); }, { style: 'stone', icon: 'ic_map', size: 30 }));
    const tips = this.mode === 'fly' ? 'Tasten: ← → ↑ ↓ fliegen, X Feuer' : 'Tasten: ← → laufen, Leertaste springen, X Feuer';
    c.add(this.add.text(K.W / 2, K.H / 2 + 195, tips, K.txt(20, '#e8d8c0')).setOrigin(0.5)); c.setScrollFactor(0, 0, true);
  }

  // ---------- Endgegner ----------
  setupBoss() {
    const A = this.arena; if (!A || this.boss) return;
    const T = K.TILE, gx = A.x1 - 3.4 * T, gy = A.ground;
    const img = this.add.image(gx, gy + 8, 'boss').setOrigin(0.5, 1).setDepth(15); img.setScale(380 / img.height);
    const core = this.add.image(gx - 30, gy - 160, 'p_glow').setScale(2.5).setTint(0xff3a00).setDepth(16).setAlpha(0.3);
    const ket = this.add.image(gx - 40, gy - 352, 'ketterich').setOrigin(0.5, 1).setDepth(14); ket.setScale(150 / ket.height).setFlipX(true);
    const shield = this.add.ellipse(gx - 20, gy - 190, 330, 420, 0x6ac8ff, 0.16).setStrokeStyle(6, 0xaae6ff, 0.85).setDepth(17).setAlpha(0.9);
    this.tweens.add({ targets: shield, alpha: 0.55, duration: 700, yoyo: true, repeat: -1 });
    const tasks = this.L.gates.slice(); const hp = tasks.length;
    const bar = this.add.container(K.W / 2, 50).setScrollFactor(0).setDepth(4000);
    bar.add(this.add.text(0, -26, 'Drachenmaschine', K.txt(24, '#ffd0a0')).setOrigin(0.5));
    const pips = []; for (let i = 0; i < hp; i++) { const p = this.add.image((i - (hp - 1) / 2) * 46, 8, 'gem').setDisplaySize(36, 36).setTint(0xff6040); bar.add(p); pips.push(p); }
    const B = this.boss = { img, core, ket, shield, hp, tasks, pips, state: 'attack', t: 0, wave: 0, bombs: [], gx, gy,
      hitTest: (x, y) => B.state !== 'dead' && Math.abs(x - (gx - 20)) < 120 && Math.abs(y - (gy - 200)) < 160,
      onFire: () => {
        if (B.state === 'open') { B.state = 'task'; this.bossTask(); }
        else { K.Audio.sfx('bonk', { vol: 0.5 }); this.sparks.explode(8, gx - 120, gy - 200); if (!B.hint) { B.hint = true; K.UI.toast(this, 'Der Schild ist zu stark! Warte, bis die Maschine überhitzt.', { size: 26 }); } }
      } };
    K.Audio.sfx('j_boss', { vol: 0.8 }); K.Audio.sfx('machine', { vol: 0.5 });
    this.cameras.main.shake(400, 0.006);
    K.Speech.say('Ketterich: Ha! Meine Drachenmaschine wird dich zerquetschen!');
    K.UI.toast(this, 'Ketterich: „Ha! Meine Drachenmaschine wird dich zerquetschen!“', { size: 28, ms: 3000, y: 150 });
    this.tweens.add({ targets: img, y: img.y - 6, duration: 300, yoyo: true, repeat: -1 });
    this.fireBtn.c.setVisible(true);
  }
  updateBoss(dt, time) {
    const pl = this.pl;
    if (!this.boss) {
      if (this.arena && pl.x > this.arena.x1 - K.W + 60) {
        const ax = this.arena.x1 - K.W; const cam = this.cameras.main;
        cam.stopFollow(); cam.pan(ax + K.W / 2, this.WH - K.H / 2, 600, 'Sine.easeInOut');
        this.physics.world.setBounds(ax, -600, K.W, this.WH + 1200); this.setupBoss();
      }
      return;
    }
    const B = this.boss; if (B.state === 'dead') return;
    B.t += dt;
    if (B.state === 'attack') {
      const n = 3 + Math.min(3, Math.floor((B.tasks.length - B.hp) / 2));
      if (B.t > 1.2 && B.wave < n) { B.wave++; B.t = 0.4; this.bossBomb(); }
      if (B.wave >= n && B.t > 2.5) {
        B.state = 'open'; B.t = 0; K.Audio.sfx('steam' in K.ASSETS.sfx ? 'steam' : 'machine', { vol: 0.5 });
        this.tweens.killTweensOf(B.shield); this.tweens.add({ targets: B.shield, alpha: 0, duration: 400 }); B.core.setAlpha(1); this.tweens.add({ targets: B.core, scale: 3.4, duration: 400, yoyo: true, repeat: -1 });
        K.UI.toast(this, 'Die Maschine überhitzt! Jetzt Feuer auf den glühenden Kern!', { size: 28 });
        this.steamFx = this.add.particles(B.gx, B.gy - 300, 'p_steam', { speedY: { min: -200, max: -80 }, speedX: { min: -60, max: 60 }, scale: { start: 0.6, end: 2.5 }, alpha: { start: 0.7, end: 0 }, lifespan: 1200, frequency: 50 }).setDepth(18);
      }
    } else if (B.state === 'open' && B.t > 7) this.bossClose();
    // Bomben
    for (let i = B.bombs.length - 1; i >= 0; i--) {
      const b = B.bombs[i]; b.vy += 1500 * dt; b.img.x += b.vx * dt; b.img.y += b.vy * dt; b.img.rotation += b.vx * dt / 30;
      if (b.img.y > B.gy - 26) { b.img.y = B.gy - 26; b.vy = -Math.abs(b.vy) * 0.55; if (Math.abs(b.vy) < 200) b.vy = 0; b.bounces++; }
      b.life -= dt;
      const hitP = Math.abs(b.img.x - pl.x) < 50 && Math.abs(b.img.y - (pl.y - 40)) < 60;
      if (hitP || b.life <= 0 || b.img.x < this.arena.x + 20) {
        if (hitP) this.hurt(b.img.x);
        K.Audio.sfx('bang', { vol: 0.45 }); this.fx.explode(20, b.img.x, b.img.y); this.smoke.explode(6, b.img.x, b.img.y);
        b.img.fuse.destroy(); b.img.destroy(); B.bombs.splice(i, 1);
      }
    }
  }
  bossBomb() {
    const B = this.boss; K.Audio.sfx('hit', { vol: 0.5 });
    const img = this.add.image(B.gx - 120, B.gy - 260, 'bomb').setDepth(19).setTint(0x8a8aa0); img.setScale(56 / img.height);
    img.fuse = this.add.particles(0, 0, 'p_spark', { follow: img, followOffset: { y: -26 }, speed: 60, scale: { start: 0.6, end: 0 }, lifespan: 250, frequency: 30, blendMode: 'ADD' }).setDepth(20);
    const dx = this.pl.x - img.x; const tt = K.rnd(0.9, 1.3);
    B.bombs.push({ img, vx: dx / tt * K.rnd(0.8, 1.05), vy: -600, life: 3.2, bounces: 0 });
  }
  bossClose() {
    const B = this.boss; B.state = 'attack'; B.t = 0; B.wave = 0;
    this.tweens.killTweensOf(B.core); B.core.setScale(2.5).setAlpha(0.3); B.shield.setAlpha(0.9); this.tweens.add({ targets: B.shield, alpha: 0.55, duration: 700, yoyo: true, repeat: -1 });
    if (this.steamFx) { this.steamFx.stop(); }
  }
  bossTask() {
    const B = this.boss; const cat = B.tasks[B.tasks.length - B.hp].cat;
    this.askTask(cat, 'Treffer! Löse die Aufgabe, dann zerbricht ein Teil der Maschine!', (res) => {
      B.hp--; const pip = B.pips[B.hp]; pip.setTint(0x333333).setAlpha(0.5);
      K.Audio.sfx('boom', { vol: 0.7 }); this.cameras.main.shake(400, 0.012); this.fx.explode(40, B.gx - 20, B.gy - 200); this.sparks.explode(30, B.gx, B.gy - 150);
      this.tweens.add({ targets: B.img, x: B.img.x + 10, duration: 60, yoyo: true, repeat: 5 });
      this.addGems(res.firstTry ? 5 : 2, B.gx - 100, B.gy - 300);
      if (B.hp <= 0) return this.bossDown();
      this.bossClose();
    });
  }
  bossDown() {
    const B = this.boss; B.state = 'dead'; B.bombs.forEach(b => { b.img.fuse.destroy(); b.img.destroy(); }); B.bombs = [];
    if (this.steamFx) this.steamFx.stop();
    K.Audio.music(null); K.Audio.sfx('boom', { vol: 0.9 });
    for (let k = 0; k < 8; k++) this.time.delayedCall(k * 250, () => { this.fx.explode(30, B.gx + K.rnd(-150, 150), B.gy - K.rnd(50, 350)); K.Audio.sfx('bang', { vol: 0.5 }); this.cameras.main.shake(200, 0.01); });
    B.ket.setTexture('ketterich_scared');
    this.tweens.add({ targets: B.ket, x: B.ket.x + 900, y: B.ket.y - 200, duration: 2200, delay: 900, ease: 'Quad.easeIn' });
    this.tweens.add({ targets: B.img, y: B.img.y + 60, angle: -8, alpha: 0.4, duration: 2000, delay: 600 });
    this.time.delayedCall(1800, () => {
      const hg = this.add.image(B.gx - 20, B.gy - 200, 'herzglut').setDepth(25).setScale(0.5);
      const gl = this.add.image(hg.x, hg.y, 'p_glow').setTint(0xff8a2a).setBlendMode('ADD').setScale(5).setDepth(24);
      this.tweens.add({ targets: [hg, gl], y: B.gy - 160, duration: 1200, ease: 'Sine.easeOut' });
      this.tweens.add({ targets: hg, scale: 1.4, duration: 1200 });
      K.Audio.sfx('j_treasure', { vol: 0.9 });
      this.finish = { x: this.pl.x - 10, y: B.gy };
    });
  }
}
