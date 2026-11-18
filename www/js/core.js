/* Purzeltal – gemeinsame Hilfsfunktionen. Alle Module hängen an window.PT,
   damit das Spiel ohne Build-Schritt und auch per file:// bzw. in der Android-App läuft. */
window.PT = window.PT || {};

(function (PT) {
  'use strict';

  PT.$ = (sel, root) => (root || document).querySelector(sel);
  PT.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /** Kleines Element-Hilfsmittel: PT.el('div', {class:'x', onclick:fn}, [kinder]) */
  PT.el = function (tag, attrs, children) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v === undefined || v === null || v === false) continue;
        if (k === 'class') e.className = v;
        else if (k === 'html') e.innerHTML = v;
        else if (k === 'text') e.textContent = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
        else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
        else e.setAttribute(k, v === true ? '' : v);
      }
    }
    if (children !== undefined && children !== null) {
      (Array.isArray(children) ? children : [children]).forEach(c => {
        if (c === null || c === undefined || c === false) return;
        e.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
      });
    }
    return e;
  };

  PT.rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  PT.pick = arr => arr[Math.floor(Math.random() * arr.length)];
  PT.shuffle = arr => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  PT.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  PT.wait = ms => new Promise(r => setTimeout(r, ms));
  PT.today = () => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };
  PT.uid = () => Math.random().toString(36).slice(2, 10);

  /** Zahlwörter für die Sprachausgabe (die Browser-Stimme liest Ziffern sonst teils seltsam) */
  const ZAHL = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn',
    'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn', 'zwanzig'];
  PT.zahlwort = n => ZAHL[n] !== undefined ? ZAHL[n] : String(n);

  /** Antwortmöglichkeiten rund um die richtige Zahl erzeugen */
  PT.numberOptions = function (correct, count, min, max) {
    const set = new Set([correct]);
    const near = [correct - 1, correct + 1, correct - 2, correct + 2, correct + 3, correct - 3, correct + 10, correct - 10];
    for (const n of PT.shuffle(near.slice(0, 6)).concat(near.slice(6))) {
      if (set.size >= count) break;
      if (n >= min && n <= max) set.add(n);
    }
    let guard = 0;
    while (set.size < count && guard++ < 100) set.add(PT.rand(min, max));
    return PT.shuffle(Array.from(set)).sort((a, b) => a - b);
  };

  /** Sehr einfacher Event-Bus */
  const handlers = {};
  PT.on = (name, fn) => { (handlers[name] = handlers[name] || []).push(fn); };
  PT.emit = (name, data) => { (handlers[name] || []).forEach(fn => { try { fn(data); } catch (e) { console.error(e); } }); };

  PT.isNativeApp = () => !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
})(window.PT);
