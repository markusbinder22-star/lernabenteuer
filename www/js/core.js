// Kivalu – Kern: Namensraum, Hilfsfunktionen, Asset-Pfade
'use strict';
const K = window.K = {
  W: 1280, H: 720, TILE: 64,
  FONT: 'Fredoka, "Trebuchet MS", Arial, sans-serif',
  TITLE_FONT: 'Uncial, Georgia, serif',
  isApp: !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()),
};

// Assets: in der PC-Einzeldatei liegen alle Dateien als data:-URL in window.EMBED
K.url = (p) => (window.EMBED && window.EMBED[p]) || p;

K.rnd = (a, b) => a + Math.random() * (b - a);
K.irnd = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
K.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
K.shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
K.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
K.lerp = (a, b, t) => a + (b - a) * t;
K.uniq = (arr) => [...new Set(arr)];
K.sleep = (scene, ms) => new Promise(r => scene.time.delayedCall(ms, r));

// Text-Stile
K.txt = (size, color = '#fff6e0', extra = {}) => Object.assign({
  fontFamily: K.FONT, fontSize: size + 'px', color, fontStyle: '600',
  stroke: '#2a1408', strokeThickness: Math.max(2, Math.round(size / 7)),
}, extra);
// Überschriften in gut lesbarer Schrift (Leseanfänger!), die Zierschrift nur für das Logo
K.title = (size, color = '#ffd27a', extra = {}) => Object.assign({
  fontFamily: K.FONT, fontStyle: '700', fontSize: size + 'px', color,
  stroke: '#3a1400', strokeThickness: Math.max(3, Math.round(size / 8)),
  shadow: { offsetX: 0, offsetY: 3, color: '#000', blur: 8, fill: true, stroke: true },
}, extra);

K.logo = (size, color = '#ffd27a', extra = {}) => Object.assign(K.title(size, color, extra), { fontFamily: K.TITLE_FONT, fontStyle: 'normal' }, extra);

K.bootProgress = (f) => { const el = document.getElementById('boot-fill'); if (el) el.style.width = Math.round(f * 100) + '%'; };
K.hideBoot = () => { const el = document.getElementById('boot'); if (el) { el.classList.add('hide'); setTimeout(() => el.remove(), 800); } };

// kleine Ereignis-Hilfe
K.events = new Phaser.Events.EventEmitter();
