/* Service worker MiamBox : fonctionnement hors connexion.
   IMPORTANT : changez VERSION à chaque modification des fichiers. */
const VERSION = "miambox-v9";
const FICHIERS = ["./", "./index.html", "./style.css", "./app.js", "./manifest.json", "./logo.png", "./logo-split.png", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png"];
self.addEventListener("install", e => {
  /* cache:"reload" : on prend toujours la dernière version sur le serveur, pas celle du cache du navigateur */
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(FICHIERS.map(f => c.add(new Request(f, { cache: "reload" }))))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* En ligne : on charge la dernière version et on la garde. Hors connexion : on utilise la copie enregistrée. */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(r => {
    if (r && r.ok && e.request.url.indexOf(self.location.origin) === 0) { const copie = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copie)); }
    return r;
  }).catch(() => caches.match(e.request)));
});
