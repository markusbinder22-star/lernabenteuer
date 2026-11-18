/* Alle festen Sprechtexte. Jeder Text hat eine id, damit im Elternbereich
   eine eigene Aufnahme dafür gemacht werden kann (dann ersetzt sie die Computerstimme).
   Texte mit wechselnden Zahlen oder Namen werden im Code gebaut und immer von der Computerstimme gelesen. */
(function (PT) {
  'use strict';

  const L = {
    // ---------- Prolog ----------
    'prolog.1': { who: 'erzaehler', text: 'Das ist das Purzeltal. Hier sorgt seit hundert Jahren die alte Sortiermaschine Gustl dafür, dass alles an seinem Platz ist.' },
    'prolog.2': { who: 'erzaehler', text: 'Doch eines Nachts fegt der Wirbelwind Zausel durchs Tal. Er bläst Gustl die Klappe auf, und alles purzelt durcheinander!' },
    'prolog.3': { who: 'erzaehler', text: 'Am Morgen steht auf der Bäckerei BÄKCER, die Brücke hat zu wenig Bretter, und die Hühner von Bäuerin Resi sitzen auf dem Dach.' },
    'prolog.4': { who: 'erzaehler', text: 'Da hält der Postbus. Jemand Neues steigt aus: der neue Flicker-Lehrling!' },
    'pfeffer.hallo': { who: 'pfeffer', text: 'Servus! Da bist du ja endlich. Ich bin Meisterin Pfeffer, die Flickmeisterin vom Purzeltal.' },
    'pfeffer.ruecken': { who: 'pfeffer', text: 'Mein Rücken tut weh. Ich kann nimmer überall hinkraxeln. Aber du schon!' },
    'pfeffer.ranzl': { who: 'pfeffer', text: 'Nimm meinen alten Rucksack mit. Er heißt Ranzl. Er ist ein bisserl besonders.' },
    'ranzl.hallo': { who: 'ranzl', text: 'Hallo! Ja, ich kann reden. Ich bin Ranzl. Ich trage alles, was du findest, und ich lese dir alles vor.' },
    'ranzl.tipp': { who: 'ranzl', text: 'Wenn du etwas nochmal hören willst, tipp einfach auf mich. Oben rechts.' },
    'pfeffer.knoepfe': { who: 'pfeffer', text: 'Erste Aufgabe: Zausel hat drei Knöpfe von meiner Werkstatt verweht. Sammelst du sie ein? Lauf mit den Pfeilen und spring mit dem großen Knopf.' },
    'pfeffer.knoepfe.fertig': { who: 'pfeffer', text: 'Bravo! Alle drei Knöpfe sind wieder da. Du bist ein echter Flicker-Lehrling.' },
    'pfeffer.auftrag': { who: 'pfeffer', text: 'Jetzt brauche ich dich am Mühlberg. Bäuerin Resi hat großen Kummer. Geh einfach nach rechts, immer dem Weg nach.' },
    'pfeffer.spiegel': { who: 'pfeffer', text: 'Das ist mein Zauberspiegel. Davor kannst du dich jederzeit umziehen.' },
    'pfeffer.truhe': { who: 'pfeffer', text: 'Oben auf dem hohen Felsen am Weg steht eine Truhe. Da ist ein Piratenhut drin. Aber da kommt man nur mit Sprungfedern hinauf.' },
    'pfeffer.wieder': { who: 'pfeffer', text: 'Na, wie geht es am Mühlberg voran? Resi braucht dich!' },
    'pfeffer.fertig': { who: 'pfeffer', text: 'Der Mühlberg ist repariert! Ich bin so stolz auf dich. Bald gibt es neue Aufträge im Tal.' },

    // ---------- Ranzl allgemein ----------
    'ranzl.gemerkt': { who: 'ranzl', text: 'Ich hab es mir gemerkt!' },
    'ranzl.grube': { who: 'ranzl', text: 'Hoppla! Ich hab dich mit meinem Gurt wieder herausgezogen.' },
    'ranzl.fluss': { who: 'ranzl', text: 'Brrr, Wasser! Ich hab Angst vor Wasser. Die Brücke ist kaputt. Wir müssen sie zuerst reparieren.' },
    'ranzl.hand': { who: 'ranzl', text: 'Siehst du die grüne Hand? Tipp drauf, dann schauen wir uns das an.' },
    'ranzl.richtig1': { who: 'ranzl', text: 'Super!' },
    'ranzl.richtig2': { who: 'ranzl', text: 'Genau richtig!' },
    'ranzl.richtig3': { who: 'ranzl', text: 'Bravo!' },
    'ranzl.richtig4': { who: 'ranzl', text: 'Spitze, das stimmt!' },
    'ranzl.richtig5': { who: 'ranzl', text: 'Ja! Das hast du toll gemacht.' },
    'ranzl.nochmal': { who: 'ranzl', text: 'Hmm, schau nochmal genau. Probier es nochmal.' },
    'ranzl.zeigen': { who: 'ranzl', text: 'Ich zeig dir, wie es geht. Schau.' },
    'ranzl.gemeinsam': { who: 'ranzl', text: 'Wir machen das gemeinsam. Tipp jetzt auf das, was leuchtet.' },
    'ranzl.radiergummi': { who: 'ranzl', text: 'Ratzefummel! Der Radiergummi hat den Fehler weggeputzt. Probier es nochmal.' },
    'ranzl.muede': { who: 'ranzl', text: 'Uaah, ich bin so müde. Gehen wir zur Rastbank und machen eine Pause?' },
    'ranzl.schlaf': { who: 'ranzl', text: 'Gute Nacht! Ich hab mir alles gemerkt. Bis zum nächsten Mal!' },
    'ranzl.zuwenig': { who: 'ranzl', text: 'Dafür haben wir noch nicht genug Knöpfe. Sammle noch ein bisserl!' },
    'ranzl.gekauft': { who: 'ranzl', text: 'Gekauft! Ich pack es gleich ein. Mmh, lecker. Äh, ich meine: schön!' },
    'ranzl.wunsch': { who: 'ranzl', text: 'Das kommt ins Spar-Glas. Dann sehen wir, wie viel noch fehlt.' },
    'ranzl.sticker': { who: 'ranzl', text: 'Ein neuer Sticker für dein Album!' },
    'ranzl.weg': { who: 'ranzl', text: 'Das ist der Weg zum Mühlberg. Hier liegen viele Knöpfe herum!' },
    'ranzl.muehlberg': { who: 'ranzl', text: 'Wir sind am Mühlberg! Schau, alles ist durcheinander.' },
    'ranzl.zuhause': { who: 'ranzl', text: 'Das ist dein Baumhaus. Hier kannst du alles hinstellen, was du kaufst.' },
    'ranzl.laden': { who: 'ranzl', text: 'Der Knopfladen! Hier kannst du mit Knöpfen einkaufen.' },
    'ranzl.truhe.zu': { who: 'ranzl', text: 'Da oben ist die Truhe. Viel zu hoch! Dafür brauchen wir Sprungfedern.' },
    'ranzl.truhe.auf': { who: 'ranzl', text: 'Die Truhe! Da ist ja der Piratenhut drin. Ahoi!' },
    'ranzl.doppelsprung': { who: 'ranzl', text: 'Mit den Sprungfedern kannst du in der Luft nochmal springen. Probier es aus!' },

    // ---------- Rastbank-Geschichten ----------
    'bank.1': { who: 'ranzl', text: 'Weißt du, einmal hat Meisterin Pfeffer einen ganzen Regenschirm in mir vergessen. Ich hab ihn aus Versehen gegessen. Seitdem muss ich bei Regen niesen.' },
    'bank.2': { who: 'ranzl', text: 'Früher war ich ganz neu und glänzend. Jetzt hab ich siebzehn Flicken. Jeder Flicken ist ein Abenteuer.' },
    'bank.3': { who: 'ranzl', text: 'Psst. Manchmal, ganz in der Früh, hör ich ein leises Sausen im Tal. Ich glaub, das ist Zausel. Er klingt ein bisserl traurig.' },

    // ---------- Mühlberg ----------
    'resi.hallo': { who: 'resi', text: 'Grüß dich! Ich bin Bäuerin Resi. Und das ist mein Esel Hansi. Gell, Hansi? Seit dem Sturm ist bei uns alles kaputt.' },
    'resi.wieder': { who: 'resi', text: 'Danke, dass du hilfst! Schau dich um: Bei der Brücke, bei den Hühnern, am Marktstand und bei der Mühle brauch ich dich.' },
    'bruecke.intro': { who: 'resi', text: 'Die Brücke hat Löcher! Hansi traut sich nicht drüber. Hilfst du mir, Bretter hineinzulegen?' },
    'bruecke.fertig': { who: 'resi', text: 'Die Brücke ist wieder ganz! Hansi, schau, wir können wieder hinüber!' },
    'huehner.intro': { who: 'resi', text: 'Meine Hühner sind so aufgeregt. Sie flattern ständig herum. Hilfst du mir beim Zählen?' },
    'huehner.fertig': { who: 'resi', text: 'Alle Hühner sind wieder unten im Hof. Gack gack, danke!' },
    'schuettel.intro': { who: 'resi', text: 'In meiner Eierkiste ist alles durcheinander gekommen. Hilfst du mir, herauszufinden, wie viele Eier wo liegen?' },
    'markt.intro': { who: 'resi', text: 'Am Marktstand ist alles umgefallen. Hilfst du mir beim Verkaufen? Die Leute zahlen mit Münzen.' },
    'markt.fertig': { who: 'resi', text: 'Der Marktstand ist wieder schön. Die Paradeiser leuchten wieder rot!' },
    'muehle.intro': { who: 'resi', text: 'Die Mühle steht still. Zausel hat alles durcheinandergeweht. Hilfst du mir, wieder Ordnung zu machen?' },
    'muehle.fertig': { who: 'resi', text: 'Die Mühle dreht sich wieder! Hörst du das Klappern?' },
    'resi.fest': { who: 'resi', text: 'Alles ist repariert! Das müssen wir feiern. Komm zum Festplatz!' },
    'fest.1': { who: 'resi', text: 'Hurra! Der Mühlberg ist wieder ganz. Die ganze Dorfkapelle spielt für dich!' },
    'fest.2': { who: 'resi', text: 'Als Dankeschön bekommst du von mir Sprungfedern. Damit kommst du ganz hoch hinauf!' },
    'fest.3': { who: 'resi', text: 'Und schau, was Hansi gefunden hat: eine Murmel. Die hat bestimmt Zausel verloren. Komisch, oder?' },
    'fest.4': { who: 'ranzl', text: 'Eine Tuba für die Dorfkapelle! Die steht jetzt im Musikpavillon im Dorf.' },

    // ---------- Aufgaben-Erklärungen ----------
    'bruecke.s.frage': { who: 'ranzl', text: 'Zähl die Löcher in der Brücke. Tipp so oft auf den Bretterstapel, wie Löcher da sind. Dann drück auf Los.' },
    'bruecke.s.hilfe1': { who: 'ranzl', text: 'Zeig mit dem Finger auf jedes Loch und zähl laut mit.' },
    'bruecke.zuwenig': { who: 'ranzl', text: 'Oje, da ist noch ein Loch übrig. Es fehlen Bretter.' },
    'bruecke.zuviel': { who: 'ranzl', text: 'Hoppla, da sind Bretter übrig geblieben. Das waren zu viele.' },
    'bruecke.f.hilfe1': { who: 'ranzl', text: 'Zähl von der kleinen Zahl weiter, bis du bei der großen bist.' },
    'huehner.frage': { who: 'ranzl', text: 'Schau ganz genau! Gleich flattern Hühner über den Zaun.' },
    'huehner.wieviele': { who: 'ranzl', text: 'Wie viele Hühner waren es? Tipp auf die Hand mit so vielen Fingern.' },
    'huehner.hilfe1': { who: 'ranzl', text: 'Ich zeig sie dir nochmal. Schau genau hin.' },
    'schuettel.hilfe1': { who: 'ranzl', text: 'Wie viele fehlen noch, bis alle Eier da sind? Zähl weiter.' },
    'markt.s.hilfe1': { who: 'ranzl', text: 'Für jeden Punkt auf dem Preisschild brauchst du einen Knopf.' },
    'markt.f.hilfe1': { who: 'ranzl', text: 'Zähl zusammen, wie viel du schon hingelegt hast.' },
    'markt.zuwenig': { who: 'ranzl', text: 'Das ist noch zu wenig.' },
    'markt.zuviel': { who: 'ranzl', text: 'Das ist zu viel. Nimm etwas weg, indem du darauf tippst.' },
    'muster.frage': { who: 'ranzl', text: 'Ich fädle eine Kette. Welche Perle kommt als Nächstes?' },
    'muster.hilfe1': { who: 'ranzl', text: 'Sprich die Farben laut mit. Was wiederholt sich?' },
    'zwanziger.hilfe1': { who: 'ranzl', text: 'Mach zuerst die obere Reihe voll. Das sind zehn. Dann zählst du weiter.' },
    'zwanziger.wieviele': { who: 'ranzl', text: 'Und wie viele Säcke sind es jetzt zusammen?' },

    // ---------- Bonus ----------
    'silben.intro': { who: 'ranzl', text: 'Silbenspringen! Ich sag dir ein Wort. Spring für jede Silbe einmal. Dann warte kurz.' },
    'silben.nochmal': { who: 'ranzl', text: 'Fast! Wir klatschen gemeinsam. Hör genau hin.' },
    'silben.genug': { who: 'ranzl', text: 'Für heute haben die Silbensteine genug. Morgen gibt es neue Wörter!' },
    'raetsel.intro': { who: 'ranzl', text: 'Ein Rätselstein! Er lässt uns nur vorbei, wenn wir sein Rätsel lösen.' },
    'raetsel.schlaeft': { who: 'ranzl', text: 'Der Rätselstein schläft. Morgen hat er ein neues Rätsel für uns.' },
    'raetsel.geschafft': { who: 'ranzl', text: 'Der Stein rückt zur Seite. Da liegt ein goldener Knopf!' },
  };

  PT.lines = L;
  PT.line = id => {
    const l = L[id];
    if (!l) { console.warn('Unbekannte Zeile', id); return { id, who: 'ranzl', text: id }; }
    return { id, who: l.who, text: l.text };
  };
  PT.characterNames = { ranzl: 'Ranzl', pfeffer: 'Meisterin Pfeffer', resi: 'Bäuerin Resi', erzaehler: 'Erzähler' };
})(window.PT);
