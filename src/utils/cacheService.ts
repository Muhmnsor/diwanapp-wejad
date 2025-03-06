
import { compressData, decompressData, isCompressedData } from './cacheCompression';

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

// Cache compression options
export type CacheCompressionOptions = {
  useCompression?: boolean;
  compressionThreshold?: number; // Size in bytes above which to compress
};

// Cache entry structure
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
  compressed?: boolean;
}

// Cache statistics
interface CacheStats {
  hits: number;
  misses: number;
  totalSize: number;
  compressionSavings: number;
}

// In-memory cache store
const memoryCache: Record<string, CacheEntry<any>> = {};

// Cache statistics
const cacheStats: CacheStats = {
  hits: 0,
  misses: 0,
  totalSize: 0,
  compressionSavings: 0
};

// Initialize stats from localStorage
try {
  const storedStats = localStorage.getItem('cache:stats');
  if (storedStats) {
    Object.assign(cacheStats, JSON.parse(storedStats));
  }
} catch (error) {
  console.warn('Failed to load cache stats from localStorage');
}

/**
 * Set data in the specified cache storage
 */
export const setCacheData = <T>(
  key: string,
  data: T,
  duration: number = CACHE_DURATIONS.MEDIUM,
  storage: CacheStorage = 'memory',
  options: CacheCompressionOptions = { useCompression: true, compressionThreshold: 1024 }
): void => {
  const timestamp = Date.now();
  let storedData = data;
  let compressed = false;
  
  // Handle compression if enabled
  if (options.useCompression) {
    const dataString = JSON.stringify(data);
    if (dataString.length > (options.compressionThreshold || 1024)) {
      storedData = compressData(dataString) as any;
      compressed = true;
      
      // Update compression statistics
      try {
        const originalSize = new Blob([dataString]).size;
        const compressedSize = new Blob([storedData as string]).size;
        cacheStats.compressionSavings += (originalSize - compressedSize);
        cacheStats.totalSize += compressedSize;
        
        // Save stats
        localStorage.setItem('cache:stats', JSON.stringify(cacheStats));
      } catch (error) {
        console.warn('Could not update compression statistics', error);
      }
    }
  }
  
  const cacheEntry: CacheEntry<T> = {
    data: storedData,
    timestamp,
    expiry: timestamp + duration,
    compressed
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
      
      // If we hit a storage limit, try to clean up expired items
      if (error.name === 'QuotaExceededError') {
        cleanupExpiredItems(storage);
        
        // Try again after cleanup
        try {
          const storageObj = storage === 'local' ? localStorage : sessionStorage;
          storageObj.setItem(key, JSON.stringify(cacheEntry));
        } catch (innerError) {
          console.error('Still failed to cache after cleanup:', innerError);
        }
      }
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
    cacheStats.hits++;
    localStorage.setItem('cache:stats', JSON.stringify(cacheStats));
    console.log(`Cache hit for ${key}`);
    
    const entry = memoryCache[key];
    
    // Handle decompression if needed
    if (entry.compressed) {
      return decompressData<T>(entry.data);
    }
    
    return entry.data as T;
  }
  
  // If not in memory or expired, try browser storage if specified
  if (storage === 'local' || storage === 'session') {
    try {
      const storageObj = storage === 'local' ? localStorage : sessionStorage;
      const cacheJson = storageObj.getItem(key);
      
      if (cacheJson) {
        const cacheEntry = JSON.parse(cacheJson) as CacheEntry<any>;
        
        if (cacheEntry.expiry > now) {
          // Restore to memory cache for faster subsequent access
          memoryCache[key] = cacheEntry;
          
          cacheStats.hits++;
          localStorage.setItem('cache:stats', JSON.stringify(cacheStats));
          console.log(`Cache hit for ${key}`);
          
          // Handle decompression if needed
          if (cacheEntry.compressed) {
            return decompressData<T>(cacheEntry.data);
          }
          
          return cacheEntry.data as T;
        }
        
        // Clean up expired cache
        storageObj.removeItem(key);
        if (memoryCache[key]) {
          delete memoryCache[key];
        }
      }
    } catch (error) {
      console.warn('Failed to retrieve from browser storage:', error);
    }
  }
  
  cacheStats.misses++;
  localStorage.setItem('cache:stats', JSON.stringify(cacheStats));
  console.log(`Cache miss for ${key}`);
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
 * Clean up expired items in storage to free up space
 */
export const cleanupExpiredItems = (storage: 'local' | 'session'): number => {
  const now = Date.now();
  let itemsRemoved = 0;
  
  try {
    const storageObj = storage === 'local' ? localStorage : sessionStorage;
    
    for (let i = 0; i < storageObj.length; i++) {
      const key = storageObj.key(i);
      if (key) {
        const item = storageObj.getItem(key);
        if (item && item.startsWith('{')) {
          try {
            const parsed = JSON.parse(item);
            if (parsed.expiry && parsed.expiry < now) {
              storageObj.removeItem(key);
              itemsRemoved++;
            }
          } catch (e) {
            // Not a valid cache entry, skip
          }
        }
      }
    }
  } catch (error) {
    console.warn('Error cleaning up expired items:', error);
  }
  
  return itemsRemoved;
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
    totalCacheEntries: memoryCacheCount + localStorageCount + sessionStorageCount,
    cacheHits: cacheStats.hits,
    cacheMisses: cacheStats.misses,
    cacheHitRatio: cacheStats.hits + cacheStats.misses === 0 ? 0 : 
      Math.round((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100),
    compressionSavings: cacheStats.compressionSavings,
    totalSize: cacheStats.totalSize
  };
};

/**
 * Reset cache statistics
 */
export const resetCacheStats = (): void => {
  cacheStats.hits = 0;
  cacheStats.misses = 0;
  cacheStats.compressionSavings = 0;
  cacheStats.totalSize = 0;
  
  try {
    localStorage.setItem('cache:stats', JSON.stringify(cacheStats));
  } catch (error) {
    console.warn('Failed to reset cache stats in localStorage:', error);
  }
};
