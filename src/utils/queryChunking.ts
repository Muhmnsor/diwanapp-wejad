
/**
 * Query Chunking Utilities
 * 
 * These utilities help improve performance by breaking large data fetching operations 
 * into smaller chunks that can be processed and cached efficiently.
 */

import { supabase } from '@/integrations/supabase/client';
import { setCacheData, getCacheData, CACHE_DURATIONS } from './cacheService';

/**
 * Configuration for chunked queries
 */
export interface ChunkConfig {
  chunkSize: number;
  cachePrefix: string;
  cacheDuration?: number;
  parallelChunks?: number;
  useCompression?: boolean;
}

/**
 * Fetch data in chunks to avoid large queries
 */
export async function fetchWithChunking<T>(
  tableName: string,
  columns: string,
  whereClause: string = '',
  orderClause: string = '',
  config: ChunkConfig
): Promise<T[]> {
  const {
    chunkSize = 100,
    cachePrefix,
    cacheDuration = CACHE_DURATIONS.MEDIUM,
    parallelChunks = 2,
    useCompression = true
  } = config;
  
  // First, get the total count
  const { count, error: countError } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true })
    .filter(whereClause, {});
  
  if (countError) {
    console.error('Error getting count:', countError);
    throw countError;
  }
  
  if (!count) return [];
  
  const totalChunks = Math.ceil(count / chunkSize);
  let allResults: T[] = [];
  
  // Check if we have cached total result
  const totalCacheKey = `${cachePrefix}:${tableName}:${whereClause}:total`;
  const cachedTotal = getCacheData<T[]>(totalCacheKey);
  
  if (cachedTotal) {
    console.log(`Using cached total for ${tableName}`);
    return cachedTotal;
  }
  
  // Process chunks in parallel batches
  for (let i = 0; i < totalChunks; i += parallelChunks) {
    const chunkPromises = [];
    
    for (let j = 0; j < parallelChunks && i + j < totalChunks; j++) {
      const chunkIndex = i + j;
      const from = chunkIndex * chunkSize;
      const to = from + chunkSize - 1;
      
      // Try to get chunk from cache first
      const chunkCacheKey = `${cachePrefix}:${tableName}:${whereClause}:chunk:${chunkIndex}`;
      const cachedChunk = getCacheData<T[]>(chunkCacheKey);
      
      if (cachedChunk) {
        chunkPromises.push(Promise.resolve(cachedChunk));
        continue;
      }
      
      // If not in cache, fetch from database
      const chunkPromise = supabase
        .from(tableName)
        .select(columns)
        .filter(whereClause, {})
        .range(from, to)
        .order(orderClause || 'id', { ascending: true })
        .then(({ data, error }) => {
          if (error) {
            console.error(`Error fetching chunk ${chunkIndex}:`, error);
            throw error;
          }
          
          // Cache this chunk
          setCacheData(chunkCacheKey, data, cacheDuration, 'memory', {
            useCompression,
            compressionThreshold: 1024,
            priority: 'normal',
            batchUpdate: true
          });
          
          return data as T[];
        });
      
      chunkPromises.push(chunkPromise);
    }
    
    // Wait for this batch of chunks to complete
    const chunkResults = await Promise.all(chunkPromises);
    allResults = [...allResults, ...chunkResults.flat()];
  }
  
  // Cache the total result
  setCacheData(totalCacheKey, allResults, cacheDuration, 'memory', {
    useCompression,
    compressionThreshold: 1024,
    priority: 'high'
  });
  
  return allResults;
}

/**
 * Clear chunked query cache by prefix
 */
export function clearChunkedQueryCache(cachePrefix: string, tableName?: string): void {
  if (tableName) {
    // Clear specific table chunks
    const tablePrefix = `${cachePrefix}:${tableName}`;
    console.log(`Clearing chunked query cache for: ${tablePrefix}`);
    setCacheData(`${tablePrefix}:total`, null, 0);
  } else {
    // Clear all chunks for this prefix
    console.log(`Clearing all chunked query cache for prefix: ${cachePrefix}`);
  }
}

/**
 * Hook for chunked queries with pagination support
 */
export async function fetchPagedData<T>(
  tableName: string,
  columns: string,
  page: number,
  pageSize: number,
  whereClause: string = '',
  orderClause: string = '',
  config: Omit<ChunkConfig, 'chunkSize'> & { useCache?: boolean }
): Promise<{ data: T[], totalCount: number, totalPages: number }> {
  const {
    cachePrefix,
    cacheDuration = CACHE_DURATIONS.MEDIUM,
    useCompression = true,
    useCache = true
  } = config;
  
  const cacheKey = `${cachePrefix}:${tableName}:${whereClause}:page:${page}:size:${pageSize}`;
  
  // Try to get from cache first
  if (useCache) {
    const cachedData = getCacheData<{ data: T[], totalCount: number, totalPages: number }>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }
  
  // Get total count
  const { count, error: countError } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true })
    .filter(whereClause, {});
  
  if (countError) {
    console.error('Error getting count:', countError);
    throw countError;
  }
  
  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  
  // Calculate range for this page
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  // Fetch page data
  const { data, error } = await supabase
    .from(tableName)
    .select(columns)
    .filter(whereClause, {})
    .range(from, to)
    .order(orderClause || 'id', { ascending: true });
  
  if (error) {
    console.error('Error fetching paged data:', error);
    throw error;
  }
  
  const result = {
    data: data as T[],
    totalCount,
    totalPages
  };
  
  // Cache the result
  if (useCache) {
    setCacheData(cacheKey, result, cacheDuration, 'memory', {
      useCompression,
      compressionThreshold: 1024,
      priority: 'normal'
    });
  }
  
  return result;
}
