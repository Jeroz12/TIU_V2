/* Service Worker - TIU Virtual
   Cachea la app para que funcione offline y cargue al instante */

const CACHE_NAME = "tiu-virtual-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json"
];

/* Instalación: guarda los archivos base en caché */
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

/* Activación: elimina cachés viejos de versiones anteriores */
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* Fetch: responde desde caché primero; si no está, va a la red y guarda */
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request)
        .then((resp) => {
          // Cachear solo respuestas válidas del mismo origen o fuentes
          if (resp && resp.status === 200 && e.request.method === "GET") {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          }
          return resp;
        })
        .catch(() => cached); // Sin red y sin caché: falla silenciosamente
    })
  );
});
