// Guardo a app em cache para ela abrir mesmo sem rede.
// Para os ficheiros da app peço sempre primeiro a versão nova à rede (assim fica sempre atualizada);
// para as bibliotecas externas uso a cópia guardada, porque não mudam.
// Os pedidos ao GitHub (os teus dados) nunca passam pela cache.
const CACHE = "diario-saude-v1";
const CDN = ["cdn.jsdelivr.net", "cdnjs.cloudflare.com", "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"])));
});
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(e.request)
        .then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r; })
        .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
    );
  } else if (CDN.includes(url.hostname)) {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(res => {
        const copia = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return res;
      }))
    );
  }
});
