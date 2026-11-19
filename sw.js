// ATI Timecard service worker.
// Pages load network-first (so updates show up without reinstalling) and fall
// back to cache offline. Bump CACHE_NAME when you change icons/manifest.
const CACHE_NAME = 'ati-timecard-v3';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './admin.html', './admin-manifest.json', './admin-icon-192.png', './admin-icon-512.png', './config.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // never touch API calls
  e.respondWith(
    fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE_NAME).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match(url.pathname.endsWith('admin.html') ? './admin.html' : './index.html')))
  );
});
