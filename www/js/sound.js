/* Geräusche werden im Code erzeugt (Web Audio) – keine Audiodateien, keine Lizenzfragen. */
(function (PT) {
  'use strict';
  let ctx = null;

  function ac() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function vol() { return (PT.store ? PT.store.settings.volume : 0.8) * 0.35; }

  function tone(freq, start, dur, type, gain, slideTo) {
    const c = ac(); if (!c) return;
    const t0 = c.currentTime + start;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, (gain || 1) * vol()), t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }

  const S = {
    unlock() { ac(); },
    coin() { tone(988, 0, 0.08, 'square', 0.5); tone(1319, 0.07, 0.18, 'square', 0.5); },
    jump() { tone(330, 0, 0.16, 'triangle', 0.7, 620); },
    land() { tone(140, 0, 0.06, 'sine', 0.5); },
    tap() { tone(660, 0, 0.05, 'triangle', 0.5); },
    plank() { tone(220, 0, 0.08, 'square', 0.35); tone(180, 0.05, 0.08, 'square', 0.3); },
    right() { [523, 659, 784].forEach((f, i) => tone(f, i * 0.09, 0.22, 'triangle', 0.8)); },
    soft() { tone(392, 0, 0.18, 'sine', 0.6); tone(330, 0.15, 0.25, 'sine', 0.6); },
    whoosh() { tone(900, 0, 0.35, 'sawtooth', 0.12, 120); },
    pull() { tone(200, 0, 0.3, 'triangle', 0.5, 500); },
    save() { [784, 988].forEach((f, i) => tone(f, i * 0.1, 0.15, 'sine', 0.7)); },
    reward() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.2, 'triangle', 0.8)); },
    /** kleines Volksmusik-artiges Motiv mit „Tuba“-Bass */
    fest() {
      const mel = [392, 440, 494, 523, 587, 523, 494, 440, 392, 494, 587, 784, 659, 587, 523, 494, 523];
      const bass = [98, 147, 98, 147, 110, 147, 98, 147, 98, 147, 98, 147, 131, 147, 98, 147, 131];
      mel.forEach((f, i) => tone(f, i * 0.22, 0.2, 'triangle', 0.6));
      bass.forEach((f, i) => tone(f, i * 0.22, 0.18, 'sawtooth', 0.35));
    },
  };
  PT.sound = S;
})(window.PT);
