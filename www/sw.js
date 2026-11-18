/* Offline-Modus für die Web-Version: alle Dateien werden beim ersten Besuch gespeichert. */
const CACHE = 'purzeltal-v1';
const FILES = [
  './', './index.html', './css/style.css', './manifest.webmanifest', './icon.svg', './icon-512.png',
  './js/core.js', './js/storage.js', './js/lines.js', './js/speech.js', './js/sound.js', './js/draw.js',
  './js/avatar.js', './js/items.js', './js/learn.js', './js/ui.js', './js/tasks.js', './js/stations.js',
  './js/editor.js', './js/menus.js', './js/parents.js', './js/world.js', './js/main.js',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Netz zuerst (damit Updates ankommen), ohne Netz aus dem Speicher
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
