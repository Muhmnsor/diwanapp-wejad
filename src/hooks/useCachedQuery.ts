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
import { useEffect, useState } from 'react';

/**
 * Enhanced useQuery hook with advanced smart caching capabilities
 * Supports materialized views and partitioned queries
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
    // Materialized view options
    useMaterializedView?: boolean;
    materializedViewRefreshInterval?: number;
    // Partitioned query options
    usePartitionedQuery?: boolean;
    partitionedQueryChunkSize?: number;
    partitionedQueryTotalItems?: number;
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
    // Materialized view options
    useMaterializedView = false,
    materializedViewRefreshInterval,
    // Partitioned query options
    usePartitionedQuery = false,
    partitionedQueryChunkSize = 50,
    partitionedQueryTotalItems,
    ...queryOptions
  } = options || {};

  // State for partitioned queries
  const [partitionKey, setPartitionKey] = useState<string | null>(null);
  const [partitionLoading, setPartitionLoading] = useState(false);

  // Create a cache key from the query key
  const cacheKey = `${cachePrefix ? cachePrefix + ':' : ''}query:${JSON.stringify(queryKey)}`;
  
  // Set up materialized view if requested
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

  // Set up partitioned query if requested
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

  // Handle loading data for partitioned queries
  useEffect(() => {
    if (partitionKey && !partitionLoading) {
      const loadPartition = async () => {
        try {
          setPartitionLoading(true);
          const info = getPartitionedQueryInfo(partitionKey);
          
          if (info && typeof info.loadedChunks === 'number') {
            // Handle case where loadedChunks is a number
            if (info.loadedChunks < info.totalChunks) {
              // Load the next chunk
              const nextChunkIndex = info.loadedChunks;
              console.log(`Loading partition chunk ${nextChunkIndex + 1}/${info.totalChunks}`);
              
              const data = await queryFn();
              updatePartitionedQuery(partitionKey, nextChunkIndex, data as any);
            }
          } else if (info && Array.isArray(info.loadedChunks)) {
            // Handle case where loadedChunks is an array
            const chunksArray = Array.from(Array(info.totalChunks).keys());
            const nextChunkIndex = chunksArray.find(idx => 
              !info.loadedChunks.includes(idx)
            );
            
            if (nextChunkIndex !== undefined) {
              console.log(`Loading partition chunk ${nextChunkIndex + 1}/${info.totalChunks}`);
              
              const data = await queryFn();
              updatePartitionedQuery(partitionKey, nextChunkIndex, data as any);
            }
          }
        } catch (error) {
          console.error('Error loading partition:', error);
        } finally {
          setPartitionLoading(false);
        }
      };
      
      loadPartition();
    }
  }, [partitionKey, partitionLoading, queryFn]);

  const result = useQuery<TQueryFnData, TError, TData, QueryKey>({
    queryKey,
    queryFn: async () => {
      // Handle materialized views
      if (useMaterializedView) {
        try {
          return await getMaterializedView(cacheKey, queryFn);
        } catch (error) {
          console.error('Error getting materialized view:', error);
          // Fall back to regular query if materialized view fails
        }
      }
      
      // Handle partitioned queries
      if (usePartitionedQuery && partitionKey) {
        const data = getPartitionedQueryData(partitionKey);
        if (data.length > 0) {
          return data as any;
        }
        // If no partitioned data yet, continue with regular query
      }
      
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
        
        // If this is a partitioned query, update the partition
        if (usePartitionedQuery && partitionKey) {
          updatePartitionedQuery(partitionKey, 0, cachedData as any);
        }
        
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
      
      // Update partitioned query if needed
      if (usePartitionedQuery && partitionKey) {
        updatePartitionedQuery(partitionKey, 0, data as any);
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

/**
 * Function to create a materialized view
 */
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

/**
 * Function to create a partitioned query
 */
export const createCachedPartitionedQuery = <T>(
  queryKey: string,
  totalItems: number,
  chunkSize?: number
): string => {
  return createPartitionedQuery(queryKey, totalItems, chunkSize);
};
