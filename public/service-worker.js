// This is a minimal service worker to enable the PWA update notification feature.
// It doesn't perform caching, focusing solely on the update lifecycle.
// Any change in this file (even a comment) will trigger a browser update check.

self.addEventListener('install', (event) => {
  console.log('Service Worker: installing...');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: activating...');
});

self.addEventListener('fetch', (event) => {
  // This service worker doesn't intercept fetch events.
  // It lets the browser handle them as it would without a service worker.
  event.respondWith(fetch(event.request));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});