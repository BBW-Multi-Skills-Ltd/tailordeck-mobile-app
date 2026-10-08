// Removes the old TailorDeck web-app service worker from browsers that installed the former PWA.
// TailorDeck now ships through Google Play; the website registers no service worker.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', () => {
  self.registration
    .unregister()
    .then(() => self.clients.matchAll())
    .then((clients) => clients.forEach((client) => client.navigate(client.url)))
})
