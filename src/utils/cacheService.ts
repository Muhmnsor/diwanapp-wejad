
import { compressData, decompressData, isCompressedData } from './cacheCompression';
import { notifyCacheUpdate, notifyCacheRemove, notifyCacheClear } from './realtimeCacheSync';

/**
 * Smart Caching Service - Enhanced
 * Provides multi-level caching capabilities with advanced features
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

// Cache item refresh strategy
export type RefreshStrategy = 'lazy' | 'background' | 'eager';

// Enhanced cache options
export type EnhancedCacheOptions = {
  useCompression?: boolean;
  compressionThreshold?: number;
  priority?: CachePriority;
  notifySync?: boolean;
  batchUpdate?: boolean;
  refreshStrategy?: RefreshStrategy;
  refreshThreshold?: number;
  onRefresh?: (key: string, oldData: any) => Promise<any>;
  concurrencyKey?: string;
  tags?: string[];
};

// Cache item priority
export type CachePriority = 'low' | 'normal' | 'high' | 'critical';

// Cache entry structure
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
  compressed?: boolean;
  priority?: CachePriority;
  lastAccessed?: number;
  accessCount?: number;
}

// Enhanced cache entry structure
interface EnhancedCacheEntry<T> extends CacheEntry<T> {
  refreshing?: boolean;
  refreshAttempts?: number;
  tags?: string[];
  concurrencyKey?: string;
  refreshStrategy?: RefreshStrategy;
  refreshThreshold?: number;
  lastRefreshCheck?: number;
}

// Materialized view entry structure
interface MaterializedViewEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
  queryKey: string[];
  parameters: Record<string, any>;
  refreshInterval: number;
  lastRefresh: number;
  refreshing: boolean;
  dependencies: string[];
}

// Partitioned query structure
interface PartitionedQueryEntry<T> {
  queryKey: string;
  totalItems: number;
  loadedChunks: Set<number>;
  chunkSize: number;
  lastAccessed: number;
  data: T[];
}

// Constant for materialized view refresh check interval
const MATERIALIZED_REFRESH_CHECK_INTERVAL = 60000; // 1 minute

// Maps for storing materialized views and partitioned queries
const materializedViews = new Map<string, MaterializedViewEntry<any>>();
let materializedViewsInterval: number | null = null;
const partitionedQueries = new Map<string, PartitionedQueryEntry<any>>();

// Cache statistics
interface EnhancedCacheStats {
  hits: number;
  misses: number;
  totalSize: number;
  compressionSavings: number;
  throttled: number;
  batchedUpdates: number;
  backgroundRefreshes: number;
  refreshFailures: number;
  priorityEvictions: Record<CachePriority, number>;
  tagBasedInvalidations: number;
  materialized: {
    views: number;
    hits: number;
    refreshes: number;
  };
  partitioned: {
    queries: number;
    chunks: number;
  };
}

// In-memory cache store
const memoryCache: Record<string, EnhancedCacheEntry<any>> = {};

// Cache statistics
const cacheStats: EnhancedCacheStats = {
  hits: 0,
  misses: 0,
  totalSize: 0,
  compressionSavings: 0,
  throttled: 0,
  batchedUpdates: 0,
  backgroundRefreshes: 0,
  refreshFailures: 0,
  priorityEvictions: {
    low: 0,
    normal: 0,
    high: 0,
    critical: 0
  },
  tagBasedInvalidations: 0,
  materialized: {
    views: 0,
    hits: 0,
    refreshes: 0
  },
  partitioned: {
    queries: 0,
    chunks: 0
  }
};

// Tracking for batched updates
const pendingUpdates: Map<string, { data: any, options: any }> = new Map();
let updateTimeout: number | null = null;
const UPDATE_THROTTLE = 200; // ms to throttle batched updates

// Background refresh queue
interface RefreshQueueItem {
  key: string;
  storage: CacheStorage;
  priority: CachePriority;
  onRefresh?: (key: string, oldData: any) => Promise<any>;
  timestamp: number;
}

const refreshQueue: RefreshQueueItem[] = [];
let refreshInterval: number | null = null;
const REFRESH_INTERVAL = 10000; // 10 seconds between refresh batches
const MAX_CONCURRENT_REFRESHES = 3;

// Concurrency tracking
const activeConcurrencyGroups: Set<string> = new Set();

// Tags system for grouped invalidation
const tagToKeysMap: Record<string, Set<string>> = {};

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
 * Set data in the specified cache storage with enhanced options
 */
export const setCacheData = <T>(
  key: string,
  data: T,
  duration: number = CACHE_DURATIONS.MEDIUM,
  storage: CacheStorage = 'memory',
  options: EnhancedCacheOptions = { 
    useCompression: true, 
    compressionThreshold: 1024,
    priority: 'normal',
    notifySync: true,
    batchUpdate: false,
    refreshStrategy: 'lazy',
    refreshThreshold: 75
  }
): void => {
  // Handle batched updates
  if (options.batchUpdate) {
    pendingUpdates.set(key, { data, options });
    
    if (!updateTimeout) {
      updateTimeout = window.setTimeout(() => {
        processBatchedUpdates();
      }, UPDATE_THROTTLE);
    }
    
    return;
  }
  
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
  
  const cacheEntry: EnhancedCacheEntry<T> = {
    data: storedData,
    timestamp,
    expiry: timestamp + duration,
    compressed,
    priority: options.priority || 'normal',
    lastAccessed: timestamp,
    accessCount: 1,
    refreshStrategy: options.refreshStrategy,
    refreshThreshold: options.refreshThreshold,
    tags: options.tags,
    concurrencyKey: options.concurrencyKey,
    lastRefreshCheck: timestamp
  };

  // Register tags if provided
  if (options.tags && options.tags.length > 0) {
    options.tags.forEach(tag => {
      if (!tagToKeysMap[tag]) {
        tagToKeysMap[tag] = new Set();
      }
      tagToKeysMap[tag].add(key);
    });
  }

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
          
          // If still failing, try to free up space by cleaning low priority items
          freeUpCacheSpace(storage, 20);
          
          try {
            const storageObj = storage === 'local' ? localStorage : sessionStorage;
            storageObj.setItem(key, JSON.stringify(cacheEntry));
          } catch (lastError) {
            console.error('Failed to cache even after pruning low priority items:', lastError);
          }
        }
      }
    }
  }
  
  // Notify other tabs/windows about the cache update
  if (options.notifySync !== false) {
    notifyCacheUpdate(key, data, storage);
  }
};

/**
 * Process all batched updates
 */
const processBatchedUpdates = (): void => {
  if (pendingUpdates.size > 0) {
    cacheStats.batchedUpdates += pendingUpdates.size;
    
    for (const [key, { data, options }] of pendingUpdates.entries()) {
      // Set cache but don't allow further batching
      setCacheData(key, data, options.duration || CACHE_DURATIONS.MEDIUM, 
                  options.storage || 'memory', 
                  { ...options, batchUpdate: false });
    }
    
    pendingUpdates.clear();
  }
  
  updateTimeout = null;
};

/**
 * Get data from cache if valid, otherwise return null
 * Enhanced with automatic refresh capabilities
 */
export const getCacheData = <T>(
  key: string,
  storage: CacheStorage = 'memory',
  options: {
    forceRefresh?: boolean;
    onRefresh?: (key: string, oldData: any) => Promise<any>;
  } = {}
): T | null => {
  const now = Date.now();
  
  // First try memory cache (fastest)
  if (memoryCache[key]) {
    const entry = memoryCache[key] as EnhancedCacheEntry<T>;
    
    // Still valid? Serve from cache
    if (entry.expiry > now) {
      cacheStats.hits++;
      localStorage.setItem('cache:stats', JSON.stringify(cacheStats));
      console.log(`Cache hit for ${key}`);
      
      // Update access statistics
      entry.lastAccessed = now;
      entry.accessCount = (entry.accessCount || 0) + 1;
      
      // Check if we should refresh in the background based on threshold
      const remainingTtl = entry.expiry - now;
      const totalTtl = entry.expiry - entry.timestamp;
      const percentageRemaining = (remainingTtl / totalTtl) * 100;
      
      if (
        !entry.refreshing && // Not already refreshing
        entry.refreshStrategy && // Has a refresh strategy
        entry.refreshStrategy !== 'lazy' && // Not lazy refresh
        entry.refreshThreshold && // Has a threshold
        percentageRemaining < entry.refreshThreshold && // Below threshold
        (entry.lastRefreshCheck === undefined || // Never checked or checked long ago
          now - (entry.lastRefreshCheck || 0) > 60000) // Don't check more than once per minute
      ) {
        entry.lastRefreshCheck = now;
        
        if (entry.refreshStrategy === 'background') {
          // Add to background refresh queue
          addToRefreshQueue(key, storage, entry.priority || 'normal', options.onRefresh);
        } else if (entry.refreshStrategy === 'eager') {
          // Immediately refresh if concurrency allows
          if (entry.concurrencyKey && activeConcurrencyGroups.has(entry.concurrencyKey)) {
            console.log(`Skipping eager refresh for ${key} due to concurrency constraints`);
          } else {
            // Track concurrency
            if (entry.concurrencyKey) {
              activeConcurrencyGroups.add(entry.concurrencyKey);
            }
            
            // Immediate async refresh
            refreshCacheEntry(key, storage, options.onRefresh)
              .finally(() => {
                if (entry.concurrencyKey) {
                  activeConcurrencyGroups.delete(entry.concurrencyKey);
                }
              });
          }
        }
      }
      
      // Handle decompression if needed
      if (entry.compressed) {
        // Fixed type issue: Ensure we're passing a string to decompressData
        return decompressData<T>(entry.data as unknown as string);
      }
      
      return entry.data as T;
    }
    
    // Cache exists but is expired, check if we're in force refresh mode
    if (options.forceRefresh && options.onRefresh) {
      // If there's a refresh function, use it to update cache
      try {
        refreshCacheEntry(key, storage, options.onRefresh);
      } catch (error) {
        console.error(`Error refreshing cache for ${key}:`, error);
      }
    }
  }
  
  // If not in memory or expired, try browser storage if specified
  if (storage === 'local' || storage === 'session') {
    try {
      const storageObj = storage === 'local' ? localStorage : sessionStorage;
      const cacheJson = storageObj.getItem(key);
      
      if (cacheJson) {
        const cacheEntry = JSON.parse(cacheJson) as EnhancedCacheEntry<any>;
        
        if (cacheEntry.expiry > now) {
          // Restore to memory cache for faster subsequent access
          memoryCache[key] = cacheEntry;
          
          // Update access statistics
          cacheEntry.lastAccessed = now;
          cacheEntry.accessCount = (cacheEntry.accessCount || 0) + 1;
          storageObj.setItem(key, JSON.stringify(cacheEntry));
          
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
        
        // Remove from tag mappings
        if (cacheEntry.tags) {
          cacheEntry.tags.forEach(tag => {
            if (tagToKeysMap[tag]) {
              tagToKeysMap[tag].delete(key);
              if (tagToKeysMap[tag].size === 0) {
                delete tagToKeysMap[tag];
              }
            }
          });
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
 * Add a cache entry to the background refresh queue
 */
const addToRefreshQueue = (
  key: string,
  storage: CacheStorage,
  priority: CachePriority,
  onRefresh?: (key: string, oldData: any) => Promise<any>
): void => {
  // Skip if already in the queue
  if (refreshQueue.some(item => item.key === key)) {
    return;
  }
  
  refreshQueue.push({
    key,
    storage,
    priority,
    onRefresh,
    timestamp: Date.now()
  });
  
  // Start refresh process if not already running
  if (refreshInterval === null) {
    refreshInterval = window.setInterval(processRefreshQueue, REFRESH_INTERVAL);
  }
  
  console.log(`Added ${key} to background refresh queue`);
};

/**
 * Process the background refresh queue
 */
const processRefreshQueue = async (): Promise<void> => {
  if (refreshQueue.length === 0) {
    // No items to refresh, stop the interval
    if (refreshInterval !== null) {
      window.clearInterval(refreshInterval);
      refreshInterval = null;
    }
    return;
  }
  
  // Sort by priority (high to low) and then by timestamp (oldest first)
  refreshQueue.sort((a, b) => {
    const priorityOrder = { 'critical': 3, 'high': 2, 'normal': 1, 'low': 0 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    
    if (priorityDiff !== 0) return priorityDiff;
    return a.timestamp - b.timestamp;
  });
  
  // Process a batch of items
  const batch = refreshQueue.splice(0, MAX_CONCURRENT_REFRESHES);
  
  console.log(`Processing ${batch.length} items from refresh queue`);
  
  const refreshPromises = batch.map(async item => {
    try {
      await refreshCacheEntry(item.key, item.storage, item.onRefresh);
    } catch (error) {
      console.error(`Failed to refresh ${item.key}:`, error);
      cacheStats.refreshFailures++;
    }
  });
  
  await Promise.all(refreshPromises);
};

/**
 * Refresh a single cache entry
 */
const refreshCacheEntry = async (
  key: string,
  storage: CacheStorage,
  onRefresh?: (key: string, oldData: any) => Promise<any>
): Promise<void> => {
  if (!onRefresh) {
    console.warn(`Cannot refresh ${key} without a refresh function`);
    return;
  }
  
  // Get current entry
  const entry = memoryCache[key] as EnhancedCacheEntry<any>;
  if (!entry) {
    console.warn(`Cannot refresh ${key} - entry not found in cache`);
    return;
  }
  
  // Mark as refreshing to prevent duplicate refreshes
  entry.refreshing = true;
  entry.refreshAttempts = (entry.refreshAttempts || 0) + 1;
  
  const originalData = entry.compressed ? decompressData(entry.data) : entry.data;
  
  try {
    console.log(`Refreshing cache entry: ${key}`);
    const freshData = await onRefresh(key, originalData);
    
    if (freshData !== undefined) {
      // Calculate new duration based on original
      const originalDuration = entry.expiry - entry.timestamp;
      
      // Store the fresh data
      setCacheData(
        key,
        freshData,
        originalDuration,
        storage,
        {
          useCompression: entry.compressed,
          priority: entry.priority,
          refreshStrategy: entry.refreshStrategy,
          refreshThreshold: entry.refreshThreshold,
          tags: entry.tags,
          concurrencyKey: entry.concurrencyKey
        }
      );
      
      cacheStats.backgroundRefreshes++;
      localStorage.setItem('cache:stats', JSON.stringify(cacheStats));
    }
  } catch (error) {
    console.error(`Error refreshing cache for ${key}:`, error);
    cacheStats.refreshFailures++;
    
    // Clear refreshing flag
    entry.refreshing = false;
  }
};

/**
 * Remove data from all cache storages
 */
export const removeCacheData = (key: string, notify: boolean = true): void => {
  const entry = memoryCache[key] as EnhancedCacheEntry<any>;
  
  // Remove from tags mapping
  if (entry && entry.tags) {
    entry.tags.forEach(tag => {
      if (tagToKeysMap[tag]) {
        tagToKeysMap[tag].delete(key);
        if (tagToKeysMap[tag].size === 0) {
          delete tagToKeysMap[tag];
        }
      }
    });
  }
  
  delete memoryCache[key];
  
  try {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to remove from browser storage:', error);
  }
  
  // Notify other tabs/windows
  if (notify) {
    notifyCacheRemove(key);
  }
};

/**
 * Invalidate cache entries by tag
 */
export const invalidateCacheByTag = (tag: string): number => {
  if (!tagToKeysMap[tag]) {
    return 0;
  }
  
  const keys = Array.from(tagToKeysMap[tag]);
  console.log(`Invalidating ${keys.length} cache entries with tag: ${tag}`);
  
  keys.forEach(key => {
    removeCacheData(key);
  });
  
  cacheStats.tagBasedInvalidations += keys.length;
  return keys.length;
};

/**
 * Clear cache items by prefix
 */
export const clearCacheByPrefix = (prefix: string): number => {
  let itemsRemoved = 0;
  
  // Clear from memory cache
  Object.keys(memoryCache).forEach(key => {
    if (key.startsWith(prefix)) {
      delete memoryCache[key];
      itemsRemoved++;
      
      // Remove from tag mappings if present
      const entry = memoryCache[key] as EnhancedCacheEntry<any>;
      if (entry && entry.tags) {
        entry.tags.forEach(tag => {
          if (tagToKeysMap[tag]) {
            tagToKeysMap[tag].delete(key);
            if (tagToKeysMap[tag].size === 0) {
              delete tagToKeysMap[tag];
            }
          }
        });
      }
    }
  });
  
  // Clear from localStorage and sessionStorage
  try {
    // Clear from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        localStorage.removeItem(key);
        itemsRemoved++;
        i--; // Adjust index since we removed an item
      }
    }
    
    // Clear from sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(prefix)) {
        sessionStorage.removeItem(key);
        itemsRemoved++;
        i--; // Adjust index since we removed an item
      }
    }
  } catch (error) {
    console.warn('Error clearing cache by prefix:', error);
  }
  
  // Notify other tabs/windows
  notifyCacheClear(prefix);
  
  console.log(`Cleared ${itemsRemoved} cache items with prefix: ${prefix}`);
  return itemsRemoved;
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
              i--; // Adjust index since we removed an item
              
              // Also remove from memory cache and tag mappings if present
              if (memoryCache[key]) {
                const entry = memoryCache[key] as EnhancedCacheEntry<any>;
                if (entry.tags) {
                  entry.tags.forEach(tag => {
                    if (tagToKeysMap[tag]) {
                      tagToKeysMap[tag].delete(key);
                      if (tagToKeysMap[tag].size === 0) {
                        delete tagToKeysMap[tag];
                      }
                    }
                  });
                }
                delete memoryCache[key];
              }
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
 * Free up space by removing low priority cache items
 */
export const freeUpCacheSpace = (storage: 'local' | 'session', percentToRemove: number = 10): number => {
  let itemsRemoved = 0;
  
  try {
    const storageObj = storage === 'local' ? localStorage : sessionStorage;
    const items: Array<{ 
      key: string, 
      priority: CachePriority, 
      lastAccessed: number, 
      accessCount: number,
      size: number
    }> = [];
    
    // Collect items with their priority and access info
    for (let i = 0; i < storageObj.length; i++) {
      const key = storageObj.key(i);
      if (key) {
        const item = storageObj.getItem(key);
        if (item && item.startsWith('{')) {
          try {
            const parsed = JSON.parse(item) as EnhancedCacheEntry<any>;
            items.push({
              key,
              priority: parsed.priority || 'normal',
              lastAccessed: parsed.lastAccessed || 0,
              accessCount: parsed.accessCount || 0,
              size: item.length
            });
          } catch (e) {
            // Skip invalid items
          }
        }
      }
    }
    
    // Sort items by priority (low first) and then by last accessed time (oldest first)
    // and access count (least accessed first)
    items.sort((a, b) => {
      const priorityOrder = { 'low': 0, 'normal': 1, 'high': 2, 'critical': 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // If same priority, sort by access time and count
      // More recently accessed and frequently accessed items have higher value
      const accessScore = (item) => {
        return item.lastAccessed + (item.accessCount * 60000); // Add 1 min per access count
      };
      
      return accessScore(a) - accessScore(b);
    });
    
    // Calculate how many items to remove
    const toRemove = Math.ceil(items.length * (percentToRemove / 100));
    const priorityCounts: Record<CachePriority, number> = { low: 0, normal: 0, high: 0, critical: 0 };
    
    // Remove the calculated number of lowest priority items
    items.slice(0, toRemove).forEach(item => {
      storageObj.removeItem(item.key);
      
      // Also remove from memory cache and tag mappings if present
      if (memoryCache[item.key]) {
        const entry = memoryCache[item.key] as EnhancedCacheEntry<any>;
        if (entry.tags) {
          entry.tags.forEach(tag => {
            if (tagToKeysMap[tag]) {
              tagToKeysMap[tag].delete(item.key);
              if (tagToKeysMap[tag].size === 0) {
                delete tagToKeysMap[tag];
              }
            }
          });
        }
        delete memoryCache[item.key];
      }
      
      itemsRemoved++;
      priorityCounts[item.priority]++;
    });
    
    // Update statistics
    Object.entries(priorityCounts).forEach(([priority, count]) => {
      cacheStats.priorityEvictions[priority as CachePriority] += count;
    });
    
    console.log(`Freed up space by removing ${itemsRemoved} cache items (${priorityCounts.low} low, ${priorityCounts.normal} normal, ${priorityCounts.high} high, ${priorityCounts.critical} critical priority)`);
  } catch (error) {
    console.warn('Error freeing up cache space:', error);
  }
  
  return itemsRemoved;
};

/**
 * Create a materialized view for frequently accessed data
 * Materialized views are pre-computed and regularly refreshed datasets
 */
export const createMaterializedView = <T>(
  viewName: string,
  queryFn: () => Promise<T>,
  options: {
    parameters?: Record<string, any>;
    refreshInterval?: number;
    queryKey?: string[];
    dependencies?: string[];
    initialData?: T;
  } = {}
): void => {
  const {
    parameters = {},
    refreshInterval = 5 * 60 * 1000, // 5 minutes default
    queryKey = [viewName],
    dependencies = [],
    initialData
  } = options;
  
  // Create a unique key for this view
  const viewKey = `materialized:${viewName}:${JSON.stringify(parameters)}`;
  
  // Start with initial data if provided
  if (initialData) {
    materializedViews.set(viewKey, {
      data: initialData,
      timestamp: Date.now(),
      expiry: Date.now() + refreshInterval,
      queryKey,
      parameters,
      refreshInterval,
      lastRefresh: Date.now(),
      refreshing: false,
      dependencies
    });
  }
  
  // Start the refresh process
  refreshMaterializedView(viewKey, queryFn);
  
  // Set up the refresh interval checker if not already running
  if (materializedViewsInterval === null) {
    materializedViewsInterval = window.setInterval(() => {
      checkMaterializedViewsRefresh();
    }, MATERIALIZED_REFRESH_CHECK_INTERVAL);
  }
  
  cacheStats.materialized.views++;
};

/**
 * Refresh a materialized view
 */
const refreshMaterializedView = async <T>(
  viewKey: string,
  queryFn: () => Promise<T>
): Promise<void> => {
  const view = materializedViews.get(viewKey);
  
  if (!view) return;
  
  // Skip if already refreshing
  if (view.refreshing) return;
  
  try {
    view.refreshing = true;
    const freshData = await queryFn();
    
    materializedViews.set(viewKey, {
      ...view,
      data: freshData,
      timestamp: Date.now(),
      expiry: Date.now() + view.refreshInterval,
      lastRefresh: Date.now(),
      refreshing: false
    });
    
    cacheStats.materialized.refreshes++;
    console.log(`Materialized view refreshed: ${viewKey}`);
  } catch (error) {
    console.error(`Error refreshing materialized view ${viewKey}:`, error);
    view.refreshing = false;
  }
};

/**
 * Check if any materialized views need refreshing
 */
const checkMaterializedViewsRefresh = () => {
  const now = Date.now();
  let refreshedCount = 0;
  
  materializedViews.forEach((view, viewKey) => {
    // Skip if already refreshing
    if (view.refreshing) return;
    
    // Check if it's time to refresh
    if (now >= view.expiry) {
      // We don't have the query function here, so we'll mark it as needing refresh
      // The next time getMaterializedView is called, it will refresh
      view.expiry = 0;
      refreshedCount++;
    }
  });
  
  if (refreshedCount > 0) {
    console.log(`Marked ${refreshedCount} materialized views for refresh`);
  }
};

/**
 * Get data from a materialized view
 */
export const getMaterializedView = async <T>(
  viewName: string,
  queryFn: () => Promise<T>,
  parameters: Record<string, any> = {},
  forceRefresh: boolean = false
): Promise<T> => {
  const viewKey = `materialized:${viewName}:${JSON.stringify(parameters)}`;
  const view = materializedViews.get(viewKey);
  
  // If view exists and is valid, return it
  if (view && !forceRefresh && view.expiry > Date.now()) {
    cacheStats.materialized.hits++;
    return view.data as T;
  }
  
  // View doesn't exist or needs refresh
  await refreshMaterializedView(viewKey, queryFn);
  
  // Return the refreshed view or throw if it fails
  const refreshedView = materializedViews.get(viewKey);
  if (!refreshedView) {
    throw new Error(`Failed to get materialized view: ${viewName}`);
  }
  
  return refreshedView.data as T;
};

/**
 * Create a partitioned query for large datasets
 * Allows loading data in chunks for better performance
 */
export const createPartitionedQuery = <T>(
  queryKey: string,
  totalItems: number,
  chunkSize: number = 50
): string => {
  const partitionKey = `partition:${queryKey}`;
  
  partitionedQueries.set(partitionKey, {
    queryKey,
    totalItems,
    loadedChunks: new Set(),
    chunkSize,
    lastAccessed: Date.now(),
    data: new Array(totalItems)
  });
  
  cacheStats.partitioned.queries++;
  
  return partitionKey;
};

/**
 * Add data to a partitioned query
 */
export const updatePartitionedQuery = <T>(
  partitionKey: string,
  chunkIndex: number,
  data: T[]
): void => {
  const partition = partitionedQueries.get(partitionKey);
  if (!partition) return;
  
  const startIndex = chunkIndex * partition.chunkSize;
  
  // Update the data
  for (let i = 0; i < data.length; i++) {
    if (startIndex + i < partition.totalItems) {
      partition.data[startIndex + i] = data[i];
    }
  }
  
  // Mark this chunk as loaded
  partition.loadedChunks.add(chunkIndex);
  partition.lastAccessed = Date.now();
  
  cacheStats.partitioned.chunks++;
};

/**
 * Get data from a partitioned query
 */
export const getPartitionedQueryData = <T>(
  partitionKey: string
): T[] => {
  const partition = partitionedQueries.get(partitionKey);
  if (!partition) return [];
  
  partition.lastAccessed = Date.now();
  return partition.data.filter(item => item !== undefined) as T[];
};

/**
 * Get information about a partitioned query
 */
export const getPartitionedQueryInfo = (
  partitionKey: string
): {
  totalItems: number;
  loadedItems: number;
  chunkSize: number;
  totalChunks: number;
  loadedChunks: number;
} | null => {
  const partition = partitionedQueries.get(partitionKey);
  if (!partition) return null;
  
  const totalChunks = Math.ceil(partition.totalItems / partition.chunkSize);
  
  return {
    totalItems: partition.totalItems,
    loadedItems: partition.data.filter(item => item !== undefined).length,
    chunkSize: partition.chunkSize,
    totalChunks,
    loadedChunks: partition.loadedChunks.size
  };
};

/**
 * Clean up unused partitioned queries
 */
export const cleanupPartitionedQueries = (
  maxAge: number = 15 * 60 * 1000 // 15 minutes
): number => {
  const now = Date.now();
  let removed = 0;
  
  partitionedQueries.forEach((partition, key) => {
    if (now - partition.lastAccessed > maxAge) {
      partitionedQueries.delete(key);
      removed++;
    }
  });
  
  return removed;
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
    totalSize: cacheStats.totalSize,
    throttledUpdates: cacheStats.throttled,
    batchedUpdates: cacheStats.batchedUpdates,
    backgroundRefreshes: cacheStats.backgroundRefreshes,
    refreshFailures: cacheStats.refreshFailures,
    priorityEvictions: cacheStats.priorityEvictions,
    tagBasedInvalidations: cacheStats.tagBasedInvalidations,
    materializedViews: {
      count: materializedViews.size,
      hits: cacheStats.materialized.hits,
      refreshes: cacheStats.materialized.refreshes
    },
    partitionedQueries: {
      count: partitionedQueries.size,
      chunks: cacheStats.partitioned.chunks
    }
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
  cacheStats.throttled = 0;
  cacheStats.batchedUpdates = 0;
  cacheStats.backgroundRefreshes = 0;
  cacheStats.refreshFailures = 0;
  cacheStats.priorityEvictions = {
    low: 0,
    normal: 0,
    high: 0,
    critical: 0
  };
  cacheStats.tagBasedInvalidations = 0;
  
  try {
    localStorage.setItem('cache:stats', JSON.stringify(cacheStats));
  } catch (error) {
    console.warn('Failed to reset cache stats in localStorage:', error);
  }
};

/**
 * Register cache event listeners
 */
const registerCacheListeners = (): void => {
  // Listen for online/offline events to optimize sync behavior
  window.addEventListener('online', () => {
    console.log('Back online - syncing cache');
    // TODO: Implement network state recovery logic
  });
  
  window.addEventListener('offline', () => {
    console.log('Network offline - operating in offline mode');
    // TODO: Implement offline mode optimizations
  });
};

// Start the background refresh process
if (refreshQueue.length > 0 && refreshInterval === null) {
  refreshInterval = window.setInterval(processRefreshQueue, REFRESH_INTERVAL);
}

// Initialize event listeners
registerCacheListeners();

// Set up automatic cleanup of unused data
setInterval(() => {
  const removedPartitions = cleanupPartitionedQueries();
  if (removedPartitions > 0) {
    console.log(`Cleaned up ${removedPartitions} unused partitioned queries`);
  }
}, 30 * 60 * 1000); // Check every 30 minutes
