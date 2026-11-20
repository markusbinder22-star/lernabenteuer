// Spielstände: mehrere Kinder-Profile, lokal im Gerät (localStorage)
'use strict';
K.Save = (() => {
  const KEY = 'kivalu.save.v1';
  const CATS = ['mathe', 'schreiben', 'lesen', 'englisch', 'logik'];
  let data = null;

  function blank() {
    return { profiles: [], current: null, settings: { music: 0.6, sfx: 0.8, voice: true, rate: 1.0 } };
  }
  function load() {
    try { data = JSON.parse(localStorage.getItem(KEY)) || blank(); } catch (e) { data = blank(); }
    data.settings = Object.assign(blank().settings, data.settings || {});
    data.profiles.forEach(fix);
    return data;
  }
  function fix(p) {
    p.owned = p.owned || { hats: [], colors: ['blau'] };
    p.levels = p.levels || {};
    p.seen = p.seen || {};
    p.hort = p.hort || [];
    p.skill = p.skill || {};
    CATS.forEach(c => { if (!p.skill[c]) p.skill[c] = p.stage === 'jung' ? 4 : 1; });
    p.stats = p.stats || { right: 0, wrong: 0, cat: {} };
    if (p.feathers == null) p.feathers = 2;
    if (p.eyes == null) p.eyes = 2;
    if (p.coins == null) p.coins = 0;
    return p;
  }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { console.warn('Speichern fehlgeschlagen', e); } }

  function create(name, stage) {
    const p = fix({ id: 'p' + Date.now().toString(36), name, stage, color: 'blau', hat: null, created: Date.now() });
    data.profiles.push(p); data.current = p.id; persist(); return p;
  }
  const cur = () => data.profiles.find(p => p.id === data.current) || null;
  function select(id) { data.current = id; const p = cur(); if (p) p.lastPlayed = Date.now(); persist(); }
  function remove(id) { data.profiles = data.profiles.filter(p => p.id !== id); if (data.current === id) data.current = null; persist(); }

  // Fortschritt
  const levelDone = (p, id) => !!(p.levels[id] && p.levels[id].done);
  function abilities(p) {
    const d = (id, k) => !!p.seen['skill_' + k] || levelDone(p, id);
    return { fire: d('1-1', 'fire'), double: d('2-1', 'double'), melt: d('3-1', 'melt'), climb: d('4-1', 'climb'), fly: d('5-1', 'fly'), bigfire: d('6-1', 'bigfire') };
  }
  function finishLevel(p, id, result) {
    const old = p.levels[id] || {};
    p.levels[id] = { done: true, gems: Math.max(old.gems || 0, result.gems || 0), max: result.maxGems || old.max || 0, treasures: K.uniq([...(old.treasures || []), ...(result.treasures || [])]) };
    persist();
  }
  function addTreasure(p, tid) { if (!p.hort.includes(tid)) p.hort.push(tid); persist(); }

  // Lernstand: passt sich an (1 = leicht … 10 = schwer)
  function recordAnswer(p, cat, ok, firstTry) {
    p.stats.cat[cat] = p.stats.cat[cat] || { right: 0, wrong: 0, streak: 0 };
    const s = p.stats.cat[cat];
    if (ok && firstTry) { p.stats.right++; s.right++; s.streak = Math.max(0, s.streak) + 1; }
    else if (!ok) { p.stats.wrong++; s.wrong++; s.streak = Math.min(0, s.streak) - 1; }
    const max = 10;
    if (s.streak >= 3) { p.skill[cat] = Math.min(max, p.skill[cat] + 1); s.streak = 0; }
    if (s.streak <= -2) { p.skill[cat] = Math.max(1, p.skill[cat] - 1); s.streak = 0; }
    persist();
  }

  return { load, persist, create, cur, select, remove, abilities, finishLevel, addTreasure, recordAnswer, levelDone, CATS,
    get data() { return data; }, get settings() { return data.settings; } };
})();
