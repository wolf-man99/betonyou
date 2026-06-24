// Minimal service worker for "add to home screen" + offline shell.
// Bump CACHE_VERSION on every production deploy so stale index.html is never served.
const CACHE_VERSION = 'v2'
const CACHE = `boy-cache-${CACHE_VERSION}`

// Only cache static assets — NOT index.html (it's fetched network-first so
// new Vercel deployments reach users immediately).
const PRECACHE = ['/manifest.json', '/icons/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return

  const url = new URL(request.url)
  const isHtml = url.pathname === '/' || url.pathname.endsWith('.html')

  if (isHtml) {
    // Network-first for HTML so new deployments are picked up immediately.
    // Falls back to cache only when offline.
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {})
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Cache-first for all other same-origin assets (JS/CSS have content hashes).
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {})
          return response
        })
        .catch(() => cached)
      return cached || networkFetch
    })
  )
})
