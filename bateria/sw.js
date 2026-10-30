// Guarda o app no celular para abrir mesmo sem internet na igreja.
// Sempre tenta a rede primeiro (pega a versão nova do site) e usa a cópia guardada se falhar.
const CACHE = 'mapabateria-v1';
const BASE = ['./', 'index.html', 'style.css', 'app.js', 'musicas.js', 'icone.svg', 'icone-192.png', 'manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.status === 200 && (new URL(e.request.url).origin === location.origin || r.type === 'cors')) {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia)).catch(() => {});
      }
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
