// KILL-SWITCH service worker.
//
// An earlier service worker (boy-cache-v1) cached index.html and the JS bundle,
// which trapped users on stale builds — new Vercel deployments never reached
// them. This version neutralizes any previously-installed service worker:
// it deletes every cache, unregisters itself, and reloads open tabs so they
// load fresh content directly from the network.
//
// Offline/PWA support can be reintroduced later once the deploy pipeline is
// stable; for now reliable updates matter more than an offline shell.

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 1. Nuke all caches left by previous service worker versions.
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))

      // 2. Take control of any open clients.
      await self.clients.claim()

      // 3. Unregister this service worker entirely.
      await self.registration.unregister()

      // 4. Reload every open tab so it re-fetches fresh assets from the network.
      const clients = await self.clients.matchAll({ type: 'window' })
      clients.forEach((client) => client.navigate(client.url))
    })()
  )
})

// Pass-through: never serve anything from cache.
self.addEventListener('fetch', () => {})
