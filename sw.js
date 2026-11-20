// Service worker de Adrogué CRM: permite instalar la app y abrirla aunque falle la red.
// Los datos (Supabase) NUNCA se guardan en caché: siempre van a la red.
const CACHE = 'adrogue-crm-v1';
const SHELL = ['./adrogue-crm.html', './manifest.json', './icon-192.png', './icon-512.png', './Logo_Chico_Adrogue_Insumos.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(SHELL.map(u => c.add(u)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // Supabase, fuentes, etc.: directo a la red
  // Red primero (siempre la versión más nueva); si no hay red, la copia guardada
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./adrogue-crm.html')))
  );
});
