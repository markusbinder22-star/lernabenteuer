// Geschichte: Kapitel, Levels, Zwischensequenzen
'use strict';
K.Story = (() => {
  const CH = [
    { n: 1, name: 'Glutfels', sub: 'Der brennende Berg', music: 'w1', amb: null, cats: ['mathe', 'logik', 'schreiben'], skill: 'fire',
      levels: [{ id: '1-1', name: 'Die Lavahöhlen' }, { id: '1-2', name: 'Der Rauchschlot' }, { id: '1-3', name: 'Das Tor im Fels' }] },
    { n: 2, name: 'Nebelwald', sub: 'Wo die Pilze größer sind als Bäume', music: 'w2', amb: 'amb_crickets', cats: ['lesen', 'mathe', 'schreiben'], skill: 'double',
      levels: [{ id: '2-1', name: 'Die Pilzwipfel' }, { id: '2-2', name: 'Das Nebelmoor' }, { id: '2-3', name: 'Der hohle Riesenbaum' }] },
    { n: 3, name: 'Frostzinnen', sub: 'Eis, Wind und ein gefangener Drache', music: 'w3', amb: 'amb_wind', cats: ['englisch', 'mathe', 'logik'], skill: 'melt',
      levels: [{ id: '3-1', name: 'Eisige Pfade' }, { id: '3-2', name: 'Der Lawinenhang' }, { id: '3-3', name: 'Das Eisgefängnis' }] },
    { n: 4, name: 'Zwergenminen', sub: 'Tief unter der Erde', music: 'w4', amb: 'amb_water', cats: ['mathe', 'logik', 'lesen'], skill: 'climb',
      levels: [{ id: '4-1', name: 'Der alte Schacht' }, { id: '4-2', name: 'Die wilde Lorenfahrt', mode: 'cart' }, { id: '4-3', name: 'Die Kristallhalle' }] },
    { n: 5, name: 'Sturmküste', sub: 'Klippen, Blitze und Wellen', music: 'w5', amb: 'amb_rain', cats: ['lesen', 'englisch', 'schreiben'], skill: 'fly',
      levels: [{ id: '5-1', name: 'Die Klippen' }, { id: '5-2', name: 'Flug durch den Sturm', mode: 'fly' }, { id: '5-3', name: 'Das Wrack' }] },
    { n: 6, name: 'Eisenstadt', sub: 'Ketterichs Fabrik', music: 'w6', amb: 'amb_machine', cats: ['logik', 'lesen', 'mathe'], skill: 'bigfire',
      levels: [{ id: '6-1', name: 'Der Käfig' }, { id: '6-2', name: 'Das Zahnradwerk' }, { id: '6-3', name: 'Ketterichs Werkstatt' }] },
    { n: 7, name: 'Himmelsfestung', sub: 'Das letzte Kapitel', music: 'w7', amb: 'amb_wind', cats: ['mathe', 'schreiben', 'lesen', 'englisch', 'logik'], skill: null,
      levels: [{ id: '7-1', name: 'Jagd in den Wolken', mode: 'fly' }, { id: '7-2', name: 'Auf dem Eisendeck' }, { id: '7-3', name: 'Die Drachenmaschine', boss: true }] },
  ];
  const allLevels = CH.flatMap(c => c.levels.map((l, i) => Object.assign({ ch: c.n, idx: i }, l)));
  const level = (id) => allLevels.find(l => l.id === id);
  const chapter = (n) => CH[n - 1];
  function unlocked(p, id) { const i = allLevels.findIndex(l => l.id === id); return i === 0 || !!p.unlockAll || K.Save.levelDone(p, allLevels[i - 1].id); }
  function nextLevel(id) { const i = allLevels.findIndex(l => l.id === id); return allLevels[i + 1] || null; }
  function progressLabel(p) { const open = allLevels.filter(l => unlocked(p, l.id)); const last = open[open.length - 1]; const done = allLevels.every(l => K.Save.levelDone(p, l.id)); return done ? 'Abenteuer geschafft!' : `Kapitel ${last.ch}: ${chapter(last.ch).name}`; }

  const SKILLS = {
    fire: { name: 'Funkenspucken', how: 'Tippe auf den Feuer-Knopf (oder Taste X).', desc: 'Kivalu kann Feuerbälle spucken! Damit verbrennt er Spinnweben und bringt Blechritter ins Schwitzen.' },
    double: { name: 'Flattersprung', how: 'Spring und tippe in der Luft noch einmal auf Springen.', desc: 'Mit den kleinen Flügeln kann Kivalu jetzt in der Luft noch einmal hochflattern.' },
    melt: { name: 'Eisschmelze', how: 'Spucke Feuer auf Eisblöcke.', desc: 'Kivalus Feuer ist heißer geworden. Es schmilzt sogar dickes Eis.' },
    climb: { name: 'Krallengriff', how: 'Spring an eine Wand und halte die Richtung zur Wand.', desc: 'Mit scharfen Krallen klettert Kivalu jetzt Felswände hoch.' },
    fly: { name: 'Drachenflug', how: 'Halte Springen gedrückt, um zu gleiten. In Fluglevels fliegst du frei.', desc: 'Kivalus Flügel sind gewachsen! Endlich kann er richtig fliegen.' },
    bigfire: { name: 'Großer Feueratem', how: 'Feuer-Knopf: Der Feuerball ist jetzt riesig.', desc: 'Ein Feuer so heiß, dass sogar Eisengitter schmelzen.' },
  };

  // ---------------- Zwischensequenzen ----------------
  // Figur: [Bild, x (0–1), y-Füße (0–1), Größe, gespiegelt]
  const C = {
    prolog: [
      { bg: 1, music: 'drama', chars: [['pt_mama', 0.2, 0.92, 1.1], ['pt_papa', 0.42, 0.92, 1.15, true], ['pt_grauzahn', 0.83, 0.92, 1.05, true], ['pt_kivalu_idle', 0.62, 0.95, 0.62]], text: 'Tief im Glutfels-Gebirge, wo die Berge rauchen und die Lava brodelt, lebt der Drachenclan der Feuerkämme.' },
      { bg: 1, chars: [['pt_kivalu_sad', 0.5, 0.95, 0.95]], text: 'Kivalu ist der Jüngste. Seine Flügel sind noch zu klein zum Fliegen. Und wenn er Feuer spucken will, kommt nur ein Rauchwölkchen heraus.' },
      { bg: 1, chars: [['herzglut', 0.5, 0.62, 2.4, false, 'glow'], ['pt_mama', 0.18, 0.95, 0.9], ['pt_papa', 0.82, 0.95, 0.9, true]], text: 'Heute Nacht ist die große Flugprüfung. Alle Drachen versammeln sich an der Herzglut, dem uralten Feuer im Herzen des Berges. Aus ihr bekommt jeder Drache seine Kraft.' },
      { bg: 1, sfx: 'distant', shake: 400, chars: [['festung', 0.5, 0.55, 1.6, false, 'float']], text: 'Da donnert es am Himmel. Eine riesige Festung aus Eisen schiebt sich vor den Mond. Sie hängt an einem Ballon und raucht aus vielen Schornsteinen.' },
      { bg: 1, music: 'boss', chars: [['ketterich_point', 0.62, 0.92, 1.35]], who: 'Baron Ketterich', text: '„Guten Abend, ihr Feuerechsen! Ich bin Baron Ketterich, der größte Erfinder aller Zeiten. Und eure Herzglut gehört ab jetzt mir!“' },
      { bg: 1, sfx: 'metal', shake: 300, chars: [['knight_walk0', 0.25, 0.92, 1.3], ['knight_walk2', 0.45, 0.92, 1.2], ['herzglut', 0.62, 0.55, 1.6, false, 'glow'], ['knight_walk1', 0.8, 0.92, 1.3, true]], text: 'Blechritter stürmen in die Halle. Mit langen Ketten reißen sie die Herzglut aus dem Felsen und schleppen sie in die Festung.' },
      { bg: 1, sfx: 'crumble', chars: [['pt_stone_adult', 0.22, 0.95, 1.05], ['pt_stone_adult', 0.78, 0.95, 1.05, true], ['pt_kivalu_shock', 0.5, 0.96, 0.75]], text: 'Kaum ist die Herzglut fort, werden die großen Drachen grau. Ihre Schuppen werden hart und kalt wie Stein. Sie können sich nicht mehr bewegen.' },
      { bg: 1, chars: [['pt_stone_adult', 0.25, 0.95, 1.05], ['pt_kivalu_sad', 0.62, 0.96, 0.8, true]], who: 'Kivalu', text: '„Mama? Papa?“ Aber sie antworten nicht. Nur Kivalu kann sich noch bewegen. Sein junges Feuer ist noch nicht an die Herzglut gebunden.' },
      { bg: 1, chars: [['pt_grauzahn', 0.3, 0.95, 1.1, false, 'stoneHalf'], ['pt_kivalu_sad', 0.75, 0.96, 0.75, true]], who: 'Grauzahn', text: '„Kivalu, hör mir gut zu. Nur du kannst die Herzglut zurückholen. Lerne die alten Drachenkünste. Sie sind in versteckten Horten überall im Land. Und beeil dich, bevor auch ich ganz zu Stein werde.“' },
      { bg: 1, music: 'title', chars: [['pt_kivalu_proud', 0.5, 0.96, 1.0]], who: 'Kivalu', text: 'Kivalu schluckt. Dann richtet er seine kleinen Flügel auf. „Ich hole die Herzglut zurück. Versprochen!“' },
    ],
    'k1-fire': [
      { bg: 1, chars: [['pt_kivalu_fire', 0.5, 0.95, 1.0]], text: 'In dem alten Hort glüht ein Runenstein. Als Kivalu ihn berührt, kribbelt es in seinem Bauch. Er hustet, und plötzlich fliegt ein echter Feuerball aus seinem Maul!' },
    ],
    'after-1-3': [
      { bg: 1, chars: [['knight_broken', 0.35, 0.92, 1.2], ['pt_kivalu_idle', 0.68, 0.95, 0.8, true]], text: 'Der letzte Blechritter klappert zusammen. Aus seiner Rüstung rutscht eine zerknitterte Karte.' },
      { bg: 2, sfx: 'page', chars: [['pt_kivalu_shock', 0.5, 0.95, 0.85]], text: 'Auf der Karte ist ein Weg eingezeichnet: durch den Nebelwald, über die Frostzinnen, bis zu einer Stadt aus Eisen. Daneben steht in krakeliger Schrift: „Herzglut abliefern. Schnell!“' },
      { bg: 2, music: 'w2', chars: [['pt_kivalu_proud', 0.5, 0.95, 0.9]], who: 'Kivalu', text: '„Der Nebelwald also.“ Kivalu faltet die Karte zusammen. „Ich komme, Ketterich!“' },
    ],
    'after-2-1': [
      { bg: 2, chars: [['pt_kivalu_cheer', 0.5, 0.95, 0.95]], text: 'Im hohlen Stamm eines Riesenpilzes findet Kivalu den zweiten Hort. Seine Flügel kribbeln. Jetzt kann er in der Luft noch einmal hochflattern!' },
    ],
    'after-2-3': [
      { bg: 2, sfx: 'distant', shake: 500, chars: [['festung', 0.55, 0.5, 1.7, false, 'float']], text: 'Plötzlich wird es dunkel über dem Nebelwald. Die Eisenfestung zieht direkt über die Baumwipfel hinweg.' },
      { bg: 2, chars: [['pt_silber', 0.35, 0.8, 0.9, false, 'cage'], ['pt_kivalu_shock', 0.75, 0.96, 0.8, true]], text: 'Unter der Festung baumelt ein Käfig. Darin sitzt ein Drache mit eisblauen Schuppen. Er ruft etwas, aber Kivalu versteht es nicht. „Help! Help me!“' },
      { bg: 3, music: 'w3', chars: [['pt_kivalu_proud', 0.5, 0.95, 0.9]], text: 'Die Festung fliegt nach Norden, zu den Frostzinnen. Kivalu zögert keine Sekunde und läuft hinterher.' },
    ],
    'after-3-1': [
      { bg: 3, chars: [['pt_kivalu_fire', 0.5, 0.95, 1.0]], text: 'Zwischen den Eiszapfen liegt ein uralter Hort. Kivalus Feuer wird heißer, so heiß, dass es sogar dickes Eis schmelzen kann!' },
    ],
    'before-3-3': [
      { bg: 3, chars: [['pt_silber', 0.32, 0.95, 1.0, false, 'cage'], ['pt_kivalu_idle', 0.75, 0.95, 0.8, true]], who: 'Silberschwinge', text: '„Hello! My name is Silberschwinge. I am an ice dragon. Please help me!“ Kivalu versteht nur wenig. Er muss Englisch lernen, um den Eisdrachen zu befreien.' },
    ],
    'after-3-3': [
      { bg: 3, sfx: 'crumble', chars: [['pt_silber_fly', 0.32, 0.8, 1.0], ['pt_kivalu_cheer', 0.75, 0.95, 0.85, true]], who: 'Silberschwinge', text: '„Thank you, little friend!“ Silberschwinge schüttelt das Eis von seinen Flügeln. Er erzählt, dass Ketterich auch ihn fangen wollte, für eine Maschine.' },
      { bg: 3, chars: [['pt_silber', 0.32, 0.95, 1.0], ['pt_kivalu_shock', 0.75, 0.95, 0.85, true]], who: 'Silberschwinge', text: '„Seven days.“ Er hebt sieben Krallen. Kivalu versteht: In sieben Tagen will Ketterich die Herzglut in seiner Maschine verbrennen. Dann ist sie für immer verloren.' },
      { bg: 4, music: 'w4', chars: [['pt_kivalu_proud', 0.5, 0.95, 0.9]], text: 'Der schnellste Weg führt unter den Bergen hindurch, durch die alten Zwergenminen. Silberschwinge fliegt voraus, um die anderen Eisdrachen zu warnen.' },
    ],
    'after-4-1': [
      { bg: 4, chars: [['pt_kivalu_cheer', 0.5, 0.95, 0.95]], text: 'Im Hort der Minen findet Kivalu die Kunst des Krallengriffs. Jetzt kann er steile Felswände hochklettern!' },
    ],
    'before-4-3': [
      { bg: 4, chars: [['bruno', 0.3, 0.92, 1.4], ['pt_kivalu_idle', 0.72, 0.95, 0.8, true]], who: 'Zwerg Bruno', text: '„Ein Drache! In meiner Mine!“ Der kleine Zwerg Bruno hebt seine Spitzhacke. Dann lacht er. „Ach, du bist ja noch ein Kind. Hilf mir, die Kristalltüren zu öffnen. Dafür zeige ich dir den Weg nach draußen.“' },
    ],
    'after-4-3': [
      { bg: 4, chars: [['bruno', 0.3, 0.92, 1.4], ['crystal_blue', 0.52, 0.85, 1.4], ['pt_kivalu_cheer', 0.75, 0.95, 0.8, true]], who: 'Zwerg Bruno', text: '„Du rechnest besser als mein Großvater!“ Bruno schenkt Kivalu einen leuchtenden Kristall für seinen Hort.' },
      { bg: 5, music: 'w5', sfx: 'amb_thunder', chars: [['pt_kivalu_shock', 0.5, 0.95, 0.85]], text: 'Der Ausgang der Mine führt an eine wilde Küste. Der Wind heult, Blitze zucken, und weit draußen über dem Meer dreht die Eisenfestung ihre Runden.' },
    ],
    'after-5-1': [
      { bg: 5, sfx: 'rise', chars: [['pt_kivalu_fly', 0.5, 0.8, 1.05]], text: 'Auf der höchsten Klippe passiert es: Kivalus Flügel wachsen! Er breitet sie aus, der Sturm hebt ihn hoch, und zum ersten Mal in seinem Leben fliegt er.' },
    ],
    'after-5-3': [
      { bg: 5, sfx: 'metal', shake: 400, chars: [['pt_kivalu_shock', 0.5, 0.95, 0.85, false, 'net']], text: 'Gerade als Kivalu die Schatzkarte aus dem Wrack holt, fällt ein riesiges Eisennetz vom Himmel. Er zappelt, aber das Netz ist zu stark.' },
      { bg: 6, music: 'drama', chars: [['ketterich_point', 0.3, 0.92, 1.3], ['pt_kivalu_sad', 0.75, 0.95, 0.8, true]], who: 'Baron Ketterich', text: '„Na so was, ein kleiner Feuerkamm! Du kommst gerade recht. Meine Maschine braucht noch ein bisschen Drachenfeuer.“' },
    ],
    'after-6-1': [
      { bg: 6, chars: [['pt_kivalu_fire', 0.5, 0.95, 1.05]], text: 'In einer verstaubten Ecke der Fabrik steht ein alter Drachenstein. Ketterich hat ihn gesammelt, aber nie verstanden. Kivalu lernt daraus den Großen Feueratem.' },
    ],
    'after-6-3': [
      { bg: 6, sfx: 'book', chars: [['pt_kivalu_sad', 0.5, 0.95, 0.85]], text: 'In Ketterichs Werkstatt liegt sein Tagebuch. Kivalu liest: Als Ketterich ein Kind war, hat ein wilder Drache sein Dorf niedergebrannt. Seitdem hat er schreckliche Angst vor Drachen.' },
      { bg: 6, chars: [['pt_kivalu_proud', 0.5, 0.95, 0.85]], who: 'Kivalu', text: '„Er ist nicht einfach böse. Er hat Angst.“ Kivalu klappt das Tagebuch zu. „Ich muss ihm zeigen, dass Drachen auch beschützen können.“' },
      { bg: 7, music: 'boss', sfx: 'distant', shake: 600, chars: [['festung', 0.5, 0.45, 2.0, false, 'rise']], text: 'Da bebt der Boden. Die Himmelsfestung hebt ab, mit der Herzglut an Bord. Kivalu breitet die Flügel aus und fliegt hinterher.' },
    ],
    finale: [
      { bg: 7, music: 'drama', sfx: 'boom', shake: 800, chars: [['knight_broken', 0.5, 0.9, 2.2]], text: 'Die Drachenmaschine kracht zusammen. Zahnräder fliegen durch die Luft. Die Festung bekommt Schlagseite und beginnt zu sinken.' },
      { bg: 7, chars: [['ketterich_scared', 0.35, 0.9, 1.3], ['pt_kivalu_fly', 0.72, 0.8, 0.9, true]], who: 'Baron Ketterich', text: '„Hilfe! Ich falle!“ Ketterich rutscht über die Kante. Kivalu zögert nicht. Er stürzt sich hinterher und fängt ihn auf.' },
      { bg: 7, chars: [['ketterich', 0.35, 0.92, 1.3], ['pt_kivalu_proud', 0.72, 0.95, 0.85, true]], who: 'Baron Ketterich', text: '„Du … du hast mich gerettet? Obwohl ich dir alles weggenommen habe?“ Kivalu nickt. „Drachen beschützen. Das ist unsere wichtigste Kunst.“' },
      { bg: 1, music: 'finale', chars: [['herzglut', 0.5, 0.6, 2.6, false, 'glow'], ['pt_kivalu_cheer', 0.5, 0.97, 0.8]], text: 'Kivalu bringt die Herzglut nach Hause. Als sie wieder im Felsen liegt, leuchtet der ganze Berg.' },
      { bg: 1, sfx: 'j_happy', chars: [['pt_mama', 0.2, 0.95, 1.05], ['pt_kivalu_cheer', 0.5, 0.97, 0.8], ['pt_papa', 0.8, 0.95, 1.05, true]], text: 'Die Steinschuppen springen auf. Mama und Papa bewegen sich wieder! Sie drücken Kivalu so fest, dass ihm fast die Luft wegbleibt.' },
      { bg: 1, chars: [['pt_grauzahn', 0.25, 0.95, 1.05], ['pt_kivalu_proud', 0.55, 0.97, 0.85], ['ketterich', 0.82, 0.92, 1.0, true]], who: 'Grauzahn', text: '„Du hast alle Drachenkünste gelernt, Kivalu. Und die wichtigste hast du ganz allein gefunden.“ Sogar Ketterich ist gekommen, um sich zu entschuldigen. Er baut jetzt Flugbrillen für Drachen.' },
      { bg: 1, chars: [['pt_kivalu_fly', 0.5, 0.75, 1.15]], text: 'Und Kivalu? Der fliegt jetzt jeden Abend über den Glutfels. Die Flugprüfung hat er übrigens mit Bestnote bestanden. ENDE … oder vielleicht der Anfang eines neuen Abenteuers?' },
    ],
  };
  // Welche Sequenz wann
  function before(id) { return { '3-3': 'before-3-3', '4-3': 'before-4-3' }[id]; }
  function after(id) { return { '1-3': 'after-1-3', '2-1': 'after-2-1', '2-3': 'after-2-3', '3-1': 'after-3-1', '3-3': 'after-3-3', '4-1': 'after-4-1', '4-3': 'after-4-3', '5-1': 'after-5-1', '5-3': 'after-5-3', '6-1': 'after-6-1', '6-3': 'after-6-3', '7-3': 'finale' }[id]; }

  return { CH, allLevels, level, chapter, unlocked, nextLevel, progressLabel, SKILLS, CUTS: C, before, after };
})();
