
import { useQuery, UseQueryOptions, UseQueryResult, QueryKey } from '@tanstack/react-query';
import { DataCategory, getCacheSettings } from '@/lib/cache/cacheConfig';
import { trackCacheMetrics, getFromLocalCache, storeInLocalCache } from '@/lib/cache/smartCache';
import { useDeveloperStore } from '@/store/developerStore';

interface SmartQueryOptions<TData, TError> extends Omit<UseQueryOptions<TData, TError, TData, QueryKey>, 'queryKey' | 'queryFn'> {
  category: DataCategory;
  useLocalCache?: boolean;
  localCacheTime?: number; // minutes
  forceFresh?: boolean;
  // Remove onSuccess from our custom options as it's better handled directly in the useQuery options
}

export function useSmartQuery<TData, TError = Error>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options: SmartQueryOptions<TData, TError>
): UseQueryResult<TData, TError> {
  const { settings: devSettings } = useDeveloperStore();
  const { category, useLocalCache = false, localCacheTime = 60, forceFresh = false, ...restOptions } = options;
  
  const cacheKey = queryKey.join('.');
  const localData = useLocalCache ? getFromLocalCache(cacheKey) : null;
  
  // Get cache settings with developer overrides if applicable
  const cacheSettings = getCacheSettings(category, devSettings || undefined);
  
  const result = useQuery<TData, TError, TData, QueryKey>({
    queryKey,
    queryFn: async () => {
      let data: TData;
      try {
        data = await queryFn();
        
        // Update local storage cache if enabled
        if (useLocalCache) {
          storeInLocalCache(cacheKey, data, localCacheTime);
        }
        
        trackCacheMetrics(queryKey as string[], false); // Cache miss
        return data;
      } catch (error) {
        console.error(`Query error for ${cacheKey}:`, error);
        throw error;
      }
    },
    initialData: !forceFresh ? (localData as TData) : undefined,
    staleTime: cacheSettings.staleTime,
    gcTime: cacheSettings.gcTime,
    refetchOnWindowFocus: cacheSettings.refetchOnWindowFocus,
    refetchOnMount: cacheSettings.refetchOnMount,
    refetchOnReconnect: cacheSettings.refetchOnReconnect,
    refetchInterval: cacheSettings.refetchInterval,
    ...restOptions
  });
  
  // Track cache hits
  if (result.isSuccess && !result.isFetching) {
    trackCacheMetrics(queryKey as string[], true); // Cache hit
  }
  
  return result;
}
