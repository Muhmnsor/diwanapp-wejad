
import { useQuery, UseQueryOptions, UseQueryResult, QueryKey } from '@tanstack/react-query';
import { 
  getCacheData, 
  setCacheData, 
  CACHE_DURATIONS, 
  CacheStorage, 
  CachePriority,
  RefreshStrategy,
  invalidateCacheByTag
} from '@/utils/cacheService';
import { useEffect } from 'react';

/**
 * Enhanced useQuery hook with advanced smart caching capabilities
 */
export function useCachedQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData
>(
  queryKey: QueryKey,
  queryFn: () => Promise<TQueryFnData>,
  options?: UseQueryOptions<TQueryFnData, TError, TData, QueryKey> & {
    cacheDuration?: number;
    cacheStorage?: CacheStorage;
    cachePrefix?: string;
    useCompression?: boolean;
    compressionThreshold?: number;
    cachePriority?: CachePriority;
    batchUpdates?: boolean;
    skipCache?: boolean;
    tags?: string[];
    refreshStrategy?: RefreshStrategy;
    refreshThreshold?: number;
    concurrencyKey?: string;
    // Progressive/incremental loading
    incrementalLoading?: boolean;
    loadingChunkSize?: number;
  }
): UseQueryResult<TData, TError> {
  const {
    cacheDuration = CACHE_DURATIONS.MEDIUM,
    cacheStorage = 'memory',
    cachePrefix = '',
    useCompression = true,
    compressionThreshold = 1024,
    cachePriority = 'normal',
    batchUpdates = true,
    skipCache = false,
    tags = [],
    refreshStrategy = 'lazy',
    refreshThreshold = 75,
    concurrencyKey,
    incrementalLoading = false,
    loadingChunkSize = 20,
    ...queryOptions
  } = options || {};

  // Create a cache key from the query key
  const cacheKey = `${cachePrefix ? cachePrefix + ':' : ''}query:${JSON.stringify(queryKey)}`;

  const result = useQuery<TQueryFnData, TError, TData, QueryKey>({
    queryKey,
    queryFn: async () => {
      // Skip cache if specified
      if (skipCache) {
        console.log(`Skipping cache for ${cacheKey} as requested`);
        const data = await queryFn();
        return data;
      }
      
      // Try to get data from cache first
      const cachedData = getCacheData<TQueryFnData>(
        cacheKey, 
        cacheStorage,
        { 
          onRefresh: async (key, oldData) => {
            // This function is called when a background refresh is triggered
            console.log(`Background refreshing data for ${key}`);
            try {
              const freshData = await queryFn();
              return freshData;
            } catch (error) {
              console.error(`Error during background refresh for ${key}:`, error);
              return undefined; // Return undefined to keep old data
            }
          }
        }
      );
      
      if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return cachedData;
      }
      
      console.log(`Cache miss for ${cacheKey}. Fetching from server...`);
      // If not cached or expired, fetch fresh data
      let data: TQueryFnData;
      
      if (incrementalLoading && Array.isArray(cachedData)) {
        // Implement incremental loading for arrays
        // First return the cached data (even if expired) to show something immediately
        if (cachedData.length > 0) {
          const freshData = await queryFn();
          
          // If the fresh data is also an array, we can do progressive loading
          if (Array.isArray(freshData)) {
            data = freshData;
            
            // For progressive loading, we return the first chunk immediately
            // and then update the cache with more chunks progressively
            const chunkSize = loadingChunkSize;
            if (freshData.length > chunkSize) {
              // Schedule loading of additional chunks
              setTimeout(() => {
                const remainingItems = freshData.slice(chunkSize);
                const chunks = Math.ceil(remainingItems.length / chunkSize);
                
                for (let i = 0; i < chunks; i++) {
                  const start = i * chunkSize;
                  const end = Math.min(start + chunkSize, remainingItems.length);
                  const chunkItems = remainingItems.slice(start, end);
                  
                  // Update cache with progressive chunks
                  setTimeout(() => {
                    const updatedData = [...(getCacheData<any[]>(cacheKey, cacheStorage) || []), ...chunkItems];
                    setCacheData(cacheKey, updatedData, cacheDuration, cacheStorage, {
                      useCompression,
                      compressionThreshold,
                      priority: cachePriority,
                      batchUpdate: batchUpdates,
                      tags,
                      refreshStrategy,
                      refreshThreshold,
                      concurrencyKey
                    });
                  }, i * 100); // Delay each chunk by 100ms * chunk index
                }
              }, 200); // Small delay before starting to load additional chunks
              
              // Return only the first chunk for immediate display
              return freshData.slice(0, chunkSize) as TQueryFnData;
            }
          } else {
            data = freshData;
          }
        } else {
          data = await queryFn();
        }
      } else {
        data = await queryFn();
      }
      
      // Cache the fresh data with all our advanced options
      setCacheData(cacheKey, data, cacheDuration, cacheStorage, {
        useCompression,
        compressionThreshold,
        priority: cachePriority,
        batchUpdate: batchUpdates,
        tags,
        refreshStrategy,
        refreshThreshold,
        concurrencyKey
      });
      
      return data;
    },
    staleTime: cacheDuration, // Use the cacheDuration as staleTime for React Query's cache
    ...queryOptions
  });

  // Effect to handle cache invalidation on unmount if needed
  useEffect(() => {
    return () => {
      // Any cleanup needed when the component using this hook unmounts
    };
  }, [cacheKey]);

  return result;
}

/**
 * Function to prefetch and cache data with advanced options
 */
export const prefetchQueryData = async <T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  options?: {
    cacheDuration?: number;
    cacheStorage?: CacheStorage;
    cachePrefix?: string;
    useCompression?: boolean;
    compressionThreshold?: number;
    cachePriority?: CachePriority;
    tags?: string[];
    refreshStrategy?: RefreshStrategy;
    refreshThreshold?: number;
    concurrencyKey?: string;
  }
): Promise<T> => {
  const {
    cacheDuration = CACHE_DURATIONS.MEDIUM,
    cacheStorage = 'memory',
    cachePrefix = '',
    useCompression = true,
    compressionThreshold = 1024,
    cachePriority = 'normal',
    tags = [],
    refreshStrategy = 'lazy',
    refreshThreshold = 75,
    concurrencyKey
  } = options || {};

  // Create a cache key from the query key
  const cacheKey = `${cachePrefix ? cachePrefix + ':' : ''}query:${JSON.stringify(queryKey)}`;
  
  // Check if already in cache and not expired
  const cachedData = getCacheData<T>(cacheKey, cacheStorage);
  if (cachedData) {
    return cachedData;
  }
  
  // Fetch the data
  const data = await queryFn();
  
  // Cache the data with all advanced options
  setCacheData(cacheKey, data, cacheDuration, cacheStorage, {
    useCompression,
    compressionThreshold,
    priority: cachePriority,
    tags,
    refreshStrategy,
    refreshThreshold,
    concurrencyKey
  });
  
  return data;
};

/**
 * Function to invalidate queries by tag
 */
export const invalidateQueriesByTag = (tag: string): number => {
  return invalidateCacheByTag(tag);
};
