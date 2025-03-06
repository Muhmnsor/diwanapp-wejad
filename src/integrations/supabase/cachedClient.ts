
import { supabase } from './client';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { getCacheData, setCacheData, removeCacheData, clearCacheByPrefix, CACHE_DURATIONS } from '@/utils/cacheService';

/**
 * Cached Supabase client wrapper functions
 */

interface CachedQueryOptions {
  cacheDuration?: number;
  skipCache?: boolean;
  cachePrefix?: string;
  tags?: string[];
}

/**
 * Execute a Supabase query with caching
 */
export async function cachedQuery<T>(
  queryKey: string,
  queryFn: () => PostgrestFilterBuilder<any, any, any, any, any>,
  options: CachedQueryOptions = {}
): Promise<{ data: T[] | null; error: any }> {
  const {
    cacheDuration = CACHE_DURATIONS.MEDIUM,
    skipCache = false,
    cachePrefix = 'supabase',
    tags = []
  } = options;

  // Build cache key
  const cacheKey = `${cachePrefix}:${queryKey}`;

  // Check cache first if not skipping
  if (!skipCache) {
    const cachedData = getCacheData<T[]>(cacheKey);
    if (cachedData) {
      return { data: cachedData, error: null };
    }
  }

  try {
    // Execute the query
    const { data, error } = await queryFn();

    // Cache the result if no error
    if (!error && data) {
      setCacheData(cacheKey, data, cacheDuration, 'local', {
        tags,
        refreshStrategy: 'background',
        refreshThreshold: 80
      });
    }

    return { data: data as T[] | null, error };
  } catch (error) {
    console.error(`Error in cached query ${queryKey}:`, error);
    return { data: null, error };
  }
}

/**
 * Clear cached queries by tag
 */
export function clearCachedQueries(tag: string): void {
  // Implementation depends on your caching strategy
  removeCacheData(`tag:${tag}`);
}

/**
 * Clear all cached queries with a specific prefix
 */
export function clearCachedQueriesByPrefix(prefix: string): void {
  clearCacheByPrefix(`supabase:${prefix}`);
}
