import { useState, useEffect } from 'react';

export const useServiceWorkerUpdater = () => {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register the service worker using a root-relative path.
      // This is more robust than constructing an absolute URL with `new URL()`,
      // which can fail with "Invalid URL" errors in certain sandboxed environments
      // (like some IDEs or iframes) where `window.location.href` may not be a valid base URL.
      // The service worker file is expected to be at the root of the web server.
      const swUrl = '/service-worker.js';

      navigator.serviceWorker.register(swUrl)
        .then(registration => {
          // Listen for the updatefound event
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              // Listen for state changes on the installing worker
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  // A new service worker is installed and waiting
                  if (navigator.serviceWorker.controller) {
                    console.log('New update is available.');
                    setWaitingWorker(installingWorker);
                    setUpdateAvailable(true);
                  }
                }
              };
            }
          };
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  const refreshPage = () => {
    if (waitingWorker) {
      // Send a message to the waiting worker to activate immediately
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page once the new service worker has taken control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  };

  return { updateAvailable, refreshPage };
};
