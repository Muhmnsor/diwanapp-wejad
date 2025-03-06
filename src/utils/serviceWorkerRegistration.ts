
/**
 * Service Worker Registration and Management Utilities
 */

// Clear Service Worker Cache
export const clearServiceWorkerCache = async (): Promise<void> => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('Service Worker cache cleared successfully');
      return Promise.resolve();
    } catch (error) {
      console.error('Error clearing Service Worker cache:', error);
      return Promise.reject(error);
    }
  } else {
    console.warn('Cache API not available in this browser');
    return Promise.resolve();
  }
};

// Update Service Worker
export const updateServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      // Unregister all service workers
      await Promise.all(
        registrations.map(registration => registration.unregister())
      );
      
      // Register the service worker again
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker updated successfully:', registration);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error updating Service Worker:', error);
      return Promise.reject(error);
    }
  } else {
    console.warn('Service Worker API not available in this browser');
    return Promise.resolve();
  }
};
