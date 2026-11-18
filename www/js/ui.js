/* Bildschirme, Sprechblasen, Hinweise und das Erwachsenen-Tor. */
(function (PT) {
  'use strict';
  const el = (...a) => PT.el(...a);
  const stack = [];

  function screen(node, opts) {
    opts = opts || {};
    node.classList.add('screen');
    if (opts.overlay) node.classList.add('overlay');
    PT.$('#screens').appendChild(node);
    stack.push(node);
    PT.emit('screens', stack.length);
    return function close() {
      const i = stack.indexOf(node);
      if (i >= 0) stack.splice(i, 1);
      node.remove();
      PT.emit('screens', stack.length);
    };
  }
  function closeAll() { while (stack.length) stack.pop().remove(); PT.emit('screens', 0); }
  function anyScreen() { return stack.length > 0; }

  function roundBtn(iconName, label, onclick, cls) {
    const b = el('button', { class: 'round-btn ' + (cls || ''), 'aria-label': label, onclick });
    b.appendChild(PT.draw.makeIcon(iconName, 108));
    return b;
  }
  function speakerBtn(getItem) {
    return roundBtn('speaker', 'Vorlesen', () => { PT.sound.tap(); const it = getItem(); if (it) PT.speech.say(it); });
  }

  // ---------- Sprechblase ----------
  let dialogBusy = false;
  let dialogQueue = Promise.resolve();

  /** lines: Array aus Zeilen-ids oder {who, text}. Gibt Promise zurück. */
  function dialog(lines) {
    dialogQueue = dialogQueue.then(() => runDialog(lines));
    return dialogQueue;
  }

  async function runDialog(lines) {
    dialogBusy = true;
    PT.emit('dialog', true);
    const box = PT.$('#dialog');
    for (const raw of lines) {
      const item = typeof raw === 'string' ? PT.line(raw) : raw;
      box.innerHTML = '';
      const portrait = el('canvas', { class: 'portrait', width: 192, height: 192 });
      PT.draw.portrait(portrait, item.who);
      const next = el('button', { class: 'round-btn go next', 'aria-label': 'Weiter' });
      next.appendChild(PT.draw.makeIcon('next', 108));
      const body = el('div', { class: 'body' }, [
        el('div', { class: 'who', text: PT.characterNames[item.who] || '' }),
        el('div', { class: 'text', text: item.text }),
      ]);
      portrait.addEventListener('click', () => PT.speech.say(item));
      box.append(portrait, body, next);
      box.classList.remove('hidden');
      await new Promise(resolve => {
        let done = false;
        const go = () => { if (done) return; done = true; PT.sound.tap(); PT.speech.stop(); resolve(); };
        next.addEventListener('click', go);
        if (PT.store.settings.autoRead) PT.speech.say(item);
      });
    }
    box.classList.add('hidden');
    box.innerHTML = '';
    dialogBusy = false;
    PT.emit('dialog', false);
  }

  // ---------- Hinweis oben ----------
  let toastTimer = null;
  function toast(text, iconCanvas, ms) {
    const t = PT.$('#toast');
    t.innerHTML = '';
    if (iconCanvas) t.appendChild(iconCanvas);
    t.appendChild(document.createTextNode(text));
    t.classList.remove('hidden');
    t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add('hidden'), ms || 2200);
  }

  // ---------- Erwachsenen-Tor ----------
  function adultGate(reason) {
    return new Promise(resolve => {
      const a = PT.rand(21, 48), b = PT.rand(23, 49);
      const input = el('input', { type: 'number', inputmode: 'numeric', autocomplete: 'off', 'aria-label': 'Ergebnis' });
      const msg = el('p', { class: 'lead' });
      let close;
      const ok = () => {
        if (parseInt(input.value, 10) === a + b) { close(); resolve(true); }
        else { msg.textContent = 'Das stimmt leider nicht.'; input.value = ''; input.focus(); }
      };
      const node = el('div', {}, [
        el('div', { class: 'topbar' }, [roundBtn('close', 'Abbrechen', () => { close(); resolve(false); }), el('div', { class: 'title', text: 'Nur für Erwachsene' }), el('div', { style: { width: '64px' } })]),
        el('div', { class: 'form' }, [
          el('p', { class: 'lead', text: reason || 'Bitte löse die Rechnung, um weiterzumachen.' }),
          el('h2', { text: a + ' + ' + b + ' = ?' }),
          input,
          el('button', { class: 'btn green', text: 'Weiter', onclick: ok }),
          msg,
        ]),
      ]);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') ok(); });
      close = screen(node, { overlay: true });
      setTimeout(() => input.focus(), 50);
    });
  }

  function confirmBox(text, yes, no) {
    return new Promise(resolve => {
      let close;
      const node = el('div', {}, [
        el('div', { class: 'form', style: { marginTop: '12vh' } }, [
          el('h2', { text }),
          el('div', { class: 'choice-row' }, [
            el('button', { class: 'btn white', text: no || 'Abbrechen', onclick: () => { close(); resolve(false); } }),
            el('button', { class: 'btn red', text: yes || 'Ja', onclick: () => { close(); resolve(true); } }),
          ]),
        ]),
      ]);
      close = screen(node, { overlay: true });
    });
  }

  PT.ui = {
    screen, closeAll, anyScreen, dialog, toast, adultGate, confirm: confirmBox, roundBtn, speakerBtn,
    get dialogBusy() { return dialogBusy; },
  };
})(window.PT);
