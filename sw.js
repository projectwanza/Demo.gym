const CACHE_NAME = "fitzone-cache-v1";
const urlsToCache = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => Promise.all(urlsToCache.map((u) => cache.add(u).catch(() => {}))))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Apps Script API, fonts, Chart.js (dusri sites) ko haath nahi lagate
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  // Page: pehle network, offline ho to cache
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match("./index.html")));
    return;
  }
  // Icons/manifest: pehle cache
  event.respondWith(caches.match(req).then((r) => r || fetch(req)));
});
