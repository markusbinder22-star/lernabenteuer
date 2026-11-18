/* Sprachausgabe.
   Reihenfolge: 1. eigene Aufnahme (Elternbereich), 2. Android-App: native Sprachausgabe des Geräts,
   3. Browser-Sprachausgabe (Web Speech API). Alles kostenlos und offline. */
(function (PT) {
  'use strict';

  const PITCH = { ranzl: 1.25, pfeffer: 0.85, resi: 1.05, erzaehler: 1.0 };
  let voice = null;
  let nativeTTS = null;
  let current = null;           // { cancel() }
  let lastItem = null;
  const recorded = new Set();   // ids mit eigener Aufnahme
  let db = null;

  // ---------- Stimme wählen ----------
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    const vs = window.speechSynthesis.getVoices() || [];
    voice = vs.find(v => /de[-_]AT/i.test(v.lang)) ||
      vs.find(v => /de[-_]DE/i.test(v.lang) && /google|natural|online/i.test(v.name)) ||
      vs.find(v => /de[-_]DE/i.test(v.lang)) ||
      vs.find(v => /^de/i.test(v.lang)) || null;
  }
  if ('speechSynthesis' in window) {
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
  }

  function initNative() {
    try {
      if (PT.isNativeApp() && window.Capacitor.registerPlugin) {
        nativeTTS = window.Capacitor.registerPlugin('TextToSpeech');
      }
    } catch (e) { nativeTTS = null; }
  }

  // ---------- Aufnahmen (IndexedDB) ----------
  function openDB() {
    return new Promise((resolve) => {
      if (!('indexedDB' in window)) return resolve(null);
      const req = indexedDB.open('purzeltal-stimmen', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('clips');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
  }
  function tx(mode) { return db.transaction('clips', mode).objectStore('clips'); }

  async function init() {
    initNative();
    db = await openDB();
    if (!db) return;
    await new Promise(res => {
      const r = tx('readonly').getAllKeys();
      r.onsuccess = () => { (r.result || []).forEach(k => recorded.add(k)); res(); };
      r.onerror = () => res();
    });
  }

  function getClip(id) {
    return new Promise(res => {
      if (!db) return res(null);
      const r = tx('readonly').get(id);
      r.onsuccess = () => res(r.result || null);
      r.onerror = () => res(null);
    });
  }
  function putClip(id, blob) {
    return new Promise((res, rej) => {
      const r = tx('readwrite').put(blob, id);
      r.onsuccess = () => { recorded.add(id); res(); };
      r.onerror = () => rej(r.error);
    });
  }
  function deleteClip(id) {
    return new Promise(res => {
      const r = tx('readwrite').delete(id);
      r.onsuccess = () => { recorded.delete(id); res(); };
      r.onerror = () => res();
    });
  }

  // ---------- Abspielen ----------
  function stop() {
    if (current) { try { current.cancel(); } catch (e) { /* egal */ } current = null; }
    if ('speechSynthesis' in window) { try { window.speechSynthesis.cancel(); } catch (e) { /* egal */ } }
    if (nativeTTS) { nativeTTS.stop().catch(() => {}); }
  }

  function volume() { return PT.store ? PT.store.settings.volume : 0.9; }
  function rate() {
    const base = PT.store ? PT.store.settings.speechRate : 0.95;
    const p = PT.game && PT.game.profile;
    return p && p.stage === 'spatz' ? base * 0.92 : base;
  }

  function speakTTS(text, who) {
    return new Promise(resolve => {
      let done = false;
      const finish = () => { if (!done) { done = true; resolve(); } };
      // Sicherheitsnetz: manche Geräte melden das Ende nie
      const timer = setTimeout(finish, 1800 + text.length * 95);
      const pitch = PITCH[who] || 1;

      if (nativeTTS) {
        current = { cancel: () => { clearTimeout(timer); finish(); } };
        nativeTTS.speak({ text, lang: 'de-DE', rate: rate(), pitch, volume: volume(), category: 'playback' })
          .then(() => { clearTimeout(timer); finish(); })
          .catch(() => { clearTimeout(timer); finish(); });
        return;
      }
      if (!('speechSynthesis' in window) || volume() === 0) { setTimeout(finish, 400 + text.length * 40); return; }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = voice ? voice.lang : 'de-DE';
      if (voice) u.voice = voice;
      u.rate = rate();
      u.pitch = pitch;
      u.volume = volume();
      u.onend = () => { clearTimeout(timer); finish(); };
      u.onerror = () => { clearTimeout(timer); finish(); };
      current = { cancel: () => { clearTimeout(timer); finish(); } };
      window.speechSynthesis.speak(u);
    });
  }

  async function playClip(id) {
    const blob = await getClip(id);
    if (!blob) return false;
    const url = URL.createObjectURL(blob);
    await new Promise(resolve => {
      const a = new Audio(url);
      a.volume = volume();
      let done = false;
      const finish = () => { if (!done) { done = true; URL.revokeObjectURL(url); resolve(); } };
      a.onended = finish; a.onerror = finish;
      current = { cancel: () => { a.pause(); finish(); } };
      a.play().catch(finish);
    });
    return true;
  }

  /** item: Zeilen-id (string), {id} oder {text, who}. Gibt ein Promise zurück, das nach dem Sprechen erfüllt wird. */
  async function say(item, opts) {
    if (typeof item === 'string') item = PT.line(item);
    if (!item || !item.text) return;
    if (!(opts && opts.noRemember)) lastItem = item;
    stop();
    if (item.id && recorded.has(item.id)) {
      const ok = await playClip(item.id);
      if (ok) return;
    }
    // Für die Stimme Großbuchstaben-Wörter wie BÄKCER buchstabieren lassen wäre zu viel; wir lesen normal.
    await speakTTS(item.text, item.who || 'ranzl');
  }

  /** Mehrere Teile nacheinander, mit kleinen Pausen (z. B. Silben) */
  async function sayParts(parts, who, pauseMs) {
    for (const p of parts) {
      await speakTTS(p, who || 'ranzl');
      await PT.wait(pauseMs || 350);
    }
  }

  function repeat() { if (lastItem) return say(lastItem); }

  PT.speech = {
    init, say, sayParts, stop, repeat,
    hasRecording: id => recorded.has(id),
    putClip, deleteClip, playClip,
    get last() { return lastItem; },
    get engine() { return nativeTTS ? 'Android-Sprachausgabe' : ('speechSynthesis' in window ? (voice ? 'Browser-Stimme: ' + voice.name : 'Browser-Stimme (keine deutsche Stimme gefunden)') : 'keine'); },
  };
})(window.PT);
