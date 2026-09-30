// Client Radar Service Worker for Web App (PWA) Offline & Fast-Launch
const CACHE_NAME = "client-radar-cache-v2";
const ASSETS_TO_CACHE = [
  "/workspace/",
  "/workspace/index.html",
  "/workspace/app.js",
  "/workspace/prospects_data.js",
  "/workspace/custom_prospects.js",
  "/workspace/objections.js",
  "/workspace/brain_studio.js",
  "/workspace/tour.js",
  "/workspace/swokei.js",
  "/workspace/sheets.js",
  "/workspace/ai_scout.js",
  "/workspace/settlements.js",
  "/workspace/telemetry.js",
  "/workspace/deal_closing.js",
  "/workspace/phone_shield.js",
  "/workspace/queue_engine.js",
  "/workspace/admin_console.js",
  "/workspace/in_call_workflow.js",
  "/workspace/auth_engine.js",
  "/workspace/persistence_engine.js",
  "/workspace/invitations.js",
  "/workspace/realtime_sync.js",
  "/workspace/manifest.json",
  "/shell.css",
  "/fonts.css",
  "/sfx_synth.js",
  "/favicon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn("[SW] Cache addAll warning:", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Skip caching for analytics, Firebase backend real-time endpoints, or chrome-extension URLs
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/") || url.hostname.includes("firebase")) {
    return;
  }

  // Network-first with cache fallback strategy for fresh data + instant offline resiliency
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;
        if (event.request.mode === "navigate") {
          return caches.match("/workspace/index.html");
        }
        return new Response("Offline", { status: 503, statusText: "Offline" });
      })
  );
});
