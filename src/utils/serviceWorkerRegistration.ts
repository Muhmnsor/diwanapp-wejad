
/**
 * Service Worker Registration Utility
 * Handles registration and updates for the service worker
 */

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker registered successfully:', registration.scope);
      
      // Check if there's a new service worker waiting
      if (registration.waiting) {
        console.log('New Service Worker waiting');
      }
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New Service Worker installed and waiting');
              // You could trigger a UI notification here to let user refresh the page
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  } else {
    console.log('Service Workers not supported in this browser');
    return null;
  }
};

/**
 * Trigger service worker update
 */
export const updateServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      console.log('Service Worker update triggered');
    }
  }
};

/**
 * Force the waiting service worker to become active
 */
export const activateWaitingServiceWorker = (): void => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
  }
};

/**
 * Clear the cache managed by the service worker
 */
export const clearServiceWorkerCache = async (): Promise<string> => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.result);
      };
      
      navigator.serviceWorker.controller.postMessage(
        { action: 'clearCache' },
        [messageChannel.port2]
      );
    });
  }
  
  return 'No active service worker found';
};
