const CACHE_NAME = "studyfy-shell-v3";
const SHELL_ASSETS = ["/icons/icon-192.svg", "/icons/icon-512.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((oldKey) => caches.delete(oldKey))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache on localhost dev server or API/Storage endpoints
  if (
    request.method !== "GET" ||
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.pathname.includes("/storage/v1/") ||
    url.pathname.includes("/auth/v1/") ||
    url.pathname.includes("/rest/v1/")
  ) {
    return;
  }

  // Network-first with cache fallback for icons only
  if (url.pathname.startsWith("/icons/")) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
  }
});
