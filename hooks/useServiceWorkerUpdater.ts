import { useState, useEffect } from 'react';

export const useServiceWorkerUpdater = () => {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const registerServiceWorker = () => {
        // Construct an absolute URL for the service worker to prevent issues in
        // sandboxed environments where relative paths or base URLs can be misleading.
        // Using `window.location.origin` ensures the path is resolved against the
        // correct origin of the application.
        const swUrl = `${window.location.origin}/service-worker.js`;
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

      // Delay registration until after the page has fully loaded.
      // This is the standard practice and avoids "document is in an invalid state" errors.
      window.addEventListener('load', registerServiceWorker);

      // Cleanup the event listener when the component unmounts.
      return () => {
        window.removeEventListener('load', registerServiceWorker);
      };
    }
  }, []);

  const refreshPage = () => {
    if (waitingWorker) {
      // Send a message to the waiting worker to skip the waiting phase
      // and activate immediately.
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page once the new service worker has taken control.
      // The 'controllerchange' event fires when the document's service worker
      // has been replaced.
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  };

  return { updateAvailable, refreshPage };
};
