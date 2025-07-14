import { useState, useEffect } from 'react';

export const useServiceWorkerUpdater = () => {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const registerServiceWorker = () => {
        // Vite will place the service-worker.js from the public directory
        // into the root of the build output.
        const swUrl = `/service-worker.js`;
        navigator.serviceWorker.register(swUrl)
          .then(registration => {
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      console.log('New update is available. Waiting for user to refresh.');
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
      };
      // Register the service worker after the page has loaded.
      window.addEventListener('load', registerServiceWorker);
      
      return () => {
        window.removeEventListener('load', registerServiceWorker);
      };
    }
  }, []);

  const refreshPage = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      // Reload the page once the new service worker has taken control.
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  };

  return { updateAvailable, refreshPage };
};