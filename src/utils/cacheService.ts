
/**
 * Smart Caching Service
 * Provides multi-level caching capabilities to reduce server requests
 */

// Cache durations in milliseconds
export const CACHE_DURATIONS = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 4 * 60 * 60 * 1000, // 4 hours
  DAY: 24 * 60 * 60 * 1000, // 1 day
  WEEK: 7 * 24 * 60 * 60 * 1000, // 1 week
};

// Cache storage types
export type CacheStorage = 'memory' | 'local' | 'session';

// Cache entry structure
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

// In-memory cache store
const memoryCache: Record<string, CacheEntry<any>> = {};

/**
 * Set data in the specified cache storage
 */
export const setCacheData = <T>(
  key: string,
  data: T,
  duration: number = CACHE_DURATIONS.MEDIUM,
  storage: CacheStorage = 'memory'
): void => {
  const timestamp = Date.now();
  const cacheEntry: CacheEntry<T> = {
    data,
    timestamp,
    expiry: timestamp + duration,
  };

  // Cache in memory regardless of storage type for faster access
  memoryCache[key] = cacheEntry;

  // Also cache in browser storage if specified
  if (storage === 'local' || storage === 'session') {
    try {
      const storageObj = storage === 'local' ? localStorage : sessionStorage;
      storageObj.setItem(key, JSON.stringify(cacheEntry));
    } catch (error) {
      console.warn('Failed to cache in browser storage:', error);
    }
  }
};

/**
 * Get data from cache if valid, otherwise return null
 */
export const getCacheData = <T>(
  key: string,
  storage: CacheStorage = 'memory'
): T | null => {
  const now = Date.now();
  
  // First try memory cache (fastest)
  if (memoryCache[key] && memoryCache[key].expiry > now) {
    return memoryCache[key].data as T;
  }
  
  // If not in memory or expired, try browser storage if specified
  if (storage === 'local' || storage === 'session') {
    try {
      const storageObj = storage === 'local' ? localStorage : sessionStorage;
      const cacheJson = storageObj.getItem(key);
      
      if (cacheJson) {
        const cacheEntry = JSON.parse(cacheJson) as CacheEntry<T>;
        
        if (cacheEntry.expiry > now) {
          // Restore to memory cache for faster subsequent access
          memoryCache[key] = cacheEntry;
          return cacheEntry.data;
        }
        
        // Clean up expired cache
        storageObj.removeItem(key);
      }
    } catch (error) {
      console.warn('Failed to retrieve from browser storage:', error);
    }
  }
  
  return null;
};

/**
 * Remove data from all cache storages
 */
export const removeCacheData = (key: string): void => {
  delete memoryCache[key];
  
  try {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to remove from browser storage:', error);
  }
};

/**
 * Clear all cache entries that match a prefix
 */
export const clearCacheByPrefix = (prefix: string): void => {
  // Clear from memory cache
  Object.keys(memoryCache).forEach(key => {
    if (key.startsWith(prefix)) {
      delete memoryCache[key];
    }
  });
  
  // Clear from browser storage
  try {
    // LocalStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
    
    // SessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(prefix)) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear cache by prefix from browser storage:', error);
  }
};

/**
 * Get cache stats for monitoring
 */
export const getCacheStats = () => {
  const memoryCacheCount = Object.keys(memoryCache).length;
  let localStorageCount = 0;
  let sessionStorageCount = 0;
  
  try {
    localStorageCount = localStorage.length;
    sessionStorageCount = sessionStorage.length;
  } catch (error) {
    console.warn('Failed to get cache stats from browser storage:', error);
  }
  
  return {
    memoryCacheCount,
    localStorageCount,
    sessionStorageCount,
    totalCacheEntries: memoryCacheCount + localStorageCount + sessionStorageCount
  };
};
