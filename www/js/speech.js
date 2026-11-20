// Vorlesen: Android-App nutzt die Sprachausgabe des Geräts (Capacitor-Plugin), PC/Browser die Web Speech API
'use strict';
K.Speech = (() => {
  let token = 0;
  const plugin = () => window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TextToSpeech;
  let voices = [];
  function loadVoices() { if (window.speechSynthesis) voices = speechSynthesis.getVoices(); }
  if (window.speechSynthesis) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  function pickVoice(lang) {
    const l = lang.toLowerCase(); const cands = voices.filter(v => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(l.slice(0, 2)));
    const exact = cands.filter(v => v.lang.toLowerCase().replace('_', '-') === l);
    const pool = exact.length ? exact : cands;
    return pool.find(v => /google|natural|neural|online/i.test(v.name)) || pool.find(v => v.localService) || pool[0] || null;
  }
  // Text für die Sprachausgabe säubern (Emojis und Zeichen weg)
  function clean(t) { return String(t).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').replace(/[_*#]/g, ' ').replace(/\s+/g, ' ').trim(); }

  async function say(text, opt = {}) {
    const s = K.Save.settings; if (!s.voice && !opt.force) return;
    const lang = opt.lang || 'de-DE'; const my = ++token; text = clean(text); if (!text) return;
    K.Audio.duck(true);
    try {
      const p = plugin();
      if (p) {
        try { await p.stop(); } catch (e) {}
        await p.speak({ text, lang, rate: (opt.rate || 1) * s.rate * (lang.startsWith('en') ? 0.85 : 0.95), pitch: opt.pitch || 1.05, volume: 1.0, category: 'playback' });
      } else if (window.speechSynthesis) {
        speechSynthesis.cancel();
        await new Promise(res => {
          const u = new SpeechSynthesisUtterance(text); u.lang = lang;
          const v = pickVoice(lang); if (v) u.voice = v;
          u.rate = (opt.rate || 1) * s.rate * (lang.startsWith('en') ? 0.85 : 0.95); u.pitch = opt.pitch || 1.05;
          u.onend = u.onerror = res; speechSynthesis.speak(u);
          setTimeout(res, 2500 + text.length * 110); // Sicherheitsnetz
        });
      }
    } catch (e) { console.warn('Sprachausgabe', e); }
    if (my === token) K.Audio.duck(false);
  }
  function stop() { token++; try { const p = plugin(); if (p) p.stop(); else if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {} K.Audio.duck(false); }
  return { say, stop, clean };
})();
