
import { useQuery, UseQueryOptions, UseQueryResult, QueryKey } from '@tanstack/react-query';
import { getCacheData, setCacheData, CACHE_DURATIONS, CacheStorage, CachePriority } from '@/utils/cacheService';

/**
 * Enhanced useQuery hook with smart caching capabilities
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
    ...queryOptions
  } = options || {};

  // Create a cache key from the query key
  const cacheKey = `${cachePrefix ? cachePrefix + ':' : ''}query:${JSON.stringify(queryKey)}`;

  return useQuery({
    queryKey,
    queryFn: async () => {
      // Skip cache if specified
      if (skipCache) {
        console.log(`Skipping cache for ${cacheKey} as requested`);
        const data = await queryFn();
        return data;
      }
      
      // Try to get data from cache first
      const cachedData = getCacheData<TQueryFnData>(cacheKey, cacheStorage);
      
      if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return cachedData;
      }
      
      console.log(`Cache miss for ${cacheKey}. Fetching from server...`);
      // If not cached or expired, fetch fresh data
      const data = await queryFn();
      
      // Cache the fresh data with compression options
      setCacheData(cacheKey, data, cacheDuration, cacheStorage, {
        useCompression,
        compressionThreshold,
        priority: cachePriority,
        batchUpdate: batchUpdates
      });
      
      return data;
    },
    staleTime: cacheDuration, // Use the cacheDuration as staleTime for React Query's cache
    ...queryOptions
  });
}

/**
 * Function to prefetch and cache data
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
  }
): Promise<T> => {
  const {
    cacheDuration = CACHE_DURATIONS.MEDIUM,
    cacheStorage = 'memory',
    cachePrefix = '',
    useCompression = true,
    compressionThreshold = 1024,
    cachePriority = 'normal'
  } = options || {};

  // Create a cache key from the query key
  const cacheKey = `${cachePrefix ? cachePrefix + ':' : ''}query:${JSON.stringify(queryKey)}`;
  
  // Fetch the data
  const data = await queryFn();
  
  // Cache the data
  setCacheData(cacheKey, data, cacheDuration, cacheStorage, {
    useCompression,
    compressionThreshold,
    priority: cachePriority
  });
  
  return data;
};
