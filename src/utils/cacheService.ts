import { compressData, decompressData, isCompressedData } from './cacheCompression';
import { notifyCacheUpdate, notifyCacheRemove, notifyCacheClear } from './realtimeCacheSync';

// Cache duration constants in milliseconds
export const CACHE_DURATIONS = {
  VERY_SHORT: 30 * 1000, // 30 seconds
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 2 * 60 * 60 * 1000, // 2 hours
  VERY_LONG: 12 * 60 * 60 * 1000, // 12 hours
  DAY: 24 * 60 * 60 * 1000, // 24 hours
  WEEK: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// Supported storage types
export type CacheStorage = 'memory' | 'local' | 'session';

// Cache priority levels for resource management
export type CachePriority = 'low' | 'normal' | 'high' | 'critical';

// Refresh strategies
export type RefreshStrategy = 'eager' | 'lazy' | 'none';

// Cache entry structure
interface CacheEntry<T> {
  key: string;
  data: T | string; // Raw or compressed data
  timestamp: number;
  expiry: number;
  useCompression: boolean;
  compressionThreshold: number;
  priority: CachePriority;
  tags: string[];
  isCompressed?: boolean;
  refreshStrategy: RefreshStrategy;
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
  loadedChunks: number | Set<number>;
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
  memoryUsage: number;
  entryCount: number;
  hitCount: number;
  missCount: number;
  evictionCount: number;
  compressionSavings: number;
  oldestEntry: number;
  newestEntry: number;
  avgAccessTime: number;
  priorityDistribution: Record<CachePriority, number>;
  storageDistribution: Record<CacheStorage, number>;
  tagFrequency: Record<string, number>;
  refreshCounts: Record<RefreshStrategy, number>;
}

// In-memory cache
const memoryCache = new Map<string, CacheEntry<any>>();

// Function to determine the storage object based on CacheStorage type
const getStorageObject = (storageType: CacheStorage): Storage | Map<string, CacheEntry<any>> => {
  if (storageType === 'local') {
    return localStorage;
  } else if (storageType === 'session') {
    return sessionStorage;
  } else {
    return memoryCache;
  }
};

// Function to check if the storage type is in-memory
const isInMemoryStorage = (storageType: CacheStorage): boolean => {
  return storageType === 'memory';
};

// Function to set data in the cache
export const setCacheData = async <T>(
  key: string,
  data: T,
  duration: number,
  storageType: CacheStorage = 'memory',
  options: {
    useCompression?: boolean;
    compressionThreshold?: number;
    priority?: CachePriority;
    batchUpdate?: boolean;
    tags?: string[];
    refreshStrategy?: RefreshStrategy;
    refreshThreshold?: number;
    concurrencyKey?: string;
  } = {}
): Promise<void> => {
  const {
    useCompression = true,
    compressionThreshold = 1024,
    priority = 'normal',
    batchUpdate = true,
    tags = [],
    refreshStrategy = 'lazy',
    refreshThreshold = 75,
    concurrencyKey
  } = options;

  const storage = getStorageObject(storageType);
  const expiry = Date.now() + duration;
  let dataToStore: T | string = data;
  let isCompressed = false;

  if (useCompression && JSON.stringify(data).length > compressionThreshold) {
    try {
      dataToStore = await compressData(data);
      isCompressed = true;
    } catch (error) {
      console.warn(`Compression failed for key ${key}. Storing uncompressed.`, error);
      useCompression = false; // Disable compression if it fails
    }
  }

  const cacheEntry: CacheEntry<T> = {
    key,
    data: dataToStore,
    timestamp: Date.now(),
    expiry,
    useCompression,
    compressionThreshold,
    priority,
    tags,
    isCompressed,
    refreshStrategy,
    refreshThreshold,
    lastRefreshCheck: Date.now()
  };

  if (isInMemoryStorage(storageType)) {
    (storage as Map<string, CacheEntry<T>>).set(key, cacheEntry);
  } else {
    (storage as Storage).setItem(key, JSON.stringify(cacheEntry));
  }

  if (batchUpdate) {
    notifyCacheUpdate(key, storageType);
  } else {
    // Optionally, handle immediate cache update notification
  }
};

// Function to retrieve data from the cache
export const getCacheData = <T>(
  key: string,
  storageType: CacheStorage = 'memory',
  options: {
    onRefresh?: (key: string, oldData: T) => Promise<T | undefined>;
  } = {}
): T | undefined => {
  const { onRefresh } = options;
  const storage = getStorageObject(storageType);
  let cacheEntry: CacheEntry<T> | null = null;

  if (isInMemoryStorage(storageType)) {
    cacheEntry = (storage as Map<string, CacheEntry<T>>).get(key) || null;
  } else {
    const storedItem = (storage as Storage).getItem(key);
    cacheEntry = storedItem ? JSON.parse(storedItem) : null;
  }

  if (!cacheEntry) {
    return undefined;
  }

  if (Date.now() > cacheEntry.expiry) {
    // Cache expired, remove it
    removeCacheData(key, storageType);
    return undefined;
  }

  let data = cacheEntry.data as T;

  if (cacheEntry.useCompression && cacheEntry.isCompressed) {
    try {
      data = decompressData(cacheEntry.data as string) as T;
    } catch (error) {
      console.warn(`Decompression failed for key ${key}. Returning undefined.`, error);
      return undefined;
    }
  }

  // Handle background refresh
  if (onRefresh && cacheEntry.refreshStrategy !== 'none') {
    const now = Date.now();
    const timeSinceLastCheck = now - (cacheEntry.lastRefreshCheck || 0);
    const refreshInterval = CACHE_DURATIONS.MEDIUM * (cacheEntry.refreshThreshold || 75) / 100;

    if (timeSinceLastCheck > refreshInterval) {
      cacheEntry.lastRefreshCheck = now;
      
      // Update the cache entry in-memory
      if (isInMemoryStorage(storageType)) {
        (storage as Map<string, CacheEntry<T>>).set(key, cacheEntry);
      } else {
        (storage as Storage).setItem(key, JSON.stringify(cacheEntry));
      }

      // Perform the refresh
      if (cacheEntry.refreshStrategy === 'eager') {
        // Eager refresh: refresh immediately
        console.log(`Eagerly refreshing cache for ${key}`);
        onRefresh(key, data)
          .then(freshData => {
            if (freshData !== undefined) {
              setCacheData(key, freshData, cacheEntry.expiry - Date.now(), storageType, {
                useCompression: cacheEntry.useCompression,
                compressionThreshold: cacheEntry.compressionThreshold,
                priority: cacheEntry.priority,
                tags: cacheEntry.tags,
                refreshStrategy: cacheEntry.refreshStrategy,
                refreshThreshold: cacheEntry.refreshThreshold
              });
            }
          })
          .catch(error => {
            console.error(`Error during eager refresh for ${key}:`, error);
          });
      } else if (cacheEntry.refreshStrategy === 'lazy') {
        // Lazy refresh: refresh in the background
        console.log(`Lazily refreshing cache for ${key}`);
        setTimeout(() => {
          onRefresh(key, data)
            .then(freshData => {
              if (freshData !== undefined) {
                setCacheData(key, freshData, cacheEntry.expiry - Date.now(), storageType, {
                  useCompression: cacheEntry.useCompression,
                  compressionThreshold: cacheEntry.compressionThreshold,
                  priority: cacheEntry.priority,
                  tags: cacheEntry.tags,
                  refreshStrategy: cacheEntry.refreshStrategy,
                  refreshThreshold: cacheEntry.refreshThreshold
                });
              }
            })
            .catch(error => {
              console.error(`Error during lazy refresh for ${key}:`, error);
            });
        }, 0);
      }
    }
  }

  return data;
};

// Function to remove data from the cache
export const removeCacheData = (key: string, storageType: CacheStorage = 'memory'): void => {
  const storage = getStorageObject(storageType);

  if (isInMemoryStorage(storageType)) {
    (storage as Map<string, CacheEntry<any>>).delete(key);
  } else {
    (storage as Storage).removeItem(key);
  }

  notifyCacheRemove(key, storageType);
};

// Function to clear the entire cache
export const clearCache = (storageType: CacheStorage = 'memory'): void => {
  const storage = getStorageObject(storageType);

  if (isInMemoryStorage(storageType)) {
    (storage as Map<string, CacheEntry<any>>).clear();
  } else {
    (storage as Storage).clear();
  }

  notifyCacheClear(storageType);
};

// Function to invalidate cache entries by tag
export const invalidateCacheByTag = (tag: string): number => {
  let invalidatedCount = 0;

  // Invalidate in-memory cache
  memoryCache.forEach((entry, key) => {
    if (entry.tags.includes(tag)) {
      memoryCache.delete(key);
      invalidatedCount++;
      notifyCacheRemove(key, 'memory');
    }
  });

  // Invalidate localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const item = localStorage.getItem(key);
      if (item) {
        try {
          const entry: CacheEntry<any> = JSON.parse(item);
          if (entry.tags.includes(tag)) {
            localStorage.removeItem(key);
            invalidatedCount++;
            notifyCacheRemove(key, 'local');
            i--; // Adjust index after removal
          }
        } catch (e) {
          console.warn(`Failed to parse localStorage item for key ${key}.`, e);
        }
      }
    }
  }

  // Invalidate sessionStorage
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key) {
      const item = sessionStorage.getItem(key);
      if (item) {
        try {
          const entry: CacheEntry<any> = JSON.parse(item);
          if (entry.tags.includes(tag)) {
            sessionStorage.removeItem(key);
            invalidatedCount++;
            notifyCacheRemove(key, 'session');
            i--; // Adjust index after removal
          }
        } catch (e) {
          console.warn(`Failed to parse sessionStorage item for key ${key}.`, e);
        }
      }
    }
  }

  return invalidatedCount;
};

// Function to create a materialized view
export const createMaterializedView = <T>(
  name: string,
  queryFn: () => Promise<T>,
  options: {
    refreshInterval?: number;
    queryKey?: string[];
    parameters?: Record<string, any>;
    dependencies?: string[];
  }
): void => {
  const { refreshInterval = CACHE_DURATIONS.MEDIUM, queryKey = [], parameters = {}, dependencies = [] } = options;

  if (materializedViews.has(name)) {
    console.warn(`Materialized view with name ${name} already exists. Overwriting.`);
  }

  const materializedViewEntry: MaterializedViewEntry<T> = {
    data: undefined as any, // Initial data is undefined
    timestamp: Date.now(),
    expiry: Date.now() + refreshInterval,
    queryKey,
    parameters,
    refreshInterval,
    lastRefresh: 0,
    refreshing: false,
    dependencies
  };

  materializedViews.set(name, materializedViewEntry);

  // Refresh immediately
  refreshMaterializedView(name, queryFn);

  // Setup interval if not already set
  if (!materializedViewsInterval) {
    materializedViewsInterval = setInterval(() => {
      materializedViews.forEach((view, key) => {
        if (Date.now() - view.lastRefresh > view.refreshInterval && !view.refreshing) {
          refreshMaterializedView(key, queryFn);
        }
      });
    }, MATERIALIZED_REFRESH_CHECK_INTERVAL) as any;
  }
};

// Function to refresh a materialized view
const refreshMaterializedView = async <T>(name: string, queryFn: () => Promise<T>): Promise<void> => {
  const view = materializedViews.get(name);
  if (!view || view.refreshing) return;

  view.refreshing = true;
  try {
    const data = await queryFn();
    view.data = data;
    view.timestamp = Date.now();
    view.expiry = Date.now() + view.refreshInterval;
    view.lastRefresh = Date.now();
    console.log(`Materialized view ${name} refreshed successfully.`);
  } catch (error) {
    console.error(`Error refreshing materialized view ${name}:`, error);
  } finally {
    view.refreshing = false;
  }
};

// Function to get data from a materialized view
export const getMaterializedView = async <T>(name: string, queryFn: () => Promise<T>): Promise<T> => {
  const view = materializedViews.get(name);
  if (!view) {
    console.warn(`Materialized view with name ${name} does not exist. Creating...`);
    createMaterializedView(name, queryFn, { refreshInterval: CACHE_DURATIONS.MEDIUM, queryKey: [name] });
    return queryFn(); // Directly fetch data if view doesn't exist
  }

  if (Date.now() > view.expiry) {
    console.log(`Materialized view ${name} expired. Refreshing...`);
    refreshMaterializedView(name, queryFn);
  }

  return view.data;
};

// Function to delete a materialized view
export const deleteMaterializedView = (name: string): void => {
  if (materializedViews.has(name)) {
    materializedViews.delete(name);
    console.log(`Materialized view ${name} deleted.`);
  } else {
    console.warn(`Materialized view with name ${name} does not exist.`);
  }
};

// Function to create a partitioned query
export const createPartitionedQuery = <T>(
  queryKey: string,
  totalItems: number,
  chunkSize: number = 50
): string => {
  const key = `${queryKey}:partitioned`;

  if (partitionedQueries.has(key)) {
    console.warn(`Partitioned query with key ${key} already exists. Overwriting.`);
  }

  const partitionedQueryEntry: PartitionedQueryEntry<T> = {
    queryKey,
    totalItems,
    loadedChunks: 0,
    chunkSize,
    lastAccessed: Date.now(),
    data: []
  };

  partitionedQueries.set(key, partitionedQueryEntry);
  return key;
};

// Function to update a partitioned query with new data
export const updatePartitionedQuery = <T>(
  queryKey: string,
  chunkIndex: number,
  data: T
): void => {
  const query = partitionedQueries.get(queryKey);
  if (!query) {
    console.warn(`Partitioned query with key ${queryKey} does not exist.`);
    return;
  }

  if (!Array.isArray(query.loadedChunks)) {
    query.loadedChunks = new Set();
  }

  (query.loadedChunks as Set<number>).add(chunkIndex);
  query.data[chunkIndex] = data;
  query.lastAccessed = Date.now();
};

// Function to get data from a partitioned query
export const getPartitionedQueryData = <T>(queryKey: string): T[] => {
  const query = partitionedQueries.get(queryKey);
  if (!query) {
    console.warn(`Partitioned query with key ${queryKey} does not exist.`);
    return [];
  }

  query.lastAccessed = Date.now();
  return query.data;
};

// Function to get info about a partitioned query
export const getPartitionedQueryInfo = (queryKey: string): { totalChunks: number; loadedChunks: number | number[] ; chunkSize: number } | undefined => {
  const query = partitionedQueries.get(queryKey);
  if (!query) {
    console.warn(`Partitioned query with key ${queryKey} does not exist.`);
    return undefined;
  }

  const totalChunks = Math.ceil(query.totalItems / query.chunkSize);
  const loadedChunks = Array.isArray(query.loadedChunks) ? query.loadedChunks : Array.from((query.loadedChunks as Set<number>).values());
  return {
    totalChunks,
    loadedChunks: loadedChunks.length > 0 ? loadedChunks : 0,
    chunkSize: query.chunkSize
  };
};

// Function to delete a partitioned query
export const deletePartitionedQuery = (queryKey: string): void => {
  if (partitionedQueries.has(queryKey)) {
    partitionedQueries.delete(queryKey);
    console.log(`Partitioned query ${queryKey} deleted.`);
  } else {
    console.warn(`Partitioned query with key ${queryKey} does not exist.`);
  }
};
