/* Elternbereich: Profile, Lernstand-Ampel, Einstellungen, Spielzeit-Wecker, eigene Stimme aufnehmen, Sicherung. */
(function (PT) {
  'use strict';
  const el = (...a) => PT.el(...a);

  function open(onClose) {
    let tab = 'lernstand', close;
    const content = el('div', { class: 'parents' });
    const tabs = el('div', { class: 'tabs' });
    const TABS = [['lernstand', 'Lernstand'], ['profile', 'Profile'], ['einstellungen', 'Einstellungen'], ['stimme', 'Eigene Stimme'], ['sicherung', 'Sicherung']];

    function build() {
      stopRecording();
      tabs.innerHTML = '';
      TABS.forEach(([id, name]) => tabs.appendChild(el('button', { class: 'btn small white' + (tab === id ? ' sel' : ''), text: name, onclick: () => { tab = id; build(); } })));
      content.innerHTML = '';
      ({ lernstand, profile: profileTab, einstellungen, stimme, sicherung })[tab](content, build);
    }

    const node = el('div', {}, [
      el('div', { class: 'topbar' }, [PT.ui.roundBtn('close', 'Schließen', () => { stopRecording(); close(); if (onClose) onClose(); }), el('div', { class: 'title', text: 'Elternbereich' }), el('div', { style: { width: '64px' } })]),
      tabs, content,
    ]);
    close = PT.ui.screen(node);
    build();
  }

  // ---------- Lernstand ----------
  function lernstand(root) {
    const list = PT.store.profiles();
    if (!list.length) { root.appendChild(el('section', {}, [el('p', { text: 'Noch keine Profile angelegt.' })])); return; }
    list.forEach(p => {
      const rows = PT.learn.skillsFor(p.stage).map(k => {
        const sk = PT.learn.SKILLS[k];
        const st = p.learn.skills[k];
        const a = PT.learn.ampel(p, k);
        return el('tr', {}, [
          el('td', {}, [el('span', { class: 'ampel ' + a.color }), a.label]),
          el('td', { text: sk.name }),
          el('td', { text: sk.where }),
          el('td', { text: st ? `Stufe ${st.level}/5` : '–' }),
          el('td', { text: st ? `${st.correct}/${st.attempts} beim 1. Versuch` : '–' }),
        ]);
      });
      const g = p.game;
      const done = PT.stations.ORDER.filter(k => g.stations[k]).length;
      root.appendChild(el('section', {}, [
        el('h3', { text: `${p.name} · ${PT.menus.stageName(p.stage)}` }),
        el('p', { text: `Mühlberg: ${done} von 4 Stationen repariert${g.festDone ? ', Fest gefeiert' : ''}. Knöpfe: ${g.taler}. Sticker: ${g.stickers.length}/10. Gespielt: ${Math.round((g.playSeconds || 0) / 60)} Minuten.` }),
        el('table', {}, [el('thead', {}, [el('tr', {}, ['Stand', 'Fähigkeit', 'Wo im Spiel', 'Schwierigkeit', 'Richtig'].map(h => el('th', { text: h })))]), el('tbody', {}, rows)]),
        el('p', { class: 'note', text: 'Die Schwierigkeit passt sich automatisch an: Ab über 85 % richtig wird es schwerer, unter 60 % leichter. Grün heißt: Stufe 4 oder 5 erreicht und zuletzt meist richtig.' }),
      ]));
    });
  }

  // ---------- Profile ----------
  function profileTab(root, rebuild) {
    PT.store.profiles().forEach(p => {
      const name = el('input', { type: 'text', value: p.name, maxlength: 16 });
      const stage = el('select', {}, [el('option', { value: 'spatz', text: 'Spatzen (4–5)' }), el('option', { value: 'fuchs', text: 'Füchse (6–7)' })]);
      stage.value = p.stage;
      root.appendChild(el('section', {}, [
        el('h3', { text: p.name }),
        el('div', { class: 'inline-form' }, [
          name, stage,
          el('button', { class: 'btn small green', text: 'Speichern', onclick: () => { p.name = name.value.trim() || p.name; p.stage = stage.value; PT.store.save(); PT.ui.toast('Gespeichert'); rebuild(); } }),
          el('button', { class: 'btn small white', text: 'Spielstand zurücksetzen', onclick: async () => { if (await PT.ui.confirm(`Spielstand und Lernstand von ${p.name} auf Anfang setzen? Der Avatar bleibt.`, 'Zurücksetzen')) { PT.store.resetProfile(p.id); rebuild(); } } }),
          el('button', { class: 'btn small red', text: 'Profil löschen', onclick: async () => { if (await PT.ui.confirm(`Profil ${p.name} endgültig löschen?`, 'Löschen')) { PT.store.removeProfile(p.id); rebuild(); } } }),
        ]),
      ]));
    });
    root.appendChild(el('p', { class: 'note', text: 'Neue Profile legst du am Startbildschirm über das Plus an (bis zu 6).' }));
  }

  // ---------- Einstellungen ----------
  function einstellungen(root) {
    const s = PT.store.settings;
    const save = () => { PT.store.save(); PT.ui.toast('Gespeichert'); };
    const vol = el('input', { type: 'range', min: 0, max: 1, step: 0.05, value: s.volume });
    vol.onchange = () => { s.volume = parseFloat(vol.value); save(); PT.sound.coin(); };
    const rate = el('input', { type: 'range', min: 0.6, max: 1.2, step: 0.05, value: s.speechRate });
    rate.onchange = () => { s.speechRate = parseFloat(rate.value); save(); };
    const auto = el('select', {}, [el('option', { value: '1', text: 'Immer automatisch vorlesen' }), el('option', { value: '0', text: 'Nur auf Tippen vorlesen' })]);
    auto.value = s.autoRead ? '1' : '0';
    auto.onchange = () => { s.autoRead = auto.value === '1'; save(); };
    const ctl = el('select', {}, [el('option', { value: 'buttons', text: 'Pfeile und Sprungknopf' }), el('option', { value: 'tap', text: 'Tipp dorthin (Figur läuft hin, springt selbst)' })]);
    ctl.value = s.control;
    ctl.onchange = () => { s.control = ctl.value; save(); };
    const mins = el('select', {}, [0, 10, 15, 20, 30, 45, 60].map(m => el('option', { value: String(m), text: m ? m + ' Minuten' : 'aus' })));
    mins.value = String(s.playMinutes);
    mins.onchange = () => { s.playMinutes = parseInt(mins.value, 10); save(); };

    root.appendChild(el('section', {}, [
      el('h3', { text: 'Ton und Vorlesen' }),
      el('div', { class: 'form', style: { maxWidth: '100%' } }, [
        el('label', {}, ['Lautstärke', vol]),
        el('label', {}, ['Sprechtempo', rate]),
        el('label', {}, ['Vorlesen', auto]),
        el('button', { class: 'btn small white', text: 'Stimme testen', onclick: () => PT.speech.say({ text: 'Servus! Ich bin Ranzl, der sprechende Rucksack.', who: 'ranzl' }) }),
        el('p', { class: 'note', text: 'Aktuell: ' + PT.speech.engine + '. Klingt die Stimme roboterhaft oder fehlt sie, kannst du unter „Eigene Stimme“ alle festen Texte selbst einsprechen.' }),
      ]),
    ]));
    root.appendChild(el('section', {}, [
      el('h3', { text: 'Steuerung und Spielzeit' }),
      el('div', { class: 'form', style: { maxWidth: '100%' } }, [
        el('label', {}, ['Steuerung', ctl]),
        el('label', {}, ['Spielzeit-Wecker', mins]),
        el('p', { class: 'note', text: 'Wenn die Zeit um ist, wird Ranzl müde. Eine laufende Aufgabe darf noch fertig gespielt werden, dann wird gespeichert und es geht zum Startbildschirm. Weiterspielen geht nur über die Erwachsenen-Rechnung.' }),
      ]),
    ]));
  }

  // ---------- Eigene Stimme ----------
  let recorder = null, recStream = null;
  function stopRecording() {
    try { if (recorder && recorder.state === 'recording') recorder.stop(); } catch (e) { /* egal */ }
    if (recStream) { recStream.getTracks().forEach(t => t.stop()); recStream = null; }
  }

  function stimme(root, rebuild) {
    const ok = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
    root.appendChild(el('section', {}, [
      el('h3', { text: 'Ranzl, Pfeffer und Resi mit deiner Stimme' }),
      el('p', { text: 'Tippe bei einem Text auf „Aufnehmen“, sprich ihn ein und tippe auf „Stopp“. Ab dann hören deine Kinder deine Aufnahme statt der Computerstimme. Texte mit wechselnden Zahlen (z. B. „Die Brücke braucht 14 Bretter“) liest weiterhin die Computerstimme.' }),
      ok ? el('p', { class: 'note', text: 'Beim ersten Mal fragt das Gerät, ob das Mikrofon benutzt werden darf. Die Aufnahmen bleiben nur auf diesem Gerät.' })
        : el('p', { class: 'note', text: 'Dieses Gerät bzw. dieser Browser unterstützt keine Aufnahme. Im Web klappt es nur über https (z. B. GitHub Pages), nicht beim direkten Öffnen der Datei.' }),
    ]));
    const groups = {};
    Object.keys(PT.lines).forEach(id => { const g = id.split('.')[0]; (groups[g] = groups[g] || []).push(id); });
    const NAMES = { prolog: 'Prolog', pfeffer: 'Meisterin Pfeffer', ranzl: 'Ranzl', bank: 'Rastbank-Geschichten', resi: 'Bäuerin Resi', bruecke: 'Brücke', huehner: 'Hühner', schuettel: 'Schüttelkiste', markt: 'Marktstand', muehle: 'Mühle', fest: 'Fest', muster: 'Kettenmuster', zwanziger: 'Zwanzigerfeld', silben: 'Silbenspringen', raetsel: 'Rätselstein' };
    Object.keys(groups).forEach(gk => {
      const sec = el('section', {}, [el('h3', { text: NAMES[gk] || gk })]);
      groups[gk].forEach(id => {
        const line = PT.lines[id];
        const has = PT.speech.hasRecording(id);
        const row = el('div', { class: 'rec-row' + (has ? ' has' : '') });
        const recBtn = el('button', { class: 'btn small white', text: 'Aufnehmen', disabled: ok ? null : true });
        recBtn.onclick = async () => {
          if (recorder && recorder.state === 'recording') { recorder.stop(); return; }
          try {
            recStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const chunks = [];
            recorder = new MediaRecorder(recStream);
            recorder.ondataavailable = e => chunks.push(e.data);
            recorder.onstop = async () => {
              stopRecording();
              const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
              await PT.speech.putClip(id, blob);
              PT.ui.toast('Aufnahme gespeichert');
              rebuild();
            };
            recorder.start();
            recBtn.textContent = 'Stopp'; recBtn.classList.add('recording');
          } catch (e) {
            PT.ui.toast('Kein Zugriff auf das Mikrofon');
          }
        };
        row.append(
          el('div', { class: 'txt' }, [el('div', { class: 'who', text: PT.characterNames[line.who] }), line.text]),
          recBtn,
          el('button', { class: 'btn small white', text: 'Anhören', onclick: () => PT.speech.say(PT.line(id), { noRemember: true }) }),
          has ? el('button', { class: 'btn small red', text: 'Löschen', onclick: async () => { await PT.speech.deleteClip(id); rebuild(); } }) : null,
        );
        sec.appendChild(row);
      });
      root.appendChild(sec);
    });
  }

  // ---------- Sicherung ----------
  async function shareNative(json) {
    const C = window.Capacitor;
    const FS = C.registerPlugin('Filesystem');
    const Share = C.registerPlugin('Share');
    const name = 'purzeltal-sicherung-' + PT.today() + '.json';
    const res = await FS.writeFile({ path: name, data: json, directory: 'CACHE', encoding: 'utf8' });
    await Share.share({ title: 'Purzeltal-Sicherung', text: 'Spielstände von Purzeltal', files: [res.uri], dialogTitle: 'Sicherung speichern oder senden' });
  }

  function sicherung(root, rebuild) {
    const file = el('input', { type: 'file', accept: '.json,application/json' });
    file.onchange = async () => {
      const f = file.files[0]; if (!f) return;
      try {
        const text = await f.text();
        if (!(await PT.ui.confirm('Alle Spielstände auf diesem Gerät durch die Sicherung ersetzen?', 'Ersetzen'))) return;
        PT.store.importJSON(text);
        PT.ui.toast('Sicherung eingespielt');
        rebuild();
      } catch (e) { PT.ui.toast('Das hat nicht geklappt: ' + e.message, null, 4000); }
    };
    const copyArea = el('textarea', { style: { width: '100%', height: '120px', display: 'none', fontSize: '12px' }, readonly: true });
    root.appendChild(el('section', {}, [
      el('h3', { text: 'Sicherung exportieren' }),
      el('p', { text: 'Alle Spielstände liegen nur auf diesem Gerät. Wenn die App gelöscht wird oder die Browserdaten gelöscht werden, sind sie weg. Mach ab und zu eine Sicherung, z. B. per Mail an dich selbst oder auf Google Drive.' }),
      el('div', { class: 'inline-form' }, [
        el('button', { class: 'btn small green', text: 'Sicherung erstellen', onclick: async () => {
          const json = PT.store.exportJSON();
          if (PT.isNativeApp()) {
            try { await shareNative(json); return; } catch (e) { console.warn(e); }
            copyArea.value = json; copyArea.style.display = 'block'; copyArea.select();
            PT.ui.toast('Teilen ging nicht. Text unten kopieren.', null, 4000);
            return;
          }
          const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
          const a = el('a', { href: url, download: 'purzeltal-sicherung-' + PT.today() + '.json' });
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 2000);
        } }),
      ]),
      copyArea,
      el('p', { class: 'note', text: 'Die eigenen Sprachaufnahmen sind nicht in der Sicherung enthalten.' }),
    ]));
    root.appendChild(el('section', {}, [
      el('h3', { text: 'Sicherung einspielen' }),
      el('p', { text: 'Wähle eine zuvor erstellte Sicherungsdatei (.json). Achtung: Das ersetzt alle Spielstände auf diesem Gerät.' }),
      file,
    ]));
  }

  PT.parents = { open };
})(window.PT);
