/* Gegenstände, Sticker und ihre Zeichnungen. */
(function (PT) {
  'use strict';
  const D = () => PT.draw;

  const ITEMS = {
    feuerwehr: { name: 'Feuerwehrhelm', kind: 'hat', price: 30, shop: true },
    koch: { name: 'Kochmütze', kind: 'hat', price: 25, shop: true },
    tiroler: { name: 'Tirolerhut', kind: 'hat', price: 60, shop: true },
    krone: { name: 'Zahnrad-Krone', kind: 'hat', price: 120, shop: true },
    pirat: { name: 'Piratenhut', kind: 'hat', price: 0, shop: false },
    glocke: { name: 'Glocken-Anhänger', kind: 'charm', price: 20, shop: true },
    pinguin: { name: 'Pinguin-Anhänger', kind: 'charm', price: 40, shop: true },
    lampe: { name: 'Sternenlampe', kind: 'room', price: 50, shop: true },
    teppich: { name: 'Fleckerlteppich', kind: 'room', price: 35, shop: true },
    radiergummi: { name: 'Radiergummi', kind: 'tool', price: 15, shop: true, consumable: true },
  };
  const SHOP_ORDER = ['koch', 'feuerwehr', 'tiroler', 'krone', 'glocke', 'pinguin', 'teppich', 'lampe', 'radiergummi'];

  const STICKERS = [
    { id: 'pfeffer', name: 'Meisterin Pfeffer', info: 'Meisterin Pfeffer ist die Flickmeisterin vom Purzeltal. Sie sucht ständig ihre Brille, dabei sitzt die auf ihrer Stirn.' },
    { id: 'ranzl', name: 'Ranzl', info: 'Ranzl ist ein sprechender Rucksack. Er hat siebzehn Flicken und isst manchmal Sachen, die er nicht soll.' },
    { id: 'resi', name: 'Bäuerin Resi', info: 'Bäuerin Resi wohnt am Mühlberg. Sie redet den ganzen Tag mit ihrem Esel Hansi.' },
    { id: 'hansi', name: 'Esel Hansi', info: 'Hansi ist ein Esel. Er frisst am liebsten Äpfel und traut sich nicht über kaputte Brücken.' },
    { id: 'gretl', name: 'Huhn Gretl', info: 'Gretl ist das mutigste Huhn von Resi. Sie flattert immer als Erste über den Zaun.' },
    { id: 'bruecke', name: 'Die Brücke', info: 'Die Holzbrücke am Mühlberg. Du hast die Löcher mit Brettern geflickt.' },
    { id: 'markt', name: 'Der Marktstand', info: 'Am Marktstand verkauft Resi Paradeiser, Äpfel und Eier.' },
    { id: 'muehle', name: 'Die Mühle', info: 'Die Mühle mahlt Korn zu Mehl. Dank dir dreht sie sich wieder.' },
    { id: 'raetselstein', name: 'Der Rätselstein', info: 'Ein Stein mit Gesicht. Er liebt Rätsel und schläft viel.' },
    { id: 'murmel', name: 'Zausels Murmel', info: 'Eine blaue Murmel. Hansi hat sie gefunden. Gehört sie dem Wirbelwind Zausel?' },
  ];

  // ---------- Hüte (Mittelpunkt Oberkopf) ----------
  function drawHat(ctx, id, x, y, s) {
    const d = D();
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    switch (id) {
      case 'feuerwehr':
        ctx.beginPath(); ctx.ellipse(0, 4, 24, 5, 0, 0, 7); d.paper(ctx, '#c43c32');
        ctx.beginPath(); ctx.arc(0, 4, 17, Math.PI, 0); ctx.closePath(); d.paper(ctx, '#d9534f');
        d.rr(ctx, -5, -12, 10, 12, 2); d.paper(ctx, '#f2c14e', 1.2);
        break;
      case 'koch':
        d.rr(ctx, -14, -6, 28, 12, 3); d.paper(ctx, '#ffffff');
        [-10, 0, 10].forEach((cx, i) => d.circle(ctx, cx, -14 - (i === 1 ? 6 : 0), 10, '#ffffff', 1.4));
        break;
      case 'tiroler':
        ctx.beginPath(); ctx.ellipse(0, 4, 23, 5, 0, 0, 7); d.paper(ctx, '#4d6b3a');
        ctx.beginPath(); ctx.moveTo(-14, 4); ctx.lineTo(-10, -14); ctx.quadraticCurveTo(0, -20, 10, -14); ctx.lineTo(14, 4); ctx.closePath(); d.paper(ctx, '#5b7d45');
        d.rr(ctx, -14, -2, 28, 5, 1); d.paper(ctx, '#d9534f', 1);
        ctx.strokeStyle = '#3b2f2a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(10, -2); ctx.quadraticCurveTo(22, -18, 18, -28); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(17, -18, 3, 9, 0.3, 0, 7); d.paper(ctx, '#f6f0e0', 1);
        break;
      case 'krone':
        ctx.beginPath(); ctx.moveTo(-16, 4); ctx.lineTo(-16, -10); ctx.lineTo(-9, -4); ctx.lineTo(0, -16); ctx.lineTo(9, -4); ctx.lineTo(16, -10); ctx.lineTo(16, 4); ctx.closePath(); d.paper(ctx, '#f2c14e');
        d.circle(ctx, 0, -2, 4.5, '#9aa3ad', 1.2); d.circle(ctx, 0, -2, 1.6, '#f2c14e', 0.8);
        d.circle(ctx, -9, 0, 2.2, '#d9534f', 1); d.circle(ctx, 9, 0, 2.2, '#3f7ab0', 1);
        break;
      case 'pirat':
        ctx.beginPath(); ctx.moveTo(-26, 2); ctx.quadraticCurveTo(-14, -6, -12, -16); ctx.quadraticCurveTo(0, -24, 12, -16); ctx.quadraticCurveTo(14, -6, 26, 2); ctx.quadraticCurveTo(0, 8, -26, 2); ctx.closePath(); d.paper(ctx, '#2f2a2a');
        d.circle(ctx, 0, -8, 4, '#f6f0e0', 1);
        ctx.strokeStyle = '#f6f0e0'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-5, -2); ctx.lineTo(5, 2); ctx.moveTo(5, -2); ctx.lineTo(-5, 2); ctx.stroke();
        break;
    }
    ctx.restore();
  }

  function drawCharm(ctx, id, x, y, s) {
    const d = D();
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = '#6b4123'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 8); ctx.stroke();
    if (id === 'glocke') {
      ctx.beginPath(); ctx.moveTo(-8, 22); ctx.quadraticCurveTo(-8, 8, 0, 8); ctx.quadraticCurveTo(8, 8, 8, 22); ctx.closePath(); d.paper(ctx, '#f2c14e');
      d.circle(ctx, 0, 23, 2.4, '#b48a2a', 1);
    } else if (id === 'pinguin') {
      d.ellipse(ctx, 0, 18, 7, 10, 0, '#2f3640');
      d.ellipse(ctx, 0, 20, 4.5, 7, 0, '#ffffff', 1);
      d.eye(ctx, -2, 13, 1.1); d.eye(ctx, 2, 13, 1.1);
      ctx.beginPath(); ctx.moveTo(-2, 15); ctx.lineTo(2, 15); ctx.lineTo(0, 18); ctx.closePath(); d.paper(ctx, '#f0a830', 0.8);
    }
    ctx.restore();
  }

  /** Gegenstand-Symbol für Laden und Rucksack */
  function drawItem(canvas, id) {
    const d = D();
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    ctx.clearRect(0, 0, W, W);
    ctx.save(); ctx.scale(W / 100, W / 100);
    const it = ITEMS[id] || {};
    if (it.kind === 'hat') { drawHat(ctx, id, 50, 66, 2); }
    else if (it.kind === 'charm') { drawCharm(ctx, id, 50, 10, 3); }
    else if (id === 'lampe') {
      ctx.fillStyle = 'rgba(242,193,78,.35)'; ctx.beginPath(); ctx.arc(50, 40, 34, 0, 7); ctx.fill();
      d.rr(ctx, 44, 60, 12, 26, 3); d.paper(ctx, '#8a5a3c');
      ctx.beginPath();
      for (let i = 0; i < 10; i++) { const r = i % 2 ? 11 : 26, a = i / 10 * Math.PI * 2 - Math.PI / 2; ctx.lineTo(50 + Math.cos(a) * r, 40 + Math.sin(a) * r); }
      ctx.closePath(); d.paper(ctx, '#f2c14e', 2);
    } else if (id === 'teppich') {
      d.rr(ctx, 10, 30, 80, 44, 16); d.paper(ctx, '#d9534f', 2);
      d.rr(ctx, 20, 38, 60, 28, 10); d.paper(ctx, '#3f7ab0', 2);
      d.rr(ctx, 32, 45, 36, 14, 6); d.paper(ctx, '#f2c14e', 2);
    } else if (id === 'radiergummi') {
      ctx.save(); ctx.translate(50, 52); ctx.rotate(-0.4);
      d.rr(ctx, -32, -14, 64, 28, 6); d.paper(ctx, '#f29b8f', 2);
      d.rr(ctx, 4, -14, 28, 28, 6); d.paper(ctx, '#7fb0d6', 2);
      ctx.restore();
    } else if (id === 'springfedern') {
      ctx.strokeStyle = '#7b8792'; ctx.lineWidth = 5;
      [32, 68].forEach(cx => { ctx.beginPath(); for (let i = 0; i <= 6; i++) ctx.lineTo(cx + (i % 2 ? 10 : -10), 82 - i * 9); ctx.stroke(); d.rr(ctx, cx - 14, 80, 28, 10, 4); d.paper(ctx, '#4a3b33'); });
    } else if (id === 'tuba') {
      ctx.beginPath(); ctx.moveTo(40, 86); ctx.lineTo(40, 30); ctx.quadraticCurveTo(40, 14, 56, 14); ctx.lineTo(56, 26); ctx.lineTo(74, 6); ctx.lineTo(90, 22); ctx.lineTo(66, 34); ctx.lineTo(62, 86); ctx.closePath(); d.paper(ctx, '#f2c14e', 2);
      d.circle(ctx, 51, 56, 12, '#e8b13a', 2);
    }
    ctx.restore();
  }

  function drawSticker(canvas, id) {
    const d = D();
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    ctx.clearRect(0, 0, W, W);
    ctx.save(); ctx.scale(W / 100, W / 100);
    switch (id) {
      case 'pfeffer': d.pfeffer(ctx, 50, 96, 0.85, 0); break;
      case 'ranzl': d.ranzl(ctx, 50, 52, 1.5, {}); break;
      case 'resi': d.resi(ctx, 50, 96, 0.85, 0); break;
      case 'hansi': d.hansi(ctx, 42, 88, 0.95, 0); break;
      case 'gretl': d.chicken(ctx, 46, 80, 2.2, 0); break;
      case 'bruecke':
        ctx.fillStyle = '#7fc3e6'; ctx.fillRect(6, 66, 88, 22);
        for (let i = 0; i < 8; i++) { d.rr(ctx, 8 + i * 11, 54, 10, 10, 2); d.paper(ctx, '#b07a48', 1.4); }
        d.rr(ctx, 6, 40, 6, 30, 2); d.paper(ctx, '#7a4a2a'); d.rr(ctx, 88, 40, 6, 30, 2); d.paper(ctx, '#7a4a2a');
        break;
      case 'markt':
        d.rr(ctx, 16, 50, 68, 34, 4); d.paper(ctx, '#b07a48', 2);
        ctx.beginPath(); ctx.moveTo(10, 40); ctx.lineTo(90, 40); ctx.lineTo(84, 24); ctx.lineTo(16, 24); ctx.closePath(); d.paper(ctx, '#d9534f', 2);
        [30, 44, 58, 72].forEach(x => d.circle(ctx, x, 48, 6, '#e04b3c', 1.2));
        break;
      case 'muehle':
        d.rr(ctx, 34, 40, 32, 50, 4); d.paper(ctx, '#e9dcc0', 2);
        ctx.beginPath(); ctx.moveTo(30, 42); ctx.lineTo(50, 22); ctx.lineTo(70, 42); ctx.closePath(); d.paper(ctx, '#a0523d', 2);
        for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(50, 34); ctx.rotate(i * Math.PI / 2 + 0.4); d.rr(ctx, -4, -34, 8, 30, 2); d.paper(ctx, '#f6f0e0', 1.4); ctx.restore(); }
        d.circle(ctx, 50, 34, 4, '#7a4a2a', 1);
        break;
      case 'raetselstein': raetselstein(ctx, 50, 86, 1.1, 0, false); break;
      case 'murmel':
        d.circle(ctx, 50, 52, 26, '#5aa0d8', 2);
        ctx.strokeStyle = '#f6f0e0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(50, 52, 14, 0.4, 2.4); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(40, 42, 6, 0, 7); ctx.fill();
        break;
    }
    ctx.restore();
  }

  function raetselstein(ctx, x, y, s, t, asleep) {
    const d = D();
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(-34, 0); ctx.quadraticCurveTo(-40, -50, -6, -62); ctx.quadraticCurveTo(30, -66, 36, -30); ctx.quadraticCurveTo(40, -6, 34, 0); ctx.closePath(); d.paper(ctx, '#9aa0a8', 2.4);
    d.ellipse(ctx, 18, -44, 6, 3, 0.4, '#7fb06a', 1);
    if (asleep) {
      ctx.strokeStyle = '#3b2f2a'; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(-10, -34, 5, 0.2, Math.PI - 0.2); ctx.stroke(); ctx.beginPath(); ctx.arc(10, -34, 5, 0.2, Math.PI - 0.2); ctx.stroke();
      ctx.fillStyle = '#3b2f2a'; ctx.font = 'bold 14px sans-serif'; ctx.fillText('z', 28 + Math.sin(t * 2) * 2, -60); ctx.fillText('Z', 36, -74 + Math.sin(t * 2) * 2);
    } else {
      d.eye(ctx, -10, -34, 4); d.eye(ctx, 10, -34, 4);
      ctx.strokeStyle = '#3b2f2a'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-18, -44); ctx.lineTo(-4, -42); ctx.moveTo(4, -42); ctx.lineTo(18, -44); ctx.stroke();
    }
    d.smile(ctx, 0, -18, 7);
    ctx.restore();
  }

  function makeCanvas(fn, id, size) {
    const c = document.createElement('canvas');
    c.width = c.height = size || 120;
    fn(c, id);
    return c;
  }

  PT.items = {
    ITEMS, SHOP_ORDER, STICKERS, drawHat, drawCharm, drawItem, drawSticker, raetselstein,
    itemCanvas: (id, size) => makeCanvas(drawItem, id, size),
    stickerCanvas: (id, size) => makeCanvas(drawSticker, id, size),
  };
})(window.PT);
