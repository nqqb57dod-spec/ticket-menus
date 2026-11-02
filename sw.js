// Fonctionnement hors ligne : tous les fichiers de l'app sont gardés sur l'appareil.
// Changer VERSION à chaque mise à jour pour que les téléphones récupèrent la nouvelle version.
const VERSION = "cuisine-2026-11-02-2";
const FICHIERS = [
  "./", "index.html", "moteur.js", "manifest.webmanifest",
  "icones/icone.svg", "icones/icone-192.png", "icones/icone-512.png", "icones/icone-masquable-512.png", "icones/apple-touch-icon.png",
  "polices/bricolage-grotesque-latin-wght-normal.woff2",
  "polices/atkinson-hyperlegible-latin-400-normal.woff2", "polices/atkinson-hyperlegible-latin-700-normal.woff2",
  "vendor/tesseract.min.js", "vendor/worker.min.js",
  "vendor/tesseract-core-simd-lstm.wasm.js", "vendor/tesseract-core-lstm.wasm.js",
  "lang/fra.traineddata.gz",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((c) => c !== VERSION).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  // Page : le réseau d'abord (pour les mises à jour), la copie locale sinon.
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).catch(() => caches.match("index.html")));
    return;
  }
  // Autres fichiers : la copie locale d'abord.
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
