import { useQuery, UseQueryOptions, UseQueryResult, QueryKey } from '@tanstack/react-query';
import { 
  getCacheData, 
  setCacheData, 
  CACHE_DURATIONS, 
  CacheStorage, 
  CachePriority,
  RefreshStrategy,
  invalidateCacheByTag,
  createMaterializedView,
  getMaterializedView,
  createPartitionedQuery,
  updatePartitionedQuery,
  getPartitionedQueryData,
  getPartitionedQueryInfo
} from '@/utils/cacheService';
import { useEffect, useState, useCallback } from 'react';

export type ProgressiveLoadingOptions = {
  enabled?: boolean;
  chunkSize?: number;
  onChunkLoaded?: (chunk: any[], progress: number) => void;
  initialChunkSize?: number;
};

/**
 * Enhanced useQuery hook with advanced smart caching capabilities
 * Supports materialized views, partitioned queries, and progressive loading
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
    progressiveLoading?: ProgressiveLoadingOptions;
    useMaterializedView?: boolean;
    materializedViewRefreshInterval?: number;
    usePartitionedQuery?: boolean;
    partitionedQueryChunkSize?: number;
    partitionedQueryTotalItems?: number;
    offlineFirst?: boolean;
    offlineFallback?: TQueryFnData;
  }
): UseQueryResult<TData, TError> & { 
  isFetchingNextChunk?: boolean;
  progress?: number;
  fetchNextChunk?: () => Promise<void>; 
} {
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
    progressiveLoading,
    useMaterializedView = false,
    materializedViewRefreshInterval,
    usePartitionedQuery = false,
    partitionedQueryChunkSize = 50,
    partitionedQueryTotalItems,
    offlineFirst = false,
    offlineFallback,
    ...queryOptions
  } = options || {};

  const [progress, setProgress] = useState(0);
  const [isFetchingNextChunk, setIsFetchingNextChunk] = useState(false);
  
  const [partitionKey, setPartitionKey] = useState<string | null>(null);
  const [partitionLoading, setPartitionLoading] = useState(false);

  const cacheKey = `${cachePrefix ? cachePrefix + ':' : ''}query:${JSON.stringify(queryKey)}`;
  
  useEffect(() => {
    if (useMaterializedView) {
      createMaterializedView(cacheKey, queryFn, {
        parameters: {},
        refreshInterval: materializedViewRefreshInterval || cacheDuration,
        queryKey: queryKey as string[],
        dependencies: []
      });
    }
  }, [useMaterializedView, cacheKey, JSON.stringify(queryKey), materializedViewRefreshInterval]);

  useEffect(() => {
    if (usePartitionedQuery && partitionedQueryTotalItems && !partitionKey) {
      const key = createPartitionedQuery(
        cacheKey,
        partitionedQueryTotalItems,
        partitionedQueryChunkSize
      );
      setPartitionKey(key);
    }
  }, [usePartitionedQuery, cacheKey, partitionedQueryTotalItems, partitionedQueryChunkSize]);

  const fetchNextChunk = useCallback(async () => {
    if (!partitionKey || partitionLoading) return;
    
    try {
      setIsFetchingNextChunk(true);
      setPartitionLoading(true);
      const info = getPartitionedQueryInfo(partitionKey);
      
      if (!info) return;
      
      const totalChunks = info.totalChunks;
      let loadedChunks: number[] = [];
      
      if (typeof info.loadedChunks === 'number') {
        loadedChunks = Array.from({ length: info.loadedChunks }, (_, i) => i);
      } else if (Array.isArray(info.loadedChunks)) {
        loadedChunks = info.loadedChunks;
      }
      
      const allChunks = Array.from({ length: totalChunks }, (_, i) => i);
      const nextChunkIndex = allChunks.find(idx => !loadedChunks.includes(idx));
      
      if (nextChunkIndex !== undefined) {
        console.log(`Loading partition chunk ${nextChunkIndex + 1}/${totalChunks}`);
        
        const data = await queryFn();
        updatePartitionedQuery(partitionKey, nextChunkIndex, data as any);
        
        const newProgress = Math.min(100, Math.round(((loadedChunks.length + 1) / totalChunks) * 100));
        setProgress(newProgress);
        
        if (progressiveLoading?.onChunkLoaded && Array.isArray(data)) {
          progressiveLoading.onChunkLoaded(data, newProgress);
        }
      } else {
        setProgress(100);
      }
    } catch (error) {
      console.error('Error loading partition chunk:', error);
    } finally {
      setPartitionLoading(false);
      setIsFetchingNextChunk(false);
    }
  }, [partitionKey, partitionLoading, queryFn, progressiveLoading]);

  useEffect(() => {
    if (partitionKey && !partitionLoading && usePartitionedQuery) {
      fetchNextChunk();
    }
  }, [partitionKey, partitionLoading, usePartitionedQuery, fetchNextChunk]);

  const result = useQuery<TQueryFnData, TError, TData, QueryKey>({
    queryKey,
    queryFn: async () => {
      if (offlineFirst && !navigator.onLine) {
        console.log(`Using offline-first approach for ${cacheKey}`);
        
        const cachedData = getCacheData<TQueryFnData>(cacheKey, cacheStorage);
        
        if (cachedData) {
          return cachedData;
        }
        
        if (offlineFallback !== undefined) {
          return offlineFallback;
        }
      }
      
      if (useMaterializedView) {
        try {
          return await getMaterializedView(cacheKey, queryFn);
        } catch (error) {
          console.error('Error getting materialized view:', error);
        }
      }
      
      if (usePartitionedQuery && partitionKey) {
        const data = getPartitionedQueryData(partitionKey);
        if (data.length > 0) {
          return data as any;
        }
      }
      
      if (skipCache) {
        console.log(`Skipping cache for ${cacheKey} as requested`);
        const data = await queryFn();
        return data;
      }
      
      const cachedData = getCacheData<TQueryFnData>(
        cacheKey, 
        cacheStorage,
        { 
          onRefresh: async (key, oldData) => {
            console.log(`Background refreshing data for ${key}`);
            try {
              const freshData = await queryFn();
              return freshData;
            } catch (error) {
              console.error(`Error during background refresh for ${key}:`, error);
              return undefined;
            }
          }
        }
      );
      
      if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        
        if (usePartitionedQuery && partitionKey) {
          updatePartitionedQuery(partitionKey, 0, cachedData as any);
        }
        
        return cachedData;
      }
      
      console.log(`Cache miss for ${cacheKey}. Fetching from server...`);
      
      let data: TQueryFnData;
      
      if (progressiveLoading?.enabled && Array.isArray(cachedData)) {
        if (cachedData.length > 0) {
          const freshDataPromise = queryFn();
          
          freshDataPromise.then(freshData => {
            if (Array.isArray(freshData)) {
              const initialChunkSize = progressiveLoading.initialChunkSize || progressiveLoading.chunkSize || 20;
              const chunkSize = progressiveLoading.chunkSize || 20;
              
              setCacheData(cacheKey, freshData.slice(0, initialChunkSize), cacheDuration, cacheStorage, {
                useCompression,
                compressionThreshold,
                priority: cachePriority,
                batchUpdate: batchUpdates,
                tags,
                refreshStrategy,
                refreshThreshold,
                concurrencyKey
              });
              
              setProgress(Math.round((initialChunkSize / freshData.length) * 100));
              
              if (freshData.length > initialChunkSize) {
                const remainingItems = freshData.slice(initialChunkSize);
                const chunks = Math.ceil(remainingItems.length / chunkSize);
                
                for (let i = 0; i < chunks; i++) {
                  const start = i * chunkSize;
                  const end = Math.min(start + chunkSize, remainingItems.length);
                  const chunkItems = remainingItems.slice(start, end);
                  
                  setTimeout(() => {
                    const currentData = getCacheData<any[]>(cacheKey, cacheStorage) || [];
                    const updatedData = [...currentData, ...chunkItems];
                    
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
                    
                    const newProgress = Math.min(
                      100, 
                      Math.round(((initialChunkSize + (i + 1) * chunkSize) / freshData.length) * 100)
                    );
                    setProgress(newProgress);
                    
                    if (progressiveLoading.onChunkLoaded) {
                      progressiveLoading.onChunkLoaded(chunkItems, newProgress);
                    }
                  }, i * 200);
                }
              } else {
                setProgress(100);
              }
            }
          }).catch(error => {
            console.error('Error fetching data for progressive loading:', error);
          });
          
          return cachedData;
        }
      }
      
      data = await queryFn();
      
      if (usePartitionedQuery && partitionKey) {
        updatePartitionedQuery(partitionKey, 0, data as any);
      }
      
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
    staleTime: cacheDuration,
    retry: (failureCount, error) => {
      if (!navigator.onLine && offlineFirst) {
        return false;
      }
      
      return failureCount < 3;
    },
    ...queryOptions
  });

  useEffect(() => {
    return () => {
    };
  }, [cacheKey]);

  return { 
    ...result, 
    isFetchingNextChunk, 
    progress, 
    fetchNextChunk 
  };
}

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

  const cacheKey = `${cachePrefix ? cachePrefix + ':' : ''}query:${JSON.stringify(queryKey)}`;
  
  const cachedData = getCacheData<T>(cacheKey, cacheStorage);
  if (cachedData) {
    return cachedData;
  }
  
  const data = await queryFn();
  
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

export const invalidateQueriesByTag = (tag: string): number => {
  return invalidateCacheByTag(tag);
};

export const createCachedMaterializedView = <T>(
  name: string,
  queryFn: () => Promise<T>,
  options?: {
    refreshInterval?: number;
    queryKey?: string[];
    dependencies?: string[];
  }
): void => {
  createMaterializedView(name, queryFn, options);
};

export const createCachedPartitionedQuery = <T>(
  queryKey: string,
  totalItems: number,
  chunkSize?: number
): string => {
  return createPartitionedQuery(queryKey, totalItems, chunkSize);
};

export const preloadDataForPath = async <T>(
  pathKey: string,
  queryFns: Record<string, () => Promise<any>>,
  options?: {
    priority?: CachePriority;
    storage?: CacheStorage;
    duration?: number;
  }
): Promise<void> => {
  const { 
    priority = 'low',
    storage = 'memory',
    duration = CACHE_DURATIONS.MEDIUM
  } = options || {};
  
  console.log(`Preloading data for path: ${pathKey}`);
  
  const promises = Object.entries(queryFns).map(async ([key, queryFn]) => {
    try {
      const data = await queryFn();
      const cacheKey = `preload:${pathKey}:${key}`;
      
      setCacheData(cacheKey, data, duration, storage, {
        priority,
        refreshStrategy: 'lazy',
        tags: ['preloaded', pathKey]
      });
      
      return { key, success: true };
    } catch (error) {
      console.error(`Error preloading data for ${key}:`, error);
      return { key, success: false, error };
    }
  });
  
  await Promise.allSettled(promises);
  console.log(`Finished preloading data for path: ${pathKey}`);
};
