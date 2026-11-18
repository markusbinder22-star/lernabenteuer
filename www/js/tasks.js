// Aufgaben-Generator: Mathe, Schreiben, Lesen, Englisch, Logik
// Zwei Stufen: 'ei' = Drachenei (4–5 Jahre), 'jung' = Jungdrache (7–8 Jahre, liest, schreibt, multipliziert).
// Jede Kategorie hat einen eigenen Lernstand 1–10, der mitwächst (siehe K.Save.recordAnswer).
'use strict';
K.Tasks = (() => {
  const { irnd, pick, shuffle, uniq } = K;

  // ---------------- Wortschatz ----------------
  // [Wort, Emoji, Artikel, Mehrzahl, Silben]
  const WORDS = [
    ['Drache', '🐉', 'der', 'Drachen', 'Dra-che'], ['Apfel', '🍎', 'der', 'Äpfel', 'Ap-fel'], ['Maus', '🐭', 'die', 'Mäuse', 'Maus'], ['Haus', '🏠', 'das', 'Häuser', 'Haus'],
    ['Hund', '🐶', 'der', 'Hunde', 'Hund'], ['Katze', '🐱', 'die', 'Katzen', 'Kat-ze'], ['Sonne', '☀️', 'die', 'Sonnen', 'Son-ne'], ['Mond', '🌙', 'der', 'Monde', 'Mond'],
    ['Baum', '🌳', 'der', 'Bäume', 'Baum'], ['Blume', '🌸', 'die', 'Blumen', 'Blu-me'], ['Fisch', '🐟', 'der', 'Fische', 'Fisch'], ['Vogel', '🐦', 'der', 'Vögel', 'Vo-gel'],
    ['Auto', '🚗', 'das', 'Autos', 'Au-to'], ['Ball', '⚽', 'der', 'Bälle', 'Ball'], ['Buch', '📖', 'das', 'Bücher', 'Buch'], ['Krone', '👑', 'die', 'Kronen', 'Kro-ne'],
    ['Schlüssel', '🔑', 'der', 'Schlüssel', 'Schlüs-sel'], ['Feuer', '🔥', 'das', 'Feuer', 'Feu-er'], ['Stern', '⭐', 'der', 'Sterne', 'Stern'], ['Eis', '🍦', 'das', 'Eis', 'Eis'],
    ['Igel', '🦔', 'der', 'Igel', 'I-gel'], ['Ente', '🦆', 'die', 'Enten', 'En-te'], ['Esel', '🫏', 'der', 'Esel', 'E-sel'], ['Oma', '👵', 'die', 'Omas', 'O-ma'],
    ['Opa', '👴', 'der', 'Opas', 'O-pa'], ['Nase', '👃', 'die', 'Nasen', 'Na-se'], ['Banane', '🍌', 'die', 'Bananen', 'Ba-na-ne'], ['Birne', '🍐', 'die', 'Birnen', 'Bir-ne'],
    ['Tomate', '🍅', 'die', 'Tomaten', 'To-ma-te'], ['Hase', '🐰', 'der', 'Hasen', 'Ha-se'], ['Bär', '🐻', 'der', 'Bären', 'Bär'], ['Löwe', '🦁', 'der', 'Löwen', 'Lö-we'],
    ['Affe', '🐵', 'der', 'Affen', 'Af-fe'], ['Schaf', '🐑', 'das', 'Schafe', 'Schaf'], ['Kuh', '🐮', 'die', 'Kühe', 'Kuh'], ['Pferd', '🐴', 'das', 'Pferde', 'Pferd'],
    ['Schiff', '🚢', 'das', 'Schiffe', 'Schiff'], ['Zug', '🚂', 'der', 'Züge', 'Zug'], ['Rakete', '🚀', 'die', 'Raketen', 'Ra-ke-te'], ['Uhr', '⏰', 'die', 'Uhren', 'Uhr'],
    ['Glocke', '🔔', 'die', 'Glocken', 'Glo-cke'], ['Hut', '🎩', 'der', 'Hüte', 'Hut'], ['Schuh', '👟', 'der', 'Schuhe', 'Schuh'], ['Brot', '🍞', 'das', 'Brote', 'Brot'],
    ['Käse', '🧀', 'der', 'Käse', 'Kä-se'], ['Kuchen', '🍰', 'der', 'Kuchen', 'Ku-chen'], ['Zitrone', '🍋', 'die', 'Zitronen', 'Zi-tro-ne'], ['Gurke', '🥒', 'die', 'Gurken', 'Gur-ke'],
    ['Pilz', '🍄', 'der', 'Pilze', 'Pilz'], ['Wolke', '☁️', 'die', 'Wolken', 'Wol-ke'], ['Schnecke', '🐌', 'die', 'Schnecken', 'Schne-cke'], ['Spinne', '🕷️', 'die', 'Spinnen', 'Spin-ne'],
    ['Biene', '🐝', 'die', 'Bienen', 'Bie-ne'], ['Schlange', '🐍', 'die', 'Schlangen', 'Schlan-ge'], ['Frosch', '🐸', 'der', 'Frösche', 'Frosch'], ['Eule', '🦉', 'die', 'Eulen', 'Eu-le'],
    ['Zahn', '🦷', 'der', 'Zähne', 'Zahn'], ['Hand', '✋', 'die', 'Hände', 'Hand'], ['Ohr', '👂', 'das', 'Ohren', 'Ohr'], ['Auge', '👁️', 'das', 'Augen', 'Au-ge'],
    ['Herz', '❤️', 'das', 'Herzen', 'Herz'], ['Kerze', '🕯️', 'die', 'Kerzen', 'Ker-ze'], ['Leiter', '🪜', 'die', 'Leitern', 'Lei-ter'], ['Tasse', '☕', 'die', 'Tassen', 'Tas-se'],
    ['Kamel', '🐫', 'das', 'Kamele', 'Ka-mel'], ['Pinguin', '🐧', 'der', 'Pinguine', 'Pin-gu-in'], ['Tiger', '🐯', 'der', 'Tiger', 'Ti-ger'], ['Wal', '🐳', 'der', 'Wale', 'Wal'],
    ['Muschel', '🐚', 'die', 'Muscheln', 'Mu-schel'], ['Regen', '🌧️', 'der', 'Regen', 'Re-gen'], ['Berg', '⛰️', 'der', 'Berge', 'Berg'], ['Insel', '🏝️', 'die', 'Inseln', 'In-sel'],
  ];
  const W = (w) => WORDS.find(x => x[0] === w);
  const SIMPLE = ['OMA', 'OPA', 'EIS', 'AUTO', 'HUT', 'MAUS', 'HAUS', 'BALL', 'IGEL', 'ESEL', 'ENTE', 'NASE', 'HASE', 'MOND', 'UHR', 'KUH', 'ZUG', 'BUCH', 'SONNE', 'FISCH'];
  // Rechtschreib-Fallen (richtig, falsch, falsch)
  const SPELL = [
    ['Biene', 'Beine?', null], ['Spiegel', 'Spigel', 'Spiegl'], ['Wiese', 'Wise', 'Wiesse'], ['Riese', 'Rise', 'Reise?'], ['Fliege', 'Flige', 'Fliehge'],
    ['Brücke', 'Brüke', 'Brükke'], ['Glocke', 'Gloke', 'Glokke'], ['Zucker', 'Zuker', 'Zukker'], ['Decke', 'Deke', 'Dekke'], ['Schnecke', 'Schneke', 'Schnekke'],
    ['Katze', 'Kaze', 'Katse'], ['Mütze', 'Müze', 'Mütse'], ['Pfütze', 'Pfüze', 'Fütze'], ['Platz', 'Plaz', 'Plats'], ['Schatz', 'Schaz', 'Schats'],
    ['Sonne', 'Sone', 'Sonnne'], ['Himmel', 'Himel', 'Himmell'], ['Teller', 'Teler', 'Tellar'], ['Wasser', 'Waser', 'Wassa'], ['Kette', 'Kete', 'Ketter'],
    ['Straße', 'Strase', 'Strasse?'], ['Fuß', 'Fus', 'Fuhs'], ['Drachenhöhle', 'Drachenhöle', 'Drachenhöhlle'], ['Fahrrad', 'Farad', 'Fahrad'], ['Vogel', 'Fogel', 'Vohgel'],
    ['Vater', 'Fater', 'Vahter'], ['Schwanz', 'Schwans', 'Schwanntz'], ['Flügel', 'Flühgel', 'Flügl'], ['Zwerg', 'Zwerk', 'Zwärg'], ['König', 'Könich', 'Könik'],
    ['Feuer', 'Foier', 'Feuar'], ['Freund', 'Froind', 'Freunt'], ['Höhle', 'Hölle?', 'Höle'], ['Eule', 'Oile', 'Euhle'], ['Stein', 'Schtein', 'Stain'],
  ].map(r => r.filter(Boolean).map(s => s.replace('?', '')));
  // Wörter zum Diktieren (Jungdrache)
  const DICTATE = {
    easy: ['Drache', 'Feuer', 'Höhle', 'Schatz', 'Krone', 'Flügel', 'Stein', 'Wolke', 'Nebel', 'Sturm', 'Zwerg', 'Gold', 'Eis', 'Berg', 'Burg', 'Ritter'],
    mid: ['Schlüssel', 'Kette', 'Brücke', 'Fackel', 'Glocke', 'Truhe', 'Spiegel', 'Riese', 'Sonne', 'Himmel', 'Insel', 'Schiff', 'Mantel', 'Wiese', 'Zucker', 'Pfütze'],
    hard: ['Schatztruhe', 'Drachenei', 'Feuerstein', 'Zahnrad', 'Eiszapfen', 'Wasserfall', 'Sternschnuppe', 'Schneeflocke', 'Kristall', 'Lokomotive', 'Abenteuer', 'Zauberstab'],
  };
  const SENT = [ // Sätze zum Ordnen
    'Der Drache spuckt Feuer.', 'Kivalu fliegt über den Berg.', 'Die Zwerge graben nach Gold.', 'Im Wald ist es neblig.', 'Der Ritter hat eine Kette.',
    'Kivalu findet einen Schatz.', 'Das Eis schmilzt in der Sonne.', 'Die Eule sitzt auf dem Ast.', 'Der Sturm ist sehr laut.', 'Wir holen die Herzglut zurück.',
    'Silberschwinge friert nie.', 'Die Lore rollt in den Tunnel.', 'Baron Ketterich baut Maschinen.', 'Am Abend leuchten die Kristalle.',
  ];
  const EN = [ // [english, emoji, deutsch, gruppe]
    ['red', '🟥', 'rot', 'col'], ['blue', '🟦', 'blau', 'col'], ['green', '🟩', 'grün', 'col'], ['yellow', '🟨', 'gelb', 'col'], ['orange', '🟧', 'orange', 'col'], ['purple', '🟪', 'lila', 'col'], ['black', '⬛', 'schwarz', 'col'], ['white', '⬜', 'weiß', 'col'], ['brown', '🟫', 'braun', 'col'],
    ['dog', '🐶', 'Hund', 'ani'], ['cat', '🐱', 'Katze', 'ani'], ['fish', '🐟', 'Fisch', 'ani'], ['bird', '🐦', 'Vogel', 'ani'], ['mouse', '🐭', 'Maus', 'ani'], ['horse', '🐴', 'Pferd', 'ani'], ['cow', '🐮', 'Kuh', 'ani'], ['pig', '🐷', 'Schwein', 'ani'], ['frog', '🐸', 'Frosch', 'ani'], ['dragon', '🐉', 'Drache', 'ani'], ['bear', '🐻', 'Bär', 'ani'], ['lion', '🦁', 'Löwe', 'ani'], ['duck', '🦆', 'Ente', 'ani'], ['owl', '🦉', 'Eule', 'ani'],
    ['apple', '🍎', 'Apfel', 'food'], ['banana', '🍌', 'Banane', 'food'], ['bread', '🍞', 'Brot', 'food'], ['cake', '🍰', 'Kuchen', 'food'], ['milk', '🥛', 'Milch', 'food'], ['cheese', '🧀', 'Käse', 'food'], ['egg', '🥚', 'Ei', 'food'], ['carrot', '🥕', 'Karotte', 'food'],
    ['sun', '☀️', 'Sonne', 'nat'], ['moon', '🌙', 'Mond', 'nat'], ['star', '⭐', 'Stern', 'nat'], ['tree', '🌳', 'Baum', 'nat'], ['flower', '🌸', 'Blume', 'nat'], ['snow', '❄️', 'Schnee', 'nat'], ['rain', '🌧️', 'Regen', 'nat'], ['fire', '🔥', 'Feuer', 'nat'], ['mountain', '⛰️', 'Berg', 'nat'],
    ['house', '🏠', 'Haus', 'thing'], ['car', '🚗', 'Auto', 'thing'], ['ball', '⚽', 'Ball', 'thing'], ['book', '📖', 'Buch', 'thing'], ['key', '🔑', 'Schlüssel', 'thing'], ['crown', '👑', 'Krone', 'thing'], ['ship', '🚢', 'Schiff', 'thing'], ['hat', '🎩', 'Hut', 'thing'],
    ['eye', '👁️', 'Auge', 'body'], ['ear', '👂', 'Ohr', 'body'], ['nose', '👃', 'Nase', 'body'], ['hand', '✋', 'Hand', 'body'], ['foot', '🦶', 'Fuß', 'body'], ['mouth', '👄', 'Mund', 'body'],
  ];
  const EN_NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
  const COUNT_EMO = ['💎', '🔥', '🪙', '🥚', '🍎', '⭐', '🐟', '🍄', '🦴', '🔑'];

  // ---------------- Hilfen ----------------
  const optsNum = (ans, spread, n = 3, min = 0) => { const s = new Set([ans]); let guard = 0; while (s.size < n && guard++ < 200) { const v = ans + irnd(-spread, spread); if (v >= min && v !== ans) s.add(v); } let k = 1; while (s.size < n) s.add(ans + spread + k++); return shuffle([...s]); };
  const choice = (o) => Object.assign({ kind: 'choice' }, o, { answerIdx: o.options.findIndex(x => String(x) === String(o.answer)) });
  const keypad = (o) => Object.assign({ kind: 'keypad' }, o);
  const tiles = (o) => Object.assign({ kind: 'tiles' }, o);
  const order = (o) => Object.assign({ kind: 'order' }, o);
  const rep = (e, n) => Array(n).fill(e).join('');
  // Level-gewichtete Typauswahl: neuere Typen häufiger, ältere zur Wiederholung
  function chooseType(types, lvl) {
    const avail = types.filter(t => t.min <= lvl && (t.max == null || t.max >= lvl));
    const ws = avail.map(t => 1 + Math.max(0, 3 - (lvl - t.min)) * 1.5);
    let r = Math.random() * ws.reduce((a, b) => a + b, 0);
    for (let i = 0; i < avail.length; i++) { r -= ws[i]; if (r <= 0) return avail[i]; }
    return avail[avail.length - 1];
  }

  // ======================= MATHE =======================
  const MATHE_EI = [
    { min: 1, max: 4, f: (l) => { const n = irnd(1, l < 2 ? 5 : 8), e = pick(COUNT_EMO); return choice({ prompt: `Wie viele ${emoName(e)} siehst du?`, visual: { type: 'emoji', text: rep(e, n) }, options: optsNum(n, 2, 3, 1), answer: n, explain: `Es sind ${n}.` }); } },
    { min: 2, max: 7, f: () => { const a = irnd(1, 7), b = irnd(1, 7); if (a === b) return null; const e1 = pick(COUNT_EMO); return choice({ prompt: 'Wo sind mehr?', visual: null, options: [rep(e1, a), rep(e1, b)], answer: rep(e1, Math.max(a, b)), big: true, explain: `${Math.max(a, b)} sind mehr als ${Math.min(a, b)}.` }); } },
    { min: 3, f: (l) => { const n = irnd(1, l < 5 ? 6 : 10); const o = optsNum(n, 3, 3, 1); return choice({ prompt: `Tippe auf die Zahl ${n}!`, options: o, answer: n, big: true, explain: `So sieht die ${n} aus.` }); } },
    { min: 4, f: () => { const e = pick(COUNT_EMO), a = irnd(1, 4), b = irnd(1, 3); return choice({ prompt: `${a} und noch ${b} dazu. Wie viele sind es?`, visual: { type: 'emoji', text: rep(e, a) + '  ➕  ' + rep(e, b) }, options: optsNum(a + b, 2, 3, 1), answer: a + b, explain: `${a} und ${b} sind ${a + b}.` }); } },
    { min: 5, f: () => { const e = pick(COUNT_EMO), a = irnd(3, 6), b = irnd(1, a - 1); return choice({ prompt: `${a} sind da. ${b} werden weggezaubert. Wie viele bleiben?`, visual: { type: 'emoji', text: rep(e, a) }, options: optsNum(a - b, 2, 3, 0), answer: a - b, explain: `${a} weniger ${b} sind ${a - b}.` }); } },
    { min: 6, f: () => { const s = irnd(1, 6); const seq = [s, s + 1, s + 2]; return choice({ prompt: 'Welche Zahl kommt als Nächstes?', visual: { type: 'text', text: seq.join('   ') + '   ?' }, options: optsNum(s + 3, 2, 3, 1), answer: s + 3, explain: `Nach ${s + 2} kommt ${s + 3}.` }); } },
    { min: 7, f: () => { const a = irnd(1, 5), b = irnd(1, 5); return choice({ prompt: `Wie viel ist ${a} plus ${b}?`, visual: { type: 'text', text: `${a} + ${b} = ?` }, options: optsNum(a + b, 2, 3, 1), answer: a + b, explain: `${a} plus ${b} ist ${a + b}.` }); } },
    { min: 8, f: () => { const a = irnd(4, 10), b = irnd(1, 4); return choice({ prompt: `Wie viel ist ${a} minus ${b}?`, visual: { type: 'text', text: `${a} − ${b} = ?` }, options: optsNum(a - b, 2, 3, 0), answer: a - b, explain: `${a} minus ${b} ist ${a - b}.` }); } },
    { min: 9, f: () => { const n = irnd(2, 5); return choice({ prompt: `Kivalu hat 2 Hände. Wie viele Krallen sind das, wenn jede Hand ${n} hat?`, visual: { type: 'emoji', text: rep('🖐️', 2) }, options: optsNum(2 * n, 2, 3, 1), answer: 2 * n, explain: `${n} und ${n} sind ${2 * n}.` }); } },
  ];
  function emoName(e) { return { '💎': 'Edelsteine', '🔥': 'Flammen', '🪙': 'Münzen', '🥚': 'Eier', '🍎': 'Äpfel', '⭐': 'Sterne', '🐟': 'Fische', '🍄': 'Pilze', '🦴': 'Knochen', '🔑': 'Schlüssel' }[e] || 'Dinge'; }

  const MATHE_JUNG = [
    { min: 1, max: 4, f: () => { const a = irnd(6, 15), b = irnd(3, 20 - a > 3 ? 20 - a : 4); const s = Math.random() < 0.5; return s ? keypad({ prompt: `Rechne: ${a} + ${b}`, visual: { type: 'text', text: `${a} + ${b} = ?` }, answer: a + b }) : keypad({ prompt: `Rechne: ${a + b} − ${b}`, visual: { type: 'text', text: `${a + b} − ${b} = ?` }, answer: a }); } },
    { min: 1, max: 6, f: () => { const a = irnd(2, 8) * 10 + irnd(0, 4), b = irnd(1, 2) * 10 + irnd(0, 5); return Math.random() < 0.5 ? keypad({ prompt: `Rechne: ${a} + ${b}`, visual: { type: 'text', text: `${a} + ${b} = ?` }, answer: a + b, explain: `Erst die Zehner, dann die Einer: ${a + b}.` }) : keypad({ prompt: `Rechne: ${a + b} − ${b}`, visual: { type: 'text', text: `${a + b} − ${b} = ?` }, answer: a }); } },
    { min: 2, f: () => { const a = irnd(15, 68), b = irnd(7, 29); const add = Math.random() < 0.5 || a - b < 0; if (add && a + b > 100) return null; return add ? keypad({ prompt: `Rechne: ${a} + ${b}`, visual: { type: 'text', text: `${a} + ${b} = ?` }, answer: a + b, explain: `${a} + ${b} = ${a + b}. Tipp: erst bis zum nächsten Zehner rechnen.` }) : keypad({ prompt: `Rechne: ${a} − ${b}`, visual: { type: 'text', text: `${a} − ${b} = ?` }, answer: a - b, explain: `${a} − ${b} = ${a - b}.` }); } },
    // Einmaleins im Zahlenraum 30
    { min: 2, f: (l) => { const rows = l < 4 ? [2, 5, 10] : [2, 3, 4, 5, 10]; const r = pick(rows), m = irnd(2, Math.floor(30 / r)); return keypad({ prompt: `Wie viel ist ${m} mal ${r}?`, visual: { type: 'text', text: `${m} · ${r} = ?` }, answer: m * r, explain: `${m} mal ${r} ist ${m * r}.` }); } },
    { min: 3, f: () => { const e = pick(['💎', '🥚', '🪙', '🔑']), g = irnd(2, 5), n = irnd(2, 6); return keypad({ prompt: `In jeder Truhe liegen ${n} ${emoName(e)}. Es sind ${g} Truhen. Wie viele ${emoName(e)} sind es zusammen?`, visual: { type: 'emoji', text: Array(g).fill(rep(e, n)).join('   ') }, answer: g * n, explain: `${g} mal ${n} ist ${g * n}.` }); } },
    { min: 4, f: () => { const r = irnd(2, 6), m = irnd(2, Math.floor(30 / r)); return keypad({ prompt: `Teile gerecht: ${r * m} Edelsteine für ${r} Drachen. Wie viele bekommt jeder?`, visual: { type: 'text', text: `${r * m} : ${r} = ?` }, answer: m, explain: `${r * m} geteilt durch ${r} ist ${m}, denn ${m} mal ${r} ist ${r * m}.` }); } },
    // großes Einmaleins bis 100
    { min: 5, f: () => { const r = irnd(3, 9), m = irnd(3, 10); return keypad({ prompt: `Wie viel ist ${m} mal ${r}?`, visual: { type: 'text', text: `${m} · ${r} = ?` }, answer: m * r, explain: `${m} mal ${r} ist ${m * r}.` }); } },
    { min: 5, f: () => { const r = irnd(2, 9), m = irnd(2, 10); const t = pick(['mul', 'add']); return t === 'mul' ? keypad({ prompt: `Welche Zahl fehlt? ${r} mal wie viel ist ${r * m}?`, visual: { type: 'text', text: `${r} · ☐ = ${r * m}` }, answer: m, explain: `${r} mal ${m} ist ${r * m}.` }) : (() => { const a = irnd(12, 55), b = irnd(8, 40); return keypad({ prompt: `Welche Zahl fehlt? ${a} plus wie viel ist ${a + b}?`, visual: { type: 'text', text: `${a} + ☐ = ${a + b}` }, answer: b, explain: `${a + b} − ${a} = ${b}.` }); })(); } },
    { min: 6, f: () => { const r = irnd(3, 9), m = irnd(2, 10); return keypad({ prompt: `Rechne: ${r * m} geteilt durch ${r}`, visual: { type: 'text', text: `${r * m} : ${r} = ?` }, answer: m, explain: `${r * m} : ${r} = ${m}.` }); } },
    { min: 6, f: () => { const n = irnd(6, 49); return Math.random() < 0.5 ? keypad({ prompt: `Verdopple ${n}!`, visual: { type: 'text', text: `das Doppelte von ${n} = ?` }, answer: 2 * n }) : keypad({ prompt: `Halbiere ${2 * n}!`, visual: { type: 'text', text: `die Hälfte von ${2 * n} = ?` }, answer: n }); } },
    // Sachaufgaben
    { min: 7, f: () => { const p = irnd(3, 9), n = irnd(3, 8), have = p * n + irnd(1, 20); return keypad({ prompt: `Ein Drachenhut kostet ${p} Glutsteine. Kivalu kauft ${n} Hüte für seine Freunde. Er hat ${have} Glutsteine. Wie viele bleiben übrig?`, visual: { type: 'text', text: `${have} − ${n} · ${p} = ?` }, answer: have - p * n, explain: `${n} mal ${p} ist ${n * p}. ${have} − ${n * p} = ${have - n * p}.` }); } },
    { min: 7, f: () => { const a = irnd(3, 9), b = irnd(3, 9), c = irnd(2, 15); return keypad({ prompt: `Rechne: ${a} mal ${b} plus ${c}`, visual: { type: 'text', text: `${a} · ${b} + ${c} = ?` }, answer: a * b + c, explain: `Punkt vor Strich: ${a * b} + ${c} = ${a * b + c}.` }); } },
    { min: 8, f: () => { const h = irnd(1, 11), m = pick([0, 15, 30, 45]), d = pick([15, 30, 45, 60, 90]); const t = h * 60 + m + d; const fmt = (x) => `${Math.floor(x / 60) % 12 || 12}:${String(x % 60).padStart(2, '0')}`; return choice({ prompt: `Die Lore fährt um ${fmt(h * 60 + m)} Uhr los und braucht ${d} Minuten. Wann kommt sie an?`, visual: { type: 'text', text: `⏰ ${fmt(h * 60 + m)} + ${d} min` }, options: shuffle(uniq([fmt(t), fmt(t + 15), fmt(t - 15), fmt(t + 60)])).slice(0, 3).concat([]).filter((v, i, a) => a.indexOf(v) === i), answer: fmt(t), explain: `${fmt(h * 60 + m)} plus ${d} Minuten ist ${fmt(t)}.` }); } },
    { min: 8, f: () => { const items = [['Fackel', irnd(2, 9)], ['Seil', irnd(3, 12)], ['Laterne', irnd(5, 19)]]; const a = pick(items), b = pick(items.filter(x => x !== a)); const pay = 50; return keypad({ prompt: `Im Zwergenladen kostet eine ${a[0]} ${a[1]} Euro und ein${b[0] === 'Laterne' ? 'e' : ''} ${b[0]} ${b[1]} Euro. Kivalu zahlt mit ${pay} Euro. Wie viel Rückgeld bekommt er?`, visual: { type: 'text', text: `${pay} € − ${a[1]} € − ${b[1]} € = ?` }, answer: pay - a[1] - b[1], explain: `${a[1]} + ${b[1]} = ${a[1] + b[1]}. ${pay} − ${a[1] + b[1]} = ${pay - a[1] - b[1]}.` }); } },
    { min: 9, f: () => { const s = irnd(2, 9), d = irnd(3, 9); const seq = [0, 1, 2, 3].map(i => s + i * d); return keypad({ prompt: 'Setze die Zahlenreihe fort!', visual: { type: 'text', text: seq.join(' , ') + ' , ?' }, answer: s + 4 * d, explain: `Immer plus ${d}.` }); } },
    { min: 10, f: () => { const a = irnd(11, 19), b = irnd(3, 6); return keypad({ prompt: `Rechne: ${a} mal ${b}`, visual: { type: 'text', text: `${a} · ${b} = ?` }, answer: a * b, explain: `10 mal ${b} ist ${10 * b}, ${a - 10} mal ${b} ist ${(a - 10) * b}, zusammen ${a * b}.` }); } },
  ];

  // ======================= SCHREIBEN =======================
  const LETTERS = 'ABDEFGHIKLMNOPRSTUWZ'.split('');
  const SCHREIBEN_EI = [
    { min: 1, f: () => { const w = pick(WORDS.filter(x => /^[A-Z]/.test(x[0]) && !/^(Sch|Ch|Qu)/.test(x[0]))); const l = w[0][0].toUpperCase(); return choice({ prompt: `Womit fängt ${w[0]} an?`, speak: `Womit fängt ${w[0]} an? ${w[0]}.`, visual: { type: 'emoji', text: w[1] }, options: shuffle(uniq([l, ...shuffle(LETTERS.filter(x => x !== l)).slice(0, 2)])), answer: l, big: true, explain: `${w[0]} fängt mit ${l} an.` }); } },
    { min: 3, f: () => { const l = pick('AEIOMLSRT'.split('')); return choice({ prompt: `Wo ist das ${l}?`, options: shuffle([l, ...shuffle(LETTERS.filter(x => x !== l)).slice(0, 3)]), answer: l, big: true, explain: `Das ist das ${l}.` }); } },
    { min: 5, f: () => { const l = pick('AEIOU'.split('')); const ws = WORDS.filter(w => w[0][0] === l); if (!ws.length) return null; const w = pick(ws); const others = shuffle(WORDS.filter(x => x[0][0] !== l)).slice(0, 2); return choice({ prompt: `Was fängt mit ${l} an?`, options: shuffle([w[1], ...others.map(o => o[1])]), answer: w[1], big: true, explain: `${w[0]} fängt mit ${l} an.` }); } },
    { min: 6, f: (lv) => { const w = pick(SIMPLE.filter(s => s.length <= (lv < 8 ? 3 : 4))); const ww = WORDS.find(x => x[0].toUpperCase() === w); return tiles({ prompt: `Lege das Wort ${ww ? ww[0] : w}!`, speak: `Lege das Wort: ${ww ? ww[0] : w}.`, visual: ww ? { type: 'emoji', text: ww[1] } : null, letters: shuffle(w.split('')), answer: w, showTarget: lv < 8, explain: `So schreibt man es: ${w}.` }); } },
  ];
  const SCHREIBEN_JUNG = [
    { min: 1, f: () => { const w = pick(DICTATE.easy); return tiles({ prompt: 'Hör gut zu und lege das Wort!', speak: `Schreibe: ${w}.`, dictate: w, letters: shuffle(w.toUpperCase().split('')), answer: w.toUpperCase(), explain: `So schreibt man es: ${w}.` }); } },
    { min: 2, f: (l) => { const w = pick(l < 5 ? DICTATE.mid : DICTATE.hard); const extra = shuffle('AEINRSTLMH'.split('')).slice(0, l < 5 ? 2 : 3); return tiles({ prompt: 'Hör gut zu und lege das Wort! Vorsicht, es sind falsche Buchstaben dabei.', speak: `Schreibe: ${w}.`, dictate: w, letters: shuffle([...w.toUpperCase().split(''), ...extra]), answer: w.toUpperCase(), extra: true, explain: `So schreibt man es: ${w}.` }); } },
    { min: 3, f: () => { const s = pick(SPELL); return choice({ prompt: 'Welches Wort ist richtig geschrieben?', options: shuffle(s.slice(0, 3)), answer: s[0], explain: `Richtig ist: ${s[0]}.` }); } },
    { min: 4, f: () => { const n = shuffle(WORDS).slice(0, 1)[0][0]; const others = shuffle(['laufen', 'groß', 'schnell', 'singen', 'rot', 'leise', 'fliegen', 'klein', 'springen', 'warm']).slice(0, 2); return choice({ prompt: 'Welches Wort ist ein Namenwort? Namenwörter schreibt man groß.', options: shuffle([n.toLowerCase(), ...others]).map(x => x.toLowerCase()), answer: n.toLowerCase(), explain: `${n} ist ein Namenwort, man schreibt es groß: ${n}.` }); } },
    { min: 5, f: () => { const w = pick(WORDS.filter(x => x[3] !== x[0])); const wrong = shuffle([w[0] + 's', w[0] + 'en', w[0] + 'e', w[0].replace(/a/, 'ä') + 'er'].filter(x => x !== w[3])).slice(0, 2); return choice({ prompt: `Ein${w[2] === 'die' ? 'e' : ''} ${w[0]}, viele …?`, visual: { type: 'emoji', text: w[1] + ' → ' + rep(w[1], 3) }, options: shuffle([w[3], ...wrong]), answer: w[3], explain: `Mehrzahl: die ${w[3]}.` }); } },
    { min: 6, f: () => { const s = pick(SENT); const words = s.replace('.', '').split(' '); return order({ prompt: 'Bring die Wörter in die richtige Reihenfolge!', items: shuffle(words.map((w, i) => ({ id: i, t: w }))), answer: words.join(' '), explain: `Richtig: ${s}` }); } },
    { min: 7, f: () => { const w = pick(WORDS.filter(x => x[0].length >= 4)); const art = w[2]; return choice({ prompt: `Welcher Begleiter passt? ___ ${w[0]}`, visual: { type: 'emoji', text: w[1] }, options: ['der', 'die', 'das'], answer: art, explain: `${art} ${w[0]}.` }); } },
    { min: 8, f: () => { const w = pick(WORDS.filter(x => x[4].includes('-'))); const n = w[4].split('-').length; return choice({ prompt: `Wie viele Silben hat ${w[0]}? Klatsch mit!`, speak: `Wie viele Silben hat ${w[0]}?`, visual: { type: 'text', text: w[0] }, options: [1, 2, 3, 4], answer: n, explain: `${w[4]}: ${n} Silben.` }); } },
    { min: 9, f: () => { const sets = [['Wie ist das Wetter?', 'wie ist das Wetter?', 'Wie ist das wetter?'], ['Der Drache fliegt hoch.', 'der Drache fliegt hoch.', 'Der drache fliegt hoch.'], ['Kivalu sucht die Herzglut.', 'Kivalu sucht die herzglut.', 'kivalu sucht die Herzglut.'], ['Im Winter schneit es.', 'Im winter schneit es.', 'im Winter schneit es.']]; const s = pick(sets); return choice({ prompt: 'Welcher Satz ist richtig geschrieben?', options: shuffle(s), answer: s[0], small: true, explain: `Richtig: ${s[0]} Am Satzanfang und bei Namenwörtern groß.` }); } },
    { min: 10, f: () => { const t = pick([['fliegen', 'Tunwort'], ['springen', 'Tunwort'], ['brüllen', 'Tunwort'], ['Höhle', 'Namenwort'], ['Ritter', 'Namenwort'], ['heiß', 'Wiewort'], ['mutig', 'Wiewort'], ['glitzernd', 'Wiewort']]); return choice({ prompt: `Was für ein Wort ist „${t[0]}“?`, options: ['Namenwort', 'Tunwort', 'Wiewort'], answer: t[1], explain: `${t[0]} ist ein ${t[1]}.` }); } },
  ];

  // ======================= LESEN =======================
  const PIC_SENT = [ // Satz → Bild
    ['Der Hund schläft.', '🐶💤'], ['Die Katze trinkt Milch.', '🐱🥛'], ['Ein Fisch schwimmt im Wasser.', '🐟🌊'], ['Der Drache spuckt Feuer.', '🐉🔥'], ['Es regnet.', '🌧️'], ['Die Sonne scheint.', '☀️'],
    ['Zwei Äpfel liegen hier.', '🍎🍎'], ['Drei Sterne leuchten.', '⭐⭐⭐'], ['Der Vogel sitzt auf dem Baum.', '🐦🌳'], ['Das Auto ist rot.', '🚗'], ['Ein Schiff fährt auf dem Meer.', '🚢🌊'], ['Es schneit auf den Berg.', '❄️⛰️'],
  ];
  const TRUTH = [
    ['Drachen haben Flügel.', true], ['Fische können klettern.', false], ['Eis ist kalt.', true], ['Die Sonne scheint in der Nacht.', false], ['Schnee ist weiß.', true], ['Ein Hund kann bellen.', true],
    ['Steine sind weich.', false], ['Feuer ist heiß.', true], ['Ein Schiff fährt auf der Straße.', false], ['Im Winter ist es oft kalt.', true], ['Eine Woche hat zehn Tage.', false], ['Bienen machen Honig.', true],
    ['Kühe können fliegen.', false], ['Ein Jahr hat zwölf Monate.', true], ['Der Mond ist aus Käse.', false], ['Zwerge wohnen gern in Höhlen.', true],
  ];
  const STORIES = [
    { t: 'Kivalu wacht früh auf. Er ist hungrig. Er isst drei Äpfel und eine Birne. Dann fliegt er zum See.', q: [['Wie viele Äpfel isst Kivalu?', ['drei', 'zwei', 'vier'], 'drei'], ['Wohin fliegt Kivalu?', ['zum See', 'zum Berg', 'nach Hause'], 'zum See'], ['Was isst Kivalu noch?', ['eine Birne', 'eine Banane', 'einen Kuchen'], 'eine Birne']] },
    { t: 'Im Nebelwald wohnt eine alte Eule. Sie heißt Wimpra. Wimpra kann im Dunkeln gut sehen. Am Tag schläft sie in einem hohlen Baum.', q: [['Wie heißt die Eule?', ['Wimpra', 'Grauzahn', 'Silberschwinge'], 'Wimpra'], ['Wo schläft Wimpra?', ['in einem hohlen Baum', 'in einer Höhle', 'auf dem Dach'], 'in einem hohlen Baum'], ['Wann schläft die Eule?', ['am Tag', 'in der Nacht', 'nie'], 'am Tag']] },
    { t: 'Die Zwerge graben jeden Tag nach Kristallen. Der kleinste Zwerg heißt Bruno. Er findet einen blauen Kristall. Er schenkt ihn Kivalu.', q: [['Wer findet den Kristall?', ['Bruno', 'Kivalu', 'der König'], 'Bruno'], ['Welche Farbe hat der Kristall?', ['blau', 'rot', 'grün'], 'blau'], ['Was macht Bruno mit dem Kristall?', ['Er schenkt ihn Kivalu.', 'Er versteckt ihn.', 'Er verkauft ihn.'], 'Er schenkt ihn Kivalu.']] },
    { t: 'Baron Ketterich hat eine fliegende Festung. Sie ist aus Eisen und hat sieben Schornsteine. In der Festung arbeiten viele Blechritter. Sie bewachen die Herzglut.', q: [['Woraus ist die Festung?', ['aus Eisen', 'aus Holz', 'aus Eis'], 'aus Eisen'], ['Wie viele Schornsteine hat sie?', ['sieben', 'drei', 'zehn'], 'sieben'], ['Was bewachen die Blechritter?', ['die Herzglut', 'den Wald', 'die Zwerge'], 'die Herzglut']] },
    { t: 'Silberschwinge ist ein Eisdrache. Er kommt aus dem hohen Norden. Er spricht nur Englisch. Wenn er niest, schneit es.', q: [['Woher kommt Silberschwinge?', ['aus dem Norden', 'aus dem Süden', 'aus dem Meer'], 'aus dem Norden'], ['Was passiert, wenn er niest?', ['Es schneit.', 'Es donnert.', 'Es brennt.'], 'Es schneit.'], ['Welche Sprache spricht er?', ['Englisch', 'Deutsch', 'Zwergisch'], 'Englisch']] },
    { t: 'Auf der Sturmküste liegt ein altes Schiff. Es ist halb im Sand versunken. Im Bauch des Schiffs steht eine Kiste. Darin liegt eine Karte mit einem roten Kreuz.', q: [['Wo liegt das Schiff?', ['auf der Sturmküste', 'im Wald', 'in der Stadt'], 'auf der Sturmküste'], ['Was liegt in der Kiste?', ['eine Karte', 'ein Schwert', 'ein Ei'], 'eine Karte'], ['Welche Farbe hat das Kreuz?', ['rot', 'blau', 'schwarz'], 'rot']] },
    { t: 'Ketterichs Tagebuch: „Als ich klein war, hat ein wilder Drache unser Dorf verbrannt. Seitdem habe ich Angst vor Drachen. Mit der Herzglut baue ich eine Maschine, die alle Drachen zähmt.“', q: [['Was ist mit Ketterichs Dorf passiert?', ['Ein Drache hat es verbrannt.', 'Es wurde überflutet.', 'Es ist weggeflogen.'], 'Ein Drache hat es verbrannt.'], ['Wovor hat Ketterich Angst?', ['vor Drachen', 'vor Mäusen', 'vor Wasser'], 'vor Drachen'], ['Was will er mit der Herzglut bauen?', ['eine Maschine', 'ein Schiff', 'ein Haus'], 'eine Maschine']] },
    { t: 'Grauzahn ist die älteste Drachin im Glutfels. Sie ist schon dreihundert Jahre alt. Ihre Schuppen sind grau wie Stein. Sie kennt alle alten Drachenkünste.', q: [['Wie alt ist Grauzahn?', ['dreihundert Jahre', 'dreißig Jahre', 'drei Jahre'], 'dreihundert Jahre'], ['Welche Farbe haben ihre Schuppen?', ['grau', 'blau', 'golden'], 'grau'], ['Was kennt Grauzahn?', ['alle alten Drachenkünste', 'alle Zwerge', 'alle Lieder'], 'alle alten Drachenkünste']] },
  ];
  const RHYME = [['Maus', 'Haus'], ['Hund', 'Mund'], ['Fisch', 'Tisch'], ['Ball', 'Stall'], ['Hase', 'Nase'], ['Katze', 'Tatze'], ['Sonne', 'Tonne'], ['Kuchen', 'suchen'], ['Stern', 'gern'], ['Baum', 'Traum']];
  const LESEN_EI = [
    { min: 1, f: () => { const ws = shuffle(WORDS).slice(0, 3); const w = ws[0]; return choice({ prompt: `Wo ist ${w[2] === 'der' ? 'der' : w[2] === 'die' ? 'die' : 'das'} ${w[0]}?`, options: shuffle(ws.map(x => x[1])), answer: w[1], big: true, explain: `Hier ist ${w[2]} ${w[0]}.` }); } },
    { min: 3, f: () => { const r = pick(RHYME); const em = { Maus: '🐭', Haus: '🏠', Hund: '🐶', Mund: '👄', Fisch: '🐟', Tisch: '🪑', Ball: '⚽', Stall: '🐴', Hase: '🐰', Nase: '👃', Katze: '🐱', Tatze: '🐾', Sonne: '☀️', Tonne: '🛢️', Kuchen: '🍰', Stern: '⭐', Baum: '🌳', Traum: '💭' }; if (!em[r[1]] || !em[r[0]]) return null; const wrong = shuffle(RHYME.filter(x => x !== r)).slice(0, 2).map(x => x[1]).filter(x => em[x]); if (wrong.length < 2) return null; return choice({ prompt: `Was reimt sich auf ${r[0]}?`, visual: { type: 'emoji', text: em[r[0]] }, options: shuffle([em[r[1]], ...wrong.map(x => em[x])]), answer: em[r[1]], big: true, explain: `${r[0]} und ${r[1]} reimen sich.` }); } },
    { min: 6, f: () => { const ws = shuffle(WORDS.filter(x => SIMPLE.includes(x[0].toUpperCase()))).slice(0, 3); if (ws.length < 3) return null; const w = ws[0]; return choice({ prompt: 'Lies das Wort. Welches Bild passt?', noSpeakVisual: true, visual: { type: 'text', text: w[0].toUpperCase() }, options: shuffle(ws.map(x => x[1])), answer: w[1], big: true, explain: `Da steht ${w[0]}.` }); } },
  ];
  const LESEN_JUNG = [
    { min: 1, f: () => { const ws = shuffle(WORDS).slice(0, 4); return choice({ prompt: 'Lies das Wort. Welches Bild passt?', noSpeakVisual: true, visual: { type: 'text', text: ws[0][0] }, options: shuffle(ws.map(x => x[1])), answer: ws[0][1], big: true, explain: `Da steht ${ws[0][0]}.` }); } },
    { min: 2, f: () => { const s = shuffle(PIC_SENT).slice(0, 3); return choice({ prompt: 'Lies den Satz. Welches Bild passt?', noSpeakVisual: true, visual: { type: 'text', text: s[0][0] }, options: shuffle(s.map(x => x[1])), answer: s[0][1], big: true, explain: `Da steht: ${s[0][0]}` }); } },
    { min: 3, f: () => { const t = pick(TRUTH); return choice({ prompt: 'Lies den Satz. Stimmt das?', noSpeakVisual: true, visual: { type: 'text', text: t[0] }, options: ['stimmt', 'stimmt nicht'], answer: t[1] ? 'stimmt' : 'stimmt nicht', explain: t[1] ? 'Das stimmt.' : 'Das stimmt nicht.' }); } },
    { min: 4, f: (l) => { const st = pick(STORIES.slice(0, l < 7 ? 6 : 8)); const q = pick(st.q); return choice({ prompt: 'Lies die Geschichte und beantworte die Frage.', noSpeakVisual: true, visual: { type: 'story', text: st.t, question: q[0] }, options: shuffle(q[1]), answer: q[2], small: true, explain: `Richtig ist: ${q[2]}` }); } },
    { min: 5, f: () => { const tr = shuffle(TRUTH.filter(x => x[1])).slice(0, 2).map(x => x[0]); const fl = pick(TRUTH.filter(x => !x[1]))[0]; return choice({ prompt: 'Ein Satz ist Unsinn. Welcher?', noSpeakVisual: true, options: shuffle([fl, ...tr]), answer: fl, small: true, explain: `Unsinn ist: ${fl}` }); } },
    { min: 6, f: () => { const ws = shuffle(WORDS).slice(0, 4); const n = irnd(1, 4); const ord = ['erste', 'zweite', 'dritte', 'vierte'][n - 1]; return choice({ prompt: `Lies genau: Tippe auf das ${ord} Bild von links!`, noSpeak: true, visual: { type: 'text', text: `Tippe auf das ${ord} Bild von links.` }, options: ws.map(x => x[1]), answer: ws[n - 1][1], big: true, keepOrder: true, explain: `Das ${ord} Bild ist ${ws[n - 1][0]}.` }); } },
    { min: 8, f: () => { const st = pick(STORIES.slice(3)); const q = pick(st.q); return choice({ prompt: 'Lies die Geschichte und beantworte die Frage.', noSpeakVisual: true, visual: { type: 'story', text: st.t, question: q[0] }, options: shuffle(q[1]), answer: q[2], small: true, explain: `Richtig ist: ${q[2]}` }); } },
  ];

  // ======================= ENGLISCH =======================
  const ENG_EI = [
    { min: 1, f: (l) => { const pool = EN.filter(x => x[3] === (l < 4 ? 'col' : pick(['col', 'ani']))); const s = shuffle(pool).slice(0, 3); return choice({ prompt: 'Hör gut zu! Welches Bild ist das?', speakEn: s[0][0], options: shuffle(s.map(x => x[1])), answer: s[0][1], big: true, explain: `${s[0][0]} heißt ${s[0][2]}.` }); } },
    { min: 3, f: () => { const n = irnd(1, 5), e = pick(COUNT_EMO); const o = optsNum(n, 2, 3, 1); return choice({ prompt: 'Hör gut zu! Welche Zahl ist das?', speakEn: EN_NUM[n], options: o.map(x => rep(e, x)), answer: rep(e, n), big: true, explain: `${EN_NUM[n]} heißt ${n}.` }); } },
    { min: 5, f: () => { const s = shuffle(EN.filter(x => ['ani', 'food', 'nat'].includes(x[3]))).slice(0, 3); return choice({ prompt: 'Hör gut zu! Welches Bild ist das?', speakEn: s[0][0], options: shuffle(s.map(x => x[1])), answer: s[0][1], big: true, explain: `${s[0][0]} heißt ${s[0][2]}.` }); } },
  ];
  const ENG_JUNG = [
    { min: 1, f: () => { const s = shuffle(EN).slice(0, 4); return choice({ prompt: 'Silberschwinge sagt ein Wort. Welches Bild ist es?', speakEn: s[0][0], options: shuffle(s.map(x => x[1])), answer: s[0][1], big: true, explain: `${s[0][0]} heißt ${s[0][2]}.` }); } },
    { min: 2, f: () => { const s = shuffle(EN).slice(0, 4); return choice({ prompt: 'Lies das englische Wort. Welches Bild passt?', visual: { type: 'text', text: s[0][0] }, noSpeakVisual: true, options: shuffle(s.map(x => x[1])), answer: s[0][1], big: true, explain: `${s[0][0]} heißt ${s[0][2]}.` }); } },
    { min: 3, f: () => { const s = shuffle(EN).slice(0, 3); return choice({ prompt: 'Wie heißt das auf Englisch?', visual: { type: 'emoji', text: s[0][1] }, options: shuffle(s.map(x => x[0])), answer: s[0][0], explain: `${s[0][2]} heißt ${s[0][0]}.` }); } },
    { min: 4, f: () => { const n = irnd(2, 6), a = pick(EN.filter(x => x[3] === 'ani' || x[3] === 'food')); const pl = a[0] === 'mouse' ? 'mice' : a[0] === 'fish' ? 'fish' : a[0] + 's'; const o = optsNum(n, 2, 3, 1); return choice({ prompt: 'Hör zu! Welches Bild passt zum Satz?', speakEn: `I see ${EN_NUM[n]} ${pl}.`, options: o.map(x => rep(a[1], x)), answer: rep(a[1], n), explain: `I see ${EN_NUM[n]} ${pl}: ${n}.` }); } },
    { min: 5, f: () => { const n = irnd(6, 20); return choice({ prompt: 'Welche Zahl ist das?', visual: { type: 'text', text: EN_NUM[n] }, options: optsNum(n, 3, 3, 1), answer: n, big: true, explain: `${EN_NUM[n]} = ${n}.` }); } },
    { min: 6, f: () => { const q = pick([['What colour is the sun?', 'yellow', ['yellow', 'blue', 'green']], ['What colour is grass?', 'green', ['green', 'red', 'black']], ['What colour is snow?', 'white', ['white', 'black', 'purple']], ['What colour is the sky?', 'blue', ['blue', 'brown', 'orange']], ['What colour is fire?', 'orange', ['orange', 'blue', 'green']], ['What colour is Kivalu?', 'blue', ['blue', 'red', 'yellow']]]); return choice({ prompt: 'Lies und beantworte die Frage.', visual: { type: 'text', text: q[0] }, speakEnQ: q[0], options: shuffle(q[2]), answer: q[1], explain: `${q[0]} – ${q[1]}.` }); } },
    { min: 7, f: () => { const s = shuffle(EN).slice(0, 3); return choice({ prompt: `Was heißt „${s[0][2]}“ auf Englisch?`, options: shuffle(s.map(x => x[0])), answer: s[0][0], explain: `${s[0][2]} heißt ${s[0][0]}.` }); } },
    { min: 8, f: () => { const w = pick(EN.filter(x => x[0].length >= 3 && x[0].length <= 6)); return tiles({ prompt: 'Hör zu und lege das englische Wort!', speakEn: w[0], visual: { type: 'emoji', text: w[1] }, letters: shuffle(w[0].toUpperCase().split('')), answer: w[0].toUpperCase(), explain: `So schreibt man es: ${w[0]}.` }); } },
    { min: 9, f: () => { const q = pick([['The dragon can fly.', 'Der Drache kann fliegen.', ['Der Drache kann schwimmen.', 'Der Hund kann fliegen.']], ['I like apples.', 'Ich mag Äpfel.', ['Ich habe Äpfel.', 'Ich mag Bananen.']], ['The cat is black.', 'Die Katze ist schwarz.', ['Der Hund ist schwarz.', 'Die Katze ist weiß.']], ['It is cold.', 'Es ist kalt.', ['Es ist heiß.', 'Es ist alt.']], ['My name is Kivalu.', 'Ich heiße Kivalu.', ['Ich bin müde.', 'Wo ist Kivalu?']], ['Where is the key?', 'Wo ist der Schlüssel?', ['Hier ist der Schlüssel.', 'Wo ist die Krone?']]]); return choice({ prompt: 'Was bedeutet der Satz?', visual: { type: 'text', text: q[0] }, speakEnQ: q[0], options: shuffle([q[1], ...q[2]]), answer: q[1], small: true, explain: `${q[0]} = ${q[1]}` }); } },
  ];

  // ======================= LOGIK =======================
  const SYM = ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠'];
  const SHAPES = ['🔺', '⬛', '⚪', '⭐', '💠', '❤️'];
  const ODD = [['🍎', '🍌', '🍐', '🚗'], ['🐶', '🐱', '🐭', '🌳'], ['🚗', '🚂', '🚢', '🍰'], ['☀️', '🌙', '⭐', '🐟'], ['🔴', '🔵', '🟢', '🐸'], ['🐟', '🐳', '🐬', '🐦'], ['🎩', '👑', '🧢', '🥕'], ['🌸', '🌻', '🌷', '🔑']];
  const LOGIK_EI = [
    { min: 1, f: () => { const a = shuffle(SYM).slice(0, 2); const seq = [a[0], a[1], a[0], a[1], a[0]]; return choice({ prompt: 'Was kommt als Nächstes?', visual: { type: 'emoji', text: seq.join(' ') + ' ❓' }, options: shuffle([a[1], a[0], pick(SYM.filter(x => !a.includes(x)))]), answer: a[1], big: true, explain: 'Immer abwechselnd.' }); } },
    { min: 2, f: () => { const o = pick(ODD); return choice({ prompt: 'Was passt nicht dazu?', options: shuffle(o), answer: o[3], big: true, explain: 'Das passt nicht zu den anderen.' }); } },
    { min: 4, f: () => { const a = shuffle(SYM).slice(0, 3); const seq = [a[0], a[1], a[2], a[0], a[1]]; return choice({ prompt: 'Was kommt als Nächstes?', visual: { type: 'emoji', text: seq.join(' ') + ' ❓' }, options: shuffle(a), answer: a[2], big: true, explain: 'Das Muster wiederholt sich.' }); } },
    { min: 6, f: () => { const a = shuffle(SYM).slice(0, 2); const seq = [a[0], a[0], a[1], a[0], a[0], a[1], a[0]]; return choice({ prompt: 'Was kommt als Nächstes?', visual: { type: 'emoji', text: seq.join(' ') + ' ❓' }, options: shuffle([a[0], a[1], pick(SYM.filter(x => !a.includes(x)))]), answer: a[0], big: true, explain: 'Zwei gleiche, dann ein anderes.' }); } },
  ];
  const LOGIK_JUNG = [
    { min: 1, f: () => { const s = irnd(1, 10), d = irnd(2, 6); const seq = [0, 1, 2, 3].map(i => s + i * d); return keypad({ prompt: 'Welche Zahl kommt als Nächstes?', visual: { type: 'text', text: seq.join(' , ') + ' , ?' }, answer: s + 4 * d, explain: `Immer plus ${d}.` }); } },
    { min: 2, f: () => { const a = shuffle(SHAPES).slice(0, 3); const seq = [a[0], a[1], a[1], a[2], a[0], a[1], a[1]]; return choice({ prompt: 'Was kommt als Nächstes?', visual: { type: 'emoji', text: seq.join(' ') + ' ❓' }, options: shuffle(a), answer: a[2], big: true, explain: 'Das Muster ist: eins, zwei gleiche, eins.' }); } },
    { min: 3, f: () => { const s = irnd(1, 4); const seq = [s, s * 2, s * 4, s * 8]; return keypad({ prompt: 'Welche Zahl kommt als Nächstes?', visual: { type: 'text', text: seq.join(' , ') + ' , ?' }, answer: s * 16, explain: 'Immer verdoppeln.' }); } },
    { min: 4, f: () => { const p = pick([['Tom', 'Lia', 'Max'], ['Bruno', 'Wimpra', 'Kivalu'], ['Anna', 'Ben', 'Cleo']]); return choice({ prompt: `${p[0]} ist größer als ${p[1]}. ${p[1]} ist größer als ${p[2]}. Wer ist am kleinsten?`, options: shuffle(p), answer: p[2], explain: `${p[2]} ist am kleinsten.` }); } },
    { min: 5, f: () => { const a = irnd(2, 6), b = irnd(2, 6); return keypad({ prompt: `Ein 🍎 wiegt ${a} Kilo. Eine 🍐 wiegt ${b} Kilo. Wie viel wiegen zwei 🍎 und eine 🍐?`, visual: { type: 'emoji', text: '🍎🍎🍐 ⚖️ ?' }, answer: 2 * a + b, explain: `${a} + ${a} + ${b} = ${2 * a + b}.` }); } },
    { min: 6, f: () => { const an = pick([['Vogel', 'fliegen', 'Fisch', 'schwimmen', ['laufen', 'fliegen']], ['Hand', 'Handschuh', 'Fuß', 'Schuh', ['Hut', 'Socke?']], ['Tag', 'Sonne', 'Nacht', 'Mond', ['Wolke', 'Regen']], ['heiß', 'Feuer', 'kalt', 'Eis', ['Wasser', 'Sonne']], ['Drache', 'Höhle', 'Vogel', 'Nest', ['Baum', 'Ei']]]); return choice({ prompt: `${an[0]} gehört zu ${an[1]} wie ${an[2]} zu …?`, options: shuffle([an[3], ...an[4].map(x => x.replace('?', ''))]), answer: an[3], explain: `${an[2]} gehört zu ${an[3]}.` }); } },
    { min: 7, f: () => { // 4×4-Rätsel: in jeder Reihe und Spalte jedes Symbol einmal
      const s = shuffle(SHAPES).slice(0, 4); const base = [[0, 1, 2, 3], [2, 3, 0, 1], [1, 0, 3, 2], [3, 2, 1, 0]];
      const rp = shuffle([0, 1, 2, 3]); const g = rp.map(r => base[r]); const r = irnd(0, 3), c = irnd(0, 3);
      const rows = g.map((row, ri) => row.map((v, ci) => ri === r && ci === c ? '❓' : s[v]).join(' '));
      return choice({ prompt: 'In jeder Reihe und jeder Spalte kommt jedes Zeichen genau einmal vor. Was gehört zum Fragezeichen?', visual: { type: 'grid', text: rows.join('\n') }, options: shuffle(s), answer: s[g[r][c]], big: true, explain: 'Schau, welches Zeichen in der Reihe und in der Spalte noch fehlt.' });
    } },
    { min: 8, f: () => { const a = irnd(2, 9), b = irnd(2, 9); const seq = [a, b, a + b, a + 2 * b]; return keypad({ prompt: 'Jede Zahl ist die Summe der zwei Zahlen davor. Welche kommt als Nächstes?', visual: { type: 'text', text: `${a} , ${b} , ${a + b} , ${a + 2 * b} , ?` }, answer: 2 * a + 3 * b, explain: `${a + b} + ${a + 2 * b} = ${2 * a + 3 * b}.` }); } },
    { min: 9, f: () => { const n = irnd(3, 6); return keypad({ prompt: `Bei einem Turnier spielt jeder Drache einmal gegen jeden anderen. Es sind ${n} Drachen. Wie viele Spiele gibt es?`, visual: { type: 'emoji', text: rep('🐉', n) }, answer: n * (n - 1) / 2, explain: `${n} mal ${n - 1} geteilt durch 2 = ${n * (n - 1) / 2}.` }); } },
  ];

  const BANK = { mathe: { ei: MATHE_EI, jung: MATHE_JUNG }, schreiben: { ei: SCHREIBEN_EI, jung: SCHREIBEN_JUNG }, lesen: { ei: LESEN_EI, jung: LESEN_JUNG }, englisch: { ei: ENG_EI, jung: ENG_JUNG }, logik: { ei: LOGIK_EI, jung: LOGIK_JUNG } };
  const CAT_NAMES = { mathe: 'Mathe', schreiben: 'Schreiben', lesen: 'Lesen', englisch: 'Englisch', logik: 'Logik' };
  const recent = [];

  function make(cat, profile, opt = {}) {
    const stage = profile.stage === 'jung' ? 'jung' : 'ei';
    const lvl = K.clamp((profile.skill[cat] || 1) + (opt.boost || 0), 1, 10);
    for (let tries = 0; tries < 40; tries++) {
      const t = chooseType(BANK[cat][stage], lvl);
      const task = t.f(lvl);
      if (!task) continue;
      const sig = cat + '|' + task.prompt + '|' + (task.visual ? task.visual.text : '') + '|' + task.answer;
      if (recent.includes(sig) && tries < 30) continue;
      recent.push(sig); if (recent.length > 40) recent.shift();
      if (task.kind === 'choice') { task.options = task.options.map(String); task.answer = String(task.answer); if (task.options.indexOf(task.answer) < 0) continue; }
      task.cat = cat; task.level = lvl;
      return task;
    }
    return choice({ prompt: 'Wie viel ist 2 plus 2?', options: ['3', '4', '5'], answer: '4', cat });
  }
  return { make, CAT_NAMES, WORDS, EN };
})();
