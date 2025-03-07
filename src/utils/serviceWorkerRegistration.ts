
/**
 * Enhanced Service Worker Registration and Management Utilities
 * Provides advanced caching and offline support
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
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // Don't use cached version of service worker
      });
      
      // Force update
      await registration.update();
      
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

// Register Service Worker
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      
      // Check if an update is available immediately
      await registration.update();
      
      // Set up periodic update checks
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Check for updates every hour
      
      console.log('Service Worker registered successfully:', registration);
      
      // Add event listeners for state changes
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            console.log('Service Worker state changed:', newWorker.state);
          });
        }
      });
      
      // Handle controller change (when a new service worker takes over)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker controller changed');
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error registering Service Worker:', error);
      return Promise.reject(error);
    }
  } else {
    console.warn('Service Worker API not available in this browser');
    return Promise.resolve();
  }
};

// Prefetch resources for offline use
export const prefetchResourcesForOffline = async (
  resources: string[]
): Promise<void> => {
  if ('caches' in window) {
    try {
      const cache = await caches.open('app-offline-cache');
      await cache.addAll(resources);
      console.log('Resources prefetched for offline use');
      return Promise.resolve();
    } catch (error) {
      console.error('Error prefetching resources:', error);
      return Promise.reject(error);
    }
  } else {
    console.warn('Cache API not available in this browser');
    return Promise.resolve();
  }
};

// Check if a service worker is active
export const isServiceWorkerActive = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      return registrations.length > 0;
    } catch (error) {
      console.error('Error checking service worker status:', error);
      return false;
    }
  }
  return false;
};

// Get cache usage statistics
export const getCacheUsageStats = async (): Promise<{ 
  cacheNames: string[]; 
  totalSize: number;
  itemCount: number;
}> => {
  if ('caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const cacheNames = await caches.keys();
      const storageEstimate = await navigator.storage.estimate();
      
      let itemCount = 0;
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        itemCount += keys.length;
      }
      
      return {
        cacheNames,
        totalSize: storageEstimate.usage || 0,
        itemCount
      };
    } catch (error) {
      console.error('Error getting cache usage stats:', error);
      return {
        cacheNames: [],
        totalSize: 0,
        itemCount: 0
      };
    }
  }
  
  return {
    cacheNames: [],
    totalSize: 0,
    itemCount: 0
  };
};
