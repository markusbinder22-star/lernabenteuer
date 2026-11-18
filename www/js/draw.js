/* Zeichenfunktionen im „Papiertheater“-Stil: flache Formen mit dunklerem Rand.
   Alles wird im Code gezeichnet, es gibt keine Bilddateien. */
(function (PT) {
  'use strict';

  function shade(hex, amt) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const n = parseInt(c, 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    if (amt < 0) { r *= 1 + amt; g *= 1 + amt; b *= 1 + amt; } else { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
    return '#' + [r, g, b].map(v => Math.round(PT.clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
  }

  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /** Füllt den aktuellen Pfad mit Papier-Look (Farbe + dunklerer Rand) */
  function paper(ctx, fill, lw) {
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = lw || 1.6;
    ctx.strokeStyle = shade(fill, -0.38);
    ctx.stroke();
  }

  function circle(ctx, x, y, r, fill, lw) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill) paper(ctx, fill, lw);
  }
  function ellipse(ctx, x, y, rx, ry, rot, fill, lw) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2);
    if (fill) paper(ctx, fill, lw);
  }
  function eye(ctx, x, y, r) {
    ctx.fillStyle = '#2b211d';
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x + r * 0.35, y - r * 0.35, r * 0.35, 0, Math.PI * 2); ctx.fill();
  }
  function smile(ctx, x, y, w, open) {
    ctx.strokeStyle = '#5a2d24'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath();
    if (open) { ctx.arc(x, y, w, 0.1 * Math.PI, 0.9 * Math.PI); ctx.closePath(); ctx.fillStyle = '#8a3b30'; ctx.fill(); }
    else { ctx.arc(x, y - w * 0.5, w, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); }
  }

  /** Knopf-Taler */
  function knopf(ctx, x, y, r, kind) {
    const col = kind === 'gold' ? '#f2c14e' : kind === 'perl' ? '#e9eef5' : '#e39b4b';
    ctx.save();
    circle(ctx, x, y, r, col, Math.max(1.2, r * 0.12));
    ctx.beginPath(); ctx.arc(x, y, r * 0.72, 0, Math.PI * 2);
    ctx.strokeStyle = shade(col, -0.25); ctx.lineWidth = Math.max(1, r * 0.08); ctx.stroke();
    ctx.fillStyle = shade(col, -0.5);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy]) => {
      ctx.beginPath(); ctx.arc(x + dx * r * 0.25, y + dy * r * 0.25, r * 0.11, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
  }

  /** Ranzl, der Rucksack. (x,y) = Mitte, s = Skalierung (1 ≈ 40 px hoch) */
  function ranzl(ctx, x, y, s, opts) {
    opts = opts || {};
    const t = opts.t || 0;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    const body = opts.skin || '#a0673a';
    // Gurte als Arme
    ctx.strokeStyle = '#6b4123'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    const wave = opts.wave ? Math.sin(t * 8) * 6 : 0;
    ctx.beginPath(); ctx.moveTo(-16, -4); ctx.quadraticCurveTo(-28, 4 + wave, -24, 14 + wave); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(16, -4); ctx.quadraticCurveTo(28, 4 - wave, 24, 14 - wave); ctx.stroke();
    // Körper
    rr(ctx, -18, -20, 36, 42, 12); paper(ctx, body, 2);
    // Klappe
    ctx.beginPath(); ctx.moveTo(-18, -8); ctx.quadraticCurveTo(0, 4, 18, -8); ctx.lineTo(18, -10); ctx.quadraticCurveTo(18, -20, 6, -20); ctx.lineTo(-6, -20); ctx.quadraticCurveTo(-18, -20, -18, -10); ctx.closePath();
    paper(ctx, shade(body, -0.15), 2);
    // Flicken
    rr(ctx, 6, 8, 9, 8, 2); paper(ctx, '#d9a441', 1.2);
    // Knopfaugen
    circle(ctx, -7, -9, 4.2, '#3b2f2a', 1);
    circle(ctx, 7, -9, 4.2, '#3b2f2a', 1);
    ctx.fillStyle = '#fff'; ctx.fillRect(-8.5, -10.5, 1.4, 1.4); ctx.fillRect(5.5, -10.5, 1.4, 1.4);
    // Reißverschluss-Mund
    const open = opts.talking ? (Math.sin(t * 18) > 0 ? 3.5 : 1) : 1;
    ctx.fillStyle = '#4a2b17';
    rr(ctx, -10, 2, 20, open + 1, 1.5); ctx.fill();
    ctx.strokeStyle = '#d6c08a'; ctx.lineWidth = 1;
    for (let i = -9; i <= 9; i += 3) { ctx.beginPath(); ctx.moveTo(i, 1.5); ctx.lineTo(i, 4 + open); ctx.stroke(); }
    ctx.restore();
  }

  function pfeffer(ctx, x, y, s, t, facing) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s * (facing || 1), s);
    const bob = Math.sin((t || 0) * 2) * 1.2;
    // Beine
    rr(ctx, -10, -26, 8, 26, 3); paper(ctx, '#5c4a6b');
    rr(ctx, 2, -26, 8, 26, 3); paper(ctx, '#5c4a6b');
    ellipse(ctx, -6, -1, 8, 4, 0, '#3b2f2a'); ellipse(ctx, 6, -1, 8, 4, 0, '#3b2f2a');
    // Rock/Schürze
    ctx.beginPath(); ctx.moveTo(-16, -64 + bob); ctx.lineTo(16, -64 + bob); ctx.lineTo(22, -22); ctx.lineTo(-22, -22); ctx.closePath(); paper(ctx, '#7b9e6b');
    ctx.beginPath(); ctx.moveTo(-9, -58 + bob); ctx.lineTo(9, -58 + bob); ctx.lineTo(13, -24); ctx.lineTo(-13, -24); ctx.closePath(); paper(ctx, '#efe3c8');
    // Werkzeuggurt
    rr(ctx, -18, -44 + bob, 36, 7, 2); paper(ctx, '#7a4a2a');
    ctx.fillStyle = '#9aa3ad'; ctx.fillRect(-14, -40 + bob, 3, 10); ctx.fillRect(8, -40 + bob, 3, 8);
    // Arme
    rr(ctx, -22, -62 + bob, 8, 26, 4); paper(ctx, '#7b9e6b');
    rr(ctx, 14, -62 + bob, 8, 26, 4); paper(ctx, '#7b9e6b');
    circle(ctx, -18, -35 + bob, 4.5, '#f0c9a6'); circle(ctx, 18, -35 + bob, 4.5, '#f0c9a6');
    // Kopf
    circle(ctx, 0, -78 + bob, 15, '#f0c9a6');
    // Haar-Dutt
    ctx.beginPath(); ctx.arc(0, -82 + bob, 15.5, Math.PI * 1.05, Math.PI * 1.95); ctx.closePath(); paper(ctx, '#d8d8d8');
    circle(ctx, 0, -99 + bob, 8, '#d8d8d8');
    // Brille auf der Stirn
    ctx.strokeStyle = '#3b2f2a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(-6, -88 + bob, 4.5, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(6, -88 + bob, 4.5, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-1.5, -88 + bob); ctx.lineTo(1.5, -88 + bob); ctx.stroke();
    eye(ctx, -5, -78 + bob, 2); eye(ctx, 5, -78 + bob, 2);
    ellipse(ctx, 0, -73 + bob, 2.4, 3, 0, '#e2a98a', 1);
    smile(ctx, 0, -68 + bob, 4);
    ctx.restore();
  }

  function resi(ctx, x, y, s, t, facing) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s * (facing || 1), s);
    const bob = Math.sin((t || 0) * 2.4) * 1.2;
    rr(ctx, -10, -24, 8, 24, 3); paper(ctx, '#f0c9a6');
    rr(ctx, 2, -24, 8, 24, 3); paper(ctx, '#f0c9a6');
    ellipse(ctx, -6, -1, 8, 4, 0, '#5a3b26'); ellipse(ctx, 6, -1, 8, 4, 0, '#5a3b26');
    // Dirndl-artiges Kleid
    ctx.beginPath(); ctx.moveTo(-14, -66 + bob); ctx.lineTo(14, -66 + bob); ctx.lineTo(24, -20); ctx.lineTo(-24, -20); ctx.closePath(); paper(ctx, '#3f7ab0');
    ctx.beginPath(); ctx.moveTo(-8, -46 + bob); ctx.lineTo(8, -46 + bob); ctx.lineTo(12, -22); ctx.lineTo(-12, -22); ctx.closePath(); paper(ctx, '#e8b74a');
    rr(ctx, -12, -66 + bob, 24, 12, 4); paper(ctx, '#fff8ea');
    rr(ctx, -22, -64 + bob, 8, 24, 4); paper(ctx, '#fff8ea');
    rr(ctx, 14, -64 + bob, 8, 24, 4); paper(ctx, '#fff8ea');
    circle(ctx, -18, -38 + bob, 4.5, '#f0c9a6'); circle(ctx, 18, -38 + bob, 4.5, '#f0c9a6');
    circle(ctx, 0, -80 + bob, 15, '#f0c9a6');
    // Kopftuch mit Punkten
    ctx.beginPath(); ctx.arc(0, -82 + bob, 16.5, Math.PI, Math.PI * 2); ctx.lineTo(18, -78 + bob); ctx.lineTo(-18, -78 + bob); ctx.closePath(); paper(ctx, '#d9534f');
    ctx.fillStyle = '#fff';
    [[-9, -88], [0, -93], [9, -88], [-4, -84], [5, -84]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(a, b + bob, 1.6, 0, 7); ctx.fill(); });
    ctx.beginPath(); ctx.moveTo(14, -80 + bob); ctx.lineTo(24, -74 + bob); ctx.lineTo(16, -72 + bob); ctx.closePath(); paper(ctx, '#d9534f');
    eye(ctx, -5, -78 + bob, 2); eye(ctx, 5, -78 + bob, 2);
    ctx.fillStyle = 'rgba(230,110,110,.35)'; ctx.beginPath(); ctx.arc(-9, -73 + bob, 3, 0, 7); ctx.arc(9, -73 + bob, 3, 0, 7); ctx.fill();
    smile(ctx, 0, -70 + bob, 4.5);
    ctx.restore();
  }

  function hansi(ctx, x, y, s, t, facing) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s * (facing || 1), s);
    const step = Math.sin((t || 0) * 3) * 2;
    ['#8d8f93', '#8d8f93', '#7d7f83', '#7d7f83'].forEach((c, i) => { rr(ctx, -26 + i * 15, -26, 7, 26, 3); paper(ctx, c); });
    ellipse(ctx, 0, -34, 32, 15, 0, '#9a9ca0');
    ellipse(ctx, 0, -28, 18, 7, 0, '#c9cbcf', 1);
    // Hals und Kopf
    ctx.beginPath(); ctx.moveTo(18, -42); ctx.lineTo(30, -62 + step * 0.3); ctx.lineTo(40, -56 + step * 0.3); ctx.lineTo(30, -30); ctx.closePath(); paper(ctx, '#9a9ca0');
    ellipse(ctx, 40, -60 + step * 0.3, 15, 9, 0.35, '#9a9ca0');
    ellipse(ctx, 50, -55 + step * 0.3, 7, 6, 0.3, '#c9cbcf', 1);
    // Ohren
    ellipse(ctx, 33, -78, 4, 13, -0.3, '#9a9ca0'); ellipse(ctx, 40, -78, 4, 13, 0.15, '#9a9ca0');
    eye(ctx, 40, -63 + step * 0.3, 1.9);
    // Schwanz
    ctx.strokeStyle = '#6f7175'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-32, -38); ctx.quadraticCurveTo(-42, -30, -38, -18 + step); ctx.stroke();
    ctx.restore();
  }

  function chicken(ctx, x, y, s, t, facing) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s * (facing || 1), s);
    const peck = Math.max(0, Math.sin((t || 0) * 4)) * 4;
    ctx.strokeStyle = '#e0a020'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-3, -6); ctx.lineTo(-4, 0); ctx.moveTo(3, -6); ctx.lineTo(4, 0); ctx.stroke();
    ellipse(ctx, 0, -14, 13, 10, 0, '#fffaf0');
    ellipse(ctx, -4, -14, 7, 5, 0.3, '#f0e8d8', 1);
    circle(ctx, 9, -24 + peck, 7, '#fffaf0');
    ctx.beginPath(); ctx.moveTo(15, -25 + peck); ctx.lineTo(21, -23 + peck); ctx.lineTo(15, -21 + peck); ctx.closePath(); paper(ctx, '#f0a830', 1);
    ctx.beginPath(); ctx.arc(7, -31 + peck, 3, 0, 7); ctx.arc(11, -31 + peck, 3, 0, 7); paper(ctx, '#e04b3c', 1);
    eye(ctx, 11, -25 + peck, 1.4);
    ctx.restore();
  }

  function zausel(ctx, x, y, s, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const w = Math.sin((t || 0) * 5);
    ctx.strokeStyle = '#9aa0a8'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * Math.PI * 2 + w * 0.1;
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * 16, Math.sin(a) * 16);
      ctx.quadraticCurveTo(Math.cos(a + 0.4) * 26, Math.sin(a + 0.4) * 26, Math.cos(a + 0.2) * (30 + w * 3), Math.sin(a + 0.2) * (30 + w * 3));
      ctx.stroke();
    }
    circle(ctx, 0, 0, 22, '#b9bec6', 2);
    ctx.strokeStyle = '#8a9099'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(PT.clamp(i * 5 - 12, -14, 14), 8 - i % 2 * 14, 6, 0, Math.PI * 1.3); ctx.stroke(); }
    circle(ctx, -7, -4, 6, '#fff', 1); circle(ctx, 7, -4, 6, '#fff', 1);
    eye(ctx, -6, -3, 3); eye(ctx, 8, -3, 3);
    smile(ctx, 0, 10, 4, true);
    ctx.restore();
  }

  // ---------- Porträts für den Dialog ----------
  function portrait(canvas, who) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const k = W / 96;
    ctx.save(); ctx.scale(k, k);
    if (who === 'pfeffer') pfeffer(ctx, 48, 190, 1.9, 0);
    else if (who === 'resi') resi(ctx, 48, 194, 1.9, 0);
    else if (who === 'ranzl') ranzl(ctx, 48, 52, 1.6, { talking: false });
    else if (who === 'zausel') zausel(ctx, 48, 50, 1.3, 0);
    else if (who === 'avatar' && PT.game && PT.game.profile) PT.avatar.drawHead(ctx, PT.game.profile.avatar, 48, 60, 1.7);
    else { // Erzähler: aufgeschlagenes Buch
      ctx.beginPath(); ctx.moveTo(12, 30); ctx.quadraticCurveTo(30, 22, 48, 32); ctx.lineTo(48, 74); ctx.quadraticCurveTo(30, 64, 12, 72); ctx.closePath(); paper(ctx, '#fffaf0', 2);
      ctx.beginPath(); ctx.moveTo(84, 30); ctx.quadraticCurveTo(66, 22, 48, 32); ctx.lineTo(48, 74); ctx.quadraticCurveTo(66, 64, 84, 72); ctx.closePath(); paper(ctx, '#fffaf0', 2);
      ctx.strokeStyle = '#c9b48d'; ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(18, 40 + i * 8); ctx.lineTo(42, 42 + i * 8); ctx.moveTo(54, 42 + i * 8); ctx.lineTo(78, 40 + i * 8); ctx.stroke(); }
    }
    ctx.restore();
  }

  // ---------- Symbole für Knöpfe ----------
  function icon(canvas, name, extra) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    ctx.clearRect(0, 0, W, W);
    ctx.save(); ctx.scale(W / 50, W / 50);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    switch (name) {
      case 'ranzl': ranzl(ctx, 25, 26, 0.9, { talking: true, t: 0.1 }); break;
      case 'bag':
        ranzl(ctx, 25, 28, 0.8, {});
        ctx.fillStyle = '#f2c14e'; ctx.beginPath(); ctx.arc(37, 12, 7, 0, 7); ctx.fill();
        ctx.fillStyle = '#3b2f2a'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('+', 37, 16);
        break;
      case 'save':
        rr(ctx, 12, 8, 26, 34, 4); paper(ctx, '#3f8fc7', 2);
        rr(ctx, 16, 12, 18, 12, 2); paper(ctx, '#fffaf0', 1.4);
        ctx.strokeStyle = '#2d6d99'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(14, 30); ctx.lineTo(36, 30); ctx.stroke();
        ctx.strokeStyle = '#3c9a3a'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(19, 18); ctx.lineTo(23, 22); ctx.lineTo(31, 13); ctx.stroke();
        break;
      case 'map':
        ctx.beginPath(); ctx.moveTo(8, 12); ctx.lineTo(19, 8); ctx.lineTo(31, 12); ctx.lineTo(42, 8); ctx.lineTo(42, 38); ctx.lineTo(31, 42); ctx.lineTo(19, 38); ctx.lineTo(8, 42); ctx.closePath(); paper(ctx, '#f7e4b0', 2);
        ctx.strokeStyle = '#d9534f'; ctx.setLineDash([3, 3]); ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.moveTo(13, 34); ctx.quadraticCurveTo(22, 18, 34, 22); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = '#d9534f'; ctx.beginPath(); ctx.arc(35, 21, 3.5, 0, 7); ctx.fill();
        break;
      case 'home':
        ctx.beginPath(); ctx.moveTo(8, 24); ctx.lineTo(25, 9); ctx.lineTo(42, 24); ctx.lineTo(37, 24); ctx.lineTo(37, 41); ctx.lineTo(13, 41); ctx.lineTo(13, 24); ctx.closePath(); paper(ctx, '#f29b8f', 2);
        rr(ctx, 21, 29, 8, 12, 2); paper(ctx, '#8a5a3c', 1.4);
        break;
      case 'speaker':
        ctx.beginPath(); ctx.moveTo(10, 20); ctx.lineTo(18, 20); ctx.lineTo(27, 11); ctx.lineTo(27, 39); ctx.lineTo(18, 30); ctx.lineTo(10, 30); ctx.closePath(); paper(ctx, '#3b2f2a', 1.5);
        ctx.strokeStyle = '#3b2f2a'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(28, 25, 7, -0.9, 0.9); ctx.stroke();
        ctx.beginPath(); ctx.arc(28, 25, 13, -0.9, 0.9); ctx.stroke();
        break;
      case 'hair': ctx.beginPath(); ctx.arc(25, 28, 14, 0, 7); paper(ctx, '#f0c9a6', 2); ctx.beginPath(); ctx.arc(25, 25, 15, Math.PI, 0); ctx.quadraticCurveTo(42, 40, 36, 44); ctx.lineTo(34, 26); ctx.lineTo(16, 26); ctx.lineTo(14, 44); ctx.quadraticCurveTo(8, 40, 10, 25); ctx.closePath(); paper(ctx, '#8a5a3c', 2); break;
      case 'face': ctx.beginPath(); ctx.arc(25, 25, 16, 0, 7); paper(ctx, '#d9a27c', 2); eye(ctx, 19, 23, 2.3); eye(ctx, 31, 23, 2.3); smile(ctx, 25, 31, 5); break;
      case 'top': ctx.beginPath(); ctx.moveTo(14, 10); ctx.lineTo(20, 8); ctx.quadraticCurveTo(25, 13, 30, 8); ctx.lineTo(36, 10); ctx.lineTo(45, 20); ctx.lineTo(39, 26); ctx.lineTo(36, 23); ctx.lineTo(36, 42); ctx.lineTo(14, 42); ctx.lineTo(14, 23); ctx.lineTo(11, 26); ctx.lineTo(5, 20); ctx.closePath(); paper(ctx, '#d9534f', 2); break;
      case 'bottom': ctx.beginPath(); ctx.moveTo(14, 8); ctx.lineTo(36, 8); ctx.lineTo(39, 44); ctx.lineTo(28, 44); ctx.lineTo(25, 20); ctx.lineTo(22, 44); ctx.lineTo(11, 44); ctx.closePath(); paper(ctx, '#3f7ab0', 2); break;
      case 'dice':
        rr(ctx, 8, 8, 34, 34, 8); paper(ctx, '#fff', 2.4);
        ctx.fillStyle = '#3b2f2a'; [[16, 16], [34, 16], [25, 25], [16, 34], [34, 34]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(a, b, 3.2, 0, 7); ctx.fill(); });
        break;
      case 'check': ctx.strokeStyle = '#2f6b25'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(10, 26); ctx.lineTo(21, 37); ctx.lineTo(41, 13); ctx.stroke(); break;
      case 'close': ctx.strokeStyle = '#3b2f2a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(14, 14); ctx.lineTo(36, 36); ctx.moveTo(36, 14); ctx.lineTo(14, 36); ctx.stroke(); break;
      case 'next': ctx.fillStyle = '#3b2f2a'; ctx.beginPath(); ctx.moveTo(16, 10); ctx.lineTo(38, 25); ctx.lineTo(16, 40); ctx.closePath(); ctx.fill(); break;
      case 'lock':
        ctx.strokeStyle = '#3b2f2a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(25, 20, 8, Math.PI, 0); ctx.stroke();
        rr(ctx, 13, 20, 24, 20, 4); paper(ctx, '#f2c14e', 2);
        break;
      case 'knopf': knopf(ctx, 25, 25, 18, extra || 'normal'); break;
    }
    ctx.restore();
  }

  function makeIcon(name, size, extra) {
    const c = document.createElement('canvas');
    c.width = c.height = size || 100;
    icon(c, name, extra);
    return c;
  }

  PT.draw = { shade, rr, paper, circle, ellipse, eye, smile, knopf, ranzl, pfeffer, resi, hansi, chicken, zausel, portrait, icon, makeIcon };
})(window.PT);
