/* Der selbst gestaltete Avatar im Scherenschnitt-Stil: Einzelteile werden im Code bewegt und eingefärbt. */
(function (PT) {
  'use strict';
  const D = () => PT.draw;

  const OPTIONS = {
    base: [{ id: 'm', name: 'Mädchen' }, { id: 'b', name: 'Bub' }, { id: 'n', name: 'Kind' }],
    skin: ['#fbe1cc', '#f0c9a6', '#d9a27c', '#b97c55', '#8d5a3b', '#5e3b27'],
    hair: [{ id: 'kurz', name: 'kurze Haare' }, { id: 'locken', name: 'Locken' }, { id: 'bob', name: 'Bob' }, { id: 'lang', name: 'lange Haare' }, { id: 'zoepfe', name: 'zwei Zöpfe' }],
    hairColor: [{ c: '#2a211e', name: 'schwarz' }, { c: '#5a3a24', name: 'dunkelbraun' }, { c: '#93653d', name: 'hellbraun' }, { c: '#e6c56a', name: 'blond' }, { c: '#d79a52', name: 'rotblond' }, { c: '#b9472a', name: 'rot' }],
    top: [{ id: 'tshirt', name: 'T-Shirt' }, { id: 'pulli', name: 'Pulli' }, { id: 'hoodie', name: 'Kapuzenpulli' }],
    bottom: [{ id: 'hose', name: 'Hose' }, { id: 'rock', name: 'Rock' }, { id: 'latz', name: 'Latzhose' }],
    colors: [{ c: '#d9534f', name: 'rot' }, { c: '#3f7ab0', name: 'blau' }, { c: '#5aa246', name: 'grün' }, { c: '#f2c14e', name: 'gelb' }],
  };

  function defaultAvatar() {
    return { base: 'n', skin: 1, hair: 0, hairColor: 2, top: 0, topColor: 0, bottom: 0, bottomColor: 1, glasses: false };
  }

  function randomAvatar() {
    return {
      base: PT.pick(['m', 'b', 'n']), skin: PT.rand(0, 5), hair: PT.rand(0, 4), hairColor: PT.rand(0, 5),
      top: PT.rand(0, 2), topColor: PT.rand(0, 3), bottom: PT.rand(0, 2), bottomColor: PT.rand(0, 3), glasses: Math.random() < 0.3,
    };
  }

  // ---------- Haare ----------
  function hairBack(ctx, a, hc) {
    const d = D();
    const style = OPTIONS.hair[a.hair].id;
    if (style === 'lang') { d.rr(ctx, -18, -90, 36, 44, 12); d.paper(ctx, hc); }
    if (style === 'bob') { d.rr(ctx, -19, -92, 38, 28, 12); d.paper(ctx, hc); }
    if (style === 'zoepfe') {
      [-1, 1].forEach(sd => {
        for (let i = 0; i < 3; i++) d.ellipse(ctx, sd * 19, -72 + i * 8, 5.5, 5, 0, hc);
        d.circle(ctx, sd * 19, -50, 3, '#d9534f', 1);
        ctx.beginPath(); ctx.moveTo(sd * 19 - 3, -48); ctx.lineTo(sd * 19, -42); ctx.lineTo(sd * 19 + 3, -48); ctx.closePath(); d.paper(ctx, hc, 1);
      });
    }
  }

  function hairFront(ctx, a, hc) {
    const d = D();
    const style = OPTIONS.hair[a.hair].id;
    if (style === 'locken') {
      const pts = [[-14, -86], [-8, -94], [0, -97], [8, -94], [14, -86], [16, -78], [-16, -78]];
      pts.forEach(([x, y]) => d.circle(ctx, x, y, 6.5, hc, 1.2));
      return;
    }
    // Grundkappe
    ctx.beginPath();
    ctx.arc(0, -80, 17, Math.PI * 1.02, Math.PI * 1.98);
    if (style === 'kurz') { ctx.quadraticCurveTo(10, -86, 2, -84); ctx.quadraticCurveTo(-6, -88, -16.8, -83); }
    else if (style === 'bob') { ctx.lineTo(18, -68); ctx.lineTo(13, -68); ctx.lineTo(12, -84); ctx.lineTo(-12, -86); ctx.lineTo(-13, -68); ctx.lineTo(-18, -68); }
    else if (style === 'lang') { ctx.lineTo(17, -62); ctx.lineTo(13, -62); ctx.lineTo(11, -84); ctx.quadraticCurveTo(0, -90, -11, -84); ctx.lineTo(-13, -62); ctx.lineTo(-17, -62); }
    else { ctx.quadraticCurveTo(8, -88, 0, -90); ctx.quadraticCurveTo(-8, -88, -16.8, -83); }
    ctx.closePath();
    d.paper(ctx, hc);
    if (style === 'zoepfe') { ctx.strokeStyle = D().shade(hc, -0.4); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, -97); ctx.lineTo(0, -90); ctx.stroke(); }
  }

  function face(ctx, a, facingShift) {
    const d = D();
    const ex = facingShift;
    d.eye(ctx, -6 + ex, -79, 2.4);
    d.eye(ctx, 6 + ex, -79, 2.4);
    if (a.base === 'm') {
      ctx.strokeStyle = '#2b211d'; ctx.lineWidth = 1.2;
      [[-6 + ex, -1], [6 + ex, 1]].forEach(([x, sd]) => { ctx.beginPath(); ctx.moveTo(x + 2 * sd, -81.5); ctx.lineTo(x + 4 * sd, -83.5); ctx.stroke(); });
    }
    if (a.base !== 'b') { ctx.fillStyle = 'rgba(230,110,110,.32)'; ctx.beginPath(); ctx.arc(-9 + ex, -73, 3, 0, 7); ctx.arc(9 + ex, -73, 3, 0, 7); ctx.fill(); }
    d.smile(ctx, ex, -71, 4.5);
    if (a.glasses) {
      ctx.strokeStyle = '#3b2f2a'; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.arc(-6 + ex, -79, 5, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.arc(6 + ex, -79, 5, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-1 + ex, -79); ctx.lineTo(1 + ex, -79); ctx.stroke();
    }
  }

  /**
   * Zeichnet den ganzen Avatar. (x, y) = Füße, s = Skalierung (1 ≈ 100 px hoch).
   * pose: { t, walk (0..1 Stärke), air, facing (1/-1), hat, charm, ranzl, cheer, front }
   */
  function drawAvatar(ctx, a, x, y, s, pose) {
    const d = D();
    pose = pose || {};
    const t = pose.t || 0;
    const f = pose.facing || 1;
    const skin = OPTIONS.skin[a.skin] || OPTIONS.skin[1];
    const hc = (OPTIONS.hairColor[a.hairColor] || OPTIONS.hairColor[0]).c;
    const topC = (OPTIONS.colors[a.topColor] || OPTIONS.colors[0]).c;
    const botC = (OPTIONS.colors[a.bottomColor] || OPTIONS.colors[1]).c;
    const topId = OPTIONS.top[a.top] ? OPTIONS.top[a.top].id : 'tshirt';
    const botId = OPTIONS.bottom[a.bottom] ? OPTIONS.bottom[a.bottom].id : 'hose';
    const walk = pose.walk || 0;
    const swing = pose.air ? 0.5 : Math.sin(t * 12) * 0.55 * walk;
    const bob = pose.air ? 0 : Math.abs(Math.sin(t * 12)) * -2.5 * walk;
    const armUp = pose.cheer ? -2.4 : 0;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s * f, s);

    // Schatten
    if (!pose.noShadow) { ctx.fillStyle = 'rgba(0,0,0,.13)'; ctx.beginPath(); ctx.ellipse(0, 1, 18, 4, 0, 0, 7); ctx.fill(); }

    ctx.translate(0, bob);

    // Ranzl am Rücken (hinter dem Körper)
    if (pose.ranzl) {
      ctx.save();
      ctx.translate(-17, -54);
      ctx.scale(-1, 1); // Gesicht nach hinten
      d.ranzl(ctx, 0, 0, 0.58, { t, skin: pose.ranzlSkin });
      ctx.restore();
      if (pose.charm && PT.items) {
        ctx.save(); ctx.translate(-22, -40); ctx.rotate(Math.sin(t * 6) * 0.35 * (walk + 0.3));
        PT.items.drawCharm(ctx, pose.charm, 0, 0, 0.55);
        ctx.restore();
      }
    }

    // Hinteres Bein und Arm
    const legX = pose.front ? 6 : 4, armX = pose.front ? 15 : 3;
    function leg(angle, front) {
      ctx.save(); ctx.translate(front ? legX : -legX, -36); ctx.rotate(angle);
      if (botId === 'rock') { d.rr(ctx, -4.5, 0, 9, 34, 4); d.paper(ctx, skin); }
      else { d.rr(ctx, -5, 0, 10, 34, 4); d.paper(ctx, front ? botC : d.shade(botC, -0.12)); }
      d.rr(ctx, -5, 29, 14, 7, 3.5); d.paper(ctx, front ? '#4a3b33' : '#3a2e28');
      ctx.restore();
    }
    function arm(angle, front) {
      ctx.save(); ctx.translate(front ? armX : -armX, -60); ctx.rotate(pose.front ? angle + (front ? -0.12 : 0.12) : angle);
      const sleeve = topId === 'tshirt' ? 10 : 24;
      d.rr(ctx, -4.5, 0, 9, 26, 4); d.paper(ctx, skin);
      d.rr(ctx, -5, 0, 10, sleeve, 4); d.paper(ctx, front ? topC : d.shade(topC, -0.12));
      d.circle(ctx, 0, 27, 4.4, skin, 1.2);
      ctx.restore();
    }
    leg(-swing, false);
    arm(swing * 0.9 + armUp, false);

    // Kapuze hinten
    if (topId === 'hoodie') { d.ellipse(ctx, -9, -66, 9, 7, 0.4, d.shade(topC, -0.1)); }

    // Rumpf
    d.rr(ctx, -12, -64, 24, 32, 8); d.paper(ctx, topC);
    if (topId === 'hoodie') { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(3, -62); ctx.lineTo(3, -52); ctx.moveTo(6, -62); ctx.lineTo(6, -53); ctx.stroke(); d.rr(ctx, -6, -46, 14, 7, 3); d.paper(ctx, d.shade(topC, -0.1), 1); }
    if (topId === 'pulli') { ctx.strokeStyle = d.shade(topC, 0.35); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-11, -48); ctx.lineTo(11, -48); ctx.moveTo(-11, -44); ctx.lineTo(11, -44); ctx.stroke(); }

    // Unterteil-Oberkante
    if (botId === 'rock') { ctx.beginPath(); ctx.moveTo(-12, -38); ctx.lineTo(12, -38); ctx.lineTo(17, -20); ctx.lineTo(-17, -20); ctx.closePath(); d.paper(ctx, botC); }
    else if (botId === 'latz') {
      d.rr(ctx, -12.5, -40, 25, 10, 3); d.paper(ctx, botC);
      d.rr(ctx, -8, -56, 16, 17, 3); d.paper(ctx, botC);
      ctx.strokeStyle = d.shade(botC, -0.3); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-7, -56); ctx.lineTo(-10, -64); ctx.moveTo(7, -56); ctx.lineTo(10, -64); ctx.stroke();
      d.circle(ctx, -6, -54, 1.6, '#f2c14e', 0.8); d.circle(ctx, 6, -54, 1.6, '#f2c14e', 0.8);
    } else { d.rr(ctx, -12.5, -40, 25, 9, 3); d.paper(ctx, botC); }

    leg(swing, true);

    // Kopf
    hairBack(ctx, a, hc);
    d.rr(ctx, -4, -68, 8, 6, 2); d.paper(ctx, skin, 1);
    d.circle(ctx, 0, -80, 16, skin);
    d.ellipse(ctx, 15, -79, 3, 4.5, 0, skin, 1.2); // Ohr
    if (pose.front) d.ellipse(ctx, -15, -79, 3, 4.5, 0, skin, 1.2);
    face(ctx, a, pose.front ? 0 : 2.5);
    hairFront(ctx, a, hc);
    if (pose.hat && PT.items) PT.items.drawHat(ctx, pose.hat, 0, -92, 1);

    arm(-swing * 0.9 + armUp, true);
    ctx.restore();
  }

  /** Nur Kopf (für Porträts) */
  function drawHead(ctx, a, x, y, s, hat) {
    ctx.save();
    ctx.translate(x, y); ctx.scale(s, s); ctx.translate(0, 80);
    const d = D();
    const skin = OPTIONS.skin[a.skin];
    const hc = OPTIONS.hairColor[a.hairColor].c;
    hairBack(ctx, a, hc);
    d.circle(ctx, 0, -80, 16, skin);
    face(ctx, a, 0);
    hairFront(ctx, a, hc);
    if (hat && PT.items) PT.items.drawHat(ctx, hat, 0, -92, 1);
    ctx.restore();
  }

  /** Ganzer Avatar in ein Canvas (Profilkarte, Spiegel) */
  function render(canvas, profileOrAvatar, opts) {
    opts = opts || {};
    const a = profileOrAvatar.avatar || profileOrAvatar;
    const g = profileOrAvatar.game;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const s = canvas.height / (opts.hatRoom === false ? 112 : 132);
    drawAvatar(ctx, a, canvas.width / 2, canvas.height - 8 * s, s, {
      t: opts.t || 0, facing: 1, front: true,
      hat: opts.hat !== undefined ? opts.hat : (g ? g.hat : null),
      ranzl: opts.ranzl !== undefined ? opts.ranzl : (g ? g.hasRanzl : false),
      charm: g ? g.charm : null, cheer: opts.cheer,
    });
  }

  PT.avatar = { OPTIONS, defaultAvatar, randomAvatar, drawAvatar, drawHead, render };
})(window.PT);
