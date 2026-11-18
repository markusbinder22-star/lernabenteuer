// Ton: eigene Web-Audio-Mischung mit Lautstärke-Begrenzer (Limiter), getrennte Regler für Musik und Effekte.
// Alle Musikstücke und Effekte sind CC0-Aufnahmen (siehe CREDITS.md), keine synthetischen Rauschgeräusche.
'use strict';
K.Audio = (() => {
  let ctx = null, master, musicBus, sfxBus, ambBus, duckGain;
  const buffers = {};      // dekodierte Effekte
  const musicCache = {};   // dekodierte Musik (max. 2 behalten)
  const pending = {};
  let curMusic = null, curAmb = null, wantMusic = null, wantAmb = null;
  const lastPlay = {};

  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    ctx = new AC();
    const lim = ctx.createDynamicsCompressor();
    lim.threshold.value = -12; lim.knee.value = 6; lim.ratio.value = 14; lim.attack.value = 0.002; lim.release.value = 0.18;
    master = ctx.createGain(); master.gain.value = 0.9;
    master.connect(lim); lim.connect(ctx.destination);
    duckGain = ctx.createGain(); duckGain.connect(master);
    musicBus = ctx.createGain(); musicBus.connect(duckGain);
    ambBus = ctx.createGain(); ambBus.connect(duckGain);
    sfxBus = ctx.createGain(); sfxBus.connect(master);
    applyVolumes();
    return ctx;
  }
  function applyVolumes() {
    if (!ctx) return; const s = K.Save.settings;
    // Musik bewusst leise, damit Sprache und Effekte gut hörbar bleiben
    musicBus.gain.value = 0.55 * s.music * s.music;
    ambBus.gain.value = 0.5 * s.sfx;
    sfxBus.gain.value = 0.75 * s.sfx * s.sfx;
  }
  async function fetchBuf(path) {
    const res = await fetch(K.url(path));
    const ab = await res.arrayBuffer();
    return await new Promise((ok, bad) => { const p = ctx.decodeAudioData(ab, ok, bad); if (p && p.then) p.then(ok, bad); });
  }
  // Effekte vorab laden (klein)
  async function loadSfx(manifest, onProgress) {
    if (!ensure()) return;
    const keys = Object.keys(manifest); let n = 0;
    await Promise.all(keys.map(async k => {
      try { buffers[k] = await fetchBuf(manifest[k]); } catch (e) { console.warn('Ton fehlt', k, e); }
      n++; onProgress && onProgress(n / keys.length);
    }));
  }
  async function getMusic(key) {
    if (musicCache[key]) return musicCache[key];
    if (pending[key]) return pending[key];
    const path = K.ASSETS.music[key]; if (!path) return null;
    pending[key] = fetchBuf(path).then(b => {
      musicCache[key] = b; delete pending[key];
      const keys = Object.keys(musicCache);
      while (keys.length > 3) { const old = keys.shift(); if (old !== key && (!curMusic || curMusic.key !== old)) delete musicCache[old]; }
      return b;
    }).catch(e => { console.warn('Musik fehlt', key, e); delete pending[key]; return null; });
    return pending[key];
  }

  function playLoop(bus, buf, vol, fadeIn) {
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const g = ctx.createGain(); g.gain.value = 0; src.connect(g); g.connect(bus);
    src.start();
    g.gain.setTargetAtTime(vol, ctx.currentTime, fadeIn / 3);
    return { src, g };
  }
  function stopLoop(h, fade = 1.2) {
    if (!h) return; const t = ctx.currentTime;
    h.g.gain.cancelScheduledValues(t); h.g.gain.setValueAtTime(h.g.gain.value, t); h.g.gain.linearRampToValueAtTime(0, t + fade);
    try { h.src.stop(t + fade + 0.05); } catch (e) {}
  }

  async function music(key, vol = 1, fade = 1.5) {
    wantMusic = key;
    if (!ensure()) return;
    if (curMusic && curMusic.key === key) return;
    if (!key) { stopLoop(curMusic, fade); curMusic = null; return; }
    const buf = await getMusic(key);
    if (!buf || wantMusic !== key) return;
    stopLoop(curMusic, fade);
    curMusic = Object.assign(playLoop(musicBus, buf, vol, fade), { key });
  }
  async function ambient(key, vol = 0.6) {
    wantAmb = key; if (!ensure()) return;
    if (curAmb && curAmb.key === key) return;
    stopLoop(curAmb, 1.5); curAmb = null;
    if (!key || !buffers[key]) return;
    curAmb = Object.assign(playLoop(ambBus, buffers[key], vol, 2), { key });
  }
  // Einzeleffekt; gleiche Effekte kurz hintereinander werden leiser und leicht verstimmt, damit nichts nervt
  function sfx(key, opt = {}) {
    if (!ctx || !buffers[key]) return;
    const now = performance.now();
    const since = now - (lastPlay[key] || 0); lastPlay[key] = now;
    if (since < 45) return;
    const src = ctx.createBufferSource(); src.buffer = buffers[key];
    src.playbackRate.value = (opt.rate || 1) * (opt.vary === false ? 1 : (0.94 + Math.random() * 0.12));
    const g = ctx.createGain(); g.gain.value = (opt.vol == null ? 1 : opt.vol) * (since < 200 ? 0.7 : 1);
    let node = g;
    if (opt.pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = K.clamp(opt.pan, -1, 1); g.connect(p); node = p; }
    src.connect(g); node.connect(sfxBus); src.start(ctx.currentTime + (opt.delay || 0));
    return src;
  }
  function duck(on) {
    if (!ctx) return; const t = ctx.currentTime;
    duckGain.gain.cancelScheduledValues(t); duckGain.gain.setTargetAtTime(on ? 0.35 : 1, t, on ? 0.08 : 0.4);
  }
  function unlock() { ensure(); if (wantMusic && (!curMusic || curMusic.key !== wantMusic)) music(wantMusic); if (wantAmb && (!curAmb || curAmb.key !== wantAmb)) ambient(wantAmb); }
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => window.addEventListener(ev, unlock, { passive: true }));
  document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) ctx.suspend(); else ctx.resume(); });

  return { ensure, loadSfx, music, ambient, sfx, duck, applyVolumes, getMusic, get ready() { return !!ctx; } };
})();
