
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { getCacheData, setCacheData, CACHE_DURATIONS, CacheStorage } from '@/utils/cacheService';

/**
 * Enhanced useQuery hook with smart caching capabilities
 */
export function useCachedQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData
>(
  queryKey: unknown[],
  queryFn: () => Promise<TQueryFnData>,
  options?: UseQueryOptions<TQueryFnData, TError, TData> & {
    cacheDuration?: number;
    cacheStorage?: CacheStorage;
    cachePrefix?: string;
  }
): UseQueryResult<TData, TError> {
  const {
    cacheDuration = CACHE_DURATIONS.MEDIUM,
    cacheStorage = 'memory',
    cachePrefix = '',
    ...queryOptions
  } = options || {};

  // Create a cache key from the query key
  const cacheKey = `${cachePrefix ? cachePrefix + ':' : ''}query:${JSON.stringify(queryKey)}`;

  return useQuery({
    queryKey,
    queryFn: async () => {
      // Try to get data from cache first
      const cachedData = getCacheData<TQueryFnData>(cacheKey, cacheStorage);
      
      if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return cachedData;
      }
      
      console.log(`Cache miss for ${cacheKey}. Fetching from server...`);
      // If not cached or expired, fetch fresh data
      const data = await queryFn();
      
      // Cache the fresh data
      setCacheData(cacheKey, data, cacheDuration, cacheStorage);
      
      return data;
    },
    staleTime: cacheDuration, // Use the cacheDuration as staleTime for React Query's cache
    ...queryOptions
  });
}
