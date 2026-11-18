// Grafik, die zur Laufzeit gemalt wird: UI-Rahmen, Symbole, Partikel, Gelände-Texturen und Parallax-Hintergründe.
// Figuren und Requisiten sind vorgerenderte 3D-Sprites (Kivalu-Modell und Kenney-3D-Bausätze, CC0).
'use strict';
K.Art = (() => {
  // --- Hilfen -------------------------------------------------------------
  function seeded(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function addCanvas(scene, key, c) { if (scene.textures.exists(key)) scene.textures.remove(key); scene.textures.addCanvas(key, c); return key; }
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  const hex = (n) => '#' + n.toString(16).padStart(6, '0');
  function mix(a, b, t) { const pa = [a >> 16, (a >> 8) & 255, a & 255], pb = [b >> 16, (b >> 8) & 255, b & 255]; return pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).reduce((s, v) => (s << 8) + v, 0); }
  const rgba = (n, a) => `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;

  // --- UI -----------------------------------------------------------------
  function btnTex(scene, key, top, bot, rim, w = 96, h = 96) {
    const c = canvas(w, h), g = c.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,0.35)'; rr(g, 3, 7, w - 6, h - 8, 26); g.fill();
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(1, bot);
    g.fillStyle = rim; rr(g, 2, 2, w - 4, h - 8, 26); g.fill();
    g.fillStyle = gr; rr(g, 6, 6, w - 12, h - 16, 22); g.fill();
    const hl = g.createLinearGradient(0, 6, 0, h * 0.5); hl.addColorStop(0, 'rgba(255,255,255,0.55)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = hl; rr(g, 10, 9, w - 20, h * 0.36, 16); g.fill();
    addCanvas(scene, key, c);
  }
  function roundTex(scene, key, top, bot, rim) {
    const s = 128, c = canvas(s, s), g = c.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.arc(64, 68, 60, 0, 7); g.fill();
    g.fillStyle = rim; g.beginPath(); g.arc(64, 63, 60, 0, 7); g.fill();
    const gr = g.createLinearGradient(0, 8, 0, 120); gr.addColorStop(0, top); gr.addColorStop(1, bot);
    g.fillStyle = gr; g.beginPath(); g.arc(64, 63, 53, 0, 7); g.fill();
    const hl = g.createRadialGradient(54, 36, 2, 54, 40, 44); hl.addColorStop(0, 'rgba(255,255,255,0.6)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = hl; g.beginPath(); g.arc(64, 63, 53, 0, 7); g.fill();
    addCanvas(scene, key, c);
  }
  function panelTex(scene, key, a, b, rimA, rimB, alpha = 0.94) {
    const s = 128, c = canvas(s, s), g = c.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,0.4)'; rr(g, 4, 8, s - 8, s - 10, 30); g.fill();
    const rim = g.createLinearGradient(0, 0, 0, s); rim.addColorStop(0, rimA); rim.addColorStop(1, rimB);
    g.fillStyle = rim; rr(g, 2, 2, s - 4, s - 8, 30); g.fill();
    const gr = g.createLinearGradient(0, 0, 0, s); gr.addColorStop(0, a); gr.addColorStop(1, b);
    g.globalAlpha = alpha; g.fillStyle = gr; rr(g, 9, 9, s - 18, s - 22, 24); g.fill(); g.globalAlpha = 1;
    g.strokeStyle = 'rgba(255,230,170,0.25)'; g.lineWidth = 2; rr(g, 14, 14, s - 28, s - 32, 20); g.stroke();
    addCanvas(scene, key, c);
  }
  function icon(scene, key, draw, s = 96) { const c = canvas(s, s), g = c.getContext('2d'); g.translate(s / 2, s / 2); g.scale(s / 96, s / 96); draw(g); addCanvas(scene, key, c); }

  function gem(g, col1 = '#ffb347', col2 = '#ff3d00', glow = 'rgba(255,120,0,0.55)') {
    const gl = g.createRadialGradient(0, 0, 4, 0, 0, 46); gl.addColorStop(0, glow); gl.addColorStop(1, 'rgba(255,80,0,0)'); g.fillStyle = gl; g.fillRect(-48, -48, 96, 96);
    const pts = [[0, -34], [26, -14], [20, 24], [0, 36], [-20, 24], [-26, -14]];
    g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath();
    const gr = g.createLinearGradient(-20, -30, 20, 30); gr.addColorStop(0, col1); gr.addColorStop(1, col2); g.fillStyle = gr; g.fill();
    g.lineWidth = 3; g.strokeStyle = '#5a1200'; g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.moveTo(0, -34); g.lineTo(26, -14); g.lineTo(0, -6); g.lineTo(-26, -14); g.closePath(); g.fill();
    g.fillStyle = 'rgba(120,0,0,0.25)'; g.beginPath(); g.moveTo(0, -6); g.lineTo(20, 24); g.lineTo(0, 36); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.ellipse(-9, -16, 5, 3, -0.6, 0, 7); g.fill();
  }
  function makeUI(scene) {
    btnTex(scene, 'ui_btn_gold', '#ffe9a3', '#f0a92c', '#7a4300');
    btnTex(scene, 'ui_btn_green', '#c7f59a', '#5fbf3a', '#235a10');
    btnTex(scene, 'ui_btn_red', '#ffb3a3', '#e2533a', '#6a1606');
    btnTex(scene, 'ui_btn_blue', '#bfe6ff', '#4b9be0', '#123a6a');
    btnTex(scene, 'ui_btn_stone', '#6d5a72', '#3a2c42', '#1a1020');
    btnTex(scene, 'ui_btn_white', '#ffffff', '#e8dcc6', '#6a5030');
    roundTex(scene, 'ui_round_gold', '#ffe9a3', '#f0a92c', '#7a4300');
    roundTex(scene, 'ui_round_stone', '#7a6680', '#3a2c42', '#1a1020');
    roundTex(scene, 'ui_round_red', '#ffb3a3', '#e2533a', '#6a1606');
    roundTex(scene, 'ui_round_glass', 'rgba(255,255,255,0.35)', 'rgba(255,255,255,0.12)', 'rgba(0,0,0,0.25)');
    panelTex(scene, 'ui_panel', '#3b2340', '#1f1226', '#e8b25a', '#8a4e12');
    panelTex(scene, 'ui_parch', '#fff5dc', '#f0dcb0', '#c48a3a', '#6b3e10', 1);
    panelTex(scene, 'ui_hud', 'rgba(30,16,36,0.75)', 'rgba(20,10,26,0.75)', 'rgba(232,178,90,0.8)', 'rgba(138,78,18,0.8)', 0.8);
    icon(scene, 'ic_gem', g => gem(g));
    icon(scene, 'ic_feather', g => {
      g.rotate(0.5); const gr = g.createLinearGradient(0, -40, 0, 40); gr.addColorStop(0, '#ffe066'); gr.addColorStop(0.5, '#ff7a1a'); gr.addColorStop(1, '#c2180a');
      g.fillStyle = gr; g.beginPath(); g.moveTo(0, -42); g.bezierCurveTo(26, -20, 22, 18, 2, 38); g.bezierCurveTo(-22, 16, -24, -18, 0, -42); g.fill();
      g.strokeStyle = '#6a1000'; g.lineWidth = 3; g.stroke(); g.beginPath(); g.moveTo(0, -38); g.lineTo(2, 46); g.stroke();
      g.strokeStyle = 'rgba(120,20,0,0.5)'; g.lineWidth = 2; for (let i = -28; i < 30; i += 8) { g.beginPath(); g.moveTo(1, i); g.lineTo(16, i - 8); g.moveTo(1, i); g.lineTo(-14, i - 8); g.stroke(); }
    });
    icon(scene, 'ic_eye', g => {
      g.fillStyle = '#fff4d6'; g.beginPath(); g.ellipse(0, 0, 40, 26, 0, 0, 7); g.fill(); g.lineWidth = 4; g.strokeStyle = '#5a3200'; g.stroke();
      const gr = g.createRadialGradient(-4, -4, 2, 0, 0, 20); gr.addColorStop(0, '#ffe680'); gr.addColorStop(1, '#d98a00'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 19, 0, 7); g.fill();
      g.fillStyle = '#1a0a00'; g.beginPath(); g.arc(0, 0, 9, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(-6, -6, 5, 0, 7); g.fill();
    });
    icon(scene, 'ic_speak', g => {
      g.fillStyle = '#3a1a00'; g.beginPath(); g.moveTo(-30, -12); g.lineTo(-14, -12); g.lineTo(4, -28); g.lineTo(4, 28); g.lineTo(-14, 12); g.lineTo(-30, 12); g.closePath(); g.fill();
      g.strokeStyle = '#3a1a00'; g.lineWidth = 6; g.lineCap = 'round'; [14, 26].forEach(r => { g.beginPath(); g.arc(4, 0, r, -0.8, 0.8); g.stroke(); });
    });
    icon(scene, 'ic_home', g => { g.fillStyle = '#3a1a00'; g.beginPath(); g.moveTo(-32, -2); g.lineTo(0, -32); g.lineTo(32, -2); g.lineTo(24, -2); g.lineTo(24, 30); g.lineTo(6, 30); g.lineTo(6, 10); g.lineTo(-6, 10); g.lineTo(-6, 30); g.lineTo(-24, 30); g.lineTo(-24, -2); g.closePath(); g.fill(); });
    icon(scene, 'ic_pause', g => { g.fillStyle = '#3a1a00'; rr(g, -24, -28, 16, 56, 5); g.fill(); rr(g, 8, -28, 16, 56, 5); g.fill(); });
    icon(scene, 'ic_back', g => { g.strokeStyle = '#3a1a00'; g.lineWidth = 12; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(12, -28); g.lineTo(-16, 0); g.lineTo(12, 28); g.stroke(); });
    icon(scene, 'ic_play', g => { g.fillStyle = '#3a1a00'; g.beginPath(); g.moveTo(-18, -30); g.lineTo(30, 0); g.lineTo(-18, 30); g.closePath(); g.fill(); });
    icon(scene, 'ic_lock', g => { g.strokeStyle = '#e8d2a0'; g.lineWidth = 9; g.beginPath(); g.arc(0, -10, 16, Math.PI, 0); g.stroke(); g.fillStyle = '#e8b25a'; rr(g, -26, -10, 52, 40, 8); g.fill(); g.fillStyle = '#5a3000'; g.beginPath(); g.arc(0, 8, 6, 0, 7); g.fill(); });
    icon(scene, 'ic_star', g => { star(g, 0, 0, 40, 18, '#ffe066', '#c27a00'); });
    icon(scene, 'ic_star_off', g => { star(g, 0, 0, 40, 18, 'rgba(255,255,255,0.15)', 'rgba(0,0,0,0.4)'); });
    icon(scene, 'ic_gear', g => { g.fillStyle = '#3a1a00'; for (let i = 0; i < 8; i++) { g.save(); g.rotate(i * Math.PI / 4); rr(g, -7, -38, 14, 18, 3); g.fill(); g.restore(); } g.beginPath(); g.arc(0, 0, 26, 0, 7); g.fill(); g.fillStyle = '#f0a92c'; g.beginPath(); g.arc(0, 0, 10, 0, 7); g.fill(); });
    icon(scene, 'ic_check', g => { g.strokeStyle = '#1f6a10'; g.lineWidth = 14; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(-28, 2); g.lineTo(-8, 24); g.lineTo(30, -24); g.stroke(); });
    icon(scene, 'ic_hort', g => { g.fillStyle = '#7a3e12'; rr(g, -34, -6, 68, 36, 6); g.fill(); g.fillStyle = '#a65a1c'; g.beginPath(); g.ellipse(0, -6, 34, 18, 0, Math.PI, 0); g.fill(); g.fillStyle = '#ffc531'; g.fillRect(-34, -8, 68, 7); g.fillRect(-5, -10, 10, 22); [[-18, -26], [6, -30], [20, -22]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 8, 0, 7); g.fill(); }); });
    icon(scene, 'ic_shop', g => { g.fillStyle = '#3a1a00'; g.beginPath(); g.moveTo(-30, -20); g.lineTo(30, -20); g.lineTo(24, 26); g.lineTo(-24, 26); g.closePath(); g.fill(); g.strokeStyle = '#3a1a00'; g.lineWidth = 7; g.beginPath(); g.arc(0, -20, 15, Math.PI, 0); g.stroke(); });
    icon(scene, 'ic_map', g => { g.fillStyle = '#3a1a00'; g.beginPath(); g.moveTo(-34, -24); g.lineTo(-12, -30); g.lineTo(12, -22); g.lineTo(34, -28); g.lineTo(34, 24); g.lineTo(12, 30); g.lineTo(-12, 22); g.lineTo(-34, 28); g.closePath(); g.fill(); g.strokeStyle = '#f0a92c'; g.lineWidth = 3; g.beginPath(); g.moveTo(-12, -30); g.lineTo(-12, 22); g.moveTo(12, -22); g.lineTo(12, 30); g.stroke(); });
    icon(scene, 'ic_arrow', g => { g.fillStyle = 'rgba(255,255,255,0.92)'; g.beginPath(); g.moveTo(-22, -30); g.lineTo(26, 0); g.lineTo(-22, 30); g.closePath(); g.fill(); });
    icon(scene, 'ic_jump', g => { g.fillStyle = 'rgba(255,255,255,0.92)'; g.beginPath(); g.moveTo(0, -32); g.lineTo(30, 6); g.lineTo(12, 6); g.lineTo(12, 30); g.lineTo(-12, 30); g.lineTo(-12, 6); g.lineTo(-30, 6); g.closePath(); g.fill(); });
    icon(scene, 'ic_heart', g => { g.fillStyle = '#ff3b5c'; g.beginPath(); g.moveTo(0, 34); g.bezierCurveTo(-46, 4, -34, -40, 0, -16); g.bezierCurveTo(34, -40, 46, 4, 0, 34); g.fill(); g.lineWidth = 4; g.strokeStyle = '#6a0010'; g.stroke(); g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.ellipse(-16, -12, 8, 5, -0.6, 0, 7); g.fill(); });
    icon(scene, 'ic_heart_off', g => { g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.moveTo(0, 34); g.bezierCurveTo(-46, 4, -34, -40, 0, -16); g.bezierCurveTo(34, -40, 46, 4, 0, 34); g.fill(); g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,0.4)'; g.stroke(); });
    icon(scene, 'ic_up', g => { g.fillStyle = 'rgba(255,255,255,0.92)'; g.beginPath(); g.moveTo(0, -28); g.lineTo(30, 22); g.lineTo(-30, 22); g.closePath(); g.fill(); });
    icon(scene, 'ic_fire', g => { flame(g, 0, 6, 34, '#fff3a0', '#ff9a1a', '#e2331a'); });
  }
  function star(g, x, y, R, r, fill, stroke) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r : R; g.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); } g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = 4; g.strokeStyle = stroke; g.stroke(); }
  function flame(g, x, y, s, c1, c2, c3) {
    const shape = (k) => { g.beginPath(); g.moveTo(x, y - s * 1.2 * k); g.bezierCurveTo(x + s * 0.9 * k, y - s * 0.3 * k, x + s * 0.8 * k, y + s * 0.8 * k, x, y + s * 0.8 * k); g.bezierCurveTo(x - s * 0.8 * k, y + s * 0.8 * k, x - s * 0.9 * k, y - s * 0.3 * k, x, y - s * 1.2 * k); g.fill(); };
    g.fillStyle = c3; shape(1); g.fillStyle = c2; shape(0.72); g.fillStyle = c1; shape(0.42);
  }

  // --- Partikel -------------------------------------------------------------
  function makeParticles(scene) {
    const soft = (key, s, stops) => { const c = canvas(s, s), g = c.getContext('2d'); const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); stops.forEach(([o, col]) => gr.addColorStop(o, col)); g.fillStyle = gr; g.fillRect(0, 0, s, s); addCanvas(scene, key, c); };
    soft('p_glow', 64, [[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,255,255,0.6)'], [1, 'rgba(255,255,255,0)']]);
    soft('p_fire', 64, [[0, 'rgba(255,255,220,1)'], [0.2, 'rgba(255,220,90,0.95)'], [0.5, 'rgba(255,110,10,0.6)'], [1, 'rgba(200,20,0,0)']]);
    soft('p_smoke', 64, [[0, 'rgba(90,80,90,0.55)'], [0.6, 'rgba(70,60,70,0.25)'], [1, 'rgba(60,50,60,0)']]);
    soft('p_steam', 64, [[0, 'rgba(255,255,255,0.6)'], [0.6, 'rgba(240,240,250,0.25)'], [1, 'rgba(240,240,250,0)']]);
    soft('p_ember', 16, [[0, 'rgba(255,250,200,1)'], [0.3, 'rgba(255,160,40,0.9)'], [1, 'rgba(255,60,0,0)']]);
    soft('p_spark', 24, [[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,240,180,0.9)'], [1, 'rgba(255,200,80,0)']]);
    soft('p_ice', 24, [[0, 'rgba(255,255,255,1)'], [0.4, 'rgba(200,240,255,0.8)'], [1, 'rgba(160,220,255,0)']]);
    soft('p_spore', 16, [[0, 'rgba(230,255,200,0.9)'], [0.4, 'rgba(170,230,140,0.5)'], [1, 'rgba(120,200,100,0)']]);
    soft('p_dust', 16, [[0, 'rgba(255,240,220,0.7)'], [1, 'rgba(255,240,220,0)']]);
    // Schneeflocke
    { const c = canvas(24, 24), g = c.getContext('2d'); g.fillStyle = '#fff'; g.beginPath(); g.arc(12, 12, 5, 0, 7); g.fill(); g.globalAlpha = 0.4; g.beginPath(); g.arc(12, 12, 9, 0, 7); g.fill(); addCanvas(scene, 'p_snow', c); }
    // Regentropfen / Blatt
    { const c = canvas(8, 32), g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 32); gr.addColorStop(0, 'rgba(200,220,255,0)'); gr.addColorStop(1, 'rgba(220,235,255,0.8)'); g.fillStyle = gr; g.fillRect(3, 0, 2, 32); addCanvas(scene, 'p_rain', c); }
    { const c = canvas(32, 32), g = c.getContext('2d'); g.translate(16, 16); g.rotate(0.6); g.fillStyle = '#6b8f2a'; g.beginPath(); g.ellipse(0, 0, 13, 6, 0, 0, 7); g.fill(); g.strokeStyle = '#3f5a12'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-12, 0); g.lineTo(12, 0); g.stroke(); addCanvas(scene, 'p_leaf', c); }
    // Glutstein (Sammelobjekt) groß
    icon(scene, 'gem', g => gem(g), 72);
    icon(scene, 'gem_blue', g => gem(g, '#bff3ff', '#2a8ad8', 'rgba(80,180,255,0.5)'), 72);
    icon(scene, 'feather', scene.textures.get('ic_feather') ? (g => { g.drawImage(scene.textures.get('ic_feather').getSourceImage(), -48, -48); }) : () => {}, 96);
    // Feuerball
    icon(scene, 'fireball', g => { const gl = g.createRadialGradient(0, 0, 2, 0, 0, 46); gl.addColorStop(0, 'rgba(255,255,230,1)'); gl.addColorStop(0.25, 'rgba(255,220,80,1)'); gl.addColorStop(0.55, 'rgba(255,110,10,0.8)'); gl.addColorStop(1, 'rgba(200,20,0,0)'); g.fillStyle = gl; g.beginPath(); g.arc(0, 0, 46, 0, 7); g.fill(); }, 64);
  }

  // --- Weltstile --------------------------------------------------------------
  const WORLDS = {
    1: { name: 'Glutfels', rockA: 0x3a2a33, rockB: 0x1d141c, mortar: 0x120a10, crack: 0xff5a14, cap: 'ash', capA: 0x5a4650, capB: 0x2e2228, sky: [0x2a0d1f, 0x8a2a1a, 0xff8a3a], far: 0x5a2030, mid: 0x3a1622, near: 0x22101a, fog: 0xff7a40, particles: 'ember', seed: 11 },
    2: { name: 'Nebelwald', rockA: 0x4a3a2c, rockB: 0x2a2018, mortar: 0x1a120c, crack: null, cap: 'moss', capA: 0x5f9a3a, capB: 0x2f5a1c, sky: [0x14262a, 0x3a6a62, 0xb9d6b0], far: 0x3d6058, mid: 0x26403a, near: 0x152822, fog: 0xc8e0d0, particles: 'spore', seed: 22 },
    3: { name: 'Frostzinnen', rockA: 0x6a7a92, rockB: 0x3a465c, mortar: 0x242c3c, crack: null, cap: 'snow', capA: 0xffffff, capB: 0xcfe4f5, sky: [0x1c2a52, 0x5a7ab8, 0xd8ecff], far: 0x8aa4cc, mid: 0x5a7298, near: 0x34445e, fog: 0xe8f4ff, particles: 'snow', seed: 33 },
    4: { name: 'Zwergenminen', rockA: 0x5a4636, rockB: 0x2c2018, mortar: 0x160e08, crack: 0x56d0ff, cap: 'stone', capA: 0x7a6650, capB: 0x4a3a2c, sky: [0x0c0a10, 0x241a1c, 0x3a2a24], far: 0x2e2220, mid: 0x221816, near: 0x140e0c, fog: 0x8a6a4a, particles: 'dust', seed: 44 },
    5: { name: 'Sturmküste', rockA: 0x8a7a62, rockB: 0x544636, mortar: 0x2a2018, crack: null, cap: 'sand', capA: 0xead7a0, capB: 0xbfa46a, sky: [0x1a2236, 0x4a5a78, 0xa8b4c8], far: 0x5a6a84, mid: 0x3a4a62, near: 0x26303e, fog: 0xc8d4e4, particles: 'rain', seed: 55 },
    6: { name: 'Eisenstadt', rockA: 0x5a5e66, rockB: 0x30343c, mortar: 0x1a1c22, crack: 0xffa020, cap: 'metal', capA: 0x9aa2ae, capB: 0x5a626e, sky: [0x1a1418, 0x5a3a30, 0xd88a50], far: 0x5a4642, mid: 0x3a302e, near: 0x221c1c, fog: 0xd8a070, particles: 'steam', seed: 66 },
    7: { name: 'Himmelsfestung', rockA: 0x6a5a4a, rockB: 0x3a3028, mortar: 0x1e1810, crack: 0xffd27a, cap: 'wood', capA: 0xb07a40, capB: 0x6a4420, sky: [0x101c3a, 0x3a5aa0, 0xffc890], far: 0xa8b8d8, mid: 0x7a8cb8, near: 0x4a5a88, fog: 0xffffff, particles: 'cloud', seed: 77 },
  };

  // Steinmuster (Worley-Zellen) – kachelbar 256×256
  function rockPattern(scene, w) {
    const key = 'rock_' + w; if (scene.textures.exists(key)) return key;
    const S = 256, st = WORLDS[w], R = seeded(st.seed);
    const c = canvas(S, S), g = c.getContext('2d'), img = g.createImageData(S, S);
    const n = w === 6 ? 0 : 26, pts = []; for (let i = 0; i < n; i++) pts.push([R() * S, R() * S, R()]);
    const A = st.rockA, B = st.rockB, M = st.mortar;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      let col;
      if (w === 6) { // Metallplatten mit Nieten
        const px = x % 128, py = y % 64; const edge = Math.min(px, 127 - px, py, 63 - py);
        const t = 0.35 + 0.4 * (py / 64) + (R() - 0.5) * 0.06; col = mix(A, B, K.clamp(t, 0, 1));
        if (edge < 3) col = mix(col, M, 0.8); else if (edge < 5) col = mix(col, 0xffffff, 0.12);
        const rv = [[8, 8], [119, 8], [8, 55], [119, 55]].some(([rx, ry]) => (px - rx) ** 2 + (py - ry) ** 2 < 10);
        if (rv) col = mix(A, 0xffffff, 0.35);
      } else {
        let d1 = 1e9, d2 = 1e9, best = null;
        for (const p of pts) for (let ox = -S; ox <= S; ox += S) for (let oy = -S; oy <= S; oy += S) {
          const d = (x - p[0] - ox) ** 2 + (y - p[1] - oy) ** 2; if (d < d1) { d2 = d1; d1 = d; best = p; } else if (d < d2) d2 = d;
        }
        const e = Math.sqrt(d2) - Math.sqrt(d1);
        const shade = 0.25 + best[2] * 0.5 + (R() - 0.5) * 0.08;
        col = mix(A, B, K.clamp(shade + (y % 256) / 1400, 0, 1));
        if (e < 3) col = mix(col, M, 0.85); else if (e < 6) col = mix(col, 0xffffff, 0.07);
        if (st.crack && e < 1.6 && best[2] > 0.72) col = mix(st.crack, 0xffffff, 0.15);
      }
      const i = (y * S + x) * 4; img.data[i] = col >> 16; img.data[i + 1] = (col >> 8) & 255; img.data[i + 2] = col & 255; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    addCanvas(scene, key, c); return key;
  }

  // Gelände eines Levels: ein Teilstück (Chunk) ab x0 malen, nur Reihen mit Fels
  function terrainChunk(scene, w, grid, solidFn, x0, chunkW = 512) {
    const st = WORLDS[w], T = K.TILE, rows = grid.length, cols = grid[0].length;
    const pat = scene.textures.get(rockPattern(scene, w)).getSourceImage();
    const R = seeded(st.seed + x0);
    const solid = (cx, cy) => cy >= rows ? solidFn(grid[rows - 1][Math.max(0, Math.min(cols - 1, cx))]) : (cx < 0 || cx >= cols || cy < 0) ? false : solidFn(grid[cy][cx]);
    const c0 = Math.max(0, Math.floor(x0 / T) - 1), c1 = Math.min(cols - 1, Math.ceil((x0 + chunkW) / T) + 1);
    let top = rows; for (let cy = 0; cy < rows; cy++) for (let cx = c0; cx <= c1; cx++) if (solid(cx, cy)) top = Math.min(top, cy);
    if (top >= rows) return null;
    const pad = 40, y0 = top * T - pad;
    const c = canvas(chunkW, rows * T - y0), g = c.getContext('2d');
    g.translate(-x0, -y0);
    const pattern = g.createPattern(pat, 'repeat');
    g.fillStyle = pattern;
    for (let cy = top; cy < rows; cy++) for (let cx = c0; cx <= c1; cx++) {
      if (!solid(cx, cy)) continue;
      const x = cx * T, y = cy * T, r = 20;
      const up = solid(cx, cy - 1), dn = solid(cx, cy + 1), lf = solid(cx - 1, cy), rt = solid(cx + 1, cy);
      g.beginPath();
      g.moveTo(x + (!up && !lf ? r : 0), y);
      if (!up && !rt) { g.lineTo(x + T - r, y); g.quadraticCurveTo(x + T, y, x + T, y + r); } else g.lineTo(x + T, y);
      if (!dn && !rt) { g.lineTo(x + T, y + T - r); g.quadraticCurveTo(x + T, y + T, x + T - r, y + T); } else g.lineTo(x + T, y + T);
      if (!dn && !lf) { g.lineTo(x + r, y + T); g.quadraticCurveTo(x, y + T, x, y + T - r); } else g.lineTo(x, y + T);
      if (!up && !lf) { g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); } else g.lineTo(x, y);
      g.closePath(); g.fill();
    }
    for (let cy = top; cy < rows; cy++) for (let cx = c0; cx <= c1; cx++) {
      if (!solid(cx, cy)) continue;
      const x = cx * T, y = cy * T;
      let depth = 0; for (let k = 1; k <= 4; k++) { if (solid(cx, cy - k)) depth++; else break; }
      if (depth) { g.fillStyle = `rgba(0,0,0,${Math.min(0.55, depth * 0.13)})`; g.fillRect(x, y, T, T); }
      if (!solid(cx - 1, cy)) { const gr = g.createLinearGradient(x, 0, x + 16, 0); gr.addColorStop(0, 'rgba(255,255,255,0.10)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x, y, 16, T); }
      if (!solid(cx + 1, cy)) { const gr = g.createLinearGradient(x + T - 18, 0, x + T, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.35)'); g.fillStyle = gr; g.fillRect(x + T - 18, y, 18, T); }
      if (!solid(cx, cy + 1)) { const gr = g.createLinearGradient(0, y + T - 20, 0, y + T); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.45)'); g.fillStyle = gr; g.fillRect(x, y + T - 20, T, 20); }
    }
    for (let cy = top; cy < rows; cy++) for (let cx = c0; cx <= c1; cx++) {
      if (!solid(cx, cy) || solid(cx, cy - 1)) continue;
      const x = cx * T, y = cy * T, lf = solid(cx - 1, cy) && !solid(cx - 1, cy - 1), rt = solid(cx + 1, cy) && !solid(cx + 1, cy - 1);
      drawCap(g, st, x, y, T, lf, rt, R);
    }
    const key = `terr_${w}_${x0}_${Math.random().toString(36).slice(2, 7)}`;
    addCanvas(scene, key, c); return { key, x: x0, y: y0 };
  }
  function drawCap(g, st, x, y, T, lf, rt, R) {
    const A = st.capA, B = st.capB, x0 = x - (lf ? 0 : 4), x1 = x + T + (rt ? 0 : 4);
    const thick = st.cap === 'snow' ? 18 : st.cap === 'metal' || st.cap === 'wood' ? 14 : 13;
    // Grundstreifen mit welliger Unterkante
    const gr = g.createLinearGradient(0, y - 4, 0, y + thick + 6); gr.addColorStop(0, hex(mix(A, 0xffffff, 0.15))); gr.addColorStop(1, hex(B));
    g.fillStyle = gr; g.beginPath(); g.moveTo(x0, y + 2);
    if (st.cap === 'snow') { for (let i = 0; i <= 4; i++) { const px = x0 + (x1 - x0) * i / 4; g.quadraticCurveTo(px - 8, y - 9 - R() * 6, px, y - 3); } }
    else g.lineTo(x1, y + 2);
    g.lineTo(x1, y + 2);
    const steps = 6; for (let i = steps; i >= 0; i--) { const px = x0 + (x1 - x0) * i / steps; g.lineTo(px, y + thick + (st.cap === 'metal' ? 0 : (R() * 8 - 2))); }
    g.closePath(); g.fill();
    // Glanzlinie
    g.strokeStyle = rgba(mix(A, 0xffffff, 0.5), 0.6); g.lineWidth = 2; g.beginPath(); g.moveTo(x0 + 2, y + 2); g.lineTo(x1 - 2, y + 2); g.stroke();
    if (st.cap === 'moss') { // Grashalme und Blätter
      for (let i = 0; i < 9; i++) { const px = x0 + R() * (x1 - x0), h = 6 + R() * 12; g.strokeStyle = hex(mix(A, i % 2 ? 0xd8ff8a : 0x2a5a14, 0.35)); g.lineWidth = 3; g.beginPath(); g.moveTo(px, y + 4); g.quadraticCurveTo(px + R() * 8 - 4, y - h * 0.5, px + R() * 10 - 5, y - h); g.stroke(); }
      for (let i = 0; i < 3; i++) { const px = x0 + R() * (x1 - x0); g.fillStyle = hex(mix(B, 0x000000, 0.2)); g.beginPath(); g.ellipse(px, y + thick + 2, 5 + R() * 4, 6 + R() * 6, 0, 0, Math.PI); g.fill(); }
    } else if (st.cap === 'ash') { // Glutpunkte
      for (let i = 0; i < 4; i++) { const px = x0 + R() * (x1 - x0), py = y + 4 + R() * 6; g.fillStyle = 'rgba(255,120,40,0.85)'; g.beginPath(); g.arc(px, py, 1.5 + R() * 1.5, 0, 7); g.fill(); }
      for (let i = 0; i < 5; i++) { const px = x0 + R() * (x1 - x0); g.fillStyle = hex(mix(A, 0x000000, 0.3)); g.beginPath(); g.arc(px, y + 1, 2 + R() * 4, Math.PI, 0); g.fill(); }
    } else if (st.cap === 'snow') {
      for (let i = 0; i < 2; i++) { if (R() < 0.5) continue; const px = x0 + 8 + R() * (x1 - x0 - 16), h = 8 + R() * 16; const ig = g.createLinearGradient(0, y + thick, 0, y + thick + h); ig.addColorStop(0, 'rgba(220,240,255,0.95)'); ig.addColorStop(1, 'rgba(160,210,255,0.3)'); g.fillStyle = ig; g.beginPath(); g.moveTo(px - 4, y + thick - 2); g.lineTo(px + 4, y + thick - 2); g.lineTo(px, y + thick + h); g.closePath(); g.fill(); }
    } else if (st.cap === 'sand') {
      for (let i = 0; i < 10; i++) { g.fillStyle = rgba(mix(B, 0x000000, 0.3), 0.5); g.fillRect(x0 + R() * (x1 - x0), y + 3 + R() * 9, 2, 2); }
      if (R() < 0.35) { const px = x0 + R() * (x1 - x0); g.strokeStyle = '#7a9a3a'; g.lineWidth = 2; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(px, y + 3); g.quadraticCurveTo(px + k * 3, y - 10, px + k * 6, y - 16); g.stroke(); } }
    } else if (st.cap === 'metal') {
      g.fillStyle = 'rgba(255,190,40,0.85)'; for (let i = 0; i < 4; i++) { g.save(); g.beginPath(); g.rect(x0, y + 5, x1 - x0, 5); g.clip(); g.beginPath(); const px = x + i * 16; g.moveTo(px, y + 10); g.lineTo(px + 8, y + 5); g.lineTo(px + 14, y + 5); g.lineTo(px + 6, y + 10); g.fill(); g.restore(); }
    } else if (st.cap === 'wood') {
      g.strokeStyle = 'rgba(60,30,10,0.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y + 8); g.lineTo(x1, y + 8); g.stroke();
      g.fillStyle = '#d8c090'; [x + 10, x + T - 10].forEach(px => { g.beginPath(); g.arc(px, y + 5, 2.5, 0, 7); g.fill(); });
    } else if (st.cap === 'stone') {
      for (let i = 0; i < 3; i++) { const px = x0 + R() * (x1 - x0); g.fillStyle = hex(mix(A, 0xffffff, 0.12)); g.beginPath(); g.ellipse(px, y + 2, 6 + R() * 6, 4, 0, Math.PI, 0); g.fill(); }
    }
  }

  // --- Hintergründe (horizontal kachelbar) -------------------------------------
  function ridge(R, W, base, amp, oct) { // periodische Höhenlinie
    const comps = []; for (let i = 0; i < oct; i++) comps.push({ k: (i + 1) * (1 + Math.floor(R() * 3)), a: amp / (i + 1.3), p: R() * 7 });
    return (x) => base + comps.reduce((s, c) => s + Math.sin(x / W * Math.PI * 2 * c.k + c.p) * c.a, 0);
  }
  function makeBackground(scene, w) {
    const st = WORLDS[w], R = seeded(st.seed * 7), BW = 2048, BH = K.H;
    const keys = {};
    // Himmel
    { const c = canvas(64, BH), g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, BH); gr.addColorStop(0, hex(st.sky[0])); gr.addColorStop(0.62, hex(st.sky[1])); gr.addColorStop(1, hex(st.sky[2])); g.fillStyle = gr; g.fillRect(0, 0, 64, BH); keys.sky = addCanvas(scene, `bg${w}_sky`, c); }
    // Lichtquelle / Himmelsdetails
    { const c = canvas(BW, BH), g = c.getContext('2d');
      if (w === 1) { // Vulkan mit Glut
        const vx = BW * 0.3; const gl = g.createRadialGradient(vx, 300, 10, vx, 300, 420); gl.addColorStop(0, 'rgba(255,140,40,0.55)'); gl.addColorStop(1, 'rgba(255,60,0,0)'); g.fillStyle = gl; g.fillRect(0, 0, BW, BH);
        g.fillStyle = hex(0x4a1828); g.beginPath(); g.moveTo(vx - 520, BH); g.lineTo(vx - 90, 300); g.quadraticCurveTo(vx, 285, vx + 90, 300); g.lineTo(vx + 560, BH); g.fill();
        const lv = g.createLinearGradient(0, 300, 0, 520); lv.addColorStop(0, '#ffcf5a'); lv.addColorStop(1, 'rgba(255,60,0,0)'); g.fillStyle = lv;
        for (const off of [-30, 15, 50]) { g.beginPath(); g.moveTo(vx + off - 6, 302); g.quadraticCurveTo(vx + off * 2.5, 420, vx + off * 4, 560); g.lineTo(vx + off * 4 + 10, 560); g.quadraticCurveTo(vx + off * 2.5 + 10, 420, vx + off + 6, 302); g.fill(); }
        for (let i = 0; i < 9; i++) { g.fillStyle = `rgba(40,20,30,${0.25 + R() * 0.2})`; g.beginPath(); g.ellipse(vx + (R() - 0.3) * 300, 240 - i * 26, 60 + i * 18, 26 + i * 6, 0, 0, 7); g.fill(); }
      } else if (w === 3 || w === 7) { // Sonne
        const sx = BW * 0.7, sy = w === 7 ? 520 : 170; const gl = g.createRadialGradient(sx, sy, 10, sx, sy, 360); gl.addColorStop(0, 'rgba(255,250,230,0.95)'); gl.addColorStop(0.1, 'rgba(255,240,200,0.7)'); gl.addColorStop(1, 'rgba(255,230,200,0)'); g.fillStyle = gl; g.fillRect(0, 0, BW, BH);
      } else if (w === 5) { // Gewitterwolken
        for (let i = 0; i < 40; i++) { const x = R() * BW, y = R() * 260; g.fillStyle = `rgba(30,36,52,${0.25 + R() * 0.35})`; g.beginPath(); g.ellipse(x, y, 120 + R() * 200, 40 + R() * 50, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(x + BW * (x > BW / 2 ? -1 : 1), y, 120, 40, 0, 0, 7); g.fill(); }
      } else if (w === 2) { // Mond hinter Nebel
        const gl = g.createRadialGradient(BW * 0.62, 150, 10, BW * 0.62, 150, 240); gl.addColorStop(0, 'rgba(240,255,240,0.7)'); gl.addColorStop(0.15, 'rgba(220,240,220,0.35)'); gl.addColorStop(1, 'rgba(200,230,210,0)'); g.fillStyle = gl; g.fillRect(0, 0, BW, BH);
      } else if (w === 6) { // Schlote und Rauch
        for (let i = 0; i < 7; i++) { const x = 140 + i * 290 + R() * 60, h = 260 + R() * 160; g.fillStyle = hex(mix(st.far, 0x000000, 0.25)); g.fillRect(x, BH - h, 40, h); g.fillRect(x - 6, BH - h, 52, 14); for (let k = 0; k < 8; k++) { g.fillStyle = `rgba(60,50,50,${0.28 - k * 0.03})`; g.beginPath(); g.arc(x + 20 + k * 22, BH - h - 20 - k * 30, 20 + k * 8, 0, 7); g.fill(); } }
      } else if (w === 4) { // Kristalle in der Höhlendecke
        for (let i = 0; i < 30; i++) { const x = R() * BW, y = R() * BH * 0.8; const gl = g.createRadialGradient(x, y, 0, x, y, 30); gl.addColorStop(0, 'rgba(120,220,255,0.35)'); gl.addColorStop(1, 'rgba(120,220,255,0)'); g.fillStyle = gl; g.fillRect(x - 30, y - 30, 60, 60); }
      }
      keys.deco = addCanvas(scene, `bg${w}_deco`, c); }
    // drei Silhouetten-Ebenen
    const layer = (name, col, base, amp, oct, detail) => {
      const c = canvas(BW, BH), g = c.getContext('2d'); const f = ridge(R, BW, base, amp, oct);
      g.fillStyle = hex(col); g.beginPath(); g.moveTo(0, BH); for (let x = 0; x <= BW; x += 8) g.lineTo(x, f(x)); g.lineTo(BW, BH); g.closePath(); g.fill();
      if (detail) detail(g, f, col);
      // Dunst nach unten
      const fg = g.createLinearGradient(0, base - amp, 0, BH); fg.addColorStop(0, rgba(st.fog, 0)); fg.addColorStop(1, rgba(st.fog, name === 'far' ? 0.22 : 0.12));
      g.globalCompositeOperation = 'source-atop'; g.fillStyle = fg; g.fillRect(0, 0, BW, BH); g.globalCompositeOperation = 'source-over';
      keys[name] = addCanvas(scene, `bg${w}_${name}`, c);
    };
    const pines = (g, f, col, n, s) => { g.fillStyle = hex(col); for (let i = 0; i < n; i++) { const x = R() * BW, y = f(x) + 6, h = s * (0.6 + R() * 0.7); [0, BW, -BW].forEach(o => { g.beginPath(); g.moveTo(x + o, y - h); g.lineTo(x + o + h * 0.28, y); g.lineTo(x + o - h * 0.28, y); g.closePath(); g.fill(); }); } };
    const mushrooms = (g, f, col, n, s) => { for (let i = 0; i < n; i++) { const x = R() * BW, y = f(x) + 8, h = s * (0.5 + R()); [0, BW, -BW].forEach(o => { g.fillStyle = hex(col); g.fillRect(x + o - h * 0.06, y - h, h * 0.12, h); g.beginPath(); g.ellipse(x + o, y - h, h * 0.35, h * 0.16, 0, Math.PI, 0); g.fill(); }); } };
    const spikes = (g, f, col, n, s) => { g.fillStyle = hex(col); for (let i = 0; i < n; i++) { const x = R() * BW, y = f(x) + 4, h = s * (0.4 + R()); [0, BW, -BW].forEach(o => { g.beginPath(); g.moveTo(x + o - h * 0.15, y); g.lineTo(x + o + (R() - 0.5) * 10, y - h); g.lineTo(x + o + h * 0.15, y); g.fill(); }); } };
    const towers = (g, f, col, n, s) => { g.fillStyle = hex(col); for (let i = 0; i < n; i++) { const x = R() * BW, y = f(x) + 10, h = s * (0.6 + R() * 0.8), wd = 30 + R() * 50; [0, BW, -BW].forEach(o => { g.fillRect(x + o, y - h, wd, h); for (let k = 0; k < wd; k += 14) g.fillRect(x + o + k, y - h - 10, 8, 10); }); } };
    const clouds = (g, f, col) => { for (let i = 0; i < 26; i++) { const x = R() * BW, y = f(x) - R() * 40; [0, BW, -BW].forEach(o => { g.fillStyle = hex(mix(col, 0xffffff, 0.3)); g.beginPath(); g.ellipse(x + o, y, 90 + R() * 80, 30 + R() * 20, 0, 0, 7); g.fill(); }); } };
    const D = {
      1: [['far', st.far, 470, 90, 4, (g, f, c) => spikes(g, f, mix(c, 0x000000, 0.1), 30, 70)], ['mid', st.mid, 540, 70, 5, (g, f, c) => spikes(g, f, c, 40, 90)], ['near', st.near, 610, 50, 6, null]],
      2: [['far', st.far, 430, 60, 3, (g, f, c) => pines(g, f, c, 160, 120)], ['mid', st.mid, 520, 50, 4, (g, f, c) => mushrooms(g, f, c, 26, 170)], ['near', st.near, 600, 40, 5, (g, f, c) => pines(g, f, c, 50, 220)]],
      3: [['far', st.far, 380, 150, 4, null], ['mid', st.mid, 500, 90, 5, (g, f, c) => pines(g, f, c, 90, 90)], ['near', st.near, 600, 60, 6, (g, f, c) => pines(g, f, c, 30, 160)]],
      4: [['far', st.far, 520, 60, 6, (g, f, c) => spikes(g, f, c, 60, 120)], ['mid', st.mid, 580, 50, 6, (g, f, c) => spikes(g, f, c, 50, 150)], ['near', st.near, 640, 40, 6, null]],
      5: [['far', st.far, 470, 50, 3, null], ['mid', st.mid, 540, 70, 5, null], ['near', st.near, 620, 40, 5, (g, f, c) => spikes(g, f, c, 12, 120)]],
      6: [['far', st.far, 470, 40, 3, (g, f, c) => towers(g, f, c, 26, 200)], ['mid', st.mid, 540, 30, 4, (g, f, c) => towers(g, f, c, 18, 160)], ['near', st.near, 620, 30, 4, null]],
      7: [['far', st.far, 560, 40, 4, clouds], ['mid', st.mid, 620, 40, 5, clouds], ['near', mix(st.near, 0xffffff, 0.5), 690, 30, 5, clouds]],
    }[w];
    D.forEach(a => layer(...a));
    // Lichtstrahlen / Nebelschleier
    { const c = canvas(BW, BH), g = c.getContext('2d');
      for (let i = 0; i < 6; i++) { const y = 300 + R() * 360; const gr = g.createLinearGradient(0, y - 40, 0, y + 40); gr.addColorStop(0, rgba(st.fog, 0)); gr.addColorStop(0.5, rgba(st.fog, w === 2 ? 0.16 : 0.07)); gr.addColorStop(1, rgba(st.fog, 0)); g.fillStyle = gr; g.fillRect(0, y - 40, BW, 80); }
      if (w === 2 || w === 4 || w === 6) for (let i = 0; i < 5; i++) { const x = R() * BW; g.save(); g.translate(x, 0); g.rotate(0.35); const gr = g.createLinearGradient(-60, 0, 60, 0); gr.addColorStop(0, rgba(st.fog, 0)); gr.addColorStop(0.5, rgba(st.fog, 0.08)); gr.addColorStop(1, rgba(st.fog, 0)); g.fillStyle = gr; g.fillRect(-60, -100, 120, BH * 1.4); g.restore(); }
      keys.fog = addCanvas(scene, `bg${w}_fog`, c); }
    return keys;
  }

  // Lava- und Wasseroberfläche (kachelbar)
  function makeLiquids(scene) {
    { const c = canvas(256, 128), g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, '#fff2a0'); gr.addColorStop(0.12, '#ffb020'); gr.addColorStop(0.45, '#ff4a00'); gr.addColorStop(1, '#8a0e00'); g.fillStyle = gr; g.fillRect(0, 0, 256, 128);
      const R = seeded(5); for (let i = 0; i < 40; i++) { const x = R() * 256, y = 14 + R() * 100; g.fillStyle = `rgba(${R() < 0.5 ? '255,230,120' : '120,10,0'},${0.25 + R() * 0.3})`; g.beginPath(); g.ellipse(x, y, 12 + R() * 22, 3 + R() * 4, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(x - 256, y, 12, 3, 0, 0, 7); g.fill(); }
      addCanvas(scene, 'lava', c); }
    { const c = canvas(256, 128), g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgba(160,230,220,0.9)'); gr.addColorStop(0.1, 'rgba(60,140,140,0.85)'); gr.addColorStop(1, 'rgba(10,40,50,0.95)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 128);
      const R = seeded(9); for (let i = 0; i < 30; i++) { const x = R() * 256, y = 10 + R() * 100; g.strokeStyle = `rgba(200,255,250,${0.1 + R() * 0.15})`; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10, y - 3, x + 22, y); g.stroke(); }
      addCanvas(scene, 'water', c); }
    { const c = canvas(256, 128), g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgba(110,140,60,0.95)'); gr.addColorStop(0.15, 'rgba(60,90,40,0.92)'); gr.addColorStop(1, 'rgba(20,35,15,0.97)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 128);
      const R = seeded(13); for (let i = 0; i < 26; i++) { const x = R() * 256, y = 8 + R() * 110; g.fillStyle = `rgba(150,190,90,${0.15 + R() * 0.2})`; g.beginPath(); g.arc(x, y, 2 + R() * 5, 0, 7); g.fill(); }
      addCanvas(scene, 'swamp', c); }
  }

  // Requisiten, die nicht aus 3D-Modellen kommen
  function makeProps(scene) {
    // Spinnennetz
    { const c = canvas(128, 192), g = c.getContext('2d'); g.strokeStyle = 'rgba(240,240,240,0.85)'; g.lineWidth = 2;
      const cx = 64, cy = 96; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * 90, cy + Math.sin(a) * 110); g.stroke(); }
      for (let r = 14; r < 100; r += 14) { g.beginPath(); for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI * 2; const px = cx + Math.cos(a) * r * 0.75, py = cy + Math.sin(a) * r; i ? g.quadraticCurveTo(cx + Math.cos(a - 0.3) * r * 0.6, cy + Math.sin(a - 0.3) * r * 0.85, px, py) : g.moveTo(px, py); } g.stroke(); }
      addCanvas(scene, 'cobweb', c); }
    // Runentor (Steinbogen mit leuchtenden Runen)
    { const c = canvas(160, 256), g = c.getContext('2d');
      const st = g.createLinearGradient(0, 0, 160, 0); st.addColorStop(0, '#5a5060'); st.addColorStop(0.5, '#8a8090'); st.addColorStop(1, '#4a4050'); g.fillStyle = st;
      g.beginPath(); g.moveTo(8, 256); g.lineTo(8, 70); g.quadraticCurveTo(80, -20, 152, 70); g.lineTo(152, 256); g.lineTo(122, 256); g.lineTo(122, 80); g.quadraticCurveTo(80, 18, 38, 80); g.lineTo(38, 256); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 3; for (let y = 100; y < 256; y += 40) { g.beginPath(); g.moveTo(8, y); g.lineTo(38, y); g.moveTo(122, y + 20); g.lineTo(152, y + 20); g.stroke(); }
      g.fillStyle = '#ffb347'; g.font = 'bold 22px serif'; ['ᚱ', 'ᚢ', 'ᚾ', 'ᛖ'].forEach((r, i) => { g.fillText(r, 14, 120 + i * 36); g.fillText(r, 128, 140 + i * 30); });
      addCanvas(scene, 'runegate', c); }
    // Torfüllung (magischer Vorhang)
    { const c = canvas(84, 200), g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 84, 0); gr.addColorStop(0, 'rgba(255,120,40,0.2)'); gr.addColorStop(0.5, 'rgba(255,190,80,0.75)'); gr.addColorStop(1, 'rgba(255,120,40,0.2)'); g.fillStyle = gr; g.fillRect(0, 0, 84, 200); addCanvas(scene, 'gatefill', c); }
    // Kontrollpunkt-Schale
    { const c = canvas(96, 96), g = c.getContext('2d'); g.fillStyle = '#4a3a40'; g.beginPath(); g.moveTo(14, 46); g.lineTo(82, 46); g.lineTo(66, 70); g.lineTo(30, 70); g.closePath(); g.fill(); g.fillRect(40, 70, 16, 18); g.fillRect(28, 86, 40, 8); g.fillStyle = '#6a5a60'; g.fillRect(12, 42, 72, 8); addCanvas(scene, 'brazier', c); }
    // Ziel: Drachenbanner
    { const c = canvas(128, 256), g = c.getContext('2d'); g.fillStyle = '#5a3a1a'; g.fillRect(14, 10, 10, 246); g.fillStyle = '#ffc531'; g.beginPath(); g.arc(19, 10, 9, 0, 7); g.fill();
      const gr = g.createLinearGradient(24, 0, 120, 0); gr.addColorStop(0, '#c2182a'); gr.addColorStop(1, '#ff4a3a'); g.fillStyle = gr; g.beginPath(); g.moveTo(24, 24); g.lineTo(120, 30); g.lineTo(100, 70); g.lineTo(120, 110); g.lineTo(24, 116); g.closePath(); g.fill();
      g.fillStyle = '#ffd27a'; g.font = 'bold 54px serif'; g.fillText('🐉', 44, 92); addCanvas(scene, 'banner', c); }
    // Holzplanke (Einweg-Plattform)
    { const c = canvas(64, 24), g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 24); gr.addColorStop(0, '#c48a4a'); gr.addColorStop(1, '#6a3e18'); g.fillStyle = gr; rr(g, 0, 2, 64, 18, 5); g.fill(); g.strokeStyle = 'rgba(60,30,10,0.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(4, 11); g.lineTo(60, 11); g.stroke(); g.fillStyle = '#3a2410'; [8, 56].forEach(x => { g.beginPath(); g.arc(x, 7, 2, 0, 7); g.fill(); }); addCanvas(scene, 'plank', c); }
    // Eisblock
    { const c = canvas(64, 64), g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 64, 64); gr.addColorStop(0, 'rgba(230,250,255,0.95)'); gr.addColorStop(1, 'rgba(110,180,230,0.9)'); g.fillStyle = gr; rr(g, 2, 2, 60, 60, 8); g.fill(); g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 3; g.beginPath(); g.moveTo(10, 14); g.lineTo(26, 10); g.moveTo(40, 50); g.lineTo(54, 40); g.stroke(); g.strokeStyle = 'rgba(80,140,200,0.6)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(20, 30); g.lineTo(34, 38); g.lineTo(30, 52); g.stroke(); addCanvas(scene, 'iceblock', c); }
    // Metallgitter (nur mit großem Feueratem schmelzbar)
    { const c = canvas(64, 64), g = c.getContext('2d'); g.fillStyle = '#3a3e46'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#7a828e'; for (let x = 4; x < 64; x += 15) g.fillRect(x, 0, 7, 64); g.fillRect(0, 6, 64, 6); g.fillRect(0, 52, 64, 6); addCanvas(scene, 'grate', c); }
    // Stacheln
    { const c = canvas(64, 32), g = c.getContext('2d'); for (let i = 0; i < 4; i++) { const x = i * 16; const gr = g.createLinearGradient(x, 0, x + 16, 0); gr.addColorStop(0, '#c8ccd4'); gr.addColorStop(1, '#5a5e66'); g.fillStyle = gr; g.beginPath(); g.moveTo(x, 32); g.lineTo(x + 8, 2); g.lineTo(x + 16, 32); g.fill(); } addCanvas(scene, 'spikes', c); }
    // Sprungpilz (Fallback, wird von 3D-Pilz ersetzt wenn vorhanden)
    // Lore (Minen)
    { const c = canvas(128, 96), g = c.getContext('2d'); g.fillStyle = '#5a3a1a'; g.beginPath(); g.moveTo(8, 20); g.lineTo(120, 20); g.lineTo(108, 70); g.lineTo(20, 70); g.closePath(); g.fill(); g.fillStyle = '#8a8e96'; g.fillRect(4, 16, 120, 8); g.fillRect(16, 40, 96, 5); [34, 94].forEach(x => { g.fillStyle = '#2a2a30'; g.beginPath(); g.arc(x, 76, 14, 0, 7); g.fill(); g.fillStyle = '#9aa2ae'; g.beginPath(); g.arc(x, 76, 6, 0, 7); g.fill(); }); addCanvas(scene, 'minecart', c); }
  }

  function boot(scene) { makeUI(scene); makeParticles(scene); makeLiquids(scene); makeProps(scene); }
  return { boot, WORLDS, makeBackground, terrainChunk, rockPattern, seeded, canvas, addCanvas, rr, mix, hex, rgba, flame, star };
})();
