// Laden aller Dateien, Erzeugen der gemalten Texturen, Einfärben von Kivalu
'use strict';
K.ASSETS = {
  props: 'barrel bomb boss bruno chest chest_gold crystal_blue crystal_ice crystal_red drone0 drone1 festung herzglut ketterich ketterich_point ketterich_scared knight_broken knight_hot knight_walk0 knight_walk1 knight_walk2 knight_walk3 t_amethyst t_ei t_ei2 t_flasche t_hammer t_herz t_kelch t_kugel t_kugel_silber t_laterne t_muenzen t_rubin t_saphir t_schluessel t_smaragd t_stern t_truhe t_urne t_zahnrad w1_brazier w1_column w1_obelisk w1_rock0 w1_rock1 w1_rock2 w1_rock3 w1_rock4 w1_rock5 w1_skull w2_bush w2_crooked w2_grass w2_lily w2_log w2_moss w2_mushroom_big w2_mushroom_group w2_mushroom_tan w2_stump w2_tree0 w2_tree1 w2_tree2 w2_tree3 w2_tree4 w3_pine w3_pine2 w3_rocks w3_snowman w3_snowpile w3_tree w4_anvil w4_barrel w4_column w4_crates w4_pickaxe w4_rocks w4_structure w4_support w5_barrel w5_cannon w5_crate w5_palm w5_palm2 w5_rocks w5_ship w5_tower w5_wreck w6_box w6_cog0 w6_cog1 w6_cog2 w6_crane w6_hopper w6_machine w6_pipe w6_robotarm w6_screen w6_warning w7_cannon w7_flag w7_mast'.split(' '),
  portraits: 'grauzahn kivalu_cheer kivalu_fire kivalu_fly kivalu_idle kivalu_proud kivalu_sad kivalu_shock mama papa silber silber_fly stone_adult stone_shock'.split(' '),
  hats: ['krone', 'zauberhut', 'piratenhut', 'wikingerhelm', 'blumenkranz', 'fliegerbrille', 'schal'],
  music: { title: 'assets/audio/music/title.ogg', drama: 'assets/audio/music/drama.ogg', w1: 'assets/audio/music/w1.ogg', w2: 'assets/audio/music/w2.ogg', w3: 'assets/audio/music/w3.ogg', w4: 'assets/audio/music/w4.ogg', w5: 'assets/audio/music/w5.ogg', w6: 'assets/audio/music/w6.ogg', w7: 'assets/audio/music/w7.ogg', boss: 'assets/audio/music/boss.ogg', map: 'assets/audio/music/map.ogg', hort: 'assets/audio/music/hort.ogg', finale: 'assets/audio/music/finale.ogg' },
  // Kurzname → Datei
  sfx: {
    click: 'ui_click-soft', tap: 'ui_click-tonal', hover: 'ui_hover', jump: 'whoosh_swish-thin', flutter: 'whoosh_air-03', land: 'footsteps_rpg-04', step: 'footsteps_rpg-01', snowstep: 'footsteps_snow-001',
    fire: 'scifi_thruster-fire-000', bigfire: 'scifi_thruster-fire-002', gem: 'money_handle-coins-2', gems: 'money_coins-handful', coin: 'money_coin-drop', sparkle: 'magic_sparkle', rise: 'magic_sparkle-rise', shimmer: 'magic_shimmer-pad',
    hurt: 'creature_cute-03', bonk: 'impact_hit-01', hit: 'impact_hit-04', metal: 'impact_metal-heavy-001', rock: 'impact_rock-hit-01', boom: 'impact_cinematic-heavy', distant: 'impact_distant-boom', gong: 'impact_gong-01',
    roar: 'creature_roar-02', roarS: 'creature_roar-01', grunt: 'creature_grunt-02', troll: 'creature_troll-01', ouch: 'creature_hurt-02', bang: 'explosion_bang-03', firework: 'explosion_firework-02',
    crumble: 'break_rock-breaking-01', rockfall: 'break_rock-falling-01', right: 'notification_success-arpeggio', right2: 'notification_confirm-002', levelup: 'notification_level-up', wrong: 'notification_error-003', question: 'notification_question-002',
    unlock: 'mechanical_lock-open-01', key: 'mechanical_key-open-01', gear: 'mechanical_gear-clockwork', machine: 'mechanical_machine-02', splash: 'water_splash-03', bubble: 'water_bubble-01', pop: 'pop_pop-1', hop: 'pop_classic-hop', spring: 'misc_spring-03',
    page: 'paper_page-flip', book: 'paper_book-open', tension: 'riser_tension-4s', swell: 'transition_swell-bell', whoosh: 'whoosh_soft-short', deep: 'whoosh_deep', cine: 'whoosh_cinematic', whooshhit: 'transition_whoosh-hit-1', pizz: 'jingle_pizzicato-01',
    j_boss: 'j_boss_appears', j_charge: 'j_charge', j_fail: 'j_failure', j_happy: 'j_happy_ending', j_start: 'j_level_start', j_reveal: 'j_reveal', j_news: 'j_startling_news', j_treasure: 'j_treasure', j_victory: 'j_victory',
    amb_wind: 'ambience_wind', amb_crickets: 'ambience_night-crickets', amb_rain: 'ambience_rain', amb_thunder: 'ambience_thunder-01', amb_water: 'ambience_water-02', amb_machine: 'ambience_machine-02',
  },
};

class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload() {
    K.Save.load();
    const L = this.load;
    L.on('progress', (v) => K.bootProgress(v * 0.85));
    L.image('kivalu_sheet', K.url('assets/sprites/kivalu.webp'));
    L.json('kivalu_meta', K.url('assets/sprites/kivalu.json'));
    K.ASSETS.hats.forEach(h => L.image('hatsheet_' + h, K.url(`assets/sprites/hat_${h}.webp`)));
    K.ASSETS.props.forEach(p => L.image(p, K.url(`assets/props/${p}.webp`)));
    L.json('props_meta', K.url('assets/props/props.json'));
    K.ASSETS.portraits.forEach(p => L.image('pt_' + p, K.url(`assets/portraits/${p}.webp`)));
  }
  async create() {
    K.Art.boot(this);
    K.kivaluMeta = this.cache.json.get('kivalu_meta');
    K.propsMeta = this.cache.json.get('props_meta');
    K.addSheetFrames(this, 'kivalu_sheet');
    K.ASSETS.hats.forEach(h => K.addSheetFrames(this, 'hatsheet_' + h));
    // Schriften sicher laden, bevor Text gezeichnet wird
    try { await Promise.race([Promise.all(['600 20px Fredoka', '700 20px Fredoka', '400 20px Uncial'].map(f => document.fonts.load(f))), new Promise(r => setTimeout(r, 2500))]); } catch (e) {}
    // Effekte vorladen
    K.Audio.ensure();
    const sfx = {}; Object.entries(K.ASSETS.sfx).forEach(([k, f]) => sfx[k] = `assets/audio/sfx/${f}.ogg`);
    await K.Audio.loadSfx(sfx, (f) => K.bootProgress(0.85 + f * 0.15));
    K.bootProgress(1);
    K.hideBoot();
    this.scene.start('Profiles');
  }
}

// Frames eines Kivalu-Bogens (oder Hut-Bogens) registrieren: Frame-Namen 0..53
K.addSheetFrames = (scene, key) => {
  const m = K.kivaluMeta, tex = scene.textures.get(key);
  const total = Object.values(m.anims).reduce((s, a) => s + a.n, 0);
  for (let i = 0; i < total; i++) { if (!tex.has(String(i))) tex.add(String(i), 0, (i % m.cols) * m.fw, Math.floor(i / m.cols) * m.fh, m.fw, m.fh); }
};

// Schuppenfarben: Blautöne im Bogen umfärben
K.COLORS = {
  blau: { name: 'Himmelblau', hue: null, price: 0 },
  smaragd: { name: 'Smaragdgrün', hue: 140, sat: 0.95, light: 0.9, price: 60 },
  rubin: { name: 'Rubinrot', hue: 352, sat: 1.0, light: 0.9, price: 60 },
  violett: { name: 'Zaubersviolett', hue: 275, sat: 0.9, light: 0.95, price: 80 },
  gold: { name: 'Goldschuppe', hue: 44, sat: 1.0, light: 1.0, price: 150 },
  nacht: { name: 'Nachtdrache', hue: 238, sat: 0.7, light: 0.52, price: 120 },
  eis: { name: 'Frostdrache', hue: 196, sat: 0.4, light: 1.3, price: 100 },
};
K.kivaluTexture = (scene, color) => {
  if (!color || color === 'blau' || !K.COLORS[color]) return 'kivalu_sheet';
  const key = 'kivalu_' + color; if (scene.textures.exists(key)) return key;
  const c = K.COLORS[color], src = scene.textures.get('kivalu_sheet').getSourceImage();
  const cv = document.createElement('canvas'); cv.width = src.width; cv.height = src.height; const g = cv.getContext('2d'); g.drawImage(src, 0, 0);
  const d = g.getImageData(0, 0, cv.width, cv.height), a = d.data;
  for (let i = 0; i < a.length; i += 4) {
    if (a[i + 3] === 0) continue;
    let r = a[i] / 255, gg = a[i + 1] / 255, b = a[i + 2] / 255; const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), dd = mx - mn; let h = 0, l = (mx + mn) / 2, s = 0;
    if (dd < 1e-4) continue; s = l > 0.5 ? dd / (2 - mx - mn) : dd / (mx + mn); h = mx === r ? ((gg - b) / dd + (gg < b ? 6 : 0)) : mx === gg ? ((b - r) / dd + 2) : ((r - gg) / dd + 4); h *= 60;
    if (!(h > 165 && h < 265 && s > 0.18)) continue;
    h = c.hue; s = Math.min(1, s * c.sat); l = Math.min(1, l * c.light);
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; const f = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    const hh = h / 360; a[i] = f(hh + 1 / 3) * 255; a[i + 1] = f(hh) * 255; a[i + 2] = f(hh - 1 / 3) * 255;
  }
  g.putImageData(d, 0, 0); scene.textures.addCanvas(key, cv); K.addSheetFrames(scene, key); return key;
};
K.HATS = {
  krone: { name: 'Goldkrone', price: 120 }, zauberhut: { name: 'Zauberhut', price: 70 }, piratenhut: { name: 'Piratenhut', price: 70 },
  wikingerhelm: { name: 'Wikingerhelm', price: 90 }, blumenkranz: { name: 'Blumenkranz', price: 40 }, fliegerbrille: { name: 'Fliegerbrille', price: 60 }, schal: { name: 'Roter Schal', price: 40 },
};

// Kivalu-Figur mit Hut (für Menüs, Hort, Level)
K.makeKivalu = (scene, x, y, profile, scale = 0.5) => {
  const tex = K.kivaluTexture(scene, profile && profile.color);
  const s = scene.add.sprite(x, y, tex, '0').setScale(scale).setOrigin(K.kivaluMeta.cx / K.kivaluMeta.fw, K.kivaluMeta.feet / K.kivaluMeta.fh);
  if (profile && profile.hat) { s.hat = scene.add.sprite(x, y, 'hatsheet_' + profile.hat, '0').setScale(scale).setOrigin(s.originX, s.originY); }
  s.playAnim = (name, loop = true) => K.playKivaluAnim(scene, s, name, loop);
  s.syncHat = () => { if (s.hat) { s.hat.setPosition(s.x, s.y).setFlipX(s.flipX).setFrame(s.frame.name).setScale(s.scaleX, s.scaleY).setRotation(s.rotation).setDepth(s.depth + 0.01).setVisible(s.visible).setAlpha(s.alpha); } };
  scene.events.on('postupdate', s.syncHat);
  s.on('destroy', () => { scene.events.off('postupdate', s.syncHat); if (s.hat) s.hat.destroy(); });
  return s;
};
K.playKivaluAnim = (scene, s, name, loop = true) => {
  const a = K.kivaluMeta.anims[name]; if (!a) return;
  if (s.curAnim === name && loop) return; s.curAnim = name; s.animT = 0; s.animLoop = loop; s.animDone = false;
  s.setFrame(String(a.start));
  if (!s.animTick) {
    s.animTick = (t, dt) => {
      if (!s.active) return; const an = K.kivaluMeta.anims[s.curAnim]; if (!an) return;
      s.animT += dt * (s.animSpeed || 1); let f = Math.floor(s.animT / 1000 * an.fps);
      if (f >= an.n) { if (s.animLoop) f %= an.n; else { f = an.n - 1; if (!s.animDone) { s.animDone = true; s.emit('animdone', s.curAnim); } } }
      s.setFrame(String(an.start + f)); s.animFrame = f;
    };
    scene.events.on('update', s.animTick);
    s.on('destroy', () => scene.events.off('update', s.animTick));
  }
};
