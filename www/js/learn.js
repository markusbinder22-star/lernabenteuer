/* Lernsystem: Fähigkeiten mit 5 Schwierigkeitsstufen, Anpassung an die Trefferquote (Ziel 75–85 %). */
(function (PT) {
  'use strict';

  const SKILLS = {
    zaehlen: { name: 'Abzählen bis 10', stage: 'spatz', where: 'Brücke' },
    simultan: { name: 'Mengen auf einen Blick (bis 5)', stage: 'spatz', where: 'Hühner-Blitz' },
    geld_s: { name: 'Mit Knöpfen bezahlen (1 zu 1 zuordnen)', stage: 'spatz', where: 'Marktstand' },
    muster: { name: 'Muster erkennen und fortsetzen', stage: 'spatz', where: 'Mühle (Kettenmuster)' },
    ergaenzen: { name: 'Ergänzen bis 20', stage: 'fuchs', where: 'Brücke' },
    zerlegen: { name: 'Zahlen zerlegen bis 10 und 20', stage: 'fuchs', where: 'Schüttelkiste' },
    geld_f: { name: 'Geld bis 20 Cent', stage: 'fuchs', where: 'Marktstand' },
    plus20: { name: 'Plus bis 20 mit Zehnerübergang', stage: 'fuchs', where: 'Mühle (Zwanzigerfeld)' },
    silben: { name: 'Silben klatschen', stage: 'beide', where: 'Silbenspringen (Bonus)' },
  };

  const WINDOW = 6;

  function state(profile, skill) {
    const s = profile.learn.skills;
    if (!s[skill]) s[skill] = { level: 1, recent: [], attempts: 0, correct: 0, lastSeen: null, history: [] };
    return s[skill];
  }

  function level(profile, skill) { return state(profile, skill).level; }

  /** ok = beim ersten Versuch richtig */
  function record(profile, skill, ok) {
    const st = state(profile, skill);
    st.attempts++;
    if (ok) st.correct++;
    st.recent.push(ok ? 1 : 0);
    if (st.recent.length > WINDOW) st.recent.shift();
    st.lastSeen = Date.now();
    const day = PT.today();
    const h = st.history[st.history.length - 1];
    if (h && h.d === day) { h.a++; if (ok) h.c++; } else { st.history.push({ d: day, a: 1, c: ok ? 1 : 0 }); if (st.history.length > 60) st.history.shift(); }

    const n = st.recent.length;
    const rate = st.recent.reduce((a, b) => a + b, 0) / n;
    if (n >= 5 && rate > 0.85 && st.level < 5) { st.level++; st.recent = []; }
    else if (n >= 4 && rate < 0.6 && st.level > 1) { st.level--; st.recent = []; }
  }

  /** Ampel für den Elternbereich */
  function ampel(profile, skill) {
    const st = profile.learn.skills[skill];
    if (!st || st.attempts === 0) return { color: 'grau', label: 'noch nicht geübt' };
    const recentRate = st.recent.length ? st.recent.reduce((a, b) => a + b, 0) / st.recent.length : st.correct / st.attempts;
    if (st.attempts < 5) return { color: 'rot', label: 'neu' };
    if (st.level >= 4 && recentRate >= 0.75) return { color: 'gruen', label: 'sitzt sicher' };
    return { color: 'gelb', label: 'übt gerade' };
  }

  function skillsFor(stage) {
    return Object.keys(SKILLS).filter(k => SKILLS[k].stage === stage || SKILLS[k].stage === 'beide');
  }

  PT.learn = { SKILLS, state, level, record, ampel, skillsFor };
})(window.PT);
