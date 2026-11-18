/* Spielstände: lokal im Gerät (localStorage). Keine Cloud, keine Kinderdaten auf Servern.
   Sprachaufnahmen liegen getrennt in IndexedDB (siehe speech.js). */
(function (PT) {
  'use strict';
  const KEY = 'purzeltal.v1';
  const MAX_PROFILES = 6;
  let data = null;

  function defaultSettings() {
    return {
      volume: 0.9,        // 0..1
      autoRead: true,     // Texte automatisch vorlesen
      control: 'buttons', // 'buttons' oder 'tap' (Tipp-dorthin)
      playMinutes: 0,     // Spielzeit-Wecker, 0 = aus
      speechRate: 0.95,
    };
  }

  function newGame() {
    return {
      prologDone: false,
      hasRanzl: false,
      tutorialButtons: [],   // eingesammelte Knöpfe im Prolog
      taler: 0,
      owned: [],             // gekaufte/gefundene Gegenstände (ids aus items.js)
      hat: null,             // getragene Kopfbedeckung
      charm: null,           // Ranzl-Anhänger
      radiergummi: 1,        // Verbrauchs-Werkzeug
      stickers: [],
      stations: {},          // { bruecke: true, ... }
      stars: {},             // Bonus-Sterne je Station
      festDone: false,
      springfedern: false,
      chestOpened: false,
      coins: [],             // ids eingesammelter Knopf-Taler in der Welt
      wish: null,            // Spar-Glas-Ziel
      raetselDate: null,
      silbenDate: null,
      silbenToday: 0,
      discovered: ['dorf'],
      pos: null,             // { x, y } in der Welt
      playSeconds: 0,
      instruments: [],
      seen: [],              // einmalige Hinweise, die schon gesagt wurden
      prologStage: 0,
    };
  }

  function newProfile(name, stage) {
    return {
      id: PT.uid(),
      name: name,
      stage: stage,          // 'spatz' (4–5) oder 'fuchs' (6–7)
      createdAt: Date.now(),
      avatar: PT.avatar ? PT.avatar.defaultAvatar() : {},
      game: newGame(),
      learn: { skills: {} },
    };
  }

  function migrate(p) {
    p.game = Object.assign(newGame(), p.game || {});
    p.learn = p.learn || { skills: {} };
    p.learn.skills = p.learn.skills || {};
    if (PT.avatar) p.avatar = Object.assign(PT.avatar.defaultAvatar(), p.avatar || {});
    return p;
  }

  function load() {
    try { data = JSON.parse(localStorage.getItem(KEY)); } catch (e) { data = null; }
    if (!data || !Array.isArray(data.profiles)) data = { version: 1, profiles: [], settings: {} };
    data.settings = Object.assign(defaultSettings(), data.settings || {});
    data.profiles.forEach(migrate);
    // Browser bitten, die Daten nicht automatisch zu löschen (wirkt v. a. bei installierter Web-App)
    try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) { /* egal */ }
    return data;
  }

  function save() {
    if (!data) return false;
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Speichern fehlgeschlagen', e);
      return false;
    }
  }

  function exportJSON() {
    return JSON.stringify({ app: 'purzeltal', exportedAt: new Date().toISOString(), data: data }, null, 2);
  }

  function importJSON(text) {
    const obj = JSON.parse(text);
    const incoming = obj && obj.data;
    if (!incoming || !Array.isArray(incoming.profiles)) throw new Error('Das ist keine Purzeltal-Sicherung.');
    incoming.settings = Object.assign(defaultSettings(), incoming.settings || {});
    incoming.profiles.forEach(migrate);
    data = incoming;
    save();
  }

  PT.store = {
    MAX_PROFILES,
    load, save, exportJSON, importJSON, newProfile, newGame,
    get data() { return data || load(); },
    get settings() { return (data || load()).settings; },
    profiles() { return (data || load()).profiles; },
    profile(id) { return this.profiles().find(p => p.id === id) || null; },
    addProfile(p) { this.profiles().push(p); save(); return p; },
    removeProfile(id) { data.profiles = data.profiles.filter(p => p.id !== id); save(); },
    resetProfile(id) {
      const p = this.profile(id);
      if (!p) return;
      p.game = newGame();
      p.learn = { skills: {} };
      save();
    },
  };
})(window.PT);
